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

// Add in missing months within the dates range
export function expandToRange(rows,dates){
	let s = new Date(dates.earliest + (dates.earliest.length==7 ? '-15':''));
	let e = new Date(dates.latest + (dates.latest.length==7 ? '-20':''));
	let y = s.getFullYear();
	let newrows = [];
	let mon,idx,m;
	for(let d = s; d <= e; ){
		mon = d.toISOString().substr(0,7);

		idx = rows.findIndex((el) => el.Date==mon);
		newrows.push(idx >= 0 ? rows[idx] : {'Date': mon, 'value': null, 'Month': d.toLocaleDateString(undefined, { month: "long", year: "numeric" })});

		// Update date
		d.setMonth(d.getMonth()+1);
	}
	return newrows;
}