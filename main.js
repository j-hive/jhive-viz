import * as d3 from 'd3';
import * as PIXI from 'pixi.js';
import { Ease, ease } from 'pixi-ease';

import './style/style.scss'

// Testing: Determining Size of app div

let div_length = document.getElementById("app").clientWidth;
let div_height = document.getElementById("app").clientHeight;

console.log("Length: %d", div_length);
console.log("Height: %d", div_height);



function closeDetailPanel() {
  // Function to Close the details panel:

  const detailsPanel = document.getElementById("detailpanel");

  detailsPanel.classList.remove("details-on");
  detailsPanel.classList.add("details-off");

}

const closeDetailButton = document.getElementById("closedetailbutton");
closeDetailButton.addEventListener("click", closeDetailPanel);