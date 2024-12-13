// Detail Pane Functions

import { d3 } from "../imports";
import { dataContainers, plottingConfig, windowState } from "../config";
import { getCutoutURL } from "../utils/cutouts";
import { getRangeWithBorder } from "../data";
import {
  convertABmagnitudeToLogFlux,
  redshiftRestWavelength,
} from "../utils/astro";

const detailsPanel = document.getElementById("detailpanel");
const detailsImage = document.getElementById("source-cutout");
const detailsTitleID = document.getElementById("detail-title-header-val");
const detailsTitleRA = document.getElementById("detail-title-ra-val");
const detailsTitleDEC = document.getElementById("detail-title-dec-val");
const detailsTitleZ = document.getElementById("detail-title-z-val");
const detailsTitleSFR = document.getElementById("detail-title-sfr-val");

const detailsTitleMagf150w = document.getElementById(
  "detail-title-mag-f150w-val"
);
const detailsTitleMagf200w = document.getElementById(
  "detail-title-mag-f200w-val"
);
const detailsTitleMagf277w = document.getElementById(
  "detail-title-mag-f277w-val"
);

// Getting SED Container

const SEDContainer = document.getElementById("detail-sed-plot");

let SEDxAxis = null;
let SEDyAxis = null;

/**
 * Get Points from SED
 * @param {Object} dataPoint
 * @returns {Array} - SED points
 */
export function getSEDPoints(dataPoint) {
  let sed = [];

  Object.entries(dataContainers.metadata.columns).forEach((entry) => {
    const [key, value] = entry;
    if (value["is_magnitude"]) {
      let tmpEntry = {};
      tmpEntry["x"] = value["wl_micron"];
      tmpEntry["y"] = dataPoint[key]
        ? convertABmagnitudeToLogFlux(dataPoint[key])
        : NaN;
      sed.push(tmpEntry);
    }
  });

  return sed;
}

/**
 * Create a Redshifted Reference Line
 * @param {Object} dataPoint - datapoint
 * @param {Number} wavelength - wavelength to redshift
 * @param {Array} extent - y-extent
 * @returns {Array} Redshifted Line
 */
export function getRedshiftedLine(dataPoint, wavelength, extent) {
  let redshiftedLine = dataPoint.zfit_50
    ? redshiftRestWavelength(wavelength, parseFloat(dataPoint["zfit_50"]))
    : wavelength;

  let topEntry = { x: redshiftedLine, y: extent[1] };
  let bottomEntry = { x: redshiftedLine, y: extent[0] };

  return [topEntry, bottomEntry];
}

/**
 * Setting NaNs to Arbitrary Low Number
 * @param {number} x  - Input Number
 * @returns {number} Number set to low if NaN
 */
export function setNanToLow(x) {
  return isNaN(x) ? -60 : x;
}

/**
 * Function to change Detail Pane
 */
export function updateDetailPanel(dataPoint) {
  // Get SVG
  const SEDsvg = d3.select("#SEDContainer");

  // Set Titles:
  detailsTitleID.innerHTML =
    dataContainers.fieldsFile[dataPoint["fieldName"]].display +
    " " +
    dataPoint["id"];
  detailsTitleRA.innerHTML = d3.format(".5f")(dataPoint["ra"]) + "&deg;";
  detailsTitleDEC.innerHTML = d3.format(".5f")(dataPoint["dec"]) + "&deg;";
  detailsTitleZ.innerHTML = d3.format(".2f")(dataPoint["zfit_50"]);
  detailsTitleSFR.innerHTML = d3.format(".1f")(dataPoint["logSFRinst_50"]);
  detailsTitleMagf150w.innerHTML =
    d3.format(".1f")(dataPoint["abmag_f150w"]) + " (f150w)";
  detailsTitleMagf200w.innerHTML =
    d3.format(".1f")(dataPoint["abmag_f200w"]) + " (f200w)";
  detailsTitleMagf277w.innerHTML =
    d3.format(".1f")(dataPoint["abmag_f277w"]) + " (f277w)";

  let sedData = getSEDPoints(dataPoint);
  // Change SED Points:

  let tmpYPoints = sedData.map((a) => a.y);

  windowState.SEDyScaler.domain(d3.extent(tmpYPoints));

  let refLine = getRedshiftedLine(
    dataPoint,
    0.4,
    windowState.SEDyScaler.domain()
  );

  SEDyAxis.transition()
    .duration(1000)
    .call(
      d3
        .axisLeft(windowState.SEDyScaler)
        .ticks(5)
        .tickSizeOuter(0)
        .tickSize(-windowState.WIDTH * 1.3)
    );

  SEDsvg.selectAll("circle")
    .data(sedData)
    .transition()
    .delay(100)
    .duration(1000)
    .attr("cy", (d) => {
      return windowState.SEDyScaler(setNanToLow(d.y));
    });

  SEDsvg.selectAll("#refLine")
    .datum(refLine)
    .transition()
    .delay(100)
    .duration(1000)
    .attr(
      "d",
      d3
        .line()
        .x((d) => {
          return windowState.SEDxScaler(d.x);
        })
        .y((d) => {
          return windowState.SEDyScaler(d.y);
        })
    );

  SEDsvg.selectAll("#refLineLabel")
    .transition()
    .delay(100)
    .duration(1000)
    .attr("x", windowState.SEDxScaler(refLine[0].x));

  // Change Cutout Image:

  detailsImage.style.backgroundImage = `url(${getCutoutURL(
    dataPoint["id"],
    "test"
  )})`;
}

/**
 * Initialize the Detail Pane
 */
export function initializeDetailPane() {
  // Base of SED
  let SEDWidth = SEDContainer.clientWidth;
  let SEDHeight = SEDContainer.clientHeight;

  windowState.SEDxScaler = d3.scaleLinear(
    [0.4, 5],
    [2 * plottingConfig.SEDLEFTMARGIN, SEDWidth - plottingConfig.SEDRIGHTMARGIN]
  );
  windowState.SEDyScaler = d3.scaleLinear(
    [17, 41],
    [SEDHeight - plottingConfig.SEDLOWERMARGIN, plottingConfig.SEDUPPERMARGIN]
  );

  let SEDsvg = d3
    .select(SEDContainer)
    .append("svg")
    .attr("id", "SEDContainer")
    .attr(
      "width",
      SEDWidth +
        2 * plottingConfig.SEDLEFTMARGIN +
        plottingConfig.SEDRIGHTMARGIN
    )
    .attr(
      "height",
      SEDHeight + plottingConfig.SEDUPPERMARGIN + plottingConfig.SEDLOWERMARGIN
    )
    .append("g")
    .attr(
      "transform",
      "translate(" +
        plottingConfig.SEDLEFTMARGIN +
        "," +
        plottingConfig.SEDUPPERMARGIN +
        ")"
    );

  SEDxAxis = SEDsvg.append("g")
    .attr(
      "transform",
      "translate(0," + (SEDHeight - plottingConfig.SEDLOWERMARGIN + 5) + ")"
    )
    .attr("class", "sed-x-axis")
    .call(d3.axisBottom(windowState.SEDxScaler).ticks(5));

  SEDyAxis = SEDsvg.append("g")
    .attr("class", "sed-y-axis")
    .attr("transform", `translate(${2.2 * plottingConfig.SEDRIGHTMARGIN}, 0)`)
    .call(
      d3
        .axisLeft(windowState.SEDyScaler)
        .ticks(5)
        .tickSizeOuter(0)
        .tickSize(-SEDWidth + plottingConfig.SEDRIGHTMARGIN)
    );

  let baseData = getSEDPoints({});

  SEDsvg.selectAll("circles")
    .data(baseData)
    .enter()
    .append("circle")
    .attr("cx", (d) => {
      return windowState.SEDxScaler(d.x);
    })
    .attr("cy", (d) => {
      return windowState.SEDyScaler(-80);
    })
    .attr("r", 5)
    .style("fill", "#73ADFA");

  let restLine = getRedshiftedLine({}, 0.4, windowState.SEDyScaler.domain());

  SEDsvg.append("path")
    .datum(restLine)
    .attr("id", "refLine")
    .attr("fill", "none")
    .attr("stroke", "#a69a83")
    .attr("stroke-opacity", 0.3)
    .attr("stroke-dasharray", "5,5")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        .x((d) => {
          return windowState.SEDxScaler(d.x);
        })
        .y((d) => {
          return windowState.SEDyScaler(d.y);
        })
    );

  SEDsvg.append("text")
    .attr("id", "refLineLabel")
    .attr("x", windowState.SEDxScaler(restLine[0].x))
    .attr(
      "y",
      windowState.SEDyScaler.range()[1] - plottingConfig.SEDUPPERMARGIN
    )
    .attr("text-anchor", "middle")
    .text("0.4 \u03BCm")
    .style("font-size", "10pt")
    .style("fill", "#a69a83");

  SEDsvg.append("text")
    .attr(
      "x",
      (plottingConfig.SEDLEFTMARGIN +
        SEDWidth -
        plottingConfig.SEDRIGHTMARGIN) /
        2
    )
    .attr("y", SEDHeight - plottingConfig.SEDLOWERMARGIN)
    .attr("dy", -6)
    .attr("text-anchor", "middle")
    .call((text) =>
      text
        .append("tspan")
        .text("Wavelength (\u03BCm)")
        .style("fill", "white")
        .style("font-size", "10pt")
    );

  SEDsvg.append("text")
    .attr("dy", 1)
    .attr("text-anchor", "middle")
    .attr(
      "transform",
      `translate(${-1.1 * plottingConfig.SEDRIGHTMARGIN},${
        (plottingConfig.SEDUPPERMARGIN +
          SEDHeight -
          plottingConfig.SEDLOWERMARGIN) /
        2
      }) rotate(-90)`
    )
    .call((text) =>
      text
        .append("tspan")
        .text("log Flux (Jy)")
        .style("fill", "white")
        .style("font-size", "10pt")
    );
}
