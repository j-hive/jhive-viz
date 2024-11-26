// Data Brushing Functions

import { d3 } from "../imports";
import { dataContainers, plottingConfig, windowState } from "../config";
import { appendToSVG } from "../plotaxis";
import { highlightPoints } from "./datainteractions";

/**
 * Primary D3 Brush Object
 */
let mainBrush = null;

/**
 * Brush Outline Element
 */
let svgBrushOutlineElement = null;

/**
 * Brush Element
 */
let brushElement = null;

/**
 * Initialize Brushing
 */
export async function initBrushing() {
  mainBrush = d3.brush().on("start end", highlightPoints);
  svgBrushOutlineElement = await appendToSVG("g");
}

/**
 * Turning off Brushing
 */
export function turnOffBrush() {
  d3.selectAll(brushElement).remove();
}

/**
 * Turning on Brushing
 */
export async function turnOnBrush() {
  brushElement = svgBrushOutlineElement.call(mainBrush);
  windowState.mouseMode = "select";
}
