import { loadCsv, cleanGraphData, minMaxDates, expandToRange } from "lib/data-helpers.js";

const totals = await loadCsv('src/_data/published/participants/total.csv');
const byMonth = await loadCsv('src/_data/published/participants/by_month.csv');

const all = totals.find((r) => 
    r.aggregation == 'TOTAL' &&
    r.variable == 'participants'
);

const allByMonth = byMonth.filter(r =>
    r.aggregation == 'BY_MONTH' &&
    r.variable == 'participants'
).map(cleanGraphData);

const dates = minMaxDates(allByMonth,'Date');

export default {
    all,
	monthly: {
		all: expandToRange(allByMonth,dates),
	},
	dates: dates,
}