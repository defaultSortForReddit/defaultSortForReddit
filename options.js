// Save options to browser.storage
function saveOptions() {
  const defaultSort = document.getElementById("sortOption").value;

  // Retrieve existing subreddit-specific settings
  browser.storage.local.get("subredditSorts").then(data => {
    const subredditSorts = data.subredditSorts || {};

    // Get subreddit name and sort option
    const subreddit = document.getElementById("subredditName").value.trim();
    const subredditSort = document.getElementById("subredditSort").value;

    if (subreddit) {
      subredditSorts[subreddit] = subredditSort; // Save the subreddit-specific setting
    }

    // Save updated settings
    browser.storage.local.set({
      sortOption: defaultSort,
      subredditSorts: subredditSorts
    });
  });
}

// Restore options from browser.storage
function restoreOptions() {
  function setCurrentChoice(result) {
    document.getElementById("sortOption").value = result.sortOption || "new";

    // Load subreddit-specific settings into a list
    const subredditSorts = result.subredditSorts || {};
    const list = document.getElementById("subredditList");
    list.innerHTML = "";

    for (const [subreddit, sort] of Object.entries(subredditSorts)) {
      const item = document.createElement("li");
      item.textContent = `${subreddit}: ${sort}`;
      list.appendChild(item);
    }
  }

  function onError(error) {
    console.error(`Error: ${error}`);
  }

  const getting = browser.storage.local.get(["sortOption", "subredditSorts"]);
  getting.then(setCurrentChoice, onError);
}

// Event listeners
document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("saveBtn").addEventListener("click", saveOptions);
