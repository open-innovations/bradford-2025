import { parse } from "@std/csv";

export async function loadCsv(path) {
  const text = await Deno.readTextFile(path);
  const data = parse(text, { skipFirstRow: true })
  .map((x) => ({...x, value: Number(x.value) }));
  return data;
}

