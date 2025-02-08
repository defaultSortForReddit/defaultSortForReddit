// Save options to browser.storage
function saveOptions() {
    const sortOption = document.getElementById("sortOption").value;
    browser.storage.local.set({
      sortOption: sortOption
    });
  }
  
  // Restore options from browser.storage
  function restoreOptions() {
    function setCurrentChoice(result) {
      document.getElementById("sortOption").value = result.sortOption || "new";
    }
  
    function onError(error) {
      console.error(`Error: ${error}`);
    }
  
    const getting = browser.storage.local.get("sortOption");
    getting.then(setCurrentChoice, onError);
  }
  
  document.addEventListener("DOMContentLoaded", restoreOptions);
  document.getElementById("saveBtn").addEventListener("click", saveOptions);
  