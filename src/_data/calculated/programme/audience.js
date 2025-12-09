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
import { cleanGraphData, loadCsv, minMaxDates } from "lib/data-helpers.js";

// Load total figures
const totals = await loadCsv("src/_data/published/programme/total.csv");

// WIP on reshaping data in javascript
// Processing / class inspired by PETL
/*
import { DataTable } from "lib/data-table.js";

const flipped = await (
  new DataTable(
    totals.filter((f) => f.aggregation == "BY_EVENT_TYPE"),
  )
)
  .recast()
  .then((x) => x.cut("event_type", "events", "audience"));

console.log(flipped);
*/

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

// MONTHLY DATA
const byMonth = await loadCsv("src/_data/published/programme/by_month.csv");

const allAudienceByMonth = byMonth.filter((r) =>
  r.aggregation == "BY_MONTH" &&
  r.variable == "audience"
).map(cleanGraphData);

// CATEGORY DATA

const digitalAudienceByMonth = byMonth.filter((r) =>
  r.aggregation == "BY_MONTH_BY_EVAL_CAT" &&
  r.evaluation_category == "Digital" &&
  r.variable == "audience"
).map(cleanGraphData);

const nonDigitalAudienceByMonth = allAudienceByMonth.map(
  ({ Date, value }) => ({
    Date,
    value: value -
      (digitalAudienceByMonth.find((r) => r.Date === Date)?.value || 0),
  }),
);

// This exposes the variables to the build. They will be available as `calculated.programme.x`
// (where `x` is the name in the export object)
export default {
	all: allAudience,
	categories: {
		digital: digitalAudience,
		nonDigital: nonDigitalAudience,
	},
	monthly: {
		all: allAudienceByMonth,
		2025: allAudienceByMonth.filter((r) => r.Date.match(/^2025-/) ),
	},
	graph: {
		all: allAudienceByMonth.filter((r) => r.Date.match(/^2025-/) ),
		categories: {
			digital: digitalAudienceByMonth.filter((r) => r.Date.match(/^2025-/) ),
			nonDigital: nonDigitalAudienceByMonth.filter((r) => r.Date.match(/^2025-/) ),
		},
	},
	dates: minMaxDates(allAudienceByMonth,'Date'),
};
