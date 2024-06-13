import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import date from "lume/plugins/date.ts";
import esbuild from "lume/plugins/esbuild.ts";
import feed from "lume/plugins/feed.ts";
import postcss from "lume/plugins/postcss.ts";
import sitemap from "lume/plugins/sitemap.ts";

const site = lume({
  src: './src',
});

site.use(base_path());
site.use(date());
site.use(esbuild());
site.use(postcss());
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

// Copy Reveal code
[
  'dist/reveal.js',
  'dist/reveal.css',
  'dist/theme/simple.css',
].forEach(f => site.remoteFile(`assets/vendor/reveal/${f}`, `vendor/reveal.js-master/${f}`));

site.copy('assets/vendor', 'assets/vendor');

export default site;
