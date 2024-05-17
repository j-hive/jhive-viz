// pixiapp.js

import * as PIXI from 'pixi.js';
import { Ease, ease } from 'pixi-ease';
import * as d3 from 'd3';


// Data URLs
const dataURL = "/data/uncover_dr3_jhive_viz.csv";
const metadataURL = "/data/uncover_dr3_jhive_viz.json";

// Adding sprite function to Bring Sprite to Front
PIXI.Sprite.prototype.bringToFront = function () {
    if (this.parent) {
        var parent = this.parent;
        parent.removeChild(this);
        parent.addChild(this);
    }
}


// Function to load data

async function load_data() {

    const data = await d3.csv(dataURL);
    const metadata_response = await fetch(metadataURL);
    const metadata = await metadata_response.json();

    console.log("Loaded Data and Metadata");

    return [data, metadata]
}




// Function to add options to axis selectors

function make_selector_options_from_metadata(metadataJSON, defaultValue) {

    // Initial Empty Option List
    let optionList = [];

    Object.entries(metadataJSON).forEach(
        (entry) => {
            const [key, value] = entry;
            let selectedParam = (key === defaultValue)
            optionList.push(
                new Option(value['display'], key, selectedParam, selectedParam)
            )
        }
    )

    return optionList

};

function add_data_options_to_axis_selectors(metadataJSON, x_default = "ra", y_default = "dec") {

    // Get Axis Selectors First:
    const xAxisSelector = document.getElementById("x-axis-selector");
    const yAxisSelector = document.getElementById("y-axis-selector");

    let xOptionList = make_selector_options_from_metadata(metadataJSON, x_default);
    let yOptionList = make_selector_options_from_metadata(metadataJSON, y_default);

    // Adding all X-parameters
    xOptionList.forEach((entry) => {
        xAxisSelector.add(entry);
    })

    // Adding all Y-parameters
    yOptionList.forEach((entry) => {
        yAxisSelector.add(entry);
    })

};

function make_axis_label(metadataJSON) {
    let labeltext = metadataJSON['display'];

    if (metadataJSON['unit']) {
        labeltext += ` (${metadataJSON['unit']})`
    }

    return labeltext
};


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
    plot_layer.fill(0x777777);


    const texture = app.renderer.generateTexture(plot_layer);

    return texture
}


// Functions for range

function getRangeWithBorder(entryMetadata) {

    let fullExtent = [entryMetadata["min_val"], entryMetadata["max_val"]]

    // Reversing if Magnitude
    if (entryMetadata['is_mag']) {
        fullExtent.reverse();
    };

    let initialRange = fullExtent[1] - fullExtent[0];

    fullExtent[0] = fullExtent[0] - (DATABORDERBUFFER * initialRange);
    fullExtent[1] = fullExtent[1] + (DATABORDERBUFFER * initialRange);

    return fullExtent
}


// Setting Plotting Constants

let WIDTH = getAppWidth();
let HEIGHT = getAppHeight();
const POINTRADIUS = 3;
const DATABORDERBUFFER = 0.07;
const LEFTMARGIN = 50;
const RIGHTMARGIN = 5;
const LOWERMARGIN = 50;
const UPPERMARGIN = 5;



export async function initializePixiApp() {


    // Loading Data:

    const [data, metadata] = await load_data();

    // Adding Options to UI
    add_data_options_to_axis_selectors(metadata);

    // Current Plot Status
    let currentXAxis = document.getElementById("x-axis-selector").value;
    let currentYAxis = document.getElementById("y-axis-selector").value;
    let currentZoom = d3.zoomIdentity;

    console.log(`Current X-Axis: ${currentXAxis}`)
    console.log(`Current Y-Axis: ${currentYAxis}`)

    WIDTH = getAppWidth();
    HEIGHT = getAppHeight();

    const app = new PIXI.Application();
    await app.init(
        {
            width: WIDTH,
            height: HEIGHT,
            antialias: true,
            background: 0x323232,
            resizeTo: main_container
        }
    );

    // Putting Pixi Scene into Container
    main_container.appendChild(app.canvas);

    // Setup Initial Plotting

    let xRange = getRangeWithBorder(metadata[currentXAxis]);
    let yRange = getRangeWithBorder(metadata[currentYAxis]).reverse();


    // Setting up Scalers 

    const x_scaler = d3.scaleLinear()
        .domain(xRange)
        .range([0, WIDTH]);

    const y_scaler = d3.scaleLinear()
        .domain(yRange)
        .range([0, HEIGHT]);



    const texture = makePixiTemplate(app);

    // Setting containers for Lookup 
    const sprite_to_data = new WeakMap();
    const data_to_sprite = new WeakMap();
    const sprite_to_selected = new WeakMap();
    const sprite_to_highlighted = new WeakMap();

    // Initial Plotting

    const point_container = new PIXI.Container()


    data.map(d => {
        const plotpoint = new PIXI.Sprite(texture);

        plotpoint.position.x = x_scaler(d[currentXAxis]);
        plotpoint.position.y = y_scaler(d[currentYAxis]);

        plotpoint.eventMode = 'static';
        plotpoint.cursor = 'pointer';

        point_container.addChild(plotpoint);

        sprite_to_data.set(plotpoint, d);
        data_to_sprite.set(d, plotpoint);
        sprite_to_selected.set(plotpoint, false);
        sprite_to_highlighted.set(plotpoint, false);

    })

    app.stage.addChild(point_container);


    // Adding and Styling Axes

    var svg = d3.select("#plot-decorators")
        .append("svg")
        .attr("id", "plot-decorators-svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("top", 0)
        .style("left", 0)
        .style("position", "absolute")
        .attr("viewBox", [0, 0, WIDTH, HEIGHT]);


    const y_axis = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${LEFTMARGIN},0)`)
        .call(d3.axisLeft(y_scaler)
            .tickSizeOuter(0)
            .tickSize(-WIDTH * 1.3)
        );

    const x_axis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${HEIGHT - LEFTMARGIN})`)
        .call(d3.axisBottom(x_scaler)
            .tickSizeOuter(0)
            .tickSize(-HEIGHT * 1.3));


    // Add Axes Labels
    const y_label = svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("x", LEFTMARGIN / 2)
        .attr("y", HEIGHT / 2)
        .attr("transform", `rotate(-90, 20, ${HEIGHT / 2})`)
        .text(make_axis_label(metadata[currentYAxis]))

    const x_label = svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", WIDTH / 2)
        .attr("y", HEIGHT - (LOWERMARGIN / 2) + 3)
        .text(make_axis_label(metadata[currentXAxis]))



    // Interaction Functions

    // Functions for tinting dots 

    function onPointerOver() {
        this.tint = 0xfacb73;
        this.z = 10000;
        this.bringToFront();

        let datapoint = sprite_to_data.get(this);

    }

    function onPointerOut() {
        this.tint = 0xffffff;
        this.z = 2;
    }

    // Adding D3 Zoom:

    const mainZoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", ({ transform }) => zoomed(transform));

    d3.select(main_container).call(mainZoom);



    function zoomed(transform) {

        const zoomed_x_scaler = transform.rescaleX(x_scaler).interpolate(d3.interpolateRound);
        const zoomed_y_scaler = transform.rescaleY(y_scaler).interpolate(d3.interpolateRound);

        x_axis.call(d3.axisBottom(zoomed_x_scaler).tickSizeOuter(0).tickSize(-HEIGHT * 1.3));
        y_axis.call(d3.axisLeft(zoomed_y_scaler).tickSizeOuter(0).tickSize(-WIDTH * 1.3));

        data.map((d) => {
            let plotpoint = data_to_sprite.get(d);
            plotpoint.position.x = zoomed_x_scaler(d[currentXAxis]);
            plotpoint.position.y = zoomed_y_scaler(d[currentYAxis]);

        })

        currentZoom = transform;
    }


    function turnOffZoom() {
        d3.select(main_container).on('.zoom', null);
    }

    function turnOnZoom() {
        d3.select(main_container).call(mainZoom);
    }



}