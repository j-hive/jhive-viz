// Application Wide Configuration Parameters

import { sassNull } from "sass";


// Data URLs

export const dataURL = "/data/dja_abell2744clu-grizli-v7.2_jhive_viz.csv";
export const metadataURL = "/data/dja_abell2744clu-grizli-v7.2_jhive_viz.json";

// Plotting Parameters

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
}


// Data Containers

export const dataContainers = {
    data: null,
    metadata: null,
    spriteToData: new WeakMap(),
    dataToSprite: new WeakMap(),
    spriteToSelected: new WeakMap(),
    spriteToHighlighted: new WeakMap()
}

// Window State

export const windowState = {
    WIDTH: null,
    HEIGHT: null,
    mouseMode: 'zoom',
    selectedPoint: false,
    currentXAxis: null,
    currentYAxis: null,
    currentZoom: null,
    xRange: null,
    yRange: null,
    xScaler: null,
    yScaler: null,
}