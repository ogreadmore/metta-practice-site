(function () {
  "use strict";

  var PASSWORD_HASH = "a4eff097ff00b2bed8c3623563f2d1011c6504dddacffd8c81ff5183986f330c";
  var SESSION_KEY = "metta-preview-access-v1";
  var root = document.documentElement;

  function readSession() {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === PASSWORD_HASH;
    } catch (_) {
      return false;
    }
  }

  function writeSession() {
    try {
      window.sessionStorage.setItem(SESSION_KEY, PASSWORD_HASH);
    } catch (_) {}
  }

  function clearSession() {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
  }

  function removeInitialLock() {
    var initialLock = document.getElementById("metta-initial-lock");
    if (initialLock) initialLock.remove();
  }

  function addStatusControl() {
    if (document.getElementById("metta-preview-status")) return;
    var status = document.createElement("div");
    status.id = "metta-preview-status";
    status.setAttribute("role", "status");
    status.innerHTML =
      '<span>Private review</span><span aria-hidden="true">·</span>' +
      '<button id="metta-preview-lock" type="button">Lock</button>';
    document.body.appendChild(status);
    document.getElementById("metta-preview-lock").addEventListener("click", function () {
      clearSession();
      window.location.reload();
    });
  }

  function unlock() {
    var gate = document.getElementById("metta-preview-gate");
    if (gate) gate.remove();
    root.classList.remove("metta-gate-active");
    root.classList.add("metta-unlocked");
    removeInitialLock();
    addStatusControl();
  }

  function toHex(buffer) {
    return Array.from(new Uint8Array(buffer), function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
  }

  async function hashPassword(value) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Secure password checking is not available in this browser.");
    }
    var digest = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value)
    );
    return toHex(digest);
  }

  function showGate() {
    root.classList.add("metta-gate-active");
    removeInitialLock();

    var gate = document.createElement("div");
    gate.id = "metta-preview-gate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "metta-preview-title");
    gate.innerHTML =
      '<div class="metta-preview-panel">' +
        '<div class="metta-preview-mark" aria-hidden="true"></div>' +
        '<h1 id="metta-preview-title">Metta<br><span>Practice</span></h1>' +
        '<p class="metta-preview-intro">This site is private while the book and audiobook receive their final review.</p>' +
        '<form id="metta-preview-form" novalidate>' +
          '<label for="metta-preview-password">Preview password</label>' +
          '<input id="metta-preview-password" type="password" autocomplete="current-password" required>' +
          '<button class="metta-preview-submit" type="submit">View the private site</button>' +
          '<p class="metta-preview-error" id="metta-preview-error" role="alert" aria-live="polite"></p>' +
        '</form>' +
        '<p class="metta-preview-byline">The Science, History, and Art of Universal Love · Taylor Oliphant</p>' +
      '</div>';
    document.body.appendChild(gate);

    var form = document.getElementById("metta-preview-form");
    var password = document.getElementById("metta-preview-password");
    var error = document.getElementById("metta-preview-error");
    var button = form.querySelector("button");

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      error.textContent = "";
      if (!password.value) {
        error.textContent = "Enter the preview password.";
        password.focus();
        return;
      }

      button.disabled = true;
      button.textContent = "Checking…";
      try {
        if (await hashPassword(password.value) === PASSWORD_HASH) {
          password.value = "";
          writeSession();
          unlock();
          return;
        }
        error.textContent = "That password was not accepted. Please try again.";
        password.select();
      } catch (problem) {
        error.textContent = problem.message || "This browser could not check the password.";
      } finally {
        button.disabled = false;
        button.textContent = "View the private site";
      }
    });

    password.focus();
  }

  function start() {
    if (readSession()) {
      unlock();
    } else {
      showGate();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
