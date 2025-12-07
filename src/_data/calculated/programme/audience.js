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
import { loadCsv, cleanGraphData } from 'lib/data-helpers.js';

const totals = await loadCsv("src/_data/published/programme/total.csv");

const allAudience = totals.find((r) =>
  r.event_type == "ALL" && r.variable == "audience"
);
const digitalAudience = totals.find(r =>
  r.aggregation == 'BY_EVAL_CAT' &&
  r.evaluation_category == 'Digital' &&
  r.variable == 'audience'
);
const nonDigitalAudience = totals.filter(r =>
  r.aggregation == 'BY_EVAL_CAT' &&
  r.evaluation_category != 'Digital' &&
  r.variable == 'audience'
).reduce((a, c) => ({ value: a.value + c.value}), { value: 0 });

// MONTHLY DATA
const byMonth = await loadCsv("src/_data/published/programme/by_month.csv");

const allAudienceByMonth = byMonth.filter((r) =>
  r.aggregation == 'BY_MONTH' &&
  r.month.match(/^2025-/) &&
  r.variable == "audience"
).map(cleanGraphData);

// CATEGORY DATA

const digitalAudienceByMonth = byMonth.filter(r =>
  r.aggregation == 'BY_MONTH_BY_EVAL_CAT' &&
  r.evaluation_category == 'Digital' &&
  r.month.match(/^2025/) &&
  r.variable == 'audience'
).map(cleanGraphData);
const nonDigitalAudienceByMonth = allAudienceByMonth.map(
  ({ Date, value }) => ({
    Date,
    value: value - (digitalAudienceByMonth.find(r => r.Date === Date)?.value || 0)
}))

// This exposes the variables to the build. They will be available as `calculated.programme.x`
// (where `x` is the name in the export object)
export default {
  all: allAudience,
  categories: {
    digital: digitalAudience,
    nonDigital: nonDigitalAudience,
  },
  graph: {
    all: allAudienceByMonth,
    categories: {
      digital: digitalAudienceByMonth,
      nonDigital: nonDigitalAudienceByMonth,
    }
  },
};
