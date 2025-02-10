// Save options to browser.storage
function saveOptions() {
  const sortOption = document.getElementById("sortOption").value;
  const sortOptionSubreddit = document.getElementById("sortOptionSubreddit").value;
  browser.storage.local.set({
    sortOption: sortOption,
    sortOptionSubreddit: sortOptionSubreddit
  }).then(() => {
    // Disable Save button and show saved message
    const saveBtn = document.getElementById("saveBtn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Preferences Saved!";
    
    // Reset the button after 2 seconds
    setTimeout(() => {
      saveBtn.textContent = "Save";
    }, 2000);
  });
}

// Restore options from browser.storage
function restoreOptions() {
  function setCurrentChoice(result) {
    const sortOption = result.sortOption || "new";
    const sortOptionSubreddit = result.sortOptionSubreddit || "new";

    document.getElementById("sortOption").value = sortOption;
    document.getElementById("sortOptionSubreddit").value = sortOptionSubreddit;
    
    // Disable Save button initially
    document.getElementById("saveBtn").disabled = true;
  }

  function onError(error) {
    console.error(`Error: ${error}`);
  }

  const getting = browser.storage.local.get(["sortOption", "sortOptionSubreddit"]);
  getting.then(setCurrentChoice, onError);
}

// Enable Save button when preferences are changed
function handlePreferenceChange() {
  document.getElementById("saveBtn").disabled = false;
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("saveBtn").addEventListener("click", saveOptions);
document.getElementById("sortOption").addEventListener("change", handlePreferenceChange);
document.getElementById("sortOptionSubreddit").addEventListener("change", handlePreferenceChange);
