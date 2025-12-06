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
import { loadCsv } from '../../../lib/data-helpers.js';

function cleanGraphData(row) {
  return { Date: row.month.slice(0, -3), value: row.value }
}

// TODO this might change name
const totals = await loadCsv("src/_data/published/programme/total.csv");

// Calculate
const open_events = totals.find((r) =>
  r.event_type == "Open" && r.variable == "events"
);
const all_events = totals.find((r) =>
  r.event_type == "ALL" && r.variable == "events"
);
const all_audience = totals.find((r) =>
  r.event_type == "ALL" && r.variable == "audience"
);

// MONTHLY DATA
const byMonth = await loadCsv("src/_data/published/programme/by_month.csv");
const allEventsByMonth = byMonth.filter((r) =>
  r.month.match(/^2025-/) &&
  r.event_type == "ALL" &&
  r.variable_group == "ALL" &&
  r.variable == "events"
).map(cleanGraphData);

const openEventsByMonth = byMonth.filter((r) =>
  r.event_type == "Open" &&
  r.month.match(/^2025-/) &&
  r.variable_group == "ALL" &&
  r.variable == "events"
).map(cleanGraphData);

const allAudienceByMonth = byMonth.filter((r) =>
  r.month.match(/^2025-/) &&
  r.event_type == "ALL" &&
  r.variable_group == "ALL" &&
  r.variable == "audience"
).map(cleanGraphData);

// CATEGORY DATA
const byCategory = await loadCsv("src/_data/published/programme/by_category.csv");

const digital_audience = byCategory.find(r => r.month == 'ALL' && r.event_type == 'ALL' && r.variable == 'audience' && r.evaluation_category == 'Digital');
const non_digital_audience = byCategory.filter(r => r.month == 'ALL' && r.event_type == 'ALL' && r.variable == 'audience' && r.evaluation_category != 'Digital').reduce((a, c) => ({ value: a.value + c.value}), { value: 0 });

const digitalAudienceByMonth = byCategory.filter(r => r.evaluation_category == 'Digital' && r.month.match(/^2025/) && r.event_type == 'ALL' && r.variable_group == 'ALL' && r.variable == 'audience').map(cleanGraphData);
const nonDigitalAudienceByMonth = allAudienceByMonth.map(({ Date, value }, i) => ({ Date, value: value - (digitalAudienceByMonth.find(r => r.Date === Date)?.value || 0) }))

// This exposes the variables to the build. They will be available as `calculated.programme.x`
// (where `x` is the name in the export object)
export default {
  events_data: totals,
  all_events,
  open_events,
  all_audience,
  categories: {
    digital_audience,
    non_digital_audience,
  },
  graph: {
    all_events: allEventsByMonth,
    open_events: openEventsByMonth,
    all_audience: allAudienceByMonth,
    categories: {
      digital_audience: digitalAudienceByMonth,
      non_digital_audience: nonDigitalAudienceByMonth,
    }
  },
};
