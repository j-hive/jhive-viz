// Data Loading and Manipulations Functions
import { d3 } from "./imports";
import { dataURL, metadataURL, dataContainers, plottingConfig } from "./config";

/**
 * Loads data and Metadata from data URLS
 * @returns {[d3.DSVRowArray, object]} Data and Metadata
 */
export async function loadData() {
  const data = await d3.csv(dataURL);
  const metadata_response = await fetch(metadataURL);
  const metadata = await metadata_response.json();

  console.log("Loaded Data and Metadata");

  return [data, metadata];
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
    defaultValue = "None";
    optionList.push(new Option("None", "None", true, true));
  }

  Object.entries(metadataJSON).forEach((entry) => {
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
 */
export function addDataOptionsToAxisSelectors(
  metadataJSON,
  xDefault = "ra",
  yDefault = "dec"
) {
  // Get Axis Selectors First:
  const xAxisSelector = document.getElementById("x-axis-selector");
  const yAxisSelector = document.getElementById("y-axis-selector");
  const colourAxisSelector = document.getElementById("colour-axis-selector");

  let xOptionList = makeSelectorOptionsFromMetadata(metadataJSON, xDefault);
  let yOptionList = makeSelectorOptionsFromMetadata(metadataJSON, yDefault);
  let colourOptionList = makeSelectorOptionsFromMetadata(
    metadataJSON,
    "None",
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

  if (metadataJSON["unit"]) {
    labelText += ` (${metadataJSON["unit"]})`;
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
  if (entryMetadata["is_mag"]) {
    fullExtent.reverse();
  }

  let initialRange = fullExtent[1] - fullExtent[0];

  fullExtent[0] =
    fullExtent[0] - plottingConfig.DATABORDERBUFFER * initialRange;
  fullExtent[1] =
    fullExtent[1] + plottingConfig.DATABORDERBUFFER * initialRange;

  return fullExtent;
}
