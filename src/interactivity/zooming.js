// Zooming Interactions

import { d3 } from "../imports";
import { dataContainers, plottingConfig, windowState } from "../config";
import { zoomPlot } from "./datainteractions";

const mainContainer = document.getElementById("app");

let mainZoom = null;

export function initZooming() {
  mainZoom = d3
    .zoom()
    .scaleExtent([1, 20])
    .on("zoom", ({ transform }) => zoomPlot(transform));

  d3.select(mainContainer).call(mainZoom);
}

windowState.mouseMode = "zoom";

export function turnOffZoom() {
  d3.select(mainContainer).on(".zoom", null);
}

export function turnOnZoom() {
  d3.select(mainContainer).call(mainZoom);
  windowState.mouseMode = "zoom";
}
