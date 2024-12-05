// User Interface Interactions

import { turnOnZoom, turnOffZoom } from "./zooming";
import { turnOnBrush, turnOffBrush } from "./brushing";

/**
 * Function to swap mouse functions
 * @param {*} event
 */
function selectMouseFunction(event) {
  let button = event.target;

  let selectButton = document.getElementById("mouse-select-button");
  let zoomButton = document.getElementById("mouse-zoom-button");

  if (button.id === "mouse-zoom-button") {
    if (!zoomButton.classList.contains("selected")) {
      zoomButton.classList.add("selected");
    }

    if (selectButton.classList.contains("selected")) {
      selectButton.classList.remove("selected");
    }
  }

  if (button.id === "mouse-select-button") {
    if (zoomButton.classList.contains("selected")) {
      zoomButton.classList.remove("selected");
    }

    if (!selectButton.classList.contains("selected")) {
      selectButton.classList.add("selected");
    }
  }
}

/**
 * Function for when Zoom Button is Clicked
 */
function clickZoomButton() {
  turnOffBrush();
  turnOnZoom();
}

/**
 * Function for when the Select Button is Clicked
 */
function clickSelectButton() {
  turnOffZoom();
  turnOnBrush();
}

/**
 * Function to open and close the field selector section
 */
function clickFieldSelectorRow() {
  const fieldSelectorContainer = document.getElementById(
    "field-selector-container"
  );

  const fieldSelectorIndicator = document.getElementById(
    "field-selector-indicator"
  );

  if (fieldSelectorContainer.style.maxHeight) {
    fieldSelectorContainer.style.maxHeight = null;
    fieldSelectorIndicator.innerHTML =
      '<i class="fa-solid fa-caret-right"></i>';
  } else {
    fieldSelectorContainer.style.maxHeight =
      fieldSelectorContainer.scrollHeight + "px";
    fieldSelectorIndicator.innerHTML = '<i class="fa-solid fa-caret-down"></i>';
  }
}

export function showAlert(message) {
  const alertBox = document.getElementById("alert-box");
  const alertInterior = document.getElementById("alert-interior");

  if (!alertBox.classList.contains("alert-visible")) {
    alertBox.classList.add("alert-visible");
  }

  alertInterior.innerHTML = message;

  setTimeout(() => {
    alertBox.classList.remove("alert-visible");
    alertInterior.innerHTML = "";
  }, 2500);
}

/**
 * Starting UI Interactions
 */
export function startUIInteractions() {
  // Add selectMouseFunction to Interaction Panel Buttons
  const mouseZoomButton = document.getElementById("mouse-zoom-button");
  const mouseSelectButton = document.getElementById("mouse-select-button");
  const fieldSelectorLabel = document.getElementById("field-selector-label");
  const fieldSelectorIndicator = document.getElementById(
    "field-selector-indicator"
  );

  mouseZoomButton.addEventListener("click", selectMouseFunction);
  mouseZoomButton.addEventListener("click", clickZoomButton);
  mouseSelectButton.addEventListener("click", selectMouseFunction);
  mouseSelectButton.addEventListener("click", clickSelectButton);

  fieldSelectorLabel.addEventListener("click", clickFieldSelectorRow);
  fieldSelectorIndicator.addEventListener("click", clickFieldSelectorRow);
}
