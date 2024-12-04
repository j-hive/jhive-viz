// Utilities for cutouts

export function getCutoutURL(catalogID, fieldName) {
  if (fieldName == "test") {
    return `/data/cutouts/f200w/abell2744clu_grizli-v7.2_uncover-dr3_f200w_${parseInt(
      catalogID
    )
      .toString()
      .padStart(5, "0")}_cutout.jpg`;
  } else {
    return null;
  }
}
