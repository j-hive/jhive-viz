// Utilities for cutouts

import { cutoutsTag, dataContainers, dataRootURL } from "../config";

export function getCutoutURL(catalogID, fieldName) {
  if (fieldName == "test") {
    return `/data/cutouts/f200w/abell2744clu_grizli-v7.2_uncover-dr3_f200w_${parseInt(
      catalogID
    )
      .toString()
      .padStart(5, "0")}_cutout.jpg`;
  } else {
    let cutoutURL =
      dataRootURL + dataContainers.fieldsFile[fieldName].cutouts_dir;

    // THIS USES A HACK -- need to fix output field names
    cutoutURL += `${fieldName.replace(
      "-grizli",
      "_grizli"
    )}${cutoutsTag}${catalogID}_image.jpg`;

    return cutoutURL;
  }
}
