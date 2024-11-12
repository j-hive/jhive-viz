// Data Interaction Functions

import { d3 } from "../imports";
import { dataContainers, plottingConfig, windowState } from "../config";
import { setHoverPaneInfo } from "../panes/hoverpane";

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

  let dataPoint = dataContainers.spriteToData.get(this);
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