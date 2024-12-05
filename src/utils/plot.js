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
  dataContainers.data.map((d) => {
    let plotPoint = dataContainers.dataToSprite.get(d);
    plotPoint.position.x = xScaler(d[windowState.currentXAxis]);
    plotPoint.position.y = yScaler(d[windowState.currentYAxis]);
  });
}

/**
 * Function to bring points to the correct colour
 */

export function recolorData() {
  dataContainers.data.map((d) => {
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
}

/**
 * Function to Replot Data
 */
export function replotData() {
  moveDataPoints(windowState.xScaler, windowState.yScaler);
}

export function removeField(fieldName) {
  console.log(`Removing Field ${fieldName}`);

  // Not working correctly
  // dataContainers.data.forEach((element) => {
  //   if (element.fieldName == fieldName) {
  //     let tmpSprite = dataContainers.dataToSprite.get(element);

  //     tmpSprite.parent.removeChild(tmpSprite);
  //   }
  // });
}

export function addField(fieldName) {
  console.log(`Adding Field ${fieldName}`);
}
