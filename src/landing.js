import "./style/style.scss";
import { loadDistributionMetadata, loadFieldsFile } from "./dataLoading";
import {
  dataContainers,
  dataRootURL,
  distributionDataContainers,
} from "./config";
import { CountUp } from "countup.js";

let numFields = 0;
let numParams = 0;
let numSources = 0;

async function getData() {
  dataContainers.fieldsFile = await loadFieldsFile();
  distributionDataContainers.metadata = await loadDistributionMetadata();

  const mainFields = Object.keys(dataContainers.fieldsFile).filter(
    (key) => !key.endsWith("_raw")
  );

  numFields = mainFields.length;
  numParams = Object.keys(distributionDataContainers.metadata.dist).length;

  await Promise.all(
    mainFields.map(async (key) => {
      let fileURL = dataRootURL + dataContainers.fieldsFile[key].metadata_file;
      const metadataFileResponse = await fetch(fileURL).catch((error) =>
        console.log(
          `Could not load Distribution Metadata File: ${error.message}`
        )
      );
      const metadataFile = await metadataFileResponse
        .json()
        .catch((error) =>
          console.log(`Could not parse Distribution Metadata: ${error.message}`)
        );

      numSources += parseInt(metadataFile.num_objects);
    })
  );
}

async function initPage() {
  const numFieldElement = document.getElementById("stat-num-field");
  const numParamElement = document.getElementById("stat-num-param");
  const numSourceElement = document.getElementById("stat-num-source");

  //   numFieldElement.innerHTML = numFields;
  //   numParamElement.innerHTML = numParams;
  //   numSourceElement.innerHTML = numSources;

  let fieldCountUp = new CountUp(numFieldElement, numFields);
  let paramCountUp = new CountUp(numParamElement, numParams);
  let sourceCountUp = new CountUp(numSourceElement, numSources);

  fieldCountUp.start();
  paramCountUp.start();
  sourceCountUp.start();
}

getData().then(initPage);
