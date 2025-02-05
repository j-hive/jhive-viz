// Main Entry Point for Details Page
import "./style/style.scss";
import {
  dataContainers,
  dataRootURL,
  distributionDataContainers,
} from "./config.js";
import {
  loadAllDataFromFieldsFile,
  loadDistributionMetadata,
  loadFieldsFile,
} from "./dataLoading.js";
import { getCutoutURL } from "./utils/cutouts.js";
import { d3 } from "./imports";

let fieldName = null;
let id = null;

const testContainer = document.getElementById("test-container");

let mainData = {};

/**
 * Generator of Distribution Plots
 */
class DistributionPlot {
  leftMargin = 80;
  rightMargin = 20;
  topMargin = 20;
  bottomMargin = 60;

  constructor(containerID, dataPoint, key) {
    this.build(containerID, dataPoint, key);
  }

  async build(containerID, dataPoint, key) {
    // Opening the distribution information
    const distDataPath =
      dataRootURL + distributionDataContainers.metadata.dist[key];

    const distributionData = await d3.csv(distDataPath, d3.autoType);

    // Creating Plot

    const distributionContainer = document.getElementById(containerID);
    distributionContainer.classList.add("distribution-plot");
    const distributionTitle = document.createElement("div");
    distributionTitle.classList.add("distribution-title");
    distributionTitle.innerHTML = `${dataContainers.metadata.columns[key].display}`;
    distributionContainer.appendChild(distributionTitle);

    let distributionContainerWidth = distributionContainer.clientWidth;
    let distributionContainerHeight = distributionContainer.clientHeight;

    let graphWidth =
      distributionContainerWidth - this.leftMargin - this.rightMargin;
    let graphHeight =
      distributionContainerHeight - this.topMargin - this.bottomMargin;

    let maxYVal = d3.max(distributionData, (d) => d.bin_values);

    let yExtent = d3.extent(distributionData, (d) => parseFloat(d.bin_values));
    yExtent[0] = 0;

    // Creating Scalers
    const distributionXScaler = d3.scaleLinear(
      d3.extent(distributionData, (d) => parseFloat(d.bin_centres)),
      [0, graphWidth]
    );
    const distributionYScaler = d3.scaleLinear(yExtent, [graphHeight, 0]);

    const distributionSVG = d3
      .select(distributionContainer)
      .append("svg")
      .attr("id", `${key}-distribution-plot`)
      .attr("width", distributionContainerWidth)
      .attr("height", distributionContainerHeight)
      .append("g")
      .attr("transform", `translate(${this.leftMargin},${this.topMargin})`);

    const distributionXAxis = distributionSVG
      .append("g")
      .attr("class", `dist-${key}-x-axis x-axis`)
      .attr("transform", `translate(0,${graphHeight})`)
      .call(d3.axisBottom(distributionXScaler));

    const distributionYAxis = distributionSVG
      .append("g")
      .attr("class", `dist-${key}-y-axis, y-axis`)
      .call(
        d3
          .axisLeft(distributionYScaler)
          .ticks(5)
          .tickSizeOuter(0)
          .tickSizeInner(-graphWidth)
      );

    const curve = distributionSVG
      .append("g")
      .append("path")
      .attr("class", `${key}-path`)
      .datum(distributionData)
      .attr("fill", "#676f7a")
      .attr("fill-opacity", 0.8)
      .attr(
        "d",
        d3
          .area()
          .x((d) => distributionXScaler(d.bin_centres))
          .y0(distributionYScaler(0))
          .y1((d) => distributionYScaler(d.bin_values))
      );

    const dataIndicator = distributionSVG
      .append("line")
      .attr("x1", distributionXScaler(dataPoint[key]))
      .attr("x2", distributionXScaler(dataPoint[key]))
      .attr("y1", distributionYScaler(0))
      .attr("y2", distributionYScaler(maxYVal))
      .attr("stroke", "#facb73")
      .attr("stroke-dasharray", 4)
      .attr("stroke-width", "2");

    const dataText = distributionSVG
      .append("text")
      .attr("fill", "#facb73")
      .attr("x", distributionXScaler(dataPoint[key]) + 5)
      .attr("y", distributionYScaler(maxYVal / 2))
      .attr("alignment-baseline", "hanging")
      .text(d3.format("0.3f")(dataPoint[key]));

    const xAxisLabel = distributionSVG
      .append("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "hanging")
      .attr("fill", "#ccc")
      .attr("x", graphWidth / 2)
      .attr("y", graphHeight + this.topMargin + 5)
      .text(
        `${dataContainers.metadata.columns[key].display} ${
          dataContainers.metadata.columns[key].output_units
            ? "(" + dataContainers.metadata.columns[key].output_units + ")"
            : ""
        }`
      );

    const yAxisLabel = distributionSVG
      .append("text")
      .attr("text-anchor", "center")
      .attr("alignment-baseline", "hanging")
      .attr("transform", "rotate(-90)")
      .attr("y", -this.leftMargin + 10)
      .attr("x", -this.topMargin - graphHeight / 2)
      .attr("fill", "#ccc")
      .text("Counts");
  }
}

function populateDenseBasis(dataPoint) {
  const plotContainer = document.getElementById("details-dense-basis-plots");

  const fieldsToPlot = [
    "zfit_50",
    "logM_50",
    "logSFRinst_50",
    "logZsol_50",
    "Av_50",
    "logMt_50",
    "logSFR10_50",
    "logSFR100_50",
    "logSFR300_50",
    "logSFR1000_50",
    "t25_50",
    "t50_50",
    "t75_50",
    "chi2",
    "fit_flags",
    "nbands",
  ];

  fieldsToPlot.map((key) => {
    let idName = `dbPlot-${key}`;
    let plotDiv = document.createElement("div");
    plotDiv.id = idName;
    plotDiv.classList.add("plot-container");

    if (dataPoint[key]) {
      plotContainer.appendChild(plotDiv);

      const distPlot = new DistributionPlot(idName, dataPoint, key);
    }
  });
}

/**
 * Convenience Function to change HTML within an element based on its ID
 * @param {String} elementID - the ID of the element to change
 * @param {String} newHTML - the new HTML to populate within the element
 */
function changeHTMLFromElementByID(elementID, newHTML) {
  const tmpElement = document.getElementById(elementID);

  if (tmpElement) {
    tmpElement.innerHTML = newHTML;
  } else {
    console.log(`No Element named ${elementID} Found. Cannot Update HTML.`);
  }
}

/**
 * Make a Magnitude Entry Box in the Top Info Section
 * @param {String} key - the magnitude key
 * @param {Number} value - the magnitude value
 */
function makeMagnitudeDisplayBox(key, value) {
  const magContainer = document.getElementById("details-magnitude-container");

  let newMagBox = document.createElement("div");
  newMagBox.classList.add("details-mag-box");

  let newFiltTitle = document.createElement("div");
  newFiltTitle.setAttribute(
    "title",
    `${dataContainers.metadata.columns[key].wl_micron} microns`
  );
  newFiltTitle.classList.add("details-mag-filt");
  newFiltTitle.innerHTML = dataContainers.metadata.columns[key].filt_name;

  let newFiltValue = document.createElement("div");
  newFiltValue.classList.add("details-mag-val");
  newFiltValue.innerHTML = d3.format(".3f")(value);

  newMagBox.appendChild(newFiltTitle);
  newMagBox.appendChild(newFiltValue);

  magContainer.appendChild(newMagBox);
}

function populateMagnitudes(mainData) {
  const magCols = Object.keys(dataContainers.metadata.columns).filter(
    (entry) => dataContainers.metadata.columns[entry].is_magnitude
  );

  magCols.sort((a, b) => {
    parseFloat(dataContainers.metadata.columns[a].wl_micron) -
      parseFloat(dataContainers.metadata.columns[b].wl_micron);
  });

  magCols.forEach((magKey) => {
    if (mainData[magKey]) {
      makeMagnitudeDisplayBox(magKey, mainData[magKey]);
    }
  });
}

/**
 * Populating base information for source
 * @param {String} fieldName - the name of the field
 * @param {Number} id - the ID of the object
 * @param {Object} mainData - the data of the object
 */
function populateTopInfo(fieldName, id, mainData) {
  changeHTMLFromElementByID(
    "details-source-name",
    dataContainers.fieldsFile[fieldName].display + ": ID " + id
  );
  changeHTMLFromElementByID(
    "details-position",
    `(ra, dec): ${mainData.ra}, ${mainData.dec}`
  );
  changeHTMLFromElementByID(
    "details-flux-radius",
    `Flux Radius: ${d3.format(".3f")(mainData.flux_radius)}"`
  );

  changeHTMLFromElementByID(
    "details-photometric-redshift",
    `Photometric Redshift: ${d3.format(".2f")(mainData.zfit_50)}`
  );

  changeHTMLFromElementByID(
    "details-stellar-mass",
    `Stellar Mass (log): ${d3.format(".2f")(mainData.logM_50)}`
  );

  changeHTMLFromElementByID(
    "details-sfr",
    `Star Formation Rate (log): ${d3.format(".2f")(mainData.logSFRinst_50)}`
  );

  changeHTMLFromElementByID(
    "details-metallicity",
    `Metallicity (log): ${d3.format(".2f")(mainData.logZsol_50)}`
  );

  // add magnitude values

  populateMagnitudes(mainData);
}

/**
 * Change the Cutout Image
 * @param {String} fieldName - the key of the field
 * @param {Number} id - the id of the object
 */
function changeCutoutImage(fieldName, id) {
  const cutoutImage = document.getElementById("details-cutout-image");

  cutoutImage.style.backgroundImage = `url(${getCutoutURL(id, fieldName)})`;
}

async function initDetailsPage() {
  dataContainers.fieldsFile = await loadFieldsFile();
  distributionDataContainers.metadata = await loadDistributionMetadata();

  let searchParams = window.location.search;
  let queryString = new window.URLSearchParams(searchParams);

  fieldName = queryString.get("fieldName");
  id = queryString.get("id");

  if (fieldName) {
    [dataContainers.data, dataContainers.metadata] =
      await loadAllDataFromFieldsFile(fieldName);

    mainData = dataContainers.data[fieldName].filter(
      (item) => item.id === id
    )[0];
  }

  populateTopInfo(fieldName, id, mainData);
  changeCutoutImage(fieldName, id);

  populateDenseBasis(mainData);
}

initDetailsPage();
