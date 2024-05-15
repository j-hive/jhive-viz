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

// Generate Random Numbers for testing

function generateArrayRandom(n_array) {
    let random_array = Array.from({ length: n_array }, () => Math.random())
    return random_array
}

const tmp_x = generateArrayRandom(80000);
const tmp_y = generateArrayRandom(80000);

// Grabbing Main Container
const main_container = document.getElementById("app");


// Functions for Width and Height
const getAppWidth = function () {
    return main_container.clientWidth;
}

const getAppHeight = function () {
    return main_container.clientHeight;
}

// Function for making template shape

function makePixiTemplate(app) {
    // Template Shape

    const templateShape = new PIXI.Graphics()
        .fill(0xffffff)
        .setStrokeStyle({ width: 1, color: 0x333333, alignment: 0 })
        .circle(0, 0, 8 * POINTRADIUS);


    const { point_width, point_height } = templateShape;

    // Draw the circle to the RenderTexture
    const renderTexture = PIXI.RenderTexture.create({
        point_width,
        point_height,
        multisample: PIXI.MSAA_QUALITY.HIGH,
        resolution: window.devicePixelRatio
    });

    const point_container = new PIXI.Container()

    const plot_layer = new PIXI.Graphics()
    plot_layer.circle(0, 0, POINTRADIUS);
    plot_layer.fill(0xcccccc);


    const texture = app.renderer.generateTexture(plot_layer);

    return texture;
}


// Functions for range

function getRangeWithBorder(data_array) {
    let fullExtent = d3.extent(data_array);

    let initialRange = fullExtent[1] - fullExtent[0];

    fullExtent[0] = fullExtent[0] - (DATABORDERBUFFER * initialRange);
    fullExtent[1] = fullExtent[1] + (DATABORDERBUFFER * initialRange);

    return fullExtent
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

    let xRange = getRangeWithBorder(tmp_x);
    let yRange = getRangeWithBorder(tmp_y).reverse();

    // Setting up Scalers 

    const x_scaler = d3.scaleLinear()
        .domain(xRange)
        .range([0, WIDTH]);

    const y_scaler = d3.scaleLinear()
        .domain(yRange)
        .range([0, HEIGHT]);



    const texture = makePixiTemplate(app);

}