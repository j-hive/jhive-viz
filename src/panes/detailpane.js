// Detail Pane Functions

import { d3 } from "../imports";
import { dataContainers, plottingConfig, windowState } from "../config";
import { getCutoutURL } from "../utils/cutouts";

const detailsPanel = document.getElementById("detailpanel");
const detailsImage = document.getElementById("source-cutout");
const detailsTitleID = document.getElementById("detail-title-header-val");
const detailsTitleRA = document.getElementById("detail-title-ra-val");
const detailsTitleDEC = document.getElementById("detail-title-dec-val");
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
      tmpEntry["y"] = dataPoint[key] ? dataPoint[key] : NaN;
      sed.push(tmpEntry);
    }
  });

  return sed;
}

/**
 * Setting NaNs to Arbitrary Low Number
 * @param {number} x  - Input Number
 * @returns {number} Number set to low if NaN
 */
export function setNanToLow(x) {
  return isNaN(x) ? 60 : x;
}

/**
 * Function to change Detail Pane
 */
export function updateDetailPanel(dataPoint) {
  // Get SVG
  const SEDsvg = d3.select("#SEDContainer");

  // Set Titles:
  detailsTitleID.innerHTML = dataPoint["id"];
  detailsTitleRA.innerHTML = d3.format(".5f")(dataPoint["ra"]) + "&deg;";
  detailsTitleDEC.innerHTML = d3.format(".5f")(dataPoint["dec"]) + "&deg;";
  detailsTitleMagf150w.innerHTML =
    d3.format(".1f")(dataPoint["abmag_f150w"]) + " (f150w)";
  detailsTitleMagf200w.innerHTML =
    d3.format(".1f")(dataPoint["abmag_f200w"]) + " (f200w)";
  detailsTitleMagf277w.innerHTML =
    d3.format(".1f")(dataPoint["abmag_f277w"]) + " (f277w)";

  let sedData = getSEDPoints(dataPoint);

  // Change SED Points:

  SEDsvg.selectAll("circle")
    .data(sedData)
    .transition()
    .delay(100)
    .duration(1000)
    .attr("cy", (d) => {
      return windowState.SEDyScaler(setNanToLow(d.y));
    });

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
    [plottingConfig.SEDLEFTMARGIN, SEDWidth - plottingConfig.SEDRIGHTMARGIN]
  );
  windowState.SEDyScaler = d3.scaleLinear(
    [17, 40],
    [plottingConfig.SEDUPPERMARGIN, SEDHeight - plottingConfig.SEDLOWERMARGIN]
  );

  let SEDsvg = d3
    .select(SEDContainer)
    .append("svg")
    .attr("id", "SEDContainer")
    .attr(
      "width",
      SEDWidth + plottingConfig.SEDLEFTMARGIN + plottingConfig.SEDRIGHTMARGIN
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

  SEDsvg.append("g")
    .attr(
      "transform",
      "translate(0," + (SEDHeight - plottingConfig.SEDLOWERMARGIN + 5) + ")"
    )
    .attr("class", "sed-x-axis")
    .call(d3.axisBottom(windowState.SEDxScaler).ticks(5));

  SEDsvg.append("g")
    .attr("class", "sed-y-axis")
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
      return windowState.SEDyScaler(80);
    })
    .attr("r", 5)
    .style("fill", "#73ADFA");

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
      `translate(${plottingConfig.SEDLEFTMARGIN},${
        (plottingConfig.SEDUPPERMARGIN +
          SEDHeight -
          plottingConfig.SEDLOWERMARGIN) /
        2
      }) rotate(-90)`
    )
    .call((text) =>
      text
        .append("tspan")
        .text("AB Magnitude")
        .style("fill", "white")
        .style("font-size", "10pt")
    );
}
