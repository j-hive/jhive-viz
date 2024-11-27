import { addDraggingToElements } from "./interactivity/dragging.js";
import { startUIInteractions } from "./interactivity/uiinteractions.js";
import { initializePixiApp } from "./pixiapp.js";
import {
  initializeLoadingMessage,
  hideLoadingSpinnerShowButton,
} from "./panes/loadingpane.js";

import "./style/style.scss";
import { initializeDetailPane } from "./panes/detailpane.js";
import * as config from "./config.js";

// Initial Removing Context Menu
window.addEventListener("contextmenu", (e) => e.preventDefault());

// Initializing Loading Message:

initializeLoadingMessage();

// Initializing Pixi App
initializePixiApp()
  .then(initializeDetailPane)
  .then(hideLoadingSpinnerShowButton);

// Setup UI Interactions
startUIInteractions();

// Adding Dragging to Elements
addDraggingToElements();
