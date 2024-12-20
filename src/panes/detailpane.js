// Detail Pane Functions

import { d3 } from "../imports";
import {
  dataContainers,
  dataRootURL,
  distributionDataContainers,
  plottingConfig,
  windowState,
} from "../config";
import { getCutoutURL } from "../utils/cutouts";
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

let SEDyAxis = null;
let SEDxAxis = null;

// Getting MSFR Container

const MSFRContainer = document.getElementById("detail-msfr-plot");

// Getting MZ Container

const MZContainer = document.getElementById("detail-mz-plot");

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
  const MSFRsvg = d3.select("#MSFRContainer");
  const MZsvg = d3.select("#MZContainer");

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

  // M-SFR Plot:

  MSFRsvg.selectAll("circle")
    .data([dataPoint])
    .transition()
    .delay(100)
    .duration(1000)
    .attr("cy", (d) => {
      return windowState.MSFRyScaler(setNanToLow(d.logM_50));
    })
    .attr("cx", (d) => {
      return windowState.MSFRxScaler(setNanToLow(d.logSFRinst_50));
    });

  // M-Z Plot:

  MZsvg.selectAll("circle")
    .data([dataPoint])
    .transition()
    .delay(100)
    .duration(1000)
    .attr("cy", (d) => {
      return windowState.MZyScaler(setNanToLow(d.logM_50));
    })
    .attr("cx", (d) => {
      return windowState.MZxScaler(setNanToLow(d.zfit_50));
    });

  // Change Cutout Image:

  detailsImage.style.backgroundImage = `url(${getCutoutURL(
    dataPoint["id"],
    dataPoint["fieldName"]
  )})`;
}

/**
 * Initialize the SED Plot Pane
 */
export function initializeSEDPlot() {
  // Initializing SED

  // Base of SED
  let SEDWidth = SEDContainer.clientWidth;
  let SEDHeight = SEDContainer.clientHeight;

  windowState.SEDxScaler = d3.scaleLinear(
    [0.4, 5],
    [plottingConfig.SEDLEFTMARGIN, SEDWidth - plottingConfig.SEDRIGHTMARGIN]
  );
  windowState.SEDyScaler = d3.scaleLinear(
    [17, 41],
    [
      SEDHeight - 2 * plottingConfig.SEDLOWERMARGIN,
      plottingConfig.SEDUPPERMARGIN,
    ]
  );

  let SEDsvg = d3
    .select(SEDContainer)
    .append("svg")
    .attr("id", "SEDContainer")
    .attr("width", SEDWidth)
    .attr("height", SEDHeight)
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
      "translate(0," + (SEDHeight - 1.1 * plottingConfig.SEDLOWERMARGIN) + ")"
    )
    .attr("class", "sed-x-axis")
    .call(d3.axisBottom(windowState.SEDxScaler).ticks(5).tickSizeOuter(0));

  SEDyAxis = SEDsvg.append("g")
    .attr("class", "sed-y-axis")
    .attr("transform", `translate(0, 0)`)
    .call(
      d3
        .axisLeft(windowState.SEDyScaler)
        .ticks(5)
        .tickSizeOuter(0)
        .tickSizeInner(-SEDWidth, 0, 0)
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
    .attr("dominant-baseline", "hanging")
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
    // .attr("y", plottingConfig.SEDUPPERMARGIN)
    .attr("dy", -20)
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
        .text("log Flux (Jy)")
        .style("fill", "white")
        .style("font-size", "10pt")
    );
}

/**
 * Initializing the M-SFR Plot
 */
export function initializeMSFRPlot() {
  let [minSFR, maxSFR] =
    distributionDataContainers.metadata.limits["logSFRinst_50"];
  let [minM, maxM] = distributionDataContainers.metadata.limits["logM_50"];

  // Base of MSFR
  let MSFRWidth = MSFRContainer.clientWidth;
  let MSFRHeight = MSFRContainer.clientHeight;

  windowState.MSFRxScaler = d3.scaleLinear(
    [minSFR, maxSFR],
    [plottingConfig.MSFRLEFTMARGIN, MSFRWidth - plottingConfig.MSFRRIGHTMARGIN]
  );
  windowState.MSFRyScaler = d3.scaleLinear(
    [minM, maxM],
    [
      MSFRHeight - plottingConfig.MSFRLOWERMARGIN,
      plottingConfig.MSFRUPPERMARGIN,
    ]
  );

  let MSFRsvg = d3
    .select(MSFRContainer)
    .append("svg")
    .attr("id", "MSFRContainer")
    .attr("width", MSFRWidth)
    .attr("height", MSFRHeight)
    .append("g")
    .attr(
      "transform",
      "translate(" +
        plottingConfig.MSFRLEFTMARGIN +
        "," +
        plottingConfig.MSFRUPPERMARGIN +
        ")"
    );

  const MSFRxAxis = MSFRsvg.append("g")
    .attr(
      "transform",
      "translate(0," + (MSFRHeight - plottingConfig.MSFRLOWERMARGIN) + ")"
    )
    .attr("class", "msfr-x-axis")
    .call(
      d3
        .axisBottom(windowState.MSFRxScaler)
        .tickValues([Math.ceil(minSFR), Math.floor(maxSFR)])
        .tickSizeOuter(0)
    );

  const MSFRyAxis = MSFRsvg.append("g")
    .attr("class", "msfr-y-axis")
    .attr("transform", `translate(${plottingConfig.MSFRLEFTMARGIN}, 0)`)
    .call(
      d3
        .axisLeft(windowState.MSFRyScaler)
        .tickValues([Math.ceil(minM), Math.floor(maxM)])
    );

  // For Image:

  let minX, maxX, minY, maxY;

  minX = windowState.MSFRxScaler(minSFR);
  minY = windowState.MSFRyScaler(minM);
  maxX = windowState.MSFRxScaler(maxSFR);
  maxY = windowState.MSFRyScaler(maxM);

  MSFRsvg.append("svg:image")
    .attr("x", minX)
    .attr("y", maxY)
    .attr("width", maxX - minX)
    .attr("height", minY - maxY)
    .attr("preserveAspectRatio", "none")
    .attr("opacity", 0.3)
    .attr(
      "xlink:href",
      dataRootURL +
        distributionDataContainers.metadata.plots["logSFRinst_50-logM_50"]
    );

  let baseData = [{ zfit_50: 10 }];

  MSFRsvg.selectAll("circles")
    .data(baseData)
    .enter()
    .append("circle")
    .attr("cx", (d) => {
      return windowState.MSFRxScaler(d.zfit_50);
    })
    .attr("cy", (d) => {
      return windowState.MSFRyScaler(-20);
    })
    .attr("r", 5)
    .style("fill", "#73ADFA");

  MSFRsvg.append("text")
    .attr(
      "x",
      (plottingConfig.MSFRLEFTMARGIN +
        MSFRWidth -
        plottingConfig.MSFRRIGHTMARGIN) /
        2
    )
    .attr("y", MSFRHeight - plottingConfig.MSFRLOWERMARGIN)
    .attr("dy", 0)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .call((text) =>
      text
        .append("tspan")
        .text("log SFR")
        // .text("log SFR (M\u2299/YR)")
        .style("fill", "white")
        .style("font-size", "10pt")
    );

  MSFRsvg.append("text")
    .attr("dy", 1)
    .attr("text-anchor", "middle")
    .attr(
      "transform",
      `translate(0,${
        (plottingConfig.MSFRUPPERMARGIN +
          MSFRHeight -
          plottingConfig.MSFRLOWERMARGIN) /
        2
      }) rotate(-90)`
    )
    .call((text) =>
      text
        .append("tspan")
        .text("log M*")
        .style("fill", "white")
        .style("font-size", "10pt")
    );
}

/**
 * Function to initialize the Mass-Redshift Plot
 */
export function initializeMZPlot() {
  let [minZ, maxZ] = distributionDataContainers.metadata.limits["zfit_50"];
  let [minM, maxM] = distributionDataContainers.metadata.limits["logM_50"];

  // Base of MZ
  let MZWidth = MZContainer.clientWidth;
  let MZHeight = MZContainer.clientHeight;

  windowState.MZxScaler = d3.scaleLinear(
    [minZ, maxZ],
    [plottingConfig.MZLEFTMARGIN, MZWidth - plottingConfig.MZRIGHTMARGIN]
  );
  windowState.MZyScaler = d3.scaleLinear(
    [minM, maxM],
    [MZHeight - plottingConfig.MZLOWERMARGIN, plottingConfig.MZUPPERMARGIN]
  );

  let MZsvg = d3
    .select(MZContainer)
    .append("svg")
    .attr("id", "MZContainer")
    .attr("width", MZWidth)
    .attr("height", MZHeight)
    .append("g")
    .attr(
      "transform",
      "translate(" +
        plottingConfig.MZLEFTMARGIN +
        "," +
        plottingConfig.MZUPPERMARGIN +
        ")"
    );

  const MZxAxis = MZsvg.append("g")
    .attr(
      "transform",
      "translate(0," + (MZHeight - plottingConfig.MZLOWERMARGIN) + ")"
    )
    .attr("class", "mz-x-axis")
    .call(
      d3
        .axisBottom(windowState.MZxScaler)
        .tickValues([Math.ceil(minZ), Math.floor(maxZ)])
        .tickSizeOuter(0)
    );

  const MZyAxis = MZsvg.append("g")
    .attr("class", "mz-y-axis")
    .attr("transform", `translate(${plottingConfig.MZLEFTMARGIN}, 0)`)
    .call(
      d3
        .axisLeft(windowState.MZyScaler)
        .tickValues([Math.ceil(minM), Math.floor(maxM)])
    );

  // For Image:

  let minX, maxX, minY, maxY;

  minX = windowState.MZxScaler(minZ);
  minY = windowState.MZyScaler(minM);
  maxX = windowState.MZxScaler(maxZ);
  maxY = windowState.MZyScaler(maxM);

  MZsvg.append("svg:image")
    .attr("x", minX)
    .attr("y", maxY)
    .attr("width", maxX - minX)
    .attr("height", minY - maxY)
    .attr("preserveAspectRatio", "none")
    .attr("opacity", 0.3)
    .attr(
      "xlink:href",
      dataRootURL + distributionDataContainers.metadata.plots["zfit_50-logM_50"]
    );

  let baseData = [{ zfit_50: 10 }];

  MZsvg.selectAll("circles")
    .data(baseData)
    .enter()
    .append("circle")
    .attr("cx", (d) => {
      return windowState.MZxScaler(d.zfit_50);
    })
    .attr("cy", (d) => {
      return windowState.MZyScaler(-20);
    })
    .attr("r", 5)
    .style("fill", "#73ADFA");

  MZsvg.append("text")
    .attr(
      "x",
      (plottingConfig.MZLEFTMARGIN + MZWidth - plottingConfig.MZRIGHTMARGIN) / 2
    )
    .attr("y", MZHeight - plottingConfig.MZLOWERMARGIN)
    .attr("dy", 0)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .call((text) =>
      text
        .append("tspan")
        .text("z")
        .style("fill", "white")
        .style("font-size", "10pt")
    );

  MZsvg.append("text")
    .attr("dy", 1)
    .attr("text-anchor", "middle")
    .attr(
      "transform",
      `translate(0,${
        (plottingConfig.MZUPPERMARGIN +
          MZHeight -
          plottingConfig.MZLOWERMARGIN) /
        2
      }) rotate(-90)`
    )
    .call((text) =>
      text
        .append("tspan")
        .text("log M*")
        .style("fill", "white")
        .style("font-size", "10pt")
    );
}

/**
 * Function to initialize the details pane
 */
export function initializeDetailPane() {
  initializeSEDPlot();
  initializeMZPlot();
  initializeMSFRPlot();
}
