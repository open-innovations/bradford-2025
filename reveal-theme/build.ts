import * as sass from 'npm:sass@1.89.2';
import 'npm:reveal.js@5.2.1';

const sourceFile = new URL(import.meta.resolve('./reveal-bd25.scss')).pathname;
const targetFile = new URL(import.meta.resolve('../src/assets/css/reveal-bd25.css'));

await Deno.writeTextFile(targetFile, sass.compile(sourceFile).css);