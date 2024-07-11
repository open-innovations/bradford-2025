export const url = "/strategy/data.json";
export const layout = "templates/none.vto"

const firstMatch = <T>(x: T, i: number, a: T[]) => a.map(x => x.id).indexOf(x.id) == i

export default function ({ topic, output, source }) {

  const nodes = [
    ...topic.map(({ id, name }) => ({ id, name, r: 5, type: "topic" })),
    ...output.filter(firstMatch).map(({ id, name }) => ({ id, name, r: 5, type: "output" })),
    ...source.map(({ id, name }) => ({ id, name, r: 5, type: "system" })),
  ]
  
  const links = [
    ...output.map((s) => ({ source: s.topic, target: s.id })),
    ...output.map((s) => (s.source || [])
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