// Main Entry Point for Details Page
import "./style/style.scss";
import { dataContainers } from "./config.js";
import { loadAllDataFromFieldsFile, loadFieldsFile } from "./dataLoading.js";

let fieldName = null;
let id = null;

const testContainer = document.getElementById("test-container");

let mainData = {};

async function initDetailsPage() {
  dataContainers.fieldsFile = await loadFieldsFile();

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

  let newHTMLString = `Field: ${fieldName}, ID: ${id} <br/>`;

  Object.keys(dataContainers.metadata.columns).map((key) => {
    if (mainData[key]) {
      newHTMLString += `${dataContainers.metadata.columns[key].display}: ${mainData[key]} <br/>`;
    }
  });

  testContainer.innerHTML = newHTMLString;
}

await initDetailsPage();
