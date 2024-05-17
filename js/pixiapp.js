// pixiapp.js

import * as PIXI from 'pixi.js';
import { Ease, ease } from 'pixi-ease';
import * as d3 from 'd3';


// Data URLs
const dataURL = "/data/uncover_dr3_jhive_viz.csv";
const metadataURL = "/data/uncover_dr3_jhive_viz.json";

// Plotting Constants

const DEFAULT_POINT_COLOR = 0xffffff;
const HIGHLIGHT_POINT_COLOR = 0x849cba;
const MOUSEOVER_POINT_COLOR = 0xfacb73;
const CLICKED_POINT_COLOR = 0x73adfa;
const POINTRADIUS = 4;
const DATABORDERBUFFER = 0.07;
const LEFTMARGIN = 50;
const RIGHTMARGIN = 5;
const LOWERMARGIN = 50;
const UPPERMARGIN = 5;

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
        .fill(DEFAULT_POINT_COLOR)
        .setStrokeStyle({ width: 1, color: DEFAULT_POINT_COLOR, alignment: 0 })
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

        plotpoint.on('pointerover', onPointerOver).on('pointerout', onPointerOut);

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
        this.tint = MOUSEOVER_POINT_COLOR;
        this.z = 10000;
        this.bringToFront();

        let datapoint = sprite_to_data.get(this);

    }

    function onPointerOut() {
        this.tint = (
            sprite_to_highlighted.get(this) ? HIGHLIGHT_POINT_COLOR :
                sprite_to_selected.get(this) ? CLICKED_POINT_COLOR :
                    DEFAULT_POINT_COLOR);
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



    // Adding Brushing 

    const highlightPoints = ({ selection: [[x0, y0], [x1, y1]] }) => {
        data.map((d) => {

            let tmpSprite = data_to_sprite.get(d);
            if ((tmpSprite.x > x0) && (tmpSprite.x < x1) & (tmpSprite.y < y1) && (tmpSprite.y > y0)) {
                tmpSprite.tint = HIGHLIGHT_POINT_COLOR;
                tmpSprite.bringToFront();
                sprite_to_highlighted.set(tmpSprite, true)
            } else {
                tmpSprite.tint = DEFAULT_POINT_COLOR;
                sprite_to_highlighted.set(tmpSprite, false)
            }

        })

    }

    const mainBrush = d3.brush().on("start brush end", highlightPoints);

    let brushElement = svg.append("g");

    function turnOffBrush() {
        d3.selectAll(brushElement).remove();
    }

    function turnOnBrush() {
        brushElement = svg.append("g").call(mainBrush);
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

    zoom_button.addEventListener("pointerdown", clickZoomButton)
    select_button.addEventListener("pointerdown", clickSelectButton)


    // Axis Switching Functions

    // Adding axis changing functions to selection boxes:

    let x_axis_options = document.getElementById('x-axis-selector');
    let y_axis_options = document.getElementById('y-axis-selector');

    x_axis_options.addEventListener('change', switch_x_axis);
    y_axis_options.addEventListener('change', switch_y_axis);

    // Setting up Ease to use:

    const motionEase = new Ease({ duration: 1000, wait: 500, ease: "easeInOutQuad" })

    function switch_x_axis() {
        let new_axis = x_axis_options.value;


        let new_x_extent = d3.extent(data, d => parseFloat(d[new_axis]));

        // Adding Buffer
        let new_x_range = new_x_extent[1] - new_x_extent[0];
        new_x_extent[0] = new_x_extent[0] - DATABORDERBUFFER * new_x_range
        new_x_extent[1] = new_x_extent[1] + DATABORDERBUFFER * new_x_range

        x_scaler.domain(new_x_extent);

        const zoomed_x_scaler = currentZoom.rescaleX(x_scaler).interpolate(d3.interpolateRound);

        // Transforming Axis
        x_axis.transition()
            .duration(1000)
            .call(d3.axisBottom(zoomed_x_scaler).tickSizeOuter(0).tickSize(-HEIGHT * 1.3));

        // Changing Labels 
        x_label.text(make_axis_label(metadata[new_axis]))

        // Transforming Map
        data.map((d) => {
            let plotpoint = data_to_sprite.get(d)


            motionEase.add(plotpoint, { x: zoomed_x_scaler(d[new_axis]) });

        });

        currentXAxis = new_axis;


    }

    function switch_y_axis() {
        let new_axis = y_axis_options.value;


        let new_y_extent = d3.extent(data, d => parseFloat(d[new_axis]));

        // Adding Buffer
        let new_y_range = new_y_extent[1] - new_y_extent[0];
        new_y_extent[0] = new_y_extent[0] - DATABORDERBUFFER * new_y_range
        new_y_extent[1] = new_y_extent[1] + DATABORDERBUFFER * new_y_range

        new_y_extent.reverse();

        y_scaler.domain(new_y_extent);

        const zoomed_y_scaler = currentZoom.rescaleY(y_scaler).interpolate(d3.interpolateRound);

        y_axis.transition()
            .duration(1000)
            .call(d3.axisLeft(zoomed_y_scaler).tickSizeOuter(0).tickSize(-WIDTH * 1.3));

        // Changing Labels 
        y_label.text(make_axis_label(metadata[new_axis]))

        data.map((d) => {
            let plotpoint = data_to_sprite.get(d);

            motionEase.add(plotpoint, { y: zoomed_y_scaler(d[new_axis]) });
        });

        currentYAxis = new_axis;

    }

    function replotData() {

        console.log(`Current X-axis: ${currentXAxis}`)
        console.log(`Current Y-axis: ${currentYAxis}`)
        data.map((d) => {
            let plotpoint = data_to_sprite.get(d);
            plotpoint.position.x = x_scaler(d[currentXAxis]);
            plotpoint.position.y = y_scaler(d[currentYAxis]);

        })

    }

    function resizeWindow() {

        HEIGHT = getAppHeight();
        WIDTH = getAppWidth();

        // Resize Pixi app
        app.resize();

        // Resize Decorators SVG
        svg.attr("width", WIDTH).attr("height", HEIGHT)

        // Update Scalers
        x_scaler.range([0, WIDTH])
        y_scaler.range([0, HEIGHT])

        // Replot Data
        replotData();

    }

    replotData();
    // Currently Resize Not Working, Turning Off
    // window.addEventListener("resize", resizeWindow);


}