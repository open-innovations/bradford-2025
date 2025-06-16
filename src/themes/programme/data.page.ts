import { stringify } from "jsr:@std/csv@1.0.6";

export default function* ({ url, page }) {
  const columns = [
    "name",
    "events",
    "scheduledEvents",
    "projectedEvents",
    "manual_events",
    "audience",
    "manual_audience",
    "evaluationCategory",
    "earliestDate",
    "latestDate",
  ];
  const projects = 
    Object.entries(page.data.events.by_project)
    .map((x) => ({ name: x[0], ...x[1] }))

  yield {
    url: `${url}projects.csv`,
    content: stringify(projects, { columns }),
  };
}
