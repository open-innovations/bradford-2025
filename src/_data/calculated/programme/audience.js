/**
 * This module creates data from 'published' data which represents the agreed
 * figures key metrics for Bradford 2025.
 *
 * This data would have been previously created via pipelines, but this will simplify
 * the process of revising the content.
 *
 * Pipelines in this repo have become somewhat fragile, presenting conflicting and
 * confusing data.
 */
import { cleanGraphData, loadCsv, minMaxDates, expandToRange } from "lib/data-helpers.js";

const smonth = "2023-07";
const emonth = "2026-03-31";

/*DEPRECATED 2026-04-23
const allAudience = totals.find((r) =>
  r.event_type == "ALL" && r.variable == "audience"
);
const digitalAudience = totals.find((r) =>
  r.aggregation == "BY_EVAL_CAT" &&
  r.evaluation_category == "Digital" &&
  r.variable == "audience"
);
const nonDigitalAudience = totals.filter((r) =>
  r.aggregation == "BY_EVAL_CAT" &&
  r.evaluation_category != "Digital" &&
  r.variable == "audience"
).reduce((a, c) => ({ value: a.value + c.value }), { value: 0 });
*/

// MONTHLY DATA
const byMonth = await loadCsv("src/_data/published/programme/by_month.csv");

const allAudience = {
	value: byMonth.filter((r) =>
		r.aggregation == "BY_MONTH" &&
		r.variable == "audience" &&
		r.month >= smonth &&
		r.month <= emonth
	).map(cleanGraphData).reduce((acc,cur) => { if(typeof cur.value==="number"){ acc += cur.value; } return acc; },0)
};
const allAudienceByMonth = byMonth.filter((r) =>
	r.aggregation == "BY_MONTH" &&
	r.variable == "audience" &&
	r.month >= smonth &&
	r.month <= emonth
).map(cleanGraphData);


// CATEGORY DATA
const digitalMonthly = byMonth.filter((r) =>
	r.aggregation == "BY_MONTH_BY_EVAL_CAT" &&
	r.evaluation_category == "Digital" &&
	r.variable == "audience" &&
	r.month >= smonth &&
	r.month <= emonth
);
const digitalAudience = { value: digitalMonthly.reduce((acc,cur) => { if(typeof cur.value==="number"){ acc += cur.value; } return acc; },0) };
const digitalAudienceByMonth = digitalMonthly.map(cleanGraphData);

const nonDigitalMonthly = byMonth.filter((r) =>
	r.aggregation == "BY_MONTH_BY_EVAL_CAT" &&
	r.evaluation_category != "Digital" &&
	r.variable == "audience" &&
	r.month >= smonth &&
	r.month <= emonth
).reduce((acc,cur) => {
	if(!(cur.month in acc)) acc[cur.month] = {'value':0};
	acc[cur.month].value += cur.value;
	return acc;
},{});
const nonDigitalMonthly2 = [];
for(let m in nonDigitalMonthly) nonDigitalMonthly2.push({'month':m,'value':nonDigitalMonthly[m].value});
const nonDigitalAudience = { value: nonDigitalMonthly2.reduce((acc,cur) => { if(typeof cur.value==="number"){ acc += cur.value; } return acc; },0) };
const nonDigitalAudienceByMonth = nonDigitalMonthly2.map(cleanGraphData);

const dates = minMaxDates(allAudienceByMonth,'Date');

// This exposes the variables to the build. They will be available as `calculated.programme.x`
// (where `x` is the name in the export object)
export default {
	all: allAudience,
	categories: {
		digital: digitalAudience,
		nonDigital: nonDigitalAudience,
	},
	monthly: {
		all: allAudienceByMonth,//CHANGED 2026-04-28 expandToRange(allAudienceByMonth,dates),
		categories: {
			digital: digitalAudienceByMonth,
			nonDigital: nonDigitalAudienceByMonth
		}
	},
	dates: dates,
};
