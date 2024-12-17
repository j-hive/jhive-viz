// Context Menu

import { dataContainers, windowState } from "../config";
import { recolorData, replotData } from "../utils/plot";
import { getPointColor } from "./datainteractions";
import { showAlert } from "./uiinteractions";

class ContextMenu {
  constructor(data) {
    this.build(data.items);
  }

  build(options) {
    this.menu = document.createElement("menu");
    this.menu.classList.add(`context-menu`);
    options.forEach((option) => this.buildOption(option));
    document.body.appendChild(this.menu);
  }

  buildOption(option) {
    const li = document.createElement("LI");
    li.classList.add(`context-menu-item`);
    li.addEventListener("click", option.action);

    const button = document.createElement("button");
    button.classList.add(`context-menu-btn`);

    const i = document.createElement("i");
    i.classList.add(`context-menu-icon`);
    i.classList.add("fa");
    i.classList.add(`fa-${option.icon}`);

    const span = document.createElement("span");
    span.classList.add(`context-menu-text`);
    span.textContent = option.name;

    button.appendChild(i);
    button.appendChild(span);
    li.appendChild(button);
    this.menu.appendChild(li);
  }

  show(x, y) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const mw = this.menu.offsetWidth;
    const mh = this.menu.offsetHeight;

    if (x + mw > w) {
      x = x - mw;
    }
    if (y + mh > h) {
      y = y - mh;
    }

    this.menu.style.left = x + "px";
    this.menu.style.top = y + "px";
    this.menu.classList.add(`show-context-menu`);
  }

  hide() {
    this.menu.classList.remove(`show-context-menu`);
  }

  isOpen() {
    return this.menu.classList.contains(`show-context-menu`);
  }
}

const menuItems = [
  {
    icon: "magnifying-glass",
    name: "Open Details",
    action: openDetails,
  },
  {
    icon: "image",
    name: "Open FITS Map",
    action: openFITSMap,
  },
  {
    icon: "copy",
    name: "Copy Abridged Data to Clipboard",
    action: copyAbridgedDataToClipboard,
  },
  {
    icon: "copy",
    name: "Copy All Data to Clipboard",
    action: copyAllDataToClipboard,
  },
];

const menuItemsSelected = [
  {
    icon: "list",
    name: "Copy IDs of Selected Sources",
    action: copySelectedID,
  },
];

const menu = new ContextMenu({
  items: menuItems,
});

const menuSelected = new ContextMenu({
  items: menuItemsSelected,
});

export function openContextMenu(event) {
  recolorData();

  let currentMenu = windowState.mouseMode === "select" ? menuSelected : menu;

  const time = currentMenu.isOpen() ? 100 : 0;

  menu.hide();
  menuSelected.hide();

  setTimeout(() => {
    currentMenu.show(event.pageX, event.pageY), time;
  });

  document.addEventListener("click", hideContextMenu, false);
}

export function hideContextMenu(event) {
  menu.hide();
  menuSelected.hide();
  document.removeEventListener("click", hideContextMenu);
}

function openDetails() {
  let dataPoint = dataContainers.spriteToData.get(windowState.selectedPoint);
  const fieldName = dataPoint.fieldName;
  const id = dataPoint.id;

  let mainURL = `details.html?fieldName=${fieldName}&id=${id}`;
  open(mainURL, "jhiveDetails");
}

function openFITSMap() {
  let dataPoint = dataContainers.spriteToData.get(windowState.selectedPoint);

  const ra = dataPoint.ra;
  const dec = dataPoint.dec;

  let baseURL = dataContainers.fieldsFile[dataPoint.fieldName]["fitsmap_url"];

  if (baseURL) {
    let FITSMapURL = `${baseURL}?coord=${ra},${dec}&zoom=8`;

    open(FITSMapURL, "_blank");
  } else {
    console.log("No FITSMap available");
    showAlert(
      `No FITSMap available for the ${
        dataContainers.fieldsFile[dataPoint.fieldName]["display"]
      } field`
    );
  }
}

function copyAbridgedDataToClipboard() {
  let dataPoint = dataContainers.spriteToData.get(windowState.selectedPoint);

  let headerString = `fieldName, id, ra, dec, ${windowState.currentXAxis}, ${windowState.currentYAxis}\n`;
  let dataString = `${dataPoint.fieldName}, ${dataPoint.id}, ${dataPoint.ra}, ${
    dataPoint.dec
  }, ${dataPoint[windowState.currentXAxis]}, ${
    dataPoint[windowState.currentYAxis]
  }`;

  navigator.clipboard
    .writeText(headerString + dataString)
    .then(() => {
      console.log("Copied Selected Data to Clipboard");
      showAlert("Copied to Clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      showAlert("Failed to Copy");
    });
}

function copyAllDataToClipboard() {
  let dataPoint = dataContainers.spriteToData.get(windowState.selectedPoint);

  let headerString = "";
  let dataString = "";

  Object.keys(dataPoint).map((fieldName) => {
    headerString += `${fieldName},`;
    dataString += `${dataPoint[fieldName]},`;
  });

  headerString = headerString.slice(0, -1);
  dataString = dataString.slice(0, -1);

  navigator.clipboard
    .writeText(headerString + "\n" + dataString)
    .then(() => {
      console.log("Copied Selected Data to Clipboard");
      showAlert("Copied to Clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      showAlert("Failed to Copy");
    });
}

function copySelectedID() {
  let headerString = `fieldName, id`;
  let dataString = "";

  dataContainers.fieldList.map((fieldName) => {
    dataContainers.data[fieldName].map((d) => {
      let tmpSprite = dataContainers.dataToSprite.get(d);

      if (dataContainers.spriteToHighlighted.get(tmpSprite)) {
        dataString += `${d.fieldName}, ${d.id}\n`;
      }
    });
  });

  navigator.clipboard
    .writeText(headerString + "\n" + dataString)
    .then(() => {
      console.log("Copied Selected IDs to Clipboard");
      showAlert("Copied IDs to Clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      showAlert("Failed to Copy");
    });
}
