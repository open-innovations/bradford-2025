import Reveal from "npm:reveal.js@5.2.1";

const deck = new Reveal({
  // Activate the scroll view
  view: "scroll",

  // Force the scrollbar to remain visible
  scrollProgress: true,
});
deck.initialize();
