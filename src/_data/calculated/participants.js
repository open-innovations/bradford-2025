import { loadCsv, cleanGraphData, minMaxDates, expandToRange } from "lib/data-helpers.js";

const smonth = "2023-07";
const emonth = "2026-03-31";

const byMonth = await loadCsv('src/_data/published/participants/by_month.csv');

/*DEPRECATED 2026-04-23
const all = totals.find((r) => 
    r.aggregation == 'TOTAL' &&
    r.variable == 'participants'
);
*/
const all = {
	value: byMonth.filter((r) =>
		r.aggregation == "BY_MONTH" &&
		r.variable == "participants" &&
		r.month >= smonth &&
		r.month <= emonth
	).map(cleanGraphData).reduce((acc,cur) => { if(typeof cur.value==="number"){ acc += cur.value; } return acc; },0)
};

const allByMonth = byMonth.filter(r =>
    r.aggregation == 'BY_MONTH' &&
    r.variable == 'participants' &&
	r.month >= smonth &&
	r.month <= emonth
).map(cleanGraphData);

const dates = minMaxDates(allByMonth,'Date');

export default {
    all,
	monthly: {
		all: allByMonth,//CHANGED 2026-04-28 expandToRange(allByMonth,dates),
	},
	dates: dates,
}