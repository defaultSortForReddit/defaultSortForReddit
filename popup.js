// Save options from the popup
function savePopupOptions() {
  const defaultSort = document.getElementById("popupSortOption").value;

  // Retrieve existing subreddit-specific settings
  browser.storage.local.get("subredditSorts").then(data => {
    const subredditSorts = data.subredditSorts || {};

    // Get subreddit name and sort option
    const subreddit = document.getElementById("popupSubredditName").value.trim();
    const subredditSort = document.getElementById("popupSubredditSort").value;

    if (subreddit) {
      subredditSorts[subreddit] = subredditSort; // Save the subreddit-specific setting
    }

    // Save updated settings
    browser.storage.local.set({
      sortOption: defaultSort,
      subredditSorts: subredditSorts
    });

    // Refresh the displayed list of subreddit-specific settings
    displayPopupSubredditList(subredditSorts);
  });
}

// Display saved subreddit-specific sorting preferences
function displayPopupSubredditList(subredditSorts) {
  const list = document.getElementById("popupSubredditList");
  list.innerHTML = "";

  for (const [subreddit, sort] of Object.entries(subredditSorts)) {
    const item = document.createElement("li");
    item.textContent = `${subreddit}: ${sort}`;
    list.appendChild(item);
  }
}

// Restore options in the popup
function restorePopupOptions() {
  browser.storage.local.get(["sortOption", "subredditSorts"]).then(result => {
    document.getElementById("popupSortOption").value = result.sortOption || "new";

    const subredditSorts = result.subredditSorts || {};
    displayPopupSubredditList(subredditSorts);
  });
}

// Event listeners
document.addEventListener("DOMContentLoaded", restorePopupOptions);
document.getElementById("popupSaveBtn").addEventListener("click", savePopupOptions);
