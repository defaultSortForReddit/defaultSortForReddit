function redirect(requestDetails) {
  return browser.storage.local.get(["sortOption", "sortOptionSubreddit"]).then(result => {
    const sortOption = result.sortOption || "new";
    const sortOptionSubreddit = result.sortOptionSubreddit || "new"; // Set default to "new"

    const homeTargetUrl = `https://www.reddit.com/${sortOption}/?feed=home`;

    // URLs to redirect for home page
    const homeUrls = [
      "https://www.reddit.com/",
      "https://www.reddit.com/?feed=home",
      "https://www.reddit.com/best/?feed=home",
      "https://www.reddit.com/hot/?feed=home",
      "https://www.reddit.com/top/?feed=home",
      "https://www.reddit.com/new/?feed=home",
      "https://www.reddit.com/rising/?feed=home"
    ];

    // URL pattern for subreddits
    const subredditPattern = /https:\/\/www\.reddit\.com\/r\/([^/]+)(\/)?(\?.*)?$/;

    if (homeUrls.includes(requestDetails.url) && requestDetails.url !== homeTargetUrl) {
      return { redirectUrl: homeTargetUrl };
    } else if (subredditPattern.test(requestDetails.url)) {
      const match = requestDetails.url.match(subredditPattern);
      const subredditName = match[1];
      const targetUrl = `https://www.reddit.com/r/${subredditName}/${sortOptionSubreddit}`;
      if (requestDetails.url !== targetUrl) {
        return { redirectUrl: targetUrl };
      }
    }
  });
}

browser.webRequest.onBeforeRequest.addListener(
  redirect,
  { urls: ["<all_urls>"] },
  ["blocking"]
);
