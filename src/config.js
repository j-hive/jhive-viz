// Application Wide Configuration Parameters

// Data URLs

/**
 * The URL to the Data File
 * @type {string}
 */
export const dataURL = "/data/dja_abell2744clu-grizli-v7.2_jhive_viz.csv";

/**
 * The URL to the Metadata File
 * @type {string}
 */
export const metadataURL = "/data/dja_abell2744clu-grizli-v7.2_jhive_viz.json";

/**
 * Configuration Parameters for Plotting
 */
export const plottingConfig = {
  DEFAULT_POINT_COLOR: 0x777777,
  HIGHLIGHT_POINT_COLOR: 0x849cba,
  MOUSEOVER_POINT_COLOR: 0xfacb73,
  CLICKED_POINT_COLOR: 0x73adfa,
  POINTRADIUS: 3,
  DATABORDERBUFFER: 0.07,
  LEFTMARGIN: 50,
  RIGHTMARGIN: 5,
  LOWERMARGIN: 50,
  UPPERMARGIN: 5,
  DEFAULT_ALPHA: 0.3,
  BACKGROUND_COLOR: 0x323232,
  SEDLEFTMARGIN: 20,
  SEDRIGHTMARGIN: 10,
  SEDLOWERMARGIN: 20,
  SEDUPPERMARGIN: 10,
};

/**
 * Object to contain all relevant data
 */
export const dataContainers = {
  data: null,
  metadata: null,
  spriteToData: new WeakMap(),
  dataToSprite: new WeakMap(),
  spriteToSelected: new WeakMap(),
  spriteToHighlighted: new WeakMap(),
};

/**
 * Object to contain all state parameters of the current window
 */
export const windowState = {
  WIDTH: null,
  HEIGHT: null,
  mouseMode: "zoom",
  selectedPoint: false,
  currentXAxis: null,
  currentYAxis: null,
  currentZoom: null,
  xRange: null,
  yRange: null,
  xScaler: null,
  yScaler: null,
  SEDxScaler: null,
  SEDyScaler: null,
  currentOpacity: null,
};
