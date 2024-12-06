// Loading Pane Functions

import html2canvas from "html2canvas";

const loadingBox = document.getElementById("loadingbox");
const loadingButton = document.getElementById("loadingclosebutton");
const loadingSpinner = document.getElementById("loadingspinner");
const loadingStatus = document.getElementById("loadingstatus");

/**
 * Close the loading pane
 */
function closeLoadingPane() {
  loadingBox.style.display = "None";
}

/**
 * Hide Loading Spinner and Alert Messages
 */
export function hideLoadingSpinnerShowButton() {
  loadingSpinner.style.display = "None";
  loadingStatus.style.display = "None";
  loadingButton.style.display = "block";
}

/**
 * Initialize the Loading Message
 */
export function initializeLoadingMessage() {
  loadingButton.addEventListener("click", closeLoadingPane);
}

/**
 * Change the Loading Status Message
 * @param {string} statusMessage
 */
export function changeLoadingStatus(statusMessage) {
  loadingStatus.innerHTML = statusMessage;
}
