import * as d3 from 'd3';
import * as PIXI from 'pixi.js';
import { Ease, ease } from 'pixi-ease';
import { addDraggingToElements } from './js/dragging.js'
import { startUIInteractions } from './js/uiinteractions.js';
import { initializePixiApp } from './js/pixiapp.js';

import './style/style.scss'

// Testing: Determining Size of app div

let app_length = document.getElementById("app").clientWidth;
let app_height = document.getElementById("app").clientHeight;

// Initializing Pixi App
initializePixiApp();

// Setup UI Interactions
startUIInteractions();


// Adding Dragging to Elements
addDraggingToElements();

