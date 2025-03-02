// Author: James Wiesen
// Copyright © 2025 defaultSortForReddit. All rights reserved.

// Save options to chrome.storage
function saveOptions() {
  const sortOption = document.getElementById("sortOption").value;
  const sortOptionSubreddit = document.getElementById("sortOptionSubreddit").value;
  const sortOptionUser = document.getElementById("sortOptionUser").value;
  const subredditSortOptions = Object.keys(JSON.parse(localStorage.getItem("subredditSortOptions")) || {}).sort().reduce((acc, key) => {
      acc[key] = JSON.parse(localStorage.getItem("subredditSortOptions"))[key];
      return acc;
  }, {});
  const darkMode = document.getElementById("darkModeToggle").checked;

  chrome.storage.local.set({
      sortOption: sortOption,
      sortOptionSubreddit: sortOptionSubreddit,
      sortOptionUser: sortOptionUser,
      subredditSortOptions: subredditSortOptions,
      darkMode: darkMode
  }).then(() => {
      const saveBtn = document.getElementById("saveBtn");
      saveBtn.disabled = true;
      saveBtn.textContent = "Preferences Saved!";
      
      setTimeout(() => {
          saveBtn.textContent = "Save Default Sort Options";
      }, 2000);
  });
}

// Restore options from chrome.storage
function restoreOptions() {
  function setCurrentChoice(result) {
      const sortOption = result.sortOption || "new";
      const sortOptionSubreddit = result.sortOptionSubreddit || "new";
      const sortOptionUser = result.sortOptionUser || "new";
      const subredditSortOptions = result.subredditSortOptions || {};
      const darkMode = result.darkMode || false;

      document.getElementById("sortOption").value = sortOption;
      document.getElementById("sortOptionSubreddit").value = sortOptionSubreddit;
      document.getElementById("sortOptionUser").value = sortOptionUser;
      
      const sortedSubredditSortOptions = Object.keys(subredditSortOptions).sort().reduce((acc, key) => {
          acc[key] = subredditSortOptions[key];
          return acc;
      }, {});
      localStorage.setItem("subredditSortOptions", JSON.stringify(sortedSubredditSortOptions));
      updateSubredditPreferencesList(subredditSortOptions);

      document.getElementById("darkModeToggle").checked = darkMode;
      applyDarkMode(darkMode);

      document.getElementById("saveBtn").disabled = true;
  }

  function onError(error) {
      console.error(`Error: ${error}`);
  }

  const getting = chrome.storage.local.get(["sortOption", "sortOptionSubreddit", "subredditSortOptions", "darkMode", "sortOptionUser"]);
  getting.then(setCurrentChoice, onError);
}

// Apply Dark Mode based on the user's preference
function applyDarkMode(isDarkMode) {
  const darkModeLabel = document.querySelector(".dark-mode-label");
  if (isDarkMode) {
      document.body.classList.add("dark-mode");
      darkModeLabel.textContent = "Dark Mode";
  } else {
      document.body.classList.remove("dark-mode");
      darkModeLabel.textContent = "Dark Mode";
  }
}

// Enable Save button when preferences are changed
function handlePreferenceChange(event) {
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = false;
  saveBtn.style.backgroundColor = ""; // Reset to default button color

  if (event.target.id === "darkModeToggle") {
      const isDarkMode = event.target.checked;
      applyDarkMode(isDarkMode);
      chrome.storage.local.set({ darkMode: isDarkMode }); // Save Dark Mode preference
  }
}

// Add subreddit preference
function addSubredditPreference() {
  const subredditName = document.getElementById("subredditName").value.trim().toLowerCase(); // Convert to lowercase
  const subredditSortOption = document.getElementById("subredditSortOption").value;
  if (subredditName) {
      const subredditSortOptions = JSON.parse(localStorage.getItem("subredditSortOptions")) || {};
      subredditSortOptions[subredditName] = subredditSortOption;
      localStorage.setItem("subredditSortOptions", JSON.stringify(subredditSortOptions));
      updateSubredditPreferencesList(subredditSortOptions);

      // Save subreddit preferences only to chrome storage
      chrome.storage.local.set({ subredditSortOptions: subredditSortOptions }).then(() => {
          document.getElementById("subredditName").value = "";
          document.getElementById("subredditSortOption").value = "new"; // Default to "new"
          document.getElementById("addSubredditBtn").disabled = true;
          document.getElementById("addSubredditBtn").style.backgroundColor = "gray";
      });
  }
}

// Remove subreddit preference
function removeSubredditPreference(subredditName) {
  const subredditSortOptions = JSON.parse(localStorage.getItem("subredditSortOptions")) || {};
  delete subredditSortOptions[subredditName];
  localStorage.setItem("subredditSortOptions", JSON.stringify(subredditSortOptions));
  updateSubredditPreferencesList(subredditSortOptions);
  saveOptions(); // Automatically save after removing the preference
}

// Update the list of per-subreddit preferences
function updateSubredditPreferencesList(subredditSortOptions) {
  const listContainer = document.getElementById("subredditPreferencesList");
  listContainer.innerHTML = "";

  const sortedSubredditNames = Object.keys(subredditSortOptions).sort();

  sortedSubredditNames.forEach(subredditName => {
      const listItem = document.createElement("div");
      listItem.className = "subreddit-preference";
      
      const subredditDiv = document.createElement("div");
      subredditDiv.textContent = `${subredditName}: ${subredditSortOptions[subredditName]}`;
      
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => removeSubredditPreference(subredditName));
      
      listItem.appendChild(subredditDiv);
      listItem.appendChild(removeBtn);
      listContainer.appendChild(listItem);
  });
}

// Enable/disable "Add Subreddit Preference" button
function checkAddSubredditPreference() {
  const subredditName = document.getElementById("subredditName").value.trim();
  const subredditSortOption = document.getElementById("subredditSortOption").value;
  const addSubredditBtn = document.getElementById("addSubredditBtn");
  
  if (subredditName && subredditSortOption) {
      addSubredditBtn.disabled = false;
      addSubredditBtn.style.backgroundColor = ""; // Reset to default button color
  } else {
      addSubredditBtn.disabled = true;
      addSubredditBtn.style.backgroundColor = "gray";
  }
}

// Disable save button initially if no changes are detected
function checkIfSaveNeeded() {
  const sortOption = document.getElementById("sortOption").value;
  const sortOptionSubreddit = document.getElementById("sortOptionSubreddit").value;
  const subredditSortOptions = JSON.parse(localStorage.getItem("subredditSortOptions")) || {};

  const anyChangesMade = sortOption !== "new" || sortOptionSubreddit !== "new" || Object.keys(subredditSortOptions).length > 0;
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = !anyChangesMade;

  if (!anyChangesMade) {
      saveBtn.style.backgroundColor = "gray"; // Set button to gray when disabled
  }
}

// Initial check
document.addEventListener("DOMContentLoaded", () => {
  restoreOptions();
  checkIfSaveNeeded();
  checkAddSubredditPreference();
  document.getElementById("darkModeToggle").addEventListener("change", handlePreferenceChange);
  document.getElementById("darkModeToggle").addEventListener("change", (event) => {
    applyDarkMode(event.target.checked);
  });
});
document.getElementById("saveBtn").addEventListener("click", saveOptions);
document.getElementById("sortOption").addEventListener("change", handlePreferenceChange);
document.getElementById("sortOptionSubreddit").addEventListener("change", handlePreferenceChange);
document.getElementById("sortOptionUser").addEventListener("change", handlePreferenceChange);
document.getElementById("addSubredditBtn").addEventListener("click", addSubredditPreference);
document.getElementById("subredditName").addEventListener("input", checkAddSubredditPreference);
document.getElementById("subredditSortOption").addEventListener("change", checkAddSubredditPreference);
