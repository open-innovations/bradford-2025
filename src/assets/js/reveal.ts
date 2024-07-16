import Reveal from "npm:reveal.js@5.1.0";

const deck = new Reveal({
  // Activate the scroll view
  view: "scroll",

  // Force the scrollbar to remain visible
  scrollProgress: true,
});
deck.initialize();
