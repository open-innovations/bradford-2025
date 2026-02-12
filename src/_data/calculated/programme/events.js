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
import { loadCsv, cleanGraphData, minMaxDates, expandToRange } from "lib/data-helpers.js";

// Load total figures
const totals = (await loadCsv("src/_data/published/programme/total.csv")).filter(r => r.variable == 'events');

const openEvents = totals.find((r) =>
  r.aggregation == 'BY_EVENT_TYPE' && r.event_type == "Open"
);
const allEvents = totals.find((r) =>
  r.aggregation == 'TOTAL' && r.event_type == "ALL"
);

// MONTHLY DATA
const byMonth = await loadCsv("src/_data/published/programme/by_month.csv");
const allEventsByMonth = byMonth.filter((r) =>
  r.aggregation == 'BY_MONTH' && r.variable == 'events'
).map(cleanGraphData);

const openEventsByMonth = byMonth.filter((r) =>
  r.aggregation == 'BY_MONTH_BY_EVENT_TYPE' && r.event_type == "Open" && r.variable == 'events'
).map(cleanGraphData);

const dates = minMaxDates(allEventsByMonth,'Date');

// By category
// NOTE this is all events, not just Open events.
const all_by_category = totals.filter(r => r.aggregation == 'BY_EVENT_TYPE').reduce((a, c) => ({ ...a, [c.evaluation_category]: c.value }), {})
const open_by_category = totals.filter(r => r.aggregation == 'BY_EVENT_TYPE_EVAL_CAT' && r.event_type == 'Open').reduce((a, c) => ({ ...a, [c.evaluation_category]: c.value }), {})

// This exposes the variables to the build. They will be available as `calculated.programme.events.x`
// (where `x` is the name in the export object)
export default {
	all: allEvents,
	open: openEvents,
	monthly: {
		all: allEventsByMonth,
		open: expandToRange(openEventsByMonth,dates),
	},
	categories: {
		all: all_by_category,
		open: open_by_category,
	},
	dates: dates,
};
