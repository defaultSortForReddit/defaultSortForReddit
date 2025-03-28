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

  return browser.storage.local.get(["sortOption", "sortOptionSubreddit", "subredditSortOptions", "sortOptionUser", "sortOptionComments"])
    .then(result => {
      const sortOption = result.sortOption || "new"; // Home page sort option
      const sortOptionSubreddit = result.sortOptionSubreddit || "new"; // Global subreddit sort option
      let subredditSortOptions = result.subredditSortOptions || {}; // Specific subreddit sort options
      const sortOptionUser = result.sortOptionUser || "new"; // Global user sort option
      const sortOptionComments = result.sortOptionComments || "best"; // Global comment sort option

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
      const commentsPattern = /https:\/\/www\.reddit\.com\/r\/([^/]+)\/comments\/([^/]+)\/([^/]+)\/(\?.*)?$/;

      console.log('sortOption:', sortOption);
      console.log('sortOptionSubreddit:', sortOptionSubreddit);
      console.log('subredditSortOptions:', subredditSortOptions);
      console.log('sortOptionUser:', sortOptionUser);
      console.log('sortOptionComments:', sortOptionComments);

      // Step 1: Handle home page sorting
      if (homeUrls.includes(requestDetails.url) && !requestDetails.url.includes(`/${sortOption}`)) {
        const homeTargetUrl = `https://www.reddit.com/${sortOption}/?feed=home`;
        console.log('Redirecting home page to:', homeTargetUrl);
        return { redirectUrl: homeTargetUrl };
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
          return { redirectUrl: targetUrl };
        }

        // Step 3: Apply global subreddit sort option if no specific option exists
        if (!specificSortOption && currentSortOption !== sortOptionSubreddit) {
          const targetGlobalUrl = `https://www.reddit.com/r/${subredditName}/${sortOptionSubreddit}`;
          console.log(`Redirecting ${subredditName} to global sort option:`, targetGlobalUrl);
          return { redirectUrl: targetGlobalUrl };
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
          return { redirectUrl: targetUserUrl };
        }
      }

      // Step 5: Apply global comment sort option
      if (commentsPattern.test(requestDetails.url)) {
        const match = requestDetails.url.match(commentsPattern);
        const subredditName = match[1];
        const postId = match[2];
        const postTitle = match[3];
        const currentSortOption = new URL(requestDetails.url).searchParams.get("sort");

        if (currentSortOption !== sortOptionComments) {
          const targetCommentsUrl = `https://www.reddit.com/r/${subredditName}/comments/${postId}/${postTitle}/?sort=${sortOptionComments}`;
          console.log(`Redirecting comments on post ${postId} to global sort option:`, targetCommentsUrl);
          return { redirectUrl: targetCommentsUrl };
        }
      }

      console.log('No redirect needed.');
      return {};
    })
    .catch(error => {
      console.error('Error in redirect function:', error);
      return {};
    });
}

browser.webRequest.onBeforeRequest.addListener(
  redirect,
  { urls: ["https://www.reddit.com/*"] },
  ["blocking"]
);

console.log('Event listener set up');
