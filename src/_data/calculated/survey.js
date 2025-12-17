import { loadCsv, cleanGraphData, minMaxDates, expandToRange } from "lib/data-helpers.js";

const results = await loadCsv('src/_data/published/survey/results.csv');

function breakdown(variable){

	const byMonth = results.filter(r => 
		r.aggregation == 'BY_MONTH' && r.variable == variable
	).map(cleanGraphData).map(x => ({ ...x, percent: x.value*100 }));

	const dates = minMaxDates(byMonth,'Date');

	return {

		all: results.find((r) => 
			r.aggregation == 'TOTAL' &&
			r.variable == variable
		),

		monthly: {
			all: expandToRange(byMonth,dates),
		},

		dates: dates

	}
}

export default {
    responses: breakdown('responses'),
	rated_good_or_excellent: breakdown('rated_good_or_excellent'),
	nps: breakdown('nps'),
}