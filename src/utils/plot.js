// Plotting Utility Functions

import { d3 } from "../imports";
import { dataContainers, plottingConfig, windowState } from "../config";
import { getPointColor } from "../interactivity/datainteractions";

/**
 * Function to Move Points on the Main Axis based on provided scalers
 * No other parameters are touched -- only position
 *
 * @param {*} xScaler - the Scaler for the x-axis
 * @param {*} yScaler - the Scaler for the y-axis
 */
export function moveDataPoints(xScaler, yScaler) {
  dataContainers.fieldList.map((fieldName) => {
    dataContainers.data[fieldName].map((d) => {
      let plotPoint = dataContainers.dataToSprite.get(d);
      plotPoint.position.x = xScaler(d[windowState.currentXAxis]);
      plotPoint.position.y = yScaler(d[windowState.currentYAxis]);
    });
  });
}

/**
 * Function to bring points to the correct colour
 */

export function recolorData() {
  dataContainers.fieldList.map((fieldName) => {
    dataContainers.data[fieldName].map((d) => {
      let plotPoint = dataContainers.dataToSprite.get(d);
      plotPoint.tint = getPointColor(plotPoint);

      let tmpAlpha = windowState.currentOpacity;
      if (dataContainers.spriteToSelected.get(plotPoint)) {
        tmpAlpha = 1.0;
      } else if (dataContainers.spriteToHighlighted.get(plotPoint)) {
        tmpAlpha = 1.0;
      }

      plotPoint.alpha = tmpAlpha;
    });
  });
}

/**
 * Function to Replot Data
 */
export function replotData() {
  const zoomedYScaler = windowState.currentZoom
    .rescaleY(windowState.yScaler)
    .interpolate(d3.interpolateRound);

  const zoomedXScaler = windowState.currentZoom
    .rescaleX(windowState.xScaler)
    .interpolate(d3.interpolateRound);

  moveDataPoints(zoomedXScaler, zoomedYScaler);
}

export function addField(fieldName) {
  console.log(`Adding Field ${fieldName}`);
}
