// Context Menu

import { dataContainers, windowState } from "../config";
import { recolorData, replotData } from "../utils/plot";
import { getPointColor } from "./datainteractions";

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

const menu = new ContextMenu({
  items: [
    {
      icon: "magnifying-glass",
      name: "Open Details",
      action: () => console.log("Open Details"),
    },
    {
      icon: "image",
      name: "Open FITS Map",
      action: openFITSMap,
    },
    {
      icon: "copy",
      name: "Copy Data to Clipboard",
      action: copyDataToClipboard,
    },
  ],
});

export function openContextMenu(event) {
  recolorData();

  const time = menu.isOpen() ? 100 : 0;

  menu.hide();
  setTimeout(() => {
    menu.show(event.pageX, event.pageY), time;
  });

  document.addEventListener("click", hideContextMenu, false);
}

export function hideContextMenu(event) {
  menu.hide();
  document.removeEventListener("click", hideContextMenu);
}

function openFITSMap() {
  let dataPoint = dataContainers.spriteToData.get(windowState.selectedPoint);

  const ra = dataPoint.ra;
  const dec = dataPoint.dec;

  let FITSMapURL = `https://s3.amazonaws.com/grizli-v2/ClusterTiles/Map/abell2744/jwst.html?coord=${ra},${dec}&zoom=8`;

  open(FITSMapURL, "FITSMapWindow");
}

function copyDataToClipboard() {
  let dataPoint = dataContainers.spriteToData.get(windowState.selectedPoint);

  let dataString = `id: ${dataPoint.id}, ra: ${dataPoint.ra}, dec: ${
    dataPoint.dec
  }, ${windowState.currentXAxis}: ${dataPoint[windowState.currentXAxis]}, ${
    windowState.currentYAxis
  }: ${dataPoint[windowState.currentYAxis]}`;

  navigator.clipboard
    .writeText(dataString)
    .then(() => {
      console.log("Copied to Clipboard", dataString);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
}
