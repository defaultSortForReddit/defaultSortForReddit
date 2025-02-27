// Author: James Wiesen
// Copyright © 2025 defaultSortForReddit. All rights reserved.

// Save options to chrome.storage
function saveOptions() {
    console.log("saveOptions called");
    const sortOption = document.getElementById("sortOption").value;
    const sortOptionSubreddit = document.getElementById("sortOptionSubreddit").value;
    const sortOptionUser = document.getElementById("sortOptionUser").value;
    const darkMode = document.getElementById("darkModeToggle").checked;

    chrome.storage.local.get("subredditSortOptions", (result) => {
        const subredditSortOptions = result.subredditSortOptions || {};
        chrome.storage.local.set({
            sortOption: sortOption,
            sortOptionSubreddit: sortOptionSubreddit,
            sortOptionUser: sortOptionUser,
            subredditSortOptions: subredditSortOptions,
            darkMode: darkMode
        }, () => {
            console.log("Options saved");
            const saveBtn = document.getElementById("saveBtn");
            saveBtn.disabled = true;
            saveBtn.textContent = "Preferences Saved!";
            
            setTimeout(() => {
                saveBtn.textContent = "Save Default Sort Options";
            }, 2000);
        });
    });
}

// Restore options from chrome.storage
function restoreOptions() {
    console.log("restoreOptions called");
    function setCurrentChoice(result) {
        console.log("setCurrentChoice called with result:", result);
        const sortOption = result.sortOption || "new";
        const sortOptionSubreddit = result.sortOptionSubreddit || "new";
        const sortOptionUser = result.sortOptionUser || "new";
        const subredditSortOptions = result.subredditSortOptions || {};
        const darkMode = result.darkMode || false;

        document.getElementById("sortOption").value = sortOption;
        document.getElementById("sortOptionSubreddit").value = sortOptionSubreddit;
        document.getElementById("sortOptionUser").value = sortOptionUser;
        updateSubredditPreferencesList(subredditSortOptions);

        document.getElementById("darkModeToggle").checked = darkMode;
        applyDarkMode(darkMode);

        document.getElementById("saveBtn").disabled = true;
    }

    function onError(error) {
        console.error(`Error: ${error}`);
    }

    chrome.storage.local.get(["sortOption", "sortOptionSubreddit", "subredditSortOptions", "darkMode", "sortOptionUser"], setCurrentChoice);
}

// Apply Dark Mode based on the user's preference
function applyDarkMode(isDarkMode) {
    console.log("applyDarkMode called with isDarkMode:", isDarkMode);
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
    console.log("handlePreferenceChange called with event:", event);
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
    console.log("addSubredditPreference called");
    const subredditName = document.getElementById("subredditName").value.trim().toLowerCase(); // Convert to lowercase
    const subredditSortOption = document.getElementById("subredditSortOption").value;
    if (subredditName) {
        chrome.storage.local.get("subredditSortOptions", (result) => {
            const subredditSortOptions = result.subredditSortOptions || {};
            subredditSortOptions[subredditName] = subredditSortOption;
            chrome.storage.local.set({ subredditSortOptions: subredditSortOptions }, () => {
                updateSubredditPreferencesList(subredditSortOptions);
                document.getElementById("subredditName").value = "";
                document.getElementById("subredditSortOption").value = "new"; // Default to "new"
                document.getElementById("addSubredditBtn").disabled = true;
                document.getElementById("addSubredditBtn").style.backgroundColor = "gray";
            });
        });
    }
}

// Remove subreddit preference
function removeSubredditPreference(subredditName) {
    console.log("removeSubredditPreference called with subredditName:", subredditName);
    chrome.storage.local.get('subredditSortOptions', (result) => {
      const subredditSortOptions = result.subredditSortOptions || {};
      delete subredditSortOptions[subredditName];
      chrome.storage.local.set({ 'subredditSortOptions': subredditSortOptions }, () => {
        updateSubredditPreferencesList(subredditSortOptions);
        saveOptions(); // Automatically save after removing the preference
      });
    });
}

// Update the list of per-subreddit preferences
function updateSubredditPreferencesList(subredditSortOptions) {
    console.log("updateSubredditPreferencesList called with subredditSortOptions:", subredditSortOptions);
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
    console.log("checkAddSubredditPreference called");
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
    console.log("checkIfSaveNeeded called");
    chrome.storage.local.get(['sortOption', 'sortOptionSubreddit', 'subredditSortOptions'], (result) => {
      const sortOption = result.sortOption || 'new';
      const sortOptionSubreddit = result.sortOptionSubreddit || 'new';
      const subredditSortOptions = result.subredditSortOptions || {};

      const anyChangesMade = sortOption !== "new" || sortOptionSubreddit !== "new" || Object.keys(subredditSortOptions).length > 0;
      const saveBtn = document.getElementById("saveBtn");
      saveBtn.disabled = !anyChangesMade;

      if (!anyChangesMade) {
        saveBtn.style.backgroundColor = "gray"; // Set button to gray when disabled
      }
    });
}

// Initial check
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");
    restoreOptions();
    checkIfSaveNeeded();
    checkAddSubredditPreference();
    document.getElementById("darkModeToggle").addEventListener("change", handlePreferenceChange);
    document.getElementById("sortOption").addEventListener("change", handlePreferenceChange);
    document.getElementById("sortOptionSubreddit").addEventListener("change", handlePreferenceChange);
    document.getElementById("sortOptionUser").addEventListener("change", handlePreferenceChange);
    document.getElementById("addSubredditBtn").addEventListener("click", addSubredditPreference);
    document.getElementById("subredditName").addEventListener("input", checkAddSubredditPreference);
    document.getElementById("subredditSortOption").addEventListener("change", checkAddSubredditPreference);
    document.getElementById("saveBtn").addEventListener("click", saveOptions);
});
