// pixiapp.js

import { d3, PIXI } from "./imports";
import { plottingConfig, dataContainers, windowState } from "./config";
import {
  loadTestData,
  addDataOptionsToAxisSelectors,
  getRangeWithBorder,
  loadFieldsFile,
  loadAllDataFromFieldsFile,
} from "./data";
import { initializePlotAxis, resizePlotAxis } from "./plotaxis";
import {
  initAxisChange,
  initColorAxis,
  initOpacitySlider,
  onPointerClick,
  onPointerOut,
  onPointerOver,
  switchColorAxis,
} from "./interactivity/datainteractions";
import { replotData } from "./utils/plot";
import { initBrushing } from "./interactivity/brushing";
import { initZooming } from "./interactivity/zooming";
import { openContextMenu } from "./interactivity/contextmenu";
import { changeLoadingStatus } from "./panes/loadingpane";
import { createColorBar } from "./panes/hoverpane";

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
  // Loading Fields File:
  dataContainers.fieldsFile = await loadFieldsFile();

  // Loading Data:

  [dataContainers.data, dataContainers.metadata] =
    await loadAllDataFromFieldsFile();

  changeLoadingStatus("Initializing Plotting...");

  // Adding Options to UI
  addDataOptionsToAxisSelectors(
    dataContainers.metadata,
    plottingConfig.DEFAULT_X_AXIS,
    plottingConfig.DEFAULT_Y_AXIS,
    plottingConfig.DEFAULT_COLOR_AXIS
  );

  // Setting Initial Plot Status
  windowState.currentXAxis = document.getElementById("x-axis-selector").value;
  windowState.currentYAxis = document.getElementById("y-axis-selector").value;
  windowState.currentZoom = d3.zoomIdentity;
  windowState.WIDTH = getAppWidth();
  windowState.HEIGHT = getAppHeight();

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
    dataContainers.metadata.columns[windowState.currentXAxis]
  );
  windowState.yRange = getRangeWithBorder(
    dataContainers.metadata.columns[windowState.currentYAxis]
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
      .on("pointerdown", onPointerClick)
      .on("rightclick", openContextMenu);

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

  // Setting Default Colour Map

  switchColorAxis();

  // Adding Zooming, Brushing, Axis Changing, Opacity Changing, and Color Axis Changing:

  initZooming();
  initBrushing();
  initAxisChange();
  initOpacitySlider();
  initColorAxis();
  createColorBar();

  /**
   * Function to handle window resizes by replotting
   */
  function resizeWindow() {
    windowState.HEIGHT = getAppHeight();
    windowState.WIDTH = getAppWidth();
    // console.log(windowState.WIDTH, windowState.HEIGHT);

    // Update Scalers
    windowState.xScaler.range([0, windowState.WIDTH]);
    windowState.yScaler.range([0, windowState.HEIGHT]);

    // Resize Decorators SVG
    resizePlotAxis();

    // Resize Pixi app
    app.resize();

    // Replot Data
    replotData();
  }

  replotData();

  // Currently Resize Not Working, Turning Off
  window.addEventListener("resize", resizeWindow);
}
