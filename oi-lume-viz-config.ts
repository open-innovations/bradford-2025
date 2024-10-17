import { getColourVariables } from './lib/parse-css.ts';
import { denimInk } from "./lib/font-metrics.ts";

const cssFile = new URL(import.meta.resolve("./src/_includes/css/colour.css")).pathname;

const names = await getColourVariables(cssFile, (n: string) => n.replace(/^--color-/, ""));

const series = [
    'yellow',
    'pink',
    'green',
    'lightyellow',
    'lightpink',
    'lightgreen',
].map(n => names[n]);

export default {
    colour: {
        names, series 
    },
    font: {
        family: '"Denim INK", "Helvetica", sans-serif',
        fonts: {
            'Denim INK': denimInk,
        }
    },
}
