// details.js
import * as d3 from 'd3';

const metadataURL = "/data/uncover_dr3_jhive_viz.json";
const metadata_response = await fetch(metadataURL);
const metadata = await metadata_response.json();

const detailsPanel = document.getElementById("detailpanel");
const detailsTitleID = document.getElementById("detail-title-header-val");
const detailsTitleRA = document.getElementById("detail-title-ra-val");
const detailsTitleDEC = document.getElementById("detail-title-dec-val");
const detailsTitleMagf150w = document.getElementById("detail-title-mag-f150w-val");
const detailsTitleMagf200w = document.getElementById("detail-title-mag-f200w-val");
const detailsTitleMagf277w = document.getElementById("detail-title-mag-f277w-val");

// Getting SED Container

const SEDContainer = document.getElementById("detail-sed-plot");

// Function to create x-y from wavelengths and magnitudes
function getSEDPoints(datapoint) {
    let sed = [];

    Object.entries(metadata).forEach(
        (entry) => {
            const [key, value] = entry;
            if (value['is_magnitude']) {
                let tmpEntry = {};
                tmpEntry['x'] = value['wl_micron']
                tmpEntry['y'] = (datapoint[key] ? datapoint[key] : NaN)
                sed.push(tmpEntry)
            }

        }
    )

    return sed
}


function setNantoLow(x) {
    return (isNaN(x) ? 60 : x)
}

// Base of SED
let SEDWidth = SEDContainer.clientWidth;
let SEDHeight = SEDContainer.clientHeight;

const marginTop = 10;
const marginRight = 10;
const marginBottom = 20;
const marginLeft = 20;


const xScaler = d3.scaleLinear([0.4, 5], [marginLeft, SEDWidth - marginRight]);
const yScaler = d3.scaleLinear([17, 40], [marginTop, SEDHeight - marginBottom]);

let svg = d3.select(SEDContainer)
    .append("svg")
    .attr("width", SEDWidth + marginLeft + marginRight)
    .attr("height", SEDHeight + marginTop + marginBottom)
    .append("g")
    .attr("transform",
        "translate(" + marginLeft + "," + marginTop + ")");

svg.append("g")
    .attr("transform", "translate(0," + (SEDHeight - marginBottom + 5) + ")")
    .attr("class", "sed-x-axis")
    .call(d3.axisBottom(xScaler).ticks(5));

svg.append("g")
    .attr("class", "sed-y-axis")
    .call(d3.axisLeft(yScaler).ticks(5).tickSizeOuter(0)
        .tickSize(-SEDWidth + marginRight));

let baseData = getSEDPoints({});

svg.selectAll("mycircles")
    .data(baseData)
    .enter()
    .append("circle")
    .attr("cx", (d) => { return xScaler(d.x) })
    .attr("cy", (d) => { return yScaler(80) })
    .attr("r", 5)
    .style("fill", "#73ADFA")



svg.append("text")
    .attr("x", (marginLeft + SEDWidth - marginRight) / 2)
    .attr("y", SEDHeight - marginBottom)
    .attr("dy", -6)
    .attr("text-anchor", "middle")
    .call(text => text.append("tspan").text("Wavelength (\u03BCm)").style("fill", "white").style("font-size", "10pt"))


svg.append("text")
    .attr("dy", 1)
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${marginLeft},${(marginTop + SEDHeight - marginBottom) / 2}) rotate(-90)`)
    .call(text => text.append("tspan").text("AB Magnitude").style("fill", "white").style("font-size", "10pt"))


export function updateDetailPanel(datapoint) {

    // Turning on Detail Panel if not there already
    detailsPanel.classList.remove("details-off");
    detailsPanel.classList.add("details-on");

    // Set Titles:
    detailsTitleID.innerHTML = datapoint['id'];
    detailsTitleRA.innerHTML = d3.format(".5f")(datapoint['ra']) + "&deg;";
    detailsTitleDEC.innerHTML = d3.format(".5f")(datapoint['dec']) + "&deg;";
    detailsTitleMagf150w.innerHTML = d3.format(".1f")(datapoint['abmag_f150w']) + " (f150w)";
    detailsTitleMagf200w.innerHTML = d3.format(".1f")(datapoint['abmag_f200w']) + " (f200w)";
    detailsTitleMagf277w.innerHTML = d3.format(".1f")(datapoint['abmag_f277w']) + " (f277w)";


    let sedData = getSEDPoints(datapoint);

    // Change SED Points:

    svg
        .selectAll("circle")
        .data(sedData)
        .transition()
        .delay(100)
        .duration(1000)
        .attr("cy", (d) => { return yScaler(setNantoLow(d.y)) })


}