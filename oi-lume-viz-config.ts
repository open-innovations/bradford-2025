import { getColourVariables } from "./lib/parse-css.ts";
import { metricsBuilder } from "./lib/font-metrics.ts";

const cssFile =
  new URL(import.meta.resolve("./src/_includes/css/colour.css")).pathname;

const names = await getColourVariables(
  cssFile,
  (n: string) => n.replace(/^--color-/, ""),
);

const series = [
  "yellow",
  "pink",
  "green",
  "lightyellow",
  "lightpink",
  "lightgreen",
  "darkgreen",
  "darkpink",
].map((n) => names[n]);

export default {
  colour: {
    names,
    series,
  },
  font: {
    family: '"Denim INK", "Helvetica", sans-serif',
    fonts: {
      "Denim INK": {
        normal: await metricsBuilder(
          "vendor/bd25/DenimINK-Regular-UUJ7XEES.woff",
        ),
        bold: await metricsBuilder("vendor/bd25/DenimINK-Bold-5SFPWNGF.woff"),
      },
    },
  },
};
