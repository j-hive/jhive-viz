import * as d3 from 'd3';
import * as PIXI from 'pixi.js';
import { Ease, ease } from 'pixi-ease';
import { addDraggingToElements } from './js/dragging.js'

import './style/style.scss'

// Testing: Determining Size of app div

let app_length = document.getElementById("app").clientWidth;
let app_height = document.getElementById("app").clientHeight;



// Detail Panel 

function closeDetailPanel() {
  // Function to Close the details panel:

  const detailsPanel = document.getElementById("detailpanel");

  detailsPanel.classList.remove("details-on");
  detailsPanel.classList.add("details-off");

}

function openDetailPanel() {
  // Function to Close the details panel:

  const detailsPanel = document.getElementById("detailpanel");

  detailsPanel.classList.remove("details-off");
  detailsPanel.classList.add("details-on");

}

const closeDetailButton = document.getElementById("closedetailbutton");
closeDetailButton.addEventListener("click", closeDetailPanel);

// Adding Dragging to Elements
addDraggingToElements();