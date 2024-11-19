// Data Interaction Functions

import { d3 } from "../imports";
import { dataContainers, plottingConfig, windowState } from "../config";
import { setHoverPaneInfo } from "../panes/hoverpane";
import { updateDetailPanel } from "../panes/detailpane";
import {
  scalePlotAxis,
  setXLabel,
  setYLabel,
  transformXAxis,
  transformYAxis,
} from "../plotaxis";
import { moveDataPoints, replotData } from "../utils/plot";
import { getRangeWithBorder, make_axis_label } from "../data";

/** @import { FederatedPointerEvent } from "pixi.js" */

/**
 * Initializing the Opacity Slider
 */
export function initOpacitySlider() {
  let opacity_slider = document.getElementById("opacity-slider");
  opacity_slider.value = plottingConfig.DEFAULT_ALPHA;
  opacity_slider.addEventListener("input", changeOpacity);
}

/**
 * Change the opacity of the individual data points
 */
export function changeOpacity() {
  let new_opacity = this.value;

  plottingConfig.DEFAULT_ALPHA = new_opacity;

  dataContainers.data.map((d) => {
    let tmpSprite = dataContainers.dataToSprite.get(d);
    tmpSprite.alpha = plottingConfig.DEFAULT_ALPHA;
  });
}

/**
 * Initialize the colour axis
 */
export function initColorAxis() {
  let colour_axis_options = document.getElementById("colour-axis-selector");
  colour_axis_options.addEventListener("change", switchColorAxis);
}

/**
 * Function to switch what is on the colour axis
 */
export function switchColorAxis() {
  let new_axis = this.value;

  if (new_axis === "None") {
    dataContainers.data.map((d) => {
      let tmpSprite = dataContainers.dataToSprite.get(d);
      tmpSprite.color = plottingConfig.DEFAULT_POINT_COLOR;
    });
  } else {
    let new_color_extent = d3.extent(dataContainers.data, (d) =>
      parseFloat(d[new_axis])
    );

    let colorScaler = d3
      .scaleSequential()
      .domain(new_color_extent)
      .interpolator(d3.interpolateViridis);

    dataContainers.data.map((d) => {
      let tmpSprite = dataContainers.dataToSprite.get(d);
      tmpSprite.tint = colorScaler(d[new_axis]);
    });
  }
}

// Main Data Interaction Functions

/**
 * Function for when pointer is over a data point
 *
 * @param {FederatedPointerEvent} event - Initial Event
 */
export function onPointerOver(event) {
  event.target.tint = plottingConfig.MOUSEOVER_POINT_COLOR;
  event.target.z = 10000;
  event.target.alpha = 1.0;
  event.target.bringToFront();

  let dataPoint = dataContainers.spriteToData.get(event.target);
  setHoverPaneInfo(dataPoint);
}

/**
 * Function for when pointer is moved off a data point
 *
 * @param {FederatedPointerEvent} event - Initial Event
 */
export function onPointerOut(event) {
  let tmpColor = plottingConfig.DEFAULT_POINT_COLOR;
  let tmpAlpha = plottingConfig.DEFAULT_ALPHA;
  const target = event.target;

  if (dataContainers.spriteToSelected.get(target)) {
    tmpColor = plottingConfig.CLICKED_POINT_COLOR;
    tmpAlpha = 1.0;
  } else if (dataContainers.spriteToHighlighted.get(target)) {
    tmpColor = plottingConfig.HIGHLIGHT_POINT_COLOR;
    tmpAlpha = 1.0;
  }

  target.tint = tmpColor;
  target.z = 2;
  target.alpha = tmpAlpha;
  setHoverPaneInfo();
}

/**
 * Function for when a data point is clicked
 *
 * @param {FederatedPointerEvent} event - Initial Event
 */
export function onPointerClick(event) {
  const target = event.target;

  target.tint = plottingConfig.CLICKED_POINT_COLOR;
  if (windowState.selectedPoint) {
    windowState.selectedPoint.tint = plottingConfig.DEFAULT_POINT_COLOR;
    windowState.selectedPoint.alpha = 1.0;
    dataContainers.spriteToSelected.set(windowState.selectedPoint, false);
  }
  windowState.selectedPoint = target;
  dataContainers.spriteToSelected.set(target, true);
  let dataPoint = dataContainers.spriteToData.get(target);
  updateDetailPanel(dataPoint);
}

/**
 * Function to Zoom Main Plotting Area
 *
 * @param transform - The D3 Transform
 */
export function zoomPlot(transform) {
  const zoomedXScaler = transform
    .rescaleX(windowState.xScaler)
    .interpolate(d3.interpolateRound);

  const zoomedYScaler = transform
    .rescaleY(windowState.yScaler)
    .interpolate(d3.interpolateRound);

  // Changing Plot Axis Decorators
  scalePlotAxis(zoomedXScaler, zoomedYScaler);

  // Moving Data Points

  moveDataPoints(zoomedXScaler, zoomedYScaler);

  windowState.currentZoom = transform;
}

// Axis Switching Functions.

let xAxisOptions = document.getElementById("x-axis-selector");
let yAxisOptions = document.getElementById("y-axis-selector");

/**
 * Function to Switch X-axis
 */
export function switchXAxis() {
  let newAxis = xAxisOptions.value;

  let newXExtent = getRangeWithBorder(dataContainers.metadata[newAxis]);

  windowState.xScaler.domain(newXExtent);

  // if (windowState.mouseMode === "select") {
  //   turnOffBrush();
  // }

  const zoomedXScaler = windowState.currentZoom
    .rescaleX(windowState.xScaler)
    .interpolate(d3.interpolateRound);

  // Transforming Axis
  transformXAxis(zoomedXScaler);

  // Changing Labels
  setXLabel(make_axis_label(dataContainers.metadata[newAxis]));

  // Transforming Map
  dataContainers.data.map((d) => {
    let plotPoint = dataContainers.dataToSprite.get(d);

    plotPoint.tint = dataContainers.spriteToHighlighted.get(plotPoint)
      ? plottingConfig.HIGHLIGHT_POINT_COLOR
      : dataContainers.spriteToSelected.get(plotPoint)
      ? plottingConfig.CLICKED_POINT_COLOR
      : plottingConfig.DEFAULT_POINT_COLOR;
  });

  windowState.currentXAxis = newAxis;
  replotData();

  // if (windowState.mouseMode === "select") {
  //   turnOnBrush();
  // }
}

/**
 * Function to Switch Y Axis
 */
export function switchYAxis() {
  let newAxis = yAxisOptions.value;

  let newYExtent = getRangeWithBorder(dataContainers.metadata[newAxis]);
  newYExtent.reverse();

  // if (windowState.mouseMode === "select") {
  //   turnOffBrush();
  // }

  windowState.yScaler.domain(newYExtent);

  const zoomedYScaler = windowState.currentZoom
    .rescaleY(windowState.yScaler)
    .interpolate(d3.interpolateRound);

  transformYAxis(zoomedYScaler);

  // Changing Labels
  setYLabel(make_axis_label(dataContainers.metadata[newAxis]));

  dataContainers.data.map((d) => {
    let plotPoint = dataContainers.dataToSprite.get(d);

    plotPoint.tint = dataContainers.spriteToHighlighted.get(plotPoint)
      ? plottingConfig.HIGHLIGHT_POINT_COLOR
      : dataContainers.spriteToSelected.get(plotPoint)
      ? plottingConfig.CLICKED_POINT_COLOR
      : plottingConfig.DEFAULT_POINT_COLOR;
  });

  windowState.currentYAxis = newAxis;
  replotData();

  // if (windowState.mouseMode === "select") {
  //   turnOnBrush();
  // }
}

// Brushing Functions

/**
 * Function to Initialize Brushing
 */

export async function initBrush() {
  const mainContainer = document.getElementById("app");

  const mainZoom = d3
    .zoom()
    .scaleExtent([1, 20])
    .on("zoom", ({ transform }) => zoomPlot(transform));

  d3.select(mainContainer).call(mainZoom);
  windowState.mouseMode = "zoom";

  function turnOffZoom() {
    d3.select(mainContainer).on(".zoom", null);
  }

  function turnOnZoom() {
    d3.select(mainContainer).call(mainZoom);
    windowState.mouseMode = "zoom";
  }

  const mainBrush = d3.brush().on("start brush end", highlightPoints);

  const svgBrushOutlineElement = await appendToSVG("g");
  let brushElement = null;

  function turnOffBrush() {
    d3.selectAll(brushElement).remove();
  }

  async function turnOnBrush() {
    brushElement = svgBrushOutlineElement.call(mainBrush);
    windowState.mouseMode = "select";
    console.log("Brush Turned On");
  }
}

/**
 * Function to highlight points
 *
 * @param {*} param0
 */

export function highlightPoints({ selection: [[x0, y0], [x1, y1]] }) {
  dataContainers.data.map((d) => {
    let tmpSprite = dataContainers.dataToSprite.get(d);
    if (
      tmpSprite.x > x0 &&
      (tmpSprite.x < x1 - plottingConfig.POINTRADIUS) &
        (tmpSprite.y < y1 - plottingConfig.POINTRADIUS) &&
      tmpSprite.y > y0
    ) {
      tmpSprite.tint = plottingConfig.HIGHLIGHT_POINT_COLOR;
      tmpSprite.alpha = 1.0;
      tmpSprite.bringToFront();
      dataContainers.spriteToHighlighted.set(tmpSprite, true);
    } else {
      tmpSprite.tint = plottingConfig.DEFAULT_POINT_COLOR;
      tmpSprite.alpha = plottingConfig.DEFAULT_ALPHA;
      dataContainers.spriteToHighlighted.set(tmpSprite, false);
    }
  });
}
