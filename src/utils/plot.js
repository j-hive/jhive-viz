// Plotting Utility Functions

import { d3 } from "../imports";
import { dataContainers, plottingConfig, windowState } from "../config";

/**
 * Function to Move Points on the Main Axis based on provided scalers
 * No other parameters are touched -- only position
 *
 * @param {*} xScaler - the Scaler for the x-axis
 * @param {*} yScaler - the Scaler for the y-axis
 */
export function moveDataPoints(xScaler, yScaler) {
  dataContainers.data.map((d) => {
    let plotPoint = dataContainers.dataToSprite.get(d);
    plotPoint.position.x = xScaler(d[windowState.currentXAxis]);
    plotPoint.position.y = yScaler(d[windowState.currentYAxis]);
  });
}

/**
 * Function to Replot Data
 */
export function replotData() {
  moveDataPoints(windowState.xScaler, windowState.yScaler);
}
