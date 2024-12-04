// Functions dealing with the hover pane

import { d3 } from "../imports";

const hoverPaneIDVal = document.getElementById("context-panel-id-value");
const hoverPaneRAVal = document.getElementById("context-panel-ra-value");
const hoverPaneDECVal = document.getElementById("context-panel-dec-value");
const hoverPaneZPhotVal = document.getElementById("context-panel-zphot-value");

/**
 * Function to Set the Hover Pane Info from data point
 * @param {*} dataPoint
 */
export function setHoverPaneInfo(dataPoint = {}) {
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
