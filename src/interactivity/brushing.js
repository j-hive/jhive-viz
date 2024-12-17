// Data Brushing Functions

import { d3 } from "../imports";
import { windowState } from "../config";
import { appendToSVG } from "../plotaxis";
import { highlightPoints } from "./datainteractions";
import { openContextMenu } from "./contextmenu";

/**
 * Brush Outline Element
 */
let svgBrushOutlineElement = null;

/**
 * Brush Element
 */
let brushElement = null;

const brushTools = { mainBrush: null };

/**
 * Initialize Brushing
 */
export async function initBrushing() {
  svgBrushOutlineElement = await appendToSVG("g");
  brushTools.mainBrush = d3.brush().on("start end", highlightPoints);
}

/**
 * Turning off Brushing
 */
export function turnOffBrush() {
  d3.selectAll(brushElement).remove();
  d3.selectAll(svgBrushOutlineElement).remove();
  document
    .getElementById("plot-decorators")
    .removeEventListener("contextmenu", openContextMenu);
}

/**
 * Turning on Brushing
 */
export async function turnOnBrush() {
  svgBrushOutlineElement = await appendToSVG("g");
  brushElement = svgBrushOutlineElement.call(brushTools.mainBrush);

  document
    .getElementById("plot-decorators")
    .addEventListener("contextmenu", openContextMenu);

  windowState.mouseMode = "select";
}
