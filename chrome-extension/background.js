// Author: James Wiesen
// Copyright © 2025 defaultSortForReddit. All rights reserved.
console.log('Background script running');

let sortOptions = {
    sortOption: "new",
    sortOptionSubreddit: "new",
    subredditSortOptions: {},
    sortOptionUser: "new"
};

// Fetch sort options and store them in the global variable
function fetchSortOptions() {
    browser.storage.local.get(["sortOption", "sortOptionSubreddit", "subredditSortOptions", "sortOptionUser"])
    .then(result => {
        sortOptions.sortOption = result.sortOption || "new";
        sortOptions.sortOptionSubreddit = result.sortOptionSubreddit || "new";
        sortOptions.subredditSortOptions = result.subredditSortOptions || {};
        sortOptions.sortOptionUser = result.sortOptionUser || "new";
        console.log('Sort options fetched:', sortOptions);
    })
    .catch(error => {
        console.error('Error fetching sort options:', error);
    });
}

// Fetch sort options when the extension is loaded
fetchSortOptions();

// Listen for changes to the storage and update the sort options
browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
        if (changes.sortOption) {
            sortOptions.sortOption = changes.sortOption.newValue || "new";
        }
        if (changes.sortOptionSubreddit) {
            sortOptions.sortOptionSubreddit = changes.sortOptionSubreddit.newValue || "new";
        }
        if (changes.subredditSortOptions) {
            sortOptions.subredditSortOptions = changes.subredditSortOptions.newValue || {};
        }
        if (changes.sortOptionUser) {
            sortOptions.sortOptionUser = changes.sortOptionUser.newValue || "new";
        }
        console.log('Sort options updated:', sortOptions);
    }
});

browser.webRequest.onBeforeRequest.addListener(
    redirect,
    { urls: ["https://www.reddit.com/*"] },
    ["blocking"]
  );

console.log('EventListener added');

// Redirect to the appropriate sort option
function redirect(requestDetails) {
    console.log('Redirect function called');
    console.log('Request URL:', requestDetails.url);

    const homeUrls = [
        "https://www.reddit.com/",
        "https://www.reddit.com/?feed=home",
        "https://www.reddit.com/best/?feed=home",
        "https://www.reddit.com/hot/?feed=home",
        "https://www.reddit.com/top/?feed=home",
        "https://www.reddit.com/new/?feed=home",
        "https://www.reddit.com/rising/?feed=home"
    ];

    const subredditPattern = /https:\/\/www\.reddit\.com\/r\/([^/]+)(\/[^/?]+)?(\/)?(\?.*)?$/;
    const userPattern = /https:\/\/www\.reddit\.com\/user\/([^/]+)(\/)?(\?.*)?$/;

    if (!homeUrls.includes(requestDetails.url) && !subredditPattern.test(requestDetails.url) && !userPattern.test(requestDetails.url)) {
        console.log('No redirect for non-home, non-user, and non-subreddit URLs.');
        return {};
    }

    const sortOption = sortOptions.sortOption;
    const sortOptionSubreddit = sortOptions.sortOptionSubreddit;
    const subredditSortOptions = sortOptions.subredditSortOptions;  
    const sortOptionUser = sortOptions.sortOptionUser;

    let targetUrl = null;

    // Step 1: Handle home page sorting
    if (homeUrls.includes(requestDetails.url) && !requestDetails.url.includes(`/${sortOption}`)) {
        targetUrl = `https://www.reddit.com/${sortOption}/?feed=home`;
        console.log('Redirecting home page to:', targetUrl);
    }

    // Step 2: Apply subreddit-specific sort options where specified
    if (subredditPattern.test(requestDetails.url)) {
        const match = requestDetails.url.match(subredditPattern);
        const subredditName = match[1].toLowerCase(); // Convert URL subreddit to lowercase
        const specificSortOption = subredditSortOptions[subredditName];
        const currentSortOption = requestDetails.url.split('/').slice(-2, -1)[0].split('?')[0];

        // Handle specific sort option
        if (specificSortOption && currentSortOption !== specificSortOption) {
          targetUrl = `https://www.reddit.com/r/${subredditName}/${specificSortOption}`;
          console.log(`Redirecting ${subredditName} to its specific sort option:`, targetUrl);
        }

        // Step 3: Apply global subreddit sort option if no specific option exists
        if (!specificSortOption && currentSortOption !== sortOptionSubreddit) {
          targetUrl = `https://www.reddit.com/r/${subredditName}/${sortOptionSubreddit}`;
          console.log(`Redirecting ${subredditName} to global sort option:`, targetUrl);
        }
      }

      // Step 4: Apply global user sort option
      if (userPattern.test(requestDetails.url)) {
        const match = requestDetails.url.match(userPattern);
        const userName = match[1];
        const currentSortOption = new URL(requestDetails.url).searchParams.get("sort");

        if (currentSortOption !== sortOptionUser) {
          targetUrl = `https://www.reddit.com/user/${userName}/?sort=${sortOptionUser}`;
          console.log(`Redirecting user ${userName} to global sort option:`, targetUrl);
        }
      }

    if (targetUrl) {
        console.log('Returning targetUrl:', targetUrl);
        return { redirectUrl: targetUrl };
      } else {
        console.log('No redirect needed.');
        return {};
      }
}