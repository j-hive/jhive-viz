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
import { turnOffBrush, turnOnBrush } from "./brushing";
import { resetZoom } from "./zooming";

/** @import { FederatedPointerEvent } from "pixi.js" */

/**
 * Initializing the Opacity Slider
 */
export function initOpacitySlider() {
  let opacity_slider = document.getElementById("opacity-slider");
  windowState.currentOpacity = plottingConfig.DEFAULT_ALPHA;
  opacity_slider.value = windowState.currentOpacity;
  opacity_slider.addEventListener("input", changeOpacity);
}

/**
 * Change the opacity of the individual data points
 */
export function changeOpacity() {
  let new_opacity = this.value;

  windowState.currentOpacity = new_opacity;

  dataContainers.fieldList.map((fieldName) => {
    dataContainers.data[fieldName].map((d) => {
      let tmpSprite = dataContainers.dataToSprite.get(d);
      tmpSprite.alpha = windowState.currentOpacity;
    });
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
  const colorbarTitle = document.getElementById("colorbar-title");
  const colorbarUnits = document.getElementById("colorbar-units");
  const colorbarMinValue = document.getElementById("colorbar-min-value");
  const colorbarMaxValue = document.getElementById("colorbar-max-value");

  let newAxis = document.getElementById("colour-axis-selector").value;

  if (newAxis === "None") {
    // Setting Window State Parameters
    windowState.currentColorAxis = null;
    windowState.colorRange = null;
    windowState.colorScaler = null;

    dataContainers.fieldList.map((fieldName) => {
      dataContainers.data[fieldName].map((d) => {
        let tmpSprite = dataContainers.dataToSprite.get(d);
        tmpSprite.tint = plottingConfig.DEFAULT_POINT_COLOR;
      });
    });

    colorbarTitle.innerHTML = "";
    colorbarMinValue.innerHTML = "";
    colorbarMaxValue.innerHTML = "";
    colorbarUnits.innerHTML = "";
  } else {
    windowState.currentColorAxis = newAxis;
    windowState.colorRange = getRangeWithBorder(
      dataContainers.metadata.columns[newAxis]
    );

    windowState.colorScaler = d3
      .scaleSequential()
      .domain(windowState.colorRange)
      .interpolator(d3.interpolateViridis);

    dataContainers.fieldList.map((fieldName) => {
      dataContainers.data[fieldName].map((d) => {
        let tmpSprite = dataContainers.dataToSprite.get(d);
        tmpSprite.tint = windowState.colorScaler(d[newAxis]);
      });
    });

    colorbarTitle.innerHTML = dataContainers.metadata.columns[newAxis].display;
    colorbarMinValue.innerHTML = d3.format("0.1f")(windowState.colorRange[0]);
    colorbarMaxValue.innerHTML = d3.format("0.1f")(windowState.colorRange[1]);
    colorbarUnits.innerHTML = dataContainers.metadata.columns[newAxis]
      .output_units
      ? "(" + dataContainers.metadata.columns[newAxis].output_units + ")"
      : "";
  }
}

// Main Data Interaction Functions

/**
 * Function for when pointer is over a data point
 *
 * @param {FederatedPointerEvent} event - Initial Event
 */
export function onPointerOver(event) {
  windowState.mouseOverPoint = event.target;
  event.target.tint = plottingConfig.MOUSEOVER_POINT_COLOR;
  event.target.z = 10000;
  event.target.alpha = 1.0;
  event.target.bringToFront();

  // let dataPoint = dataContainers.spriteToData.get(event.target);
  // setHoverPaneInfo(dataPoint);
}

/**
 * Function for when pointer is moved off a data point
 *
 * @param {FederatedPointerEvent} event - Initial Event
 */
export function onPointerOut(event) {
  let tmpAlpha = windowState.currentOpacity;
  const target = event.target;

  if (dataContainers.spriteToSelected.get(target)) {
    tmpAlpha = 1.0;
  } else if (dataContainers.spriteToHighlighted.get(target)) {
    tmpAlpha = 1.0;
  }
  windowState.mouseOverPoint = false;
  target.tint = getPointColor(target);
  target.z = 2;
  target.alpha = tmpAlpha;
  // setHoverPaneInfo();
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
    dataContainers.spriteToSelected.set(windowState.selectedPoint, false);
    windowState.selectedPoint.tint = getPointColor(windowState.selectedPoint);
    windowState.selectedPoint.alpha = windowState.currentOpacity;
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

  // Get new range
  let newXRange = getRangeWithBorder(dataContainers.metadata.columns[newAxis]);
  windowState.xRange = newXRange;

  windowState.xScaler.domain(windowState.xRange);

  // Turn off brushing while changing axis
  if (windowState.mouseMode === "select") {
    turnOffBrush();
  }

  const zoomedXScaler = windowState.currentZoom
    .rescaleX(windowState.xScaler)
    .interpolate(d3.interpolateRound);

  // Transforming Axis
  transformXAxis(zoomedXScaler);

  // Changing Labels
  setXLabel(make_axis_label(dataContainers.metadata.columns[newAxis]));

  // Transforming Map
  dataContainers.fieldList.map((fieldName) => {
    dataContainers.data[fieldName].map((d) => {
      let plotPoint = dataContainers.dataToSprite.get(d);

      plotPoint.tint = getPointColor(plotPoint);
    });
  });

  windowState.currentXAxis = newAxis;
  replotData();

  // Turn on brushing if was on prior to axis change
  if (windowState.mouseMode === "select") {
    turnOnBrush();
  }
}

/**
 * Function to Switch Y Axis
 */
export function switchYAxis() {
  let newAxis = yAxisOptions.value;

  // Getting New extent
  let newYRange = getRangeWithBorder(dataContainers.metadata.columns[newAxis]);
  newYRange.reverse();
  windowState.yRange = newYRange;

  // Turn off brushing while changing axis
  if (windowState.mouseMode === "select") {
    turnOffBrush();
  }

  windowState.yScaler.domain(windowState.yRange);

  const zoomedYScaler = windowState.currentZoom
    .rescaleY(windowState.yScaler)
    .interpolate(d3.interpolateRound);

  transformYAxis(zoomedYScaler);

  // Changing Labels
  setYLabel(make_axis_label(dataContainers.metadata.columns[newAxis]));

  dataContainers.fieldList.map((fieldName) => {
    dataContainers.data[fieldName].map((d) => {
      let plotPoint = dataContainers.dataToSprite.get(d);

      plotPoint.tint = getPointColor(plotPoint);
    });
  });

  windowState.currentYAxis = newAxis;
  replotData();

  // Turn on brushing if was on prior to axis change
  if (windowState.mouseMode === "select") {
    turnOnBrush();
  }
}

/**
 * Function to initialize the axis changes
 */

export function initAxisChange() {
  xAxisOptions.addEventListener("change", switchXAxis);
  yAxisOptions.addEventListener("change", switchYAxis);
}

/**
 * Function to highlight points
 *
 * @param {*} param0
 */

export function highlightPoints(brushEvent) {
  let x0, x1, y0, y1;

  if (brushEvent.selection) {
    [[x0, y0], [x1, y1]] = brushEvent.selection;
  }

  dataContainers.fieldList.map((fieldName) => {
    dataContainers.data[fieldName].map((d) => {
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
        tmpSprite.alpha = windowState.currentOpacity;
        dataContainers.spriteToHighlighted.set(tmpSprite, false);
        tmpSprite.tint = getPointColor(tmpSprite);
      }
    });
  });
}

/**
 * Get appropriate point colour
 */

export function getPointColor(sprite) {
  let currentColor = plottingConfig.DEFAULT_POINT_COLOR;

  if (dataContainers.spriteToSelected.get(sprite)) {
    currentColor = plottingConfig.CLICKED_POINT_COLOR;
  } else if (dataContainers.spriteToHighlighted.get(sprite)) {
    currentColor = plottingConfig.HIGHLIGHT_POINT_COLOR;
  } else if (windowState.currentColorAxis) {
    currentColor = windowState.colorScaler(
      dataContainers.spriteToData.get(sprite)[windowState.currentColorAxis]
    );
  }

  return currentColor;
}

/**
 * Reset plot to original state
 */
export function resetPlot() {
  const xAxisSelector = document.getElementById("x-axis-selector");
  const yAxisSelector = document.getElementById("y-axis-selector");
  const colourAxisSelector = document.getElementById("colour-axis-selector");

  xAxisSelector.value = plottingConfig.DEFAULT_X_AXIS;
  yAxisSelector.value = plottingConfig.DEFAULT_Y_AXIS;
  colourAxisSelector.value = plottingConfig.DEFAULT_COLOR_AXIS;

  resetZoom();

  switchXAxis();
  switchYAxis();
  switchColorAxis();
}
