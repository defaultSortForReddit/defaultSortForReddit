function redirect(requestDetails) {
    return browser.storage.local.get("sortOption").then(result => {
      const sortOption = result.sortOption || "new";
      const targetUrl = `https://www.reddit.com/${sortOption}/?feed=home`;
  
      // URLs to redirect
      const homeUrls = [
        "https://www.reddit.com/",
        "https://www.reddit.com/?feed=home",
        "https://www.reddit.com/best/?feed=home",
        "https://www.reddit.com/hot/?feed=home",
        "https://www.reddit.com/top/?feed=home",
        "https://www.reddit.com/new/?feed=home",
        "https://www.reddit.com/rising/?feed=home"
      ];
  
      if (homeUrls.includes(requestDetails.url) && requestDetails.url !== targetUrl) {
        return { redirectUrl: targetUrl };
      }
    });
  }
  
  browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: ["<all_urls>"]},
    ["blocking"]
  );
  