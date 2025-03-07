// Author: James Wiesen
// Copyright © 2025 defaultSortForReddit. All rights reserved.

(function() {
    const sortOptions = {
        sortOption: "new",
        sortOptionSubreddit: "new",
        subredditSortOptions: {},
        sortOptionUser: "new"
    };

    // Fetch sort options from storage
    function fetchSortOptions() {
        return chrome.storage.local.get(["sortOption", "sortOptionSubreddit", "subredditSortOptions", "sortOptionUser"])
            .then(result => {
                sortOptions.sortOption = result.sortOption || "new";
                sortOptions.sortOptionSubreddit = result.sortOptionSubreddit || "new";
                sortOptions.subredditSortOptions = result.subredditSortOptions || {};
                sortOptions.sortOptionUser = result.sortOptionUser || "new";
            })
            .catch(error => {
                console.error('Error fetching sort options:', error);
            });
    }

    // Redirect based on sort options
    function handleNavigation() {
        const url = window.location.href;

        const homeUrls = [
            "https://www.reddit.com/",
            "https://www.reddit.com/?feed=home",
            "https://www.reddit.com/best/?feed=home",
            "https://www.reddit.com/hot/?feed=home",
            "https://www.reddit.com/top/?feed=home",
            "https://www.reddit.com/new/?feed=home",
            "https://www.reddit.com/rising/?feed=home"
        ];

        const subredditPattern = /https:\/\/www\.reddit\.com\/r\/([^/]+)\/?(new|hot|top|rising)?\/?$/;
        const userPattern = /https:\/\/www\.reddit\.com\/user\/([^/]+)(\/)?(\?.*)?$/;

        if (!homeUrls.includes(url) && !subredditPattern.test(url) && !userPattern.test(url)) {
            return;
        }
        
        let targetUrl = null;

        // Handle home page sorting
        if (homeUrls.includes(url) && !url.includes(`/${sortOptions.sortOption}`)) {
            targetUrl = `https://www.reddit.com/${sortOptions.sortOption}/?feed=home`;
        }

        // Apply subreddit-specific sort options where specified
        if (subredditPattern.test(url)) {
            const match = url.match(subredditPattern);
            const subredditName = match[1].toLowerCase(); // Convert URL subreddit to lowercase
            const specificSortOption = sortOptions.subredditSortOptions[subredditName];
            const currentSortOption = url.split('/').slice(-2, -1)[0].split('?')[0];

            // Handle specific sort option
            if (specificSortOption && currentSortOption !== specificSortOption) {
                targetUrl = `https://www.reddit.com/r/${subredditName}/${specificSortOption}`;
            }

            // Apply global subreddit sort option if no specific option exists
            if (!specificSortOption && currentSortOption !== sortOptions.sortOptionSubreddit) {
                targetUrl = `https://www.reddit.com/r/${subredditName}/${sortOptions.sortOptionSubreddit}`;
            }
        }

        // Apply global user sort option
        if (userPattern.test(url)) {
            const match = url.match(userPattern);
            const userName = match[1];
            const currentSortOption = new URL(url).searchParams.get("sort");

            if (currentSortOption !== sortOptions.sortOptionUser) {
                targetUrl = `https://www.reddit.com/user/${userName}/?sort=${sortOptions.sortOptionUser}`;
            }
        }

        if (targetUrl && targetUrl !== url) {
            window.location.replace(targetUrl);
        }
    }

    // Fetch sort options and handle initial navigation
    fetchSortOptions().then(handleNavigation);

    // Listen for URL changes and handle navigation
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('pushstate', handleNavigation);
    window.addEventListener('replacestate', handleNavigation);
})();
