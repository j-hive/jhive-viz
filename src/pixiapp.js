// pixiapp.js

import { Ease } from "pixi-ease";
import { d3, PIXI } from "./imports";
import { plottingConfig, dataContainers, windowState } from "./config";
import {
  load_data,
  make_axis_label,
  add_data_options_to_axis_selectors,
  getRangeWithBorder,
} from "./data";
import {
  appendToSVG,
  initializePlotAxis,
  resizePlotAxis,
  scalePlotAxis,
  setXLabel,
  setYLabel,
  transformXAxis,
  transformYAxis,
} from "./plotaxis";
import {
  initColorAxis,
  initOpacitySlider,
} from "./interactivity/datainteractions";
import { setHoverPaneInfo } from "./panes/hoverpane";
import { initializeDetailPane, updateDetailPanel } from "./panes/detailpane";

// Adding sprite function to Bring Sprite to Front
PIXI.Sprite.prototype.bringToFront = function () {
  if (this.parent) {
    var parent = this.parent;
    parent.removeChild(this);
    parent.addChild(this);
  }
};

// Grabbing Main Container
const main_container = document.getElementById("app");

// Functions for Width and Height
const getAppWidth = function () {
  return main_container.clientWidth;
};

const getAppHeight = function () {
  return main_container.clientHeight;
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
    resizeTo: main_container,
  });

  // Putting Pixi Scene into Container
  main_container.appendChild(app.canvas);

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

  // Interaction Functions

  // Functions for tinting dots

  function onPointerOver() {
    this.tint = plottingConfig.MOUSEOVER_POINT_COLOR;
    this.z = 10000;
    this.alpha = 1.0;
    this.bringToFront();

    let datapoint = dataContainers.spriteToData.get(this);
    setHoverPaneInfo(datapoint);
  }

  function onPointerOut() {
    let tmpColor = plottingConfig.DEFAULT_POINT_COLOR;
    let tmpAlpha = plottingConfig.DEFAULT_ALPHA;

    if (dataContainers.spriteToSelected.get(this)) {
      tmpColor = plottingConfig.CLICKED_POINT_COLOR;
      tmpAlpha = 1.0;
    } else if (dataContainers.spriteToHighlighted.get(this)) {
      tmpColor = plottingConfig.HIGHLIGHT_POINT_COLOR;
      tmpAlpha = 1.0;
    }

    this.tint = tmpColor;
    this.z = 2;
    this.alpha = tmpAlpha;
    setHoverPaneInfo();
  }

  function onPointerClick() {
    this.tint = plottingConfig.CLICKED_POINT_COLOR;
    if (windowState.selectedPoint) {
      windowState.selectedPoint.tint = plottingConfig.DEFAULT_POINT_COLOR;
      windowState.selectedPoint.alpha = 1.0;
      dataContainers.spriteToSelected.set(windowState.selectedPoint, false);
    }
    windowState.selectedPoint = this;
    dataContainers.spriteToSelected.set(this, true);
    let datapoint = dataContainers.spriteToData.get(this);
    updateDetailPanel(datapoint);
  }

  // Adding D3 Zoom:

  const mainZoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", ({ transform }) => zoomed(transform));

  d3.select(main_container).call(mainZoom);
  windowState.mouseMode = "zoom";

  function zoomed(transform) {
    const zoomed_x_scaler = transform
      .rescaleX(windowState.xScaler)
      .interpolate(d3.interpolateRound);
    const zoomed_y_scaler = transform
      .rescaleY(windowState.yScaler)
      .interpolate(d3.interpolateRound);

    scalePlotAxis(zoomed_x_scaler, zoomed_y_scaler);

    dataContainers.data.map((d) => {
      let plotPoint = dataContainers.dataToSprite.get(d);
      plotPoint.position.x = zoomed_x_scaler(d[windowState.currentXAxis]);
      plotPoint.position.y = zoomed_y_scaler(d[windowState.currentYAxis]);
    });

    windowState.currentZoom = transform;
  }

  function turnOffZoom() {
    d3.select(main_container).on(".zoom", null);
  }

  function turnOnZoom() {
    d3.select(main_container).call(mainZoom);
    windowState.mouseMode = "zoom";
  }

  // Adding Brushing

  const highlightPoints = ({ selection: [[x0, y0], [x1, y1]] }) => {
    dataContainers.data.map((d) => {
      let tmpSprite = dataContainers.dataToSprite.get(d);
      if (
        tmpSprite.x > x0 &&
        (tmpSprite.x < x1 - plottingConfig.POINTRADIUS) &
          (tmpSprite.y < y1 - plottingConfig.POINTRADIUS) &&
        tmpSprite.y > y0
      ) {
        tmpSprite.tint = plottingConfig.HIGHLIGHT_POINT_COLOR;
        tmpSprite.alpha = 1.0;
        tmpSprite.bringToFront();
        dataContainers.spriteToHighlighted.set(tmpSprite, true);
      } else {
        tmpSprite.tint = plottingConfig.DEFAULT_POINT_COLOR;
        tmpSprite.alpha = plottingConfig.DEFAULT_ALPHA;
        dataContainers.spriteToHighlighted.set(tmpSprite, false);
      }
    });
  };

  const mainBrush = d3.brush().on("start brush end", highlightPoints);

  let brushElement = appendToSVG("g");

  function turnOffBrush() {
    d3.selectAll(brushElement).remove();
  }

  function turnOnBrush() {
    brushElement = appendToSVG("g").call(mainBrush);
    windowState.mouseMode = "select";
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

  x_axis_options.addEventListener("change", switch_x_axis);
  y_axis_options.addEventListener("change", switch_y_axis);

  // Setting up Ease to use:

  const motionEase = new Ease({
    duration: 1000,
    wait: 500,
    ease: "easeInOutQuad",
  });

  function switch_x_axis() {
    let new_axis = x_axis_options.value;

    let new_x_extent = d3.extent(dataContainers.data, (d) =>
      parseFloat(d[new_axis])
    );

    // Adding Buffer
    let new_x_range = new_x_extent[1] - new_x_extent[0];
    new_x_extent[0] =
      new_x_extent[0] - plottingConfig.DATABORDERBUFFER * new_x_range;
    new_x_extent[1] =
      new_x_extent[1] + plottingConfig.DATABORDERBUFFER * new_x_range;

    windowState.xScaler.domain(new_x_extent);

    if (windowState.mouseMode === "select") {
      turnOffBrush();
    }

    const zoomed_x_scaler = windowState.currentZoom
      .rescaleX(windowState.xScaler)
      .interpolate(d3.interpolateRound);

    // Transforming Axis
    transformXAxis(zoomed_x_scaler);

    // Changing Labels
    setXLabel(make_axis_label(dataContainers.metadata[new_axis]));

    // Transforming Map
    dataContainers.data.map((d) => {
      let plotPoint = dataContainers.dataToSprite.get(d);

      motionEase.add(plotPoint, { x: zoomed_x_scaler(d[new_axis]) });

      plotPoint.tint = dataContainers.spriteToHighlighted.get(plotPoint)
        ? plottingConfig.HIGHLIGHT_POINT_COLOR
        : dataContainers.spriteToSelected.get(plotPoint)
        ? plottingConfig.CLICKED_POINT_COLOR
        : plottingConfig.DEFAULT_POINT_COLOR;
    });

    windowState.currentXAxis = new_axis;

    if (windowState.mouseMode === "select") {
      turnOnBrush();
    }
  }

  function switch_y_axis() {
    let new_axis = y_axis_options.value;

    let new_y_extent = d3.extent(dataContainers.data, (d) =>
      parseFloat(d[new_axis])
    );

    // Adding Buffer
    let new_y_range = new_y_extent[1] - new_y_extent[0];
    new_y_extent[0] =
      new_y_extent[0] - plottingConfig.DATABORDERBUFFER * new_y_range;
    new_y_extent[1] =
      new_y_extent[1] + plottingConfig.DATABORDERBUFFER * new_y_range;

    new_y_extent.reverse();

    if (windowState.mouseMode === "select") {
      turnOffBrush();
    }

    windowState.yScaler.domain(new_y_extent);

    const zoomed_y_scaler = windowState.currentZoom
      .rescaleY(windowState.yScaler)
      .interpolate(d3.interpolateRound);

    transformYAxis(zoomed_y_scaler);

    // Changing Labels
    setYLabel(make_axis_label(dataContainers.metadata[new_axis]));

    dataContainers.data.map((d) => {
      let plotPoint = dataContainers.dataToSprite.get(d);

      motionEase.add(plotPoint, { y: zoomed_y_scaler(d[new_axis]) });

      plotPoint.tint = dataContainers.spriteToHighlighted.get(plotPoint)
        ? plottingConfig.HIGHLIGHT_POINT_COLOR
        : dataContainers.spriteToSelected.get(plotPoint)
        ? plottingConfig.CLICKED_POINT_COLOR
        : plottingConfig.DEFAULT_POINT_COLOR;
    });

    windowState.currentYAxis = new_axis;

    if (windowState.mouseMode === "select") {
      turnOnBrush();
    }
  }

  // Opacity Slider

  initOpacitySlider();

  // Colour Axis

  initColorAxis();

  function replotData() {
    console.log(`Current X-axis: ${windowState.currentXAxis}`);
    console.log(`Current Y-axis: ${windowState.currentYAxis}`);
    dataContainers.data.map((d) => {
      let plotPoint = dataContainers.dataToSprite.get(d);
      plotPoint.position.x = windowState.xScaler(d[windowState.currentXAxis]);
      plotPoint.position.y = windowState.yScaler(d[windowState.currentYAxis]);
    });
  }

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

  initializeDetailPane();
}
