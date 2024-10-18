import { metricsBuilder } from "./font-metrics.ts";

Deno.bench("Build metrics", async () => {
  await metricsBuilder("vendor/bd25/DenimINK-Regular-UUJ7XEES.woff");
  await metricsBuilder("vendor/bd25/DenimINK-Bold-5SFPWNGF.woff");
});
