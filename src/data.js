// Data Loading and Manipulations Functions
import { d3 } from "./imports";
import { dataURL, metadataURL, dataContainers, plottingConfig } from "./config";

// Initial Data Loading Function

export async function load_data() {
  const data = await d3.csv(dataURL);
  const metadata_response = await fetch(metadataURL);
  const metadata = await metadata_response.json();

  console.log("Loaded Data and Metadata");

  return [data, metadata];
}

// Data Axis Functions

export function make_selector_options_from_metadata(
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

export function add_data_options_to_axis_selectors(
  metadataJSON,
  x_default = "ra",
  y_default = "dec"
) {
  // Get Axis Selectors First:
  const xAxisSelector = document.getElementById("x-axis-selector");
  const yAxisSelector = document.getElementById("y-axis-selector");
  const colourAxisSelector = document.getElementById("colour-axis-selector");

  let xOptionList = make_selector_options_from_metadata(
    metadataJSON,
    x_default
  );
  let yOptionList = make_selector_options_from_metadata(
    metadataJSON,
    y_default
  );
  let colourOptionList = make_selector_options_from_metadata(
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
 * @param {*} entryMetadata - The Entry Metadata Object
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
