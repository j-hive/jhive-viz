// Data Loading and Manipulations Functions
import { d3 } from "./imports";
import {
  testDataURL,
  testMetadataURL,
  dataContainers,
  plottingConfig,
  dataRootURL,
  fieldsFileName,
} from "./config";
import { v8_0_0 } from "pixi.js";
import { addField, removeField } from "./utils/plot";
import { changeLoadingStatus } from "./panes/loadingpane";

/**
 * Loads data and Metadata from data URLS
 * @returns {[d3.DSVRowArray, object]} Data and Metadata
 */
export async function loadTestData() {
  const data = await d3.csv(testDataURL);
  const metadataResponse = await fetch(testMetadataURL);
  const metadata = await metadataResponse.json();

  // Adding FieldName
  addFieldNameToData(data, "abell2744");

  console.log("Loaded Data and Metadata");

  return [data, metadata];
}

/**
 * Merges two field metadata files, adjusting min/max values for common fields
 * @param {object} metadata1
 * @param {object} metadata2
 * @returns object
 */
export async function mergeMetadataJSONs(metadata1, metadata2) {
  let newMin, newMax;

  for (const key in metadata2.columns) {
    if (key in metadata1.columns) {
      newMin = Math.min(
        metadata1.columns[key]["min_val"],
        metadata2.columns[key]["min_val"]
      );
      newMax = Math.max(
        metadata1.columns[key]["max_val"],
        metadata2.columns[key]["max_val"]
      );

      metadata1.columns[key]["min_val"] = newMin;
      metadata1.columns[key]["max_val"] = newMax;
    } else {
      metadata1.columns[key] = metadata2.columns[key];
    }
  }

  metadata1["num_objects"] += metadata2["num_objects"];

  return metadata1;
}

/**
 * Loads all data from the fields file
 * @returns {[d3.DSVRowArray, object]}
 */

export async function loadAllDataFromFieldsFile() {
  let mergedData = new Array();
  let mergedMetadata = { num_objects: 0, columns: {} };

  let tmpData = null;
  let tmpMetadata = null;

  // Loading Data from Each Field
  for (const key in dataContainers.fieldsFile) {
    console.log(`Loading Data from ${dataContainers.fieldsFile[key].display}`);
    changeLoadingStatus(
      `Loading Data from ${dataContainers.fieldsFile[key].display}...`
    );

    const metadataResponse = await fetch(
      dataRootURL + dataContainers.fieldsFile[key].metadata_file
    ).catch((error) =>
      console.log(
        `Could not load Metadata File for ${dataContainers.fieldsFile[key].display}: ${error.message}`
      )
    );

    tmpMetadata = await metadataResponse.json();

    mergedMetadata = await mergeMetadataJSONs(mergedMetadata, tmpMetadata);

    tmpData = await d3.csv(
      dataRootURL + dataContainers.fieldsFile[key].data_file
    );

    addFieldNameToData(tmpData, key);

    mergedData = [...mergedData, ...tmpData];

    createFunctionSelector(key);
  }

  return [mergedData, mergedMetadata];
}

function createFunctionSelector(fieldName) {
  const fieldSelectorContainer = document.getElementById(
    "field-selector-container"
  );

  const fieldContainer = document.createElement("div");
  fieldContainer.classList.add("field-selector-field-container");

  const fieldInput = document.createElement("input");
  fieldInput.type = "checkbox";
  fieldInput.name = fieldName;
  fieldInput.id = "field_selector_" + fieldName;
  fieldInput.checked = true;
  fieldInput.addEventListener("click", (event) => {
    if (event.target.checked) {
      addField(fieldName);
    } else {
      removeField(fieldName);
    }
  });

  const fieldLabel = document.createElement("label");
  fieldLabel.htmlFor = fieldInput.id;
  fieldLabel.innerHTML = dataContainers.fieldsFile[fieldName].display;

  fieldContainer.appendChild(fieldInput);
  fieldContainer.appendChild(fieldLabel);
  fieldSelectorContainer.appendChild(fieldContainer);
}

/**
 * Loads the field file containing all details of the fields
 * @returns {Object}
 */

export async function loadFieldsFile() {
  changeLoadingStatus("Loading Fields Reference...");
  const fieldsFileResponse = await fetch(dataRootURL + fieldsFileName).catch(
    (error) => console.log(`Could not load Fields File: ${error.message}`)
  );
  const fieldsFile = await fieldsFileResponse
    .json()
    .catch((error) =>
      console.log(`Could not parse Fields File: ${error.message}`)
    );
  console.log("Loaded Fields File");

  return fieldsFile;
}

/**
 * Adding a fieldName field to loaded data
 * @param {Array} data - the data array
 * @param {string} fieldName - the name of the field
 */

export async function addFieldNameToData(data, fieldName) {
  data.map((d) => {
    d.fieldName = fieldName;
  });
}

// Data Axis Functions

/**
 * Create all of the Data Axis Options
 * @param {object} metadataJSON - the Metadata JSON
 * @param {string} [defaultValue=null] - The default value in the selector
 * @param {boolean} [addNone = false] - If "None" should be added to the Selector
 * @returns {HTMLOptionElement[]} List of HTML Option Tags
 */
export function makeSelectorOptionsFromMetadata(
  metadataJSON,
  defaultValue,
  addNone = false
) {
  // Initial Empty Option List
  let optionList = [];

  // If addNone is True

  if (addNone) {
    optionList.push(new Option("None", "None", true, true));
  }

  Object.entries(metadataJSON.columns).forEach((entry) => {
    const [key, value] = entry;
    let selectedParam = key === defaultValue;
    optionList.push(
      new Option(value["display"], key, selectedParam, selectedParam)
    );
  });

  return optionList;
}

/**
 * Function to Add Data Options to the Axis Selectors
 * @param {object} metadataJSON - the Metadata JSON
 * @param {string} [xDefault = "ra"] - the key of the default x-axis default field
 * @param {string} [yDefault = "dec"] - the key of the default y-axis default field
 * @param {string} [colDefault = "None"] - the key of the default colour axis default field
 */
export function addDataOptionsToAxisSelectors(
  metadataJSON,
  xDefault = "ra",
  yDefault = "dec",
  colDefault = "None"
) {
  // Get Axis Selectors First:
  const xAxisSelector = document.getElementById("x-axis-selector");
  const yAxisSelector = document.getElementById("y-axis-selector");
  const colourAxisSelector = document.getElementById("colour-axis-selector");

  let xOptionList = makeSelectorOptionsFromMetadata(metadataJSON, xDefault);
  let yOptionList = makeSelectorOptionsFromMetadata(metadataJSON, yDefault);
  let colourOptionList = makeSelectorOptionsFromMetadata(
    metadataJSON,
    colDefault,
    true
  );

  // Adding all X-parameters
  xOptionList.forEach((entry) => {
    xAxisSelector.add(entry);
  });

  // Adding all Y-parameters
  yOptionList.forEach((entry) => {
    yAxisSelector.add(entry);
  });

  // Adding all Colour parameters
  colourOptionList.forEach((entry) => {
    colourAxisSelector.add(entry);
  });
}

export function make_axis_label(metadataJSON) {
  let labelText = metadataJSON["display"];

  if (metadataJSON["output_units"]) {
    labelText += ` (${metadataJSON["output_units"]})`;
  }

  return labelText;
}

// Data Property Functions

/**
 * Gets the Range for a data column and adds a border
 *
 * @param {object} entryMetadata - The Entry Metadata Object
 * @returns {Array} the Extent Array with Border
 */
export function getRangeWithBorder(entryMetadata) {
  let fullExtent = [entryMetadata["min_val"], entryMetadata["max_val"]];

  // Reversing if Magnitude
  if (entryMetadata["is_magnitude"]) {
    fullExtent.reverse();
  }

  let initialRange = fullExtent[1] - fullExtent[0];

  fullExtent[0] =
    fullExtent[0] - plottingConfig.DATABORDERBUFFER * initialRange;
  fullExtent[1] =
    fullExtent[1] + plottingConfig.DATABORDERBUFFER * initialRange;

  return fullExtent;
}
