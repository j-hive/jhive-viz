// pixiapp.js

import { d3, PIXI } from "./imports";
import { plottingConfig, dataContainers, windowState } from "./config";
import {
  load_data,
  add_data_options_to_axis_selectors,
  getRangeWithBorder,
} from "./data";
import { appendToSVG, initializePlotAxis, resizePlotAxis } from "./plotaxis";
import {
  highlightPoints,
  initColorAxis,
  initOpacitySlider,
  onPointerClick,
  onPointerOut,
  onPointerOver,
  switchXAxis,
  switchYAxis,
  zoomPlot,
} from "./interactivity/datainteractions";
import { initializeDetailPane } from "./panes/detailpane";
import { replotData } from "./utils/plot";
import { nice } from "d3";

// Adding sprite function to Bring Sprite to Front
PIXI.Sprite.prototype.bringToFront = function () {
  if (this.parent) {
    var parent = this.parent;
    parent.removeChild(this);
    parent.addChild(this);
  }
};

// Grabbing Main Container
const mainContainer = document.getElementById("app");

// Functions for Width and Height
const getAppWidth = function () {
  return mainContainer.clientWidth;
};

const getAppHeight = function () {
  return mainContainer.clientHeight;
};

/**
 * Creates the Template Shape for Data Points
 * @param {PIXI.Application} app
 * @returns {PIXI.Texture}
 */
function makePixiTemplate(app) {
  const templateShape = new PIXI.Graphics()
    .setStrokeStyle({
      width: 1,
      color: plottingConfig.DEFAULT_POINT_COLOR,
      alignment: 0,
    })
    .circle(0, 0, 8 * plottingConfig.POINTRADIUS);

  const { point_width, point_height } = templateShape;

  // Draw the circle to the RenderTexture
  const renderTexture = PIXI.RenderTexture.create({
    point_width,
    point_height,
    multisample: PIXI.MSAA_QUALITY.HIGH,
    resolution: window.devicePixelRatio,
  });

  const plot_layer = new PIXI.Graphics();
  plot_layer.circle(0, 0, plottingConfig.POINTRADIUS);
  plot_layer.fill(PIXI.Texture.WHITE);

  const texture = app.renderer.generateTexture(plot_layer);

  return texture;
}

// Setting Initial Plotting Parameters

windowState.WIDTH = getAppWidth();
windowState.HEIGHT = getAppHeight();

/**
 * Initializing Pixi Application
 */
export async function initializePixiApp() {
  // Loading Data:

  [dataContainers.data, dataContainers.metadata] = await load_data();

  // Adding Options to UI
  add_data_options_to_axis_selectors(dataContainers.metadata);

  // Setting Initial Plot Status
  windowState.currentXAxis = document.getElementById("x-axis-selector").value;
  windowState.currentYAxis = document.getElementById("y-axis-selector").value;
  windowState.currentZoom = d3.zoomIdentity;
  windowState.WIDTH = getAppWidth();
  windowState.HEIGHT = getAppHeight();

  console.log(`Current X-Axis: ${windowState.currentXAxis}`);
  console.log(`Current Y-Axis: ${windowState.currentYAxis}`);

  const app = new PIXI.Application();
  await app.init({
    width: windowState.WIDTH,
    height: windowState.HEIGHT,
    antialias: true,
    background: plottingConfig.BACKGROUND_COLOR,
    resizeTo: mainContainer,
  });

  // Putting Pixi Scene into Container
  mainContainer.appendChild(app.canvas);

  // Setup Initial Plotting

  windowState.xRange = getRangeWithBorder(
    dataContainers.metadata[windowState.currentXAxis]
  );
  windowState.yRange = getRangeWithBorder(
    dataContainers.metadata[windowState.currentYAxis]
  ).reverse();

  // Setting up Initial Scalers

  windowState.xScaler = d3
    .scaleLinear()
    .domain(windowState.xRange)
    .range([0, windowState.WIDTH]);

  windowState.yScaler = d3
    .scaleLinear()
    .domain(windowState.yRange)
    .range([0, windowState.HEIGHT]);

  // Making Pixi Point Texture
  const texture = makePixiTemplate(app);

  // Initial Plotting

  const point_container = new PIXI.Container();

  dataContainers.data.map((d) => {
    const plotPoint = new PIXI.Sprite(texture);

    plotPoint.position.x = windowState.xScaler(d[windowState.currentXAxis]);
    plotPoint.position.y = windowState.yScaler(d[windowState.currentYAxis]);
    plotPoint.tint = plottingConfig.DEFAULT_POINT_COLOR;
    plotPoint.alpha = plottingConfig.DEFAULT_ALPHA;

    plotPoint.eventMode = "static";
    plotPoint.cursor = "pointer";

    plotPoint
      .on("pointerover", onPointerOver)
      .on("pointerout", onPointerOut)
      .on("pointerdown", onPointerClick);

    point_container.addChild(plotPoint);

    dataContainers.spriteToData.set(plotPoint, d);
    dataContainers.dataToSprite.set(d, plotPoint);
    dataContainers.spriteToSelected.set(plotPoint, false);
    dataContainers.spriteToHighlighted.set(plotPoint, false);
  });

  // Adding Point Container to Pixi Stage
  app.stage.addChild(point_container);

  // Adding and Styling Axes

  initializePlotAxis();

  // Adding D3 Zoom:

  const mainZoom = d3
    .zoom()
    .scaleExtent([1, 20])
    .on("zoom", ({ transform }) => zoomPlot(transform));

  d3.select(mainContainer).call(mainZoom);
  windowState.mouseMode = "zoom";

  function turnOffZoom() {
    d3.select(mainContainer).on(".zoom", null);
  }

  function turnOnZoom() {
    d3.select(mainContainer).call(mainZoom);
    windowState.mouseMode = "zoom";
  }

  const mainBrush = d3.brush().on("start end", highlightPoints);

  const svgBrushOutlineElement = await appendToSVG("g");
  let brushElement = null;

  function turnOffBrush() {
    d3.selectAll(brushElement).remove();
  }

  async function turnOnBrush() {
    brushElement = svgBrushOutlineElement.call(mainBrush);
    windowState.mouseMode = "select";
    console.log("Brush Turned On");
  }

  // Adding mouse function changing to buttons:

  let zoom_button = document.getElementById("mouse-zoom-button");
  let select_button = document.getElementById("mouse-select-button");

  function clickZoomButton() {
    turnOffBrush();
    turnOnZoom();
  }

  function clickSelectButton() {
    turnOffZoom();
    turnOnBrush();
  }

  zoom_button.addEventListener("pointerdown", clickZoomButton);
  select_button.addEventListener("pointerdown", clickSelectButton);

  // Axis Switching Functions

  // Adding axis changing functions to selection boxes:

  let x_axis_options = document.getElementById("x-axis-selector");
  let y_axis_options = document.getElementById("y-axis-selector");

  x_axis_options.addEventListener("change", switchXAxis);
  y_axis_options.addEventListener("change", switchYAxis);

  // Opacity Slider

  initOpacitySlider();

  // Colour Axis

  initColorAxis();

  function resizeWindow() {
    windowState.HEIGHT = getAppHeight();
    windowState.WIDTH = getAppWidth();

    // Resize Pixi app
    app.resize();

    // Resize Decorators SVG
    resizePlotAxis();

    // Update Scalers
    x_scaler.range([0, windowState.WIDTH]);
    windowState.yScaler.range([0, windowState.HEIGHT]);

    // Replot Data
    replotData();
  }

  replotData();

  // Currently Resize Not Working, Turning Off
  // window.addEventListener("resize", resizeWindow);
}
