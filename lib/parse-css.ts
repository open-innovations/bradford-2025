import { parse, render, walk } from "jsr:@tbela99/css-parser@0.7.2";

export async function getColourVariables(
  cssFile: string | URL,
  transformName = (x: string) => x.replace(/^--/, ""),
) {
  const cssText = await Deno.readTextFile(cssFile);
  const rawCss = await parse(cssText);
  const parsedCss = await parse(
    render(rawCss.ast, { convertColor: true }).code,
  );

  const result: { [k: string]: string } = {};
  for (const { node } of walk(parsedCss.ast)) {
    if (node.typ != 5) continue;
    const { nam, val } = node;
    const values = val.filter((v) => v.typ === 49);
    if (values.length < 1) continue;
    const value = values.map((x) => x.val).join(", ");
    result[transformName(nam)] = value;
  }

  return result;
}
