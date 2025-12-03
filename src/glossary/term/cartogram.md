---
title: Cartogram
description: A cartogram gives each area of a visualisation the same impact.
templateEngine: vto,md
---

When showing data on a heat map, a geographic map can give a distorted impression of the data. This tends to be the case when the data you want to compare is more related to population than the physical size of an area. This can be true when comparing [wards](/glossary/term/ward) where each ward has a similar population and should be the same fraction of the heat map.

We have used [a hexagon-based layout of wards](https://open-innovations.org/projects/hexmaps/editor/?https://open-innovations.org/projects/hexmaps/maps/uk-wards-2024.hexjson) to display ward-based data and [a hexagon-based local authority layout](https://open-innovations.org/projects/hexmaps/editor/?https://open-innovations.org/projects/hexmaps/maps/uk-local-authority-districts-2023.hexjson) to display local-authority-based data.

<h2>Ward hex map</h2>
<section style="max-width: 900px;">
{{ comp.oi.map.hex_cartogram({
    config: {
        hexjson: hexes.bd_2024,
        data: wards.map((x, i, l) => ({ ...x, value: i + 1 })),
        matchKey: 'code',
        value: 'colour',
        label: 'short_code',
        tooltip: '{{ name }} ({{ short_code }})'
    }
}) }}
</section>
<h2>Local authority hex map</h2>
<section style="max-width: 900px;">
{{ comp.oi.map.hex_cartogram({
    config: {
        hexjson: hexes.uk_lads_2023,
        matchKey: 'code',
        value: 'colour',
        label: '{{ n | slice(0,3) }}',
        tooltip: '{{ n }}'
    }
}) }}
</section>