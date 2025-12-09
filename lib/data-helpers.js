import { parse } from "@std/csv";

export async function loadCsv(path) {
	const text = await Deno.readTextFile(path);
	const data = parse(text, { skipFirstRow: true })
	.map((x) => ({...x, value: Number(x.value) }));
	return data;
}

export function cleanGraphData(row) {
	let d = new Date(row.month);
	return { Date: row.month.slice(0, -3), value: row.value, Month: d.toLocaleDateString(undefined, { month: "long", year: "numeric" }) };
}

export function minMaxDates(rows,key="Date") {
	let minDate = '9999-99-99';
	let maxDate = '0000-00-00';
	for(let r = 0; r < rows.length; r++){
		let v = rows[r][key];
		if(typeof v==="string"){
			if(v > maxDate) maxDate = v;
			if(v < minDate) minDate = v;
		}
	}
	return {'earliest':minDate,'latest':maxDate};
}