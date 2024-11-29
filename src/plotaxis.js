// Functions related to creation and styling of plot axes

import { d3 } from "./imports";
import { dataContainers, plottingConfig, windowState } from "./config";
import { make_axis_label } from "./data";

/**
 * Container for all plot axis objects
 */
const plotAxisContainers = {
  svg: null,
  yAxis: null,
  xAxis: null,
  yLabel: null,
  xLabel: null,
};

/**
 * Initialize the Plot Axis Decorators
 */
export function initializePlotAxis() {
  // Adding and Styling Axes

  plotAxisContainers.svg = d3
    .select("#plot-decorators")
    .append("svg")
    .attr("id", "plot-decorators-svg")
    .attr("width", windowState.WIDTH)
    .attr("height", windowState.HEIGHT)
    .style("top", 0)
    .style("left", 0)
    .style("position", "absolute")
    .attr("viewBox", [0, 0, windowState.WIDTH, windowState.HEIGHT]);

  plotAxisContainers.yAxis = plotAxisContainers.svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${plottingConfig.LEFTMARGIN},0)`)
    .call(
      d3
        .axisLeft(windowState.yScaler)
        .tickSizeOuter(0)
        .tickSize(-windowState.WIDTH * 1.3)
    );

  plotAxisContainers.xAxis = plotAxisContainers.svg
    .append("g")
    .attr("class", "x-axis")
    .attr(
      "transform",
      `translate(0,${windowState.HEIGHT - plottingConfig.LEFTMARGIN})`
    )
    .call(
      d3
        .axisBottom(windowState.xScaler)
        .tickSizeOuter(0)
        .tickSize(-windowState.HEIGHT * 1.3)
    );

  // Add Axes Labels
  plotAxisContainers.yLabel = plotAxisContainers.svg
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("x", plottingConfig.LEFTMARGIN / 2)
    .attr("y", windowState.HEIGHT / 2)
    .attr("transform", `rotate(-90, 20, ${windowState.HEIGHT / 2})`)
    .text(make_axis_label(dataContainers.metadata[windowState.currentYAxis]));

  plotAxisContainers.xLabel = plotAxisContainers.svg
    .append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", windowState.WIDTH / 2)
    .attr("y", windowState.HEIGHT - plottingConfig.LOWERMARGIN / 2 + 3)
    .text(make_axis_label(dataContainers.metadata[windowState.currentXAxis]));
}

// Scaling/Zooming Axes

/**
 * scale the plot axis (for zooms)
 * @param {*} zoomedXScaler
 * @param {*} zoomedYScaler
 */
export function scalePlotAxis(zoomedXScaler, zoomedYScaler) {
  plotAxisContainers.xAxis.call(
    d3
      .axisBottom(zoomedXScaler)
      .tickSizeOuter(0)
      .tickSize(-windowState.HEIGHT * 1.3)
  );

  plotAxisContainers.yAxis.call(
    d3
      .axisLeft(zoomedYScaler)
      .tickSizeOuter(0)
      .tickSize(-windowState.WIDTH * 1.3)
  );
}

// Transforming between Axes

/**
 * function to transform the x-axis
 * @param {*} zoomedXScaler
 */
export function transformXAxis(zoomedXScaler) {
  plotAxisContainers.xAxis
    .transition()
    .duration(1000)
    .call(
      d3
        .axisBottom(zoomedXScaler)
        .tickSizeOuter(0)
        .tickSize(-windowState.HEIGHT * 1.3)
    );
}

/**
 * function to transform the y-axis
 * @param {*} zoomedYScaler
 */
export function transformYAxis(zoomedYScaler) {
  plotAxisContainers.yAxis
    .transition()
    .duration(1000)
    .call(
      d3
        .axisLeft(zoomedYScaler)
        .tickSizeOuter(0)
        .tickSize(-windowState.WIDTH * 1.3)
    );
}

// Setting Axis Labels

/**
 * Change Y-Axis Label
 * @param {string} text - New Y-Axis Label
 */
export function setYLabel(text) {
  plotAxisContainers.yLabel.text(text);
}

/**
 * Change X-Axis Label
 * @param {string} text - New X-Axis Label
 */
export function setXLabel(text) {
  plotAxisContainers.xLabel.text(text);
}

/**
 * Add an Element to the plot axis SVG
 * @param {string} element - the element type to add to the plot axis
 * @returns {SVGElement}
 */
export async function appendToSVG(element) {
  const newElement = plotAxisContainers.svg.append(element);
  return newElement;
}

/**
 * Resize the SVG to the current window size
 */
export function resizePlotAxis() {
  plotAxisContainers.svg
    .attr("width", windowState.WIDTH)
    .attr("height", windowState.HEIGHT);
}
