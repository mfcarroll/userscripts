// ==UserScript==
// @name         Mosyle Stay Logged In
// @namespace    http://tampermonkey.net/
// @version      2026-02-05
// @description  Forces "Keep me logged in on this computer" checkbox on Mosyle Business. Compatible with 1Password auto-fill.
// @author       Matthew Carroll
// @match        https://mybusiness.mosyle.com/*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/mfcarroll/userscripts/main/mosyle-login.user.js
// @downloadURL  https://raw.githubusercontent.com/mfcarroll/userscripts/main/mosyle-login.user.js
// ==/UserScript==

(function () {
  "use strict";

  const CHECKBOX_ID = "stay_loggedin";

  // 1. Standard visual check (Natural behavior)
  // We try to click it properly if we see it appear.
  function attemptCheck() {
    const checkbox = document.getElementById(CHECKBOX_ID);
    // Only click if it exists, is visible, and is unchecked
    if (checkbox && !checkbox.checked && checkbox.offsetParent !== null) {
      checkbox.click();
    }
  }

  // 2. The "Speed Trap" (Crucial for 1Password)
  // Catches the form exactly when "Enter" is pressed or 1Password auto-submits.
  document.addEventListener(
    "submit",
    (e) => {
      const checkbox = document.getElementById(CHECKBOX_ID);
      if (checkbox && !checkbox.checked) {
        // Force the underlying property true immediately before data sends
        checkbox.checked = true;
      }
    },
    true,
  );

  // 3. Watch for the login box sliding down
  const observer = new MutationObserver(attemptCheck);

  // Wait for body to exist, then start watching
  const init = setInterval(() => {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      clearInterval(init);
      attemptCheck(); // Run once on init just in case
    }
  }, 50);
})();
