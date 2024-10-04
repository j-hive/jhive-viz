import * as d3 from 'd3';
import * as PIXI from 'pixi.js';
import { Ease, ease } from 'pixi-ease';
import { addDraggingToElements } from './dragging.js'
import { startUIInteractions } from './uiinteractions.js';
import { initializePixiApp } from './pixiapp.js';
import { initializeLoadingMessage, hideLoadingSpinnerShowButton } from './loading.js';

import './style/style.scss'

// Testing: Determining Size of app div

let app_length = document.getElementById("app").clientWidth;
let app_height = document.getElementById("app").clientHeight;

// Initial Removing Context Menu
window.addEventListener("contextmenu", e => e.preventDefault());

// Initializing Loading Message:

initializeLoadingMessage();

// Initializing Pixi App
initializePixiApp().then(hideLoadingSpinnerShowButton);

// Setup UI Interactions
startUIInteractions();


// Adding Dragging to Elements
addDraggingToElements();
