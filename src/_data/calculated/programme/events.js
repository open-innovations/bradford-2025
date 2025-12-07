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
import { loadCsv, cleanGraphData } from "lib/data-helpers.js";

// Load total figures
const totals = await loadCsv("src/_data/published/programme/total.csv");

const openEvents = totals.find((r) =>
  r.aggregation == 'BY_EVENT_TYPE' && r.event_type == "Open" && r.variable == "events"
);
const allEvents = totals.find((r) =>
  r.aggregation == 'TOTAL' && r.event_type == "ALL" && r.variable == "events"
);

// MONTHLY DATA
const byMonth = await loadCsv("src/_data/published/programme/by_month.csv");
const allEventsByMonth = byMonth.filter((r) =>
  r.aggregation == 'BY_MONTH' &&
  r.month.match(/^2025-/) &&
  r.variable == "events"
).map(cleanGraphData);

const openEventsByMonth = byMonth.filter((r) =>
  r.aggregation == 'BY_MONTH_BY_EVENT_TYPE' &&
  r.month.match(/^2025-/) &&
  r.event_type == "Open" &&
  r.variable == "events"
).map(cleanGraphData);

// This exposes the variables to the build. They will be available as `calculated.programme.events.x`
// (where `x` is the name in the export object)
export default {
  all: allEvents,
  open: openEvents,
  graph: {
    all: allEventsByMonth,
    open: openEventsByMonth,
  },
};
