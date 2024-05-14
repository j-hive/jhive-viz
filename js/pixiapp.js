// pixiapp.js

import * as PIXI from 'pixi.js';
import { Ease, ease } from 'pixi-ease';
import * as d3 from 'd3';



// Adding sprite function to Bring Sprite to Front
PIXI.Sprite.prototype.bringToFront = function () {
    if (this.parent) {
        var parent = this.parent;
        parent.removeChild(this);
        parent.addChild(this);
    }
}


// Grabbing Main Container
const main_container = document.getElementById("app");


// Functions for Width and Height
const getAppWidth = function () {
    return main_container.clientWidth;
}

const getAppHeight = function () {
    return main_container.clientHeight;
}


// Current Plot Status
let currentXAxis = "UMAP_X";
let currentYAxis = "UMAP_Y"
let currentZoom = d3.zoomIdentity;


// Setting Plotting Constants

let WIDTH = getAppWidth();
let HEIGHT = getAppHeight();
const POINTRADIUS = 5;
const DATABORDERBUFFER = 0.05;
const LEFTMARGIN = 50;
const RIGHTMARGIN = 5;
const LOWERMARGIN = 50;
const UPPERMARGIN = 5;



export async function initializePixiApp() {

    const app = new PIXI.Application();
    await app.init(
        {
            width: WIDTH,
            height: HEIGHT,
            antialias: true,
            background: 0x323232,
            resizeTo: window
        }
    );

    // Putting Pixi Scene into Container
    main_container.appendChild(app.canvas);

}