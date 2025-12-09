import { loadCsv, cleanGraphData, minMaxDates } from "lib/data-helpers.js";

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

export default {
    all,
	monthly: {
		all: allByMonth,
		2025: allByMonth.filter((r) => r.Date.match(/^2025-/) ),
	},
    graph: {
        all: allByMonth.filter((r) => r.Date.match(/^2025-/) )
    },
	dates: minMaxDates(allByMonth,'Date'),
}