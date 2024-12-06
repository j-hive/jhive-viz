// Screenshot Functions

import html2canvas from "html2canvas";

const screenshotTarget = document.getElementById("app");

function saveAs(uri, filename) {
  var link = document.createElement("a");

  if (typeof link.download === "string") {
    link.href = uri;
    link.download = filename;

    //Firefox requires the link to be in the body
    document.body.appendChild(link);

    //simulate click
    link.click();

    //remove the link when done
    document.body.removeChild(link);
  } else {
    window.open(uri);
  }
}

export function saveScreenshot() {
  html2canvas(screenshotTarget).then((canvas) => {
    saveAs(canvas.toDataURL("image/png"), "jhive_screenshot.png");
  });
}
