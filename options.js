// Save options to browser.storage
function saveOptions() {
  const sortOption = document.getElementById("sortOption").value;
  const sortOptionSubreddit = document.getElementById("sortOptionSubreddit").value;
  browser.storage.local.set({
    sortOption: sortOption,
    sortOptionSubreddit: sortOptionSubreddit
  });
}

// Restore options from browser.storage
function restoreOptions() {
  function setCurrentChoice(result) {
    document.getElementById("sortOption").value = result.sortOption || "new";
    document.getElementById("sortOptionSubreddit").value = result.sortOptionSubreddit || "best";
  }

  function onError(error) {
    console.error(`Error: ${error}`);
  }

  const getting = browser.storage.local.get(["sortOption", "sortOptionSubreddit"]);
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("saveBtn").addEventListener("click", saveOptions);
