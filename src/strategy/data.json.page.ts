export const url = "/strategy/data.json";
export const layout = "templates/none.vto"

export default function ({ output, systems }) {
  const topics = output.map(({ id }) => ({ id, r: 10 }))
  const indicator = output.map(({ indicator }) => indicator).flat().filter((x, i, a) => a.map(x => x.id).indexOf(x.id) == i);

  const nodes = [
    ...topics.map(({ id }) => ({ id, r: 5, type: "topic" })),
    ...indicator.map(({ id }) => ({ id, r: 5, type: "output" })),
    ...systems.map(({ id }) => ({ id, r: 5, type: "system" })),
  ]
  
  const links = [
    ...output.map((s) => s.indicator
      .map(t => ({
        source: s.id, target: t.id
      }))
    ).flat(),
    ...indicator.map((s) => (s.system || [])
      .map(t => ({
        source: s.id, target: t
      }))
    ).flat()
  ]

  return JSON.stringify({
    nodes,
    links
  }, null, 2)
}