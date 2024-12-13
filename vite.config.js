// vite.config.js
import handlebars from "vite-plugin-handlebars";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { resolve } from "path";
import { defineConfig } from "vite";

const devTrue = process.env.NODE_ENV === "development";

function getVersionName() {
  let returnString =
    "Version " +
    JSON.stringify(process.env.npm_package_version).split('"').join("");

  if (devTrue) {
    returnString = "Dev Version";
  }

  return returnString;
}

function getCurrentYear() {
  return new Date().getFullYear();
}

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, "partials"),
      context: {
        versionNumber: getVersionName,
        currentYear: getCurrentYear,
      },
    }),
    ViteImageOptimizer({ jpeg: { quality: 60 } }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
