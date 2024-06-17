import Reveal from "npm:reveal.js";

const deck = new Reveal({
  // Activate the scroll view
  view: "scroll",

  // Force the scrollbar to remain visible
  scrollProgress: true,
});
deck.initialize();
