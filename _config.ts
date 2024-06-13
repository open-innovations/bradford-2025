import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import date from "lume/plugins/date.ts";
import esbuild from "lume/plugins/esbuild.ts";
import feed from "lume/plugins/feed.ts";
import postcss from "lume/plugins/postcss.ts";
import sass from "lume/plugins/sass.ts";
import sitemap from "lume/plugins/sitemap.ts";

const site = lume({
  src: './src',
});

site.use(base_path());
site.use(date());
site.use(esbuild());
site.use(sass()); // Requried for Reveal themes
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

// Copy typefaces
[
  'DenimINK-Bold-WY4SU2TF.woff2',
  'DenimINK-Light-J3BAZLHK.woff2',
  'DenimINK-Regular-YY7M2VJL.woff2',
  'DenimINK-SemiBold-6EI7BXBD.woff2',
].forEach(f => {
  console.log(f)
  site.remoteFile(`assets/fonts/${f}`, `vendor/bd25/${f}`)
});

site.copy('assets/fonts/');

// Copy Reveal code
[
  'dist/reveal.js',
  'dist/reveal.css',
  'dist/theme/simple.css',
].forEach(f => site.remoteFile(`assets/vendor/reveal/${f}`, `vendor/reveal.js-master/${f}`));

site.copy('assets/vendor/');

[
  "mixins.scss",
  "exposer.scss",
  "settings.scss",
  "theme.scss",
].forEach(c => site.remoteFile(`_includes/scss/${c}`, `vendor/reveal.js-master/css/theme/template/${c}`))

export default site;
