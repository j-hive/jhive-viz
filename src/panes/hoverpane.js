// Functions dealing with the hover pane

import { csvParse } from "d3";
import { dataContainers } from "../config";
import { d3 } from "../imports";

const hoverPaneFieldVal = document.getElementById("context-panel-field-value");
const hoverPaneIDVal = document.getElementById("context-panel-id-value");
const hoverPaneRAVal = document.getElementById("context-panel-ra-value");
const hoverPaneDECVal = document.getElementById("context-panel-dec-value");
const hoverPaneZPhotVal = document.getElementById("context-panel-zphot-value");
const hoverPaneColorbarRow = document.getElementById("colorbar-row");
const hoverPaneColorbarColors = document.getElementById("colorbar-colors");

/**
 * Function to Set the Hover Pane Info from data point
 * @param {*} dataPoint
 */
export function setHoverPaneInfo(dataPoint = {}) {
  hoverPaneFieldVal.innerHTML = dataPoint["fieldName"]
    ? dataContainers.fieldsFile[dataPoint["fieldName"]].display
    : "";
  hoverPaneIDVal.innerHTML = dataPoint["id"]
    ? d3.format(".0f")(dataPoint["id"])
    : "";
  hoverPaneRAVal.innerHTML = dataPoint["ra"]
    ? d3.format(".5f")(dataPoint["ra"]) + "&deg;"
    : "";
  hoverPaneDECVal.innerHTML = dataPoint["dec"]
    ? d3.format(".5f")(dataPoint["dec"]) + "&deg;"
    : "";
  hoverPaneZPhotVal.innerHTML = dataPoint["zfit_50"]
    ? d3.format(".2f")(dataPoint["zfit_50"])
    : "";
}

export function createColorBar() {
  const colors = [];
  const n = 256;

  for (let i = 0; i < n; ++i) {
    colors.push(d3.interpolateViridis(i / (n - 1)));
  }

  const canvas = document.createElement("canvas");
  canvas.width = n;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  canvas.id = "colorbarSVG";

  for (let i = 0; i < n; ++i) {
    context.fillStyle = colors[i];
    context.fillRect(i, 0, 1, 1);
  }

  hoverPaneColorbarColors.appendChild(canvas);
}
