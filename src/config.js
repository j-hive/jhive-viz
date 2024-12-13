// Application Wide Configuration Parameters

// Data URLs

/**
 * The URL to the data root
 * @type {string}
 */

export const dataRootURL = "/data/";

/**
 * The filename of the fields File
 * @type {string}
 */
export const fieldsFileName = "fields_data.json";

/**
 * The URL to the Data File
 * @type {string}
 */
export const testDataURL = "/data/v1.0/ceers-full-grizli-v7.2/catalog.csv";

/**
 * The URL to the Metadata File
 * @type {string}
 */
export const testMetadataURL =
  "/data/v1.0/ceers-full-grizli-v7.2/metadata.json";

/**
 * Configuration Parameters for Plotting
 */
export const plottingConfig = {
  DEFAULT_POINT_COLOR: 0x777777,
  HIGHLIGHT_POINT_COLOR: 0x849cba,
  MOUSEOVER_POINT_COLOR: 0xfacb73,
  CLICKED_POINT_COLOR: 0x73adfa,
  DEFAULT_X_AXIS: "logSFRinst_50",
  DEFAULT_Y_AXIS: "logM_50",
  DEFAULT_COLOR_AXIS: "logZsol_50",
  POINTRADIUS: 3,
  DATABORDERBUFFER: 0.07,
  LEFTMARGIN: 50,
  RIGHTMARGIN: 5,
  LOWERMARGIN: 50,
  UPPERMARGIN: 5,
  DEFAULT_ALPHA: 0.1,
  BACKGROUND_COLOR: 0x323232,
  SEDLEFTMARGIN: 40,
  SEDRIGHTMARGIN: 10,
  SEDLOWERMARGIN: 20,
  SEDUPPERMARGIN: 10,
};

/**
 * Object to contain all relevant data
 */
export const dataContainers = {
  fieldsFile: null,
  data: null,
  metadata: null,
  pixiApp: null,
  pointContainer: {},
  fieldList: [],
  spriteToData: new WeakMap(),
  dataToSprite: new WeakMap(),
  spriteToSelected: new WeakMap(),
  spriteToHighlighted: new WeakMap(),
  pixiTexture: null,
};

/**
 * Object to contain all state parameters of the current window
 */
export const windowState = {
  WIDTH: null,
  HEIGHT: null,
  mouseMode: "zoom",
  selectedPoint: false,
  mouseOverPoint: false,
  currentXAxis: null,
  currentYAxis: null,
  currentColorAxis: null,
  currentZoom: null,
  currentOpacity: null,
  colorRange: null,
  xRange: null,
  yRange: null,
  colorScaler: null,
  xScaler: null,
  yScaler: null,
  colorScaler: null,
  SEDxScaler: null,
  SEDyScaler: null,
  MSFRxScaler: null,
  MSFRyScaler: null,
};
