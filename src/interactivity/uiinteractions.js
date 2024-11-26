// User Interface Interactions

import { turnOnZoom, turnOffZoom } from "./zooming";
import { turnOnBrush, turnOffBrush } from "./brushing";

/**
 * Select Mouse Function
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

function clickZoomButton() {
  turnOffBrush();
  turnOnZoom();
}

function clickSelectButton() {
  turnOffZoom();
  turnOnBrush();
}

/**
 * Starting UI Interactions
 */
export function startUIInteractions() {
  // Add selectMouseFunction to Interaction Panel Buttons
  const mouseZoomButton = document.getElementById("mouse-zoom-button");
  const mouseSelectButton = document.getElementById("mouse-select-button");

  mouseZoomButton.addEventListener("click", selectMouseFunction);
  mouseZoomButton.addEventListener("click", clickZoomButton);
  mouseSelectButton.addEventListener("click", selectMouseFunction);
  mouseSelectButton.addEventListener("click", clickSelectButton);
}
