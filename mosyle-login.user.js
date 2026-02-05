// ==UserScript==
// @name         Mosyle Automation (Login + Auto-Submit 2FA)
// @namespace    http://tampermonkey.net/
// @version      2026-02-05
// @description  Keeps you logged in, triggers 1Password, and auto-submits 2FA when filled
// @author       Matthew Carroll
// @match        https://mybusiness.mosyle.com/*
// @match        https://*.mosyle.com/*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/mfcarroll/userscripts/main/mosyle-login.user.js
// @downloadURL  https://raw.githubusercontent.com/mfcarroll/userscripts/main/mosyle-login.user.js
// ==/UserScript==

(function () {
  "use strict";

  const IDS = {
    LOGIN_CHECKBOX: "stay_loggedin",
    TWO_FACTOR_INPUT: "code_verification",
  };

  // --- TASK 1: Handle Login Checkbox ---
  function handleLoginCheckbox() {
    const checkbox = document.getElementById(IDS.LOGIN_CHECKBOX);
    // Only click if it exists, is visible, and is unchecked
    if (checkbox && !checkbox.checked && checkbox.offsetParent !== null) {
      checkbox.click();
    }
  }

  // --- TASK 2: Handle 2FA Focus & Auto-Submit ---
  function handleTwoFactor() {
    const input = document.getElementById(IDS.TWO_FACTOR_INPUT);

    // A. If input exists and is visible
    if (input && input.offsetParent !== null) {
      // 1. Focus it once (so 1Password sees it)
      if (input.dataset.scriptFocused !== "true") {
        input.dataset.scriptFocused = "true";
        input.click();
        input.focus();

        // Add a listener to watch for 1Password filling the data
        input.addEventListener("input", () => checkAndSubmit(input));
      }

      // 2. Also check immediately in case we missed the event
      checkAndSubmit(input);
    }
  }

  // Helper: Checks length and clicks Submit if ready
  function checkAndSubmit(inputElement) {
    // Mosyle 2FA is exactly 6 digits
    if (inputElement.value && inputElement.value.length === 6) {
      // Prevent double-submitting
      if (inputElement.dataset.scriptSubmitted === "true") return;
      inputElement.dataset.scriptSubmitted = "true";

      console.log("Mosyle Script: 2FA filled. Auto-submitting now...");

      // Find the submit button inside the same form
      // (We look for 'input[type="submit"]' specifically)
      const form = inputElement.form;
      const submitBtn = form.querySelector('input[type="submit"]');

      if (submitBtn) {
        submitBtn.click();
      }
    }
  }

  // --- Main Loop ---
  function runChecks() {
    handleLoginCheckbox();
    handleTwoFactor();
  }

  // 1. Observer: Watches for the 2FA popup or Login slide-down
  const observer = new MutationObserver(runChecks);

  // 2. Init: Start observing as soon as body exists
  const init = setInterval(() => {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      clearInterval(init);
      runChecks(); // Run once immediately
    }
  }, 50);

  // 3. Safety Net: Login Form Submission
  // Catches the form exactly when "Enter" is pressed or 1Password auto-submits the password.
  document.addEventListener(
    "submit",
    (e) => {
      const checkbox = document.getElementById(IDS.LOGIN_CHECKBOX);
      if (checkbox && !checkbox.checked) {
        checkbox.checked = true; // Force property true before submit
      }
    },
    true,
  );
})();
