import jsonLoader from "lume/core/loaders/json.ts";
import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import date from "lume/plugins/date.ts";
import esbuild from "lume/plugins/esbuild.ts";
import favicon from "lume/plugins/favicon.ts";
import feed from "lume/plugins/feed.ts";
import metas from "lume/plugins/metas.ts";
import postcss from "lume/plugins/postcss.ts";
import redirects from "lume/plugins/redirects.ts";
import sass from "lume/plugins/sass.ts";
import sheets from "lume/plugins/sheets.ts";
import sitemap from "lume/plugins/sitemap.ts";
import svgo from "lume/plugins/svgo.ts";
import transformImages from "lume/plugins/transform_images.ts";


import autoDependency from "https://deno.land/x/oi_lume_utils/processors/auto-dependency.ts";
import oiLumeViz from "oi_lume_viz/mod.ts";

const site = lume({
  src: "./src",
  location: new URL("https://open-innovations.github.io/bradford-2025"),
});

site.use(sheets());
site.loadData(['.geojson', '.hexjson'], jsonLoader);
site.process(['.html'], (pages) => pages.forEach(autoDependency));

site.use(oiLumeViz());

site.use(base_path());
site.use(date({
  formats: {
    BD25_LONG_DATE: "d MMMM yyyy",
  }
}));
site.use(esbuild({
  options: {
    bundle: true,
    format: "esm",
    minify: false,
    keepNames: true,
    platform: "browser",
    target: "esnext",
    // incremental: true,
    treeShaking: true,
  },
}));
site.use(sass()); // Requried for Reveal themes
site.use(postcss());
site.use(redirects());
site.use(favicon());

site.use(svgo());
site.use(transformImages());

site.use(metas());
site.use(sitemap());
site.use(feed({
  output: ["/site.rss", "/site.json"],
  query: "type=metric",
  info: {
    title: "=site.title",
    description: "=site.description",
  },
  items: {
    title: "=title",
    description: "=excerpt",
  },
}));

// Copy typefaces
[
  "DenimINK-Bold-5SFPWNGF.woff",
  "DenimINK-Bold-WY4SU2TF.woff2",
  "DenimINK-Light-HFY2BIIM.woff",
  "DenimINK-Light-J3BAZLHK.woff2",
  "DenimINK-Medium-BLMRAKTV.woff",
  "DenimINK-Medium-T4JMAUMH.woff2",
  "DenimINK-Regular-UUJ7XEES.woff",
  "DenimINK-Regular-YY7M2VJL.woff2",
  "DenimINK-SemiBold-6EI7BXBD.woff2",
  "DenimINK-SemiBold-47CY3AKH.woff",
].forEach((f) => site.remoteFile(`assets/fonts/${f}`, `vendor/bd25/${f}`));

site.copy("assets/fonts/");

// Copy Reveal code
[
  "dist/reveal.css",
].forEach((f) =>
  site.remoteFile(`assets/vendor/reveal/${f}`, `node_modules/reveal.js/${f}`)
);

site.copy("assets/vendor/");

[
  "mixins.scss",
  "exposer.scss",
  "settings.scss",
  "theme.scss",
].forEach((c) =>
  site.remoteFile(
    `_includes/scss/${c}`,
    `node_modules/reveal.js/css/theme/template/${c}`,
  )
);

export default site;
