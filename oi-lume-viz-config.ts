import { getColourVariables } from './lib/parse-css.ts';

const cssFile = new URL(import.meta.resolve("./src/_includes/css/colour.css")).pathname;

const names = await getColourVariables(cssFile, (n: string) => n.replace(/^--color-/, ""));

console.log(names);

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
    }
}
