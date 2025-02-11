function redirect(requestDetails) {
  return browser.storage.local.get(["sortOption", "subredditSorts"]).then(result => {
    const defaultSort = result.sortOption || "new"; // Default sorting option
    const subredditSorts = result.subredditSorts || {}; // Per-subreddit preferences

    const subredditPattern = /https:\/\/www\.reddit\.com\/r\/([^/]+)(\/)?(\?.*)?$/;
    const match = requestDetails.url.match(subredditPattern);

    if (match) {
      const subreddit = match[1];
      const subredditSort = subredditSorts[subreddit] || defaultSort;
      const targetUrl = `https://www.reddit.com/r/${subreddit}/${subredditSort}/`;

      if (requestDetails.url !== targetUrl) {
        return { redirectUrl: targetUrl };
      }
    }
  });
}

// Listen for web requests and apply redirection
browser.webRequest.onBeforeRequest.addListener(
  redirect,
  { urls: ["*://www.reddit.com/r/*"] },
  ["blocking"]
);
