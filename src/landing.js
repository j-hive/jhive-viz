import "./style/style.scss";
import { loadDistributionMetadata } from "./dataLoading";
import { CountUp } from "countup.js";

let numFields = 0;
let numParams = 0;
let numSources = 0;

async function getData() {
  await loadDistributionMetadata().then((result) => {
    numFields = result.field_keys_included.length;
    numParams = Object.keys(result.dist).length;
    numSources = parseInt(result.num_objects);
  });
}

async function initPage() {
  const numFieldElement = document.getElementById("stat-num-field");
  const numParamElement = document.getElementById("stat-num-param");
  const numSourceElement = document.getElementById("stat-num-source");

  let fieldCountUp = new CountUp(numFieldElement, numFields);
  let paramCountUp = new CountUp(numParamElement, numParams);
  let sourceCountUp = new CountUp(numSourceElement, numSources);

  fieldCountUp.start();
  paramCountUp.start();
  sourceCountUp.start();
}

getData().then(initPage);
