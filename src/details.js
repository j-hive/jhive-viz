// Main Entry Point for Details Page
import "./style/style.scss";
import { dataContainers, distributionDataContainers } from "./config.js";
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
}

await initDetailsPage();
