import { loadCsv } from "../../../lib/data-helpers.js";

const totals = (await loadCsv('src/_data/published/programme/total.csv')).filter(x => x.variable == 'participants');
const byMonth = (await loadCsv('src/_data/published/programme/by_month.csv')).filter(x => x.variable == 'participants' && x.month.match(/^2025/));

const all = totals.find((r) => r.event_type == 'ALL' && r.variable_group == 'ALL');

const allByMonth = byMonth.filter(r => r.event_type == 'ALL' && r.variable_group == 'ALL').map(x => ({ Date: x.month.slice(0, -3), value: x.value }));

export default {
    all,
    graph: {
        all: allByMonth
    }
}