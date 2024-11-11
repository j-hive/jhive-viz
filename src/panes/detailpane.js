// Detail Pane Functions

import * as d3 from "d3";
import { dataContainers, plottingConfig, windowState } from "../config";

const detailsPanel = document.getElementById("detailpanel");
const detailsImage = document.getElementById("source-cutout");
const detailsTitleID = document.getElementById("detail-title-header-val");
const detailsTitleRA = document.getElementById("detail-title-ra-val");
const detailsTitleDEC = document.getElementById("detail-title-dec-val");
const detailsTitleMagf150w = document.getElementById(
  "detail-title-mag-f150w-val"
);
const detailsTitleMagf200w = document.getElementById(
  "detail-title-mag-f200w-val"
);
const detailsTitleMagf277w = document.getElementById(
  "detail-title-mag-f277w-val"
);

// Getting SED Container

const SEDContainer = document.getElementById("detail-sed-plot");

/**
 * Get Points from SED
 * @param {*} dataPoint
 * @returns
 */
export function getSEDPoints(dataPoint) {
  let sed = [];

  Object.entries(dataContainers.metadata).forEach((entry) => {
    const [key, value] = entry;
    if (value["is_magnitude"]) {
      let tmpEntry = {};
      tmpEntry["x"] = value["wl_micron"];
      tmpEntry["y"] = dataPoint[key] ? dataPoint[key] : NaN;
      sed.push(tmpEntry);
    }
  });

  return sed;
}

/**
 * Setting NaNs to Arbitrary Low Number
 * @param {number} x  - Input Number
 * @returns {number} Number set to low if NaN
 */
export function setNanToLow(x) {
  return isNaN(x) ? 60 : x;
}

export function initializeDetailPane() {}
