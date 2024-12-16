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

class DistributionPlot {
  leftMargin = 100;
  rightMargin = 20;
  topMargin = 20;
  bottomMargin = 100;

  constructor(containerID, dataPoint, key) {
    this.build(containerID, dataPoint, key);
  }

  async build(containerID, dataPoint, key) {
    // Opening the distribution information
    const distDataPath =
      dataRootURL + distributionDataContainers.metadata.dist[key];

    const distributionData = await d3.csv(distDataPath, d3.autoType);
    console.log(distributionData);

    // Creating Plot

    const distributionContainer = document.getElementById(containerID);
    console.log(distributionContainer);
    let distributionContainerWidth = distributionContainer.clientWidth;
    let distributionContainerHeight = distributionContainer.clientHeight;

    // Creating Scalers
    const distributionXScaler = d3.scaleLinear(
      d3.extent(distributionData, (d) => parseFloat(d.bin_centres)),
      [this.leftMargin, distributionContainerWidth - this.rightMargin]
    );
    const distributionYScaler = d3.scaleLinear(
      d3.extent(distributionData, (d) => parseFloat(d.bin_values)),
      [distributionContainerHeight - this.topMargin, this.bottomMargin]
    );

    const distributionSVG = d3
      .select(distributionContainer)
      .append("svg")
      .attr("id", `${key}-distribution-plot`)
      .attr("width", distributionContainerWidth)
      .attr("height", distributionContainerHeight)
      .append("g")
      .attr("transform", "translate(0,0)");

    const distributionXAxis = distributionSVG
      .append("g")
      .attr("class", `dist-${key}-x-axis`)
      .attr(
        "transform",
        `translate(0, ${distributionContainerHeight - this.topMargin})`
      )
      .call(d3.axisBottom(distributionXScaler));

    const distributionYAxis = distributionSVG
      .append("g")
      .attr("class", `dist-${key}-y-axis`)
      .attr("transform", `translate(${this.leftMargin},0)`)
      .call(d3.axisLeft(distributionYScaler).ticks(5));

    const curve = distributionSVG
      .append("g")
      .append("path")
      .attr("class", `${key}-path`)
      .datum(distributionData)
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
      .attr(
        "y2",
        distributionYScaler(d3.max(distributionData, (d) => d.bin_values))
      )
      .attr("stroke", "#facb73")
      .attr("stroke-dasharray", 4)
      .attr("stroke-width", "2");
  }
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

  cutoutImage.style.backgroundImage = `url(${getCutoutURL(id, "test")})`;
}

async function initDetailsPage() {
  dataContainers.fieldsFile = await loadFieldsFile();
  distributionDataContainers.metadata = await loadDistributionMetadata();

  let searchParams = window.location.search;
  let queryString = new window.URLSearchParams(searchParams);

  fieldName = queryString.get("fieldName");
  id = queryString.get("id");

  console.log(fieldName, id);

  if (fieldName) {
    [dataContainers.data, dataContainers.metadata] =
      await loadAllDataFromFieldsFile(fieldName);

    mainData = dataContainers.data[fieldName].filter(
      (item) => item.id === id
    )[0];
  }

  populateTopInfo(fieldName, id, mainData);
  changeCutoutImage(fieldName, id);

  let newHTMLString = `Field: ${fieldName}, ID: ${id} <br/>`;

  Object.keys(dataContainers.metadata.columns).map((key) => {
    if (mainData[key]) {
      newHTMLString += `${dataContainers.metadata.columns[key].display} (${key}): ${mainData[key]} <br/>`;
    }
  });

  testContainer.innerHTML = newHTMLString;

  const distPlot = new DistributionPlot(
    "test-plot-container",
    mainData,
    "logM_50"
  );
}

await initDetailsPage();
