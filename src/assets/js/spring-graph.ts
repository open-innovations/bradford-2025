import * as d3 from "../../../deps/d3.ts";

const colour = {
  black: "#000000",
  offblack: "#1c1b1f",
  white: "#ffffff",
  pink: "#ffadd5",
  green: "#45d10a",
  yellow: "#e4ae00",
  grey: "#c7c7c7",
  midgrey: "#d5d3d0",
  lightgrey: "#e6e4e5",
  darkgrey: "#434343",
}

const series = {
  topic: { colour: colour.pink, label: "Topic" },
  output: { colour: colour.green, label: "Output" },
  system: { colour: colour.yellow, label: "System" },
}

async function init(selector: string) {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  const data = await d3.json("/strategy/data.json");

  const { width, height } = container.getBoundingClientRect();
  const nodes = data.nodes.map((n) => ({ ...n }));
  const links = data.links.map((e) => ({ ...e }));

  const centre = d3.forceCenter(width / 2, height / 2);
  const charge = d3.forceManyBody();

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((d) => d.id))
    .force("charge", charge)
    .force("center", centre)
    .velocityDecay(0.5)
    .on("tick", ticked);

  function recentre(x, y) {
    centre.x(x);
    centre.y(y);
  }

  const watcher = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    recentre(width / 2, height / 2);
    charge.distanceMax(Math.min(width, height) / 4);
    simulation.restart();
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);
  })
  watcher.observe(container);

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width:100%;height:auto;");

  const link = svg.append("g")
    .attr("stroke", "#d5d3d0")
    .selectAll()
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => "2");

  const node = svg.append("g")
    .attr("stroke", "#aaa")
    .attr("stroke-width", "1.5")
    .selectAll()
    .data(nodes)
    .join("circle")
    .attr("r", d => d.r || 10)
    .attr("fill", (d) => series[d.type].colour || "#aaa");

  const legend = svg.append("g").attr("transform", "translate(20, 20)")

  Object.values(series).forEach((s, i) => {
    const r = 10
    const y = (2 * r + 5) * i;
    legend.append("circle").attr("r", r).attr("cy", y).attr("fill", s.colour )
    legend.append("text").attr("dx", r + 5).attr("dy", y + 5).text(s.label)
  })

  node.append("title")
    .text((d) => d.id);

   // Add a drag behavior.
   node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    node
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);
  }

  // Reheat the simulation when drag starts, and fix the subject position.
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  // Update the subject (dragged node) position during drag.
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  container?.append(svg.node());
}

addEventListener("DOMContentLoaded", () => init("#graph"));
