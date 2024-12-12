// Data Loading and Manipulations Functions
import { d3 } from "./imports";
import {
  dataContainers,
  plottingConfig,
  dataRootURL,
  fieldsFileName,
} from "./config";
import { replotData } from "./utils/plot";
import { addDataToPlot } from "./pixiapp";
import { addFieldNameToData } from "./dataLoading";

/**
 * Remove Field Data from plot points, data, and metadata
 * @param {string} fieldName
 */

export async function removeFieldData(fieldName) {
  console.log(`Removing Field ${fieldName}`);
  updateFieldList();
  dataContainers.pointContainer[fieldName].removeChildren();
  delete dataContainers.pointContainer[fieldName];
  delete dataContainers.data[fieldName];

  replotData();
}

/**
 * Add a field to the plot
 * @param {String} fieldName - the name of the field
 */
export async function addFieldData(fieldName) {
  updateFieldList();

  let tmpData = await d3.csv(
    dataRootURL + dataContainers.fieldsFile[fieldName].data_file
  );

  addFieldNameToData(tmpData, fieldName);

  dataContainers.data[fieldName] = tmpData;

  dataContainers.metadata.num_objects += tmpData.length;

  await addDataToPlot(fieldName);

  replotData();
}

export function createFunctionSelector(fieldName) {
  const fieldSelectorContainer = document.getElementById(
    "field-selector-container"
  );

  const fieldContainer = document.createElement("div");
  fieldContainer.classList.add("field-selector-field-container");

  const fieldInput = document.createElement("input");
  fieldInput.type = "checkbox";
  fieldInput.name = "field_selector_option";
  fieldInput.value = fieldName;
  fieldInput.id = "field_selector_" + fieldName;
  fieldInput.checked = true;
  fieldInput.addEventListener("click", (event) => {
    if (event.target.checked) {
      addFieldData(fieldName);
    } else {
      removeFieldData(fieldName);
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
 * Adding a fieldName field to loaded data
 * @param {Array} data - the data array
 * @param {string} fieldName - the name of the field
 */

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
 * @param {Number} dataBorderBuffer - The Border to Use
 * @returns {Array} the Extent Array with Border
 */
export function getRangeWithBorder(
  entryMetadata,
  dataBorderBuffer = plottingConfig.DATABORDERBUFFER
) {
  let fullExtent = [entryMetadata["min_val"], entryMetadata["max_val"]];

  // Reversing if Magnitude
  if (entryMetadata["is_magnitude"]) {
    fullExtent.reverse();
  }

  let initialRange = fullExtent[1] - fullExtent[0];

  fullExtent[0] = fullExtent[0] - dataBorderBuffer * initialRange;
  fullExtent[1] = fullExtent[1] + dataBorderBuffer * initialRange;

  return fullExtent;
}

/**
 * Update the dataContainers Field List based on current
 * selection state of the checkboxes
 */
export function updateFieldList() {
  const checkedFieldSelectorOptions = document.querySelectorAll(
    "input[name=field_selector_option]:checked"
  );
  dataContainers.fieldList.length = 0;
  checkedFieldSelectorOptions.forEach((checkBox) => {
    dataContainers.fieldList.push(checkBox.value);
  });
}
