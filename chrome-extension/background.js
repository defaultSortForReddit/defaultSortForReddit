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
    return chrome.storage.local.get(["sortOption", "sortOptionSubreddit", "subredditSortOptions", "sortOptionUser"])
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

// Function to update dynamic rules
function updateDynamicRules() {
    const rules = [];

    // Home page rule
    rules.push({
        id: 1,
        priority: 1,
        action: { type: "redirect", redirect: { regexSubstitution: `https://www.reddit.com/${sortOptions.sortOption}/?feed=home` } },
        condition: {
            regexFilter: "^https://www\\.reddit\\.com(/)?(\\?.*)?$",
            resourceTypes: ["main_frame"],
            excludedRequestDomains: [`www.reddit.com/${sortOptions.sortOption}/?feed=home`]
        }
    });

    // Home page rule with sort option in URL
    rules.push({
        id: 2,
        priority: 1,
        action: { type: "redirect", redirect: { regexSubstitution: `https://www.reddit.com/${sortOptions.sortOption}/?feed=home` } },
        condition: {
            regexFilter: "^https://www\\.reddit\\.com/[^/]+(/)?(\\?.*)?$",
            resourceTypes: ["main_frame"],
            excludedRequestDomains: [`www.reddit.com/${sortOptions.sortOption}/?feed=home`]
        }
    });

    // Home page rule with feed parameter
    rules.push({
        id: 3,
        priority: 1,
        action: { type: "redirect", redirect: { regexSubstitution: `https://www.reddit.com/${sortOptions.sortOption}/?feed=home` } },
        condition: {
            regexFilter: "^https://www\\.reddit\\.com(/)?\\?feed=home$",
            resourceTypes: ["main_frame"],
            excludedRequestDomains: [`www.reddit.com/${sortOptions.sortOption}/?feed=home`]
        }
    });

    // Subreddit rules
    Object.keys(sortOptions.subredditSortOptions).forEach((subredditName, index) => {
        const sortOption = sortOptions.subredditSortOptions[subredditName];
        if (sortOption) {
            rules.push({
                id: index + 4,
                priority: 1,
                action: { type: "redirect", redirect: { regexSubstitution: `https://www.reddit.com/r/${subredditName}/${sortOption}/` } },
                condition: {
                    regexFilter: `^https://www\\.reddit\\.com/r/${subredditName}(/[^/?]+)?(/)?(\\?.*)?$`,
                    resourceTypes: ["main_frame"],
                    excludedRequestDomains: [`www.reddit.com/r/${subredditName}/${sortOption}/`]
                }
            });
        }
    });

    // Global subreddit rule
    rules.push({
      id: 1000,
      priority: 1,
      action: { type: "redirect", redirect: { regexSubstitution: `https://www.reddit.com/r/\\1/${sortOptions.sortOptionSubreddit}/` } },
      condition: {
        regexFilter: `https://www\\.reddit\\.com/r/([^/]+)(/)+([^/]+)(/)$`,
        resourceTypes: ["main_frame"],
        excludedRequestDomains: [`www.reddit.com/r/\\1/${sortOptions.sortOptionSubreddit}/`]
      }
    });

    // User rule
    rules.push({
        id: 1001,
        priority: 1,
        action: { type: "redirect", redirect: { regexSubstitution: `https://www.reddit.com/user/\\1/?sort=${sortOptions.sortOptionUser}` } },
        condition: {
            regexFilter: "^https://www\\.reddit\\.com/user/([^/]+)(/)?(\\?.*)?$",
            resourceTypes: ["main_frame"],
            excludedRequestDomains: [`www.reddit.com/user/\\1/?sort=${sortOptions.sortOptionUser}`]
        }
    });

    // Remove all existing rules and add the new rules
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [], // Empty array to remove all existing rules
        addRules: rules
    }).then(() => {
        console.log('Dynamic rules updated:', rules);
    }).catch(error => {
        console.error('Error updating dynamic rules:', error);
    });
}

// Fetch sort options when the extension is loaded
fetchSortOptions().then(updateDynamicRules);

// Listen for changes to the storage and update the sort options and dynamic rules
chrome.storage.onChanged.addListener((changes, area) => {
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
        updateDynamicRules();
    }
});
