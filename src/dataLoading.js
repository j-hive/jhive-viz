// Data Loading Functions

import { d3 } from "./imports";

import {
  testDataURL,
  testMetadataURL,
  dataContainers,
  dataRootURL,
  fieldsFileName,
  distributionMetadataPath,
} from "./config";
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

export async function loadAllDataFromFieldsFile(filterKey = null) {
  const mergedData = new Object();
  let mergedMetadata = { num_objects: 0, columns: {} };

  let tmpData = null;
  let tmpMetadata = null;

  // Loading Data from Each Field
  for (const key in dataContainers.fieldsFile) {
    if (filterKey && key != filterKey) {
      continue;
    } else if (key.endsWith("_raw")) {
      continue;
    }

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

    mergedData[key] = tmpData;
  }

  return [mergedData, mergedMetadata];
}

/**
 * Add a field name parameter to the array of data objects
 * @param {Array} data - the data array
 * @param {String} fieldName - the field name to append
 */
export async function addFieldNameToData(data, fieldName) {
  data.map((d) => {
    d.fieldName = fieldName;
  });
}

export async function loadDistributionMetadata() {
  changeLoadingStatus("Loading Distribution Metadata...");
  const metadataFileResponse = await fetch(distributionMetadataPath).catch(
    (error) =>
      console.log(`Could not load Distribution Metadata File: ${error.message}`)
  );
  const metadataFile = await metadataFileResponse
    .json()
    .catch((error) =>
      console.log(`Could not parse Distribution Metadata: ${error.message}`)
    );
  console.log("Loaded Distribution Metadata");

  return metadataFile;
}
