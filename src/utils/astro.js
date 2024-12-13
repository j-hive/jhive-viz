// Astronomical Functions

/**
 * Function to convert magnitudes to flux
 * @param {Number} mag - Magnitude to convert
 * @returns {Number} flux in Janskies
 */
export function convertABmagnitudeToLogFlux(mag) {
  return -(mag - 8.9) / 2.5;
}

/**
 * Redshift a wavelength to a specific redshift
 * @param {Number} wavelength - Rest wavelength to convert
 * @param {Number} redshift - Redshift to redshift to
 * @returns {Number} Redshifted Wavelength
 */
export function redshiftRestWavelength(wavelength, redshift) {
  return wavelength * (1 + redshift);
}
