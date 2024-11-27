// Loading Pane Functions

const loadingBox = document.getElementById("loadingbox");
const loadingButton = document.getElementById("loadingclosebutton");
const loadingSpinner = document.getElementById("loadingspinner");

/**
 * Close the loading pane
 */
function closeLoadingPane() {
  loadingBox.style.display = "None";
}

/**
 * Hide Loading Spinner
 */
export function hideLoadingSpinnerShowButton() {
  loadingSpinner.style.display = "None";
  loadingButton.style.display = "block";
}

/**
 * Initialize the Loading Message
 */
export function initializeLoadingMessage() {
  loadingButton.addEventListener("click", closeLoadingPane);
}
