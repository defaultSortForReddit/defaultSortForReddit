// Author: James Wiesen
// Copyright © 2025 defaultSortForReddit. All rights reserved.

console.log('Background script running');

function redirect(requestDetails) {
  console.log('Redirect function called');
  console.log('Request URL:', requestDetails.url);

  // Do not redirect message URLs
  if (requestDetails.url.startsWith("https://www.reddit.com/message")) {
    console.log('No redirect for message URLs.');
    return {};
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["sortOption", "sortOptionSubreddit", "subredditSortOptions", "sortOptionUser"], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error accessing chrome.storage:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      
      console.log('Storage result:', result);
      const sortOption = result.sortOption || "new"; // Home page sort option
      const sortOptionSubreddit = result.sortOptionSubreddit || "new"; // Global subreddit sort option
      let subredditSortOptions = result.subredditSortOptions || {}; // Specific subreddit sort options
      const sortOptionUser = result.sortOptionUser || "new"; // Global user sort option

      // Sort subredditSortOptions by subreddit name (key)
      subredditSortOptions = Object.fromEntries(
        Object.entries(subredditSortOptions).sort(([a], [b]) => a.localeCompare(b))
      );

      const homeUrls = [
        "https://www.reddit.com/",
        "https://www.reddit.com/?feed=home",
        "https://www.reddit.com/best/?feed=home",
        "https://www.reddit.com/hot/?feed=home",
        "https://www.reddit.com/top/?feed=home",
        "https://www.reddit.com/new/?feed=home",
        "https://www.reddit.com/rising/?feed=home"
      ];

      const subredditPattern = /https:\/\/www\.reddit\.com\/r\/([^/]+)(\/)?(\?.*)?$/;
      const userPattern = /https:\/\/www\.reddit\.com\/user\/([^/]+)(\/)?(\?.*)?$/;

      console.log('sortOption:', sortOption);
      console.log('sortOptionSubreddit:', sortOptionSubreddit);
      console.log('subredditSortOptions:', subredditSortOptions);
      console.log('sortOptionUser:', sortOptionUser);

      // Step 1: Handle home page sorting
      if (homeUrls.includes(requestDetails.url) && !requestDetails.url.includes(`/${sortOption}`)) {
        const homeTargetUrl = `https://www.reddit.com/${sortOption}/?feed=home`;
        console.log('Redirecting home page to:', homeTargetUrl);
        resolve({ redirectUrl: homeTargetUrl });
        return;
      }

      // Step 2: Apply subreddit-specific sort options where specified
      if (subredditPattern.test(requestDetails.url)) {
        const match = requestDetails.url.match(subredditPattern);
        const subredditName = match[1].toLowerCase(); // Convert URL subreddit to lowercase
        const specificSortOption = subredditSortOptions[subredditName];
        const currentSortOption = requestDetails.url.split('/').slice(-2, -1)[0].split('?')[0];

        // Handle specific sort option
        if (specificSortOption && currentSortOption !== specificSortOption) {
          const targetUrl = `https://www.reddit.com/r/${subredditName}/${specificSortOption}`;
          console.log(`Redirecting ${subredditName} to its specific sort option:`, targetUrl);
          resolve({ redirectUrl: targetUrl });
          return;
        }

        // Step 3: Apply global subreddit sort option if no specific option exists
        if (!specificSortOption && currentSortOption !== sortOptionSubreddit) {
          const targetGlobalUrl = `https://www.reddit.com/r/${subredditName}/${sortOptionSubreddit}`;
          console.log(`Redirecting ${subredditName} to global sort option:`, targetGlobalUrl);
          resolve({ redirectUrl: targetGlobalUrl });
          return;
        }
      }

      // Step 4: Apply global user sort option
      if (userPattern.test(requestDetails.url)) {
        const match = requestDetails.url.match(userPattern);
        const userName = match[1];
        const currentSortOption = new URL(requestDetails.url).searchParams.get("sort");

        if (currentSortOption !== sortOptionUser) {
          const targetUserUrl = `https://www.reddit.com/user/${userName}/?sort=${sortOptionUser}`;
          console.log(`Redirecting user ${userName} to global sort option:`, targetUserUrl);
          resolve({ redirectUrl: targetUserUrl });
          return;
        }
      }

      console.log('No redirect needed.');
      resolve({});
    });
  });
}

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    try {
      const result = await redirect(details);
      if (result && result.redirectUrl) {
        console.log('Returning redirect URL:', result.redirectUrl);
        return { redirectUrl: result.redirectUrl };
      }
    } catch (error) {
      console.error('Error during redirection:', error);
    }
    return {};
  },
  { urls: ["https://www.reddit.com/*"] },
  ["blocking"]
);

console.log('Event listener set up');
