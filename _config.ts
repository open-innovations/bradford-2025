import jsonLoader from "lume/core/loaders/json.ts";
import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import date from "lume/plugins/date.ts";
import esbuild from "lume/plugins/esbuild.ts";
import favicon from "lume/plugins/favicon.ts";
import feed from "lume/plugins/feed.ts";
import metas from "lume/plugins/metas.ts";
import openGraphImages from "lume/plugins/og_images.ts";
import postcss from "lume/plugins/postcss.ts";
import redirects from "lume/plugins/redirects.ts";
import sheets from "lume/plugins/sheets.ts";
import sitemap from "lume/plugins/sitemap.ts";
import svgo from "lume/plugins/svgo.ts";
import transformImages from "lume/plugins/transform_images.ts";

import { read } from "lume/core/utils/read.ts";

import autoDependency from "https://deno.land/x/oi_lume_utils/processors/auto-dependency.ts";
import oiLumeViz from "oi_lume_viz/mod.ts";

import oiLumeVizOptions from './oi-lume-viz-config.ts';
import filters from "./lib/filters.ts";

import postcssConfig from "./postcss-config.ts";

import bradfordDataPublisher from './lib/bradford-data-publisher.ts';

const site = lume({
  src: "./src",
  location: new URL("https://data.bradford2025.co.uk/"),
});

// Include some remote asset files
site.remoteFile("assets/images/oi-square-white.svg", "https://open-innovations.org/resources/images/logos/oi-square-white.svg")

// Copy published data
site.use(await bradfordDataPublisher({
  publishedRoot: new URL(await import.meta.resolve('./data/published/')).pathname,
  metadataRoot: new URL(await import.meta.resolve('./data/metadata/')).pathname,
  exclude: [  
    'volunteers/demographics',
  ]
}))

site.use(sheets({
  options: {
      cellDates: true,
  }
}));
site.loadData(['.geojson', '.hexjson'], jsonLoader);
site.process(['.html'], (pages) => pages.forEach(autoDependency));

site.use(oiLumeViz(oiLumeVizOptions));
site.data('oiColour', oiLumeVizOptions.colour);

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
site.use(postcss(postcssConfig));
site.use(redirects());
site.use(favicon());

site.use(svgo());
site.use(transformImages());

// SEO
site.use(openGraphImages({
  satori: {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Denim INK",
        weight: 100,
        style: "normal",
        data: await read("vendor/bd25/DenimINK-Light-HFY2BIIM.woff", true)
      },
      {
        name: "Denim INK",
        weight: 400,
        style: "normal",
        data: await read("vendor/bd25/DenimINK-Regular-UUJ7XEES.woff", true)
      },
      {
        name: "Denim INK",
        weight: 700,
        style: "normal",
        data: await read("vendor/bd25/DenimINK-Bold-5SFPWNGF.woff", true)
      },
      // src: url(../fonts/DenimINK-Regular-YY7M2VJL.woff2) format('woff2'),
      //   url(../fonts/DenimINK-Regular-UUJ7XEES.woff) format('woff');
      // font-display: swap;    
    ]
  },
}));
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

/**
 * The list below maps a series of source files stored in the top-level `data` directory into the
 * site build context. This is useful when some publicly released data is to be integrated direct
 * into the site with no change (and a pipeline is therefore not necessary). Files can be renamed
 * simply in this way. Note that the files will not appear in the source tree.
 */
[
  // [ 'volunteers/demographics.csv', 'themes/volunteers/_data/demographics.csv' ],
  // [ 'volunteers/geo-summary.csv', 'themes/volunteers/_data/geo_summary.csv' ],
].forEach(async ([source, target]: [string, string]) => {
  const file = `data/processed/${source}`;
  try {
    await Deno.lstat(file);
    return site.remoteFile(target, file);
  } catch(e) {
    console.error(e.message);
  }
})

/**
 * Set up some global data
 */

// Set up landing page
const landing = 'placeholder';
const devLanding = 'v1';
site.data('landingPage', Deno.env.get('LUME_DRAFTS') == 'true' ? devLanding : landing, '/landing');

// Kludge to strip height and width from in line svg
site.process(['.html'], (pages) => pages.forEach(page => {
  page.document!.querySelectorAll<SVGElement>('.oi-viz svg').forEach(svg => {
    // Remove all inline styles!
    svg.removeAttribute('style');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
  })
  // Another kludge to avoid memory leaks on large pages
  page.content;
}));

site.use(filters);

export default site;
