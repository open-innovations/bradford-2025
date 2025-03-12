const wafflify = (sourceData, key = 'key', value = 'value', options = {}) => {
    const {
        minValue,
        seriesConfig,
    } = {
        minValue: 1.0,
        seriesConfig: {},
        ...options,
    };

    const total = sourceData.reduce((a, c) => a + c[value], 0);
    const data = [sourceData.reduce((a, c) => ({
        ...a,
        [c[key]]: +(100 * c[value] / total).toLocaleString(undefined, {
            maximumFractionDigits: 3,
            roundingMode: "halfEven",
        })
    }), {})];

    const series = sourceData
        .sort((a, b) => b[value] - a[value])
        .filter(x => data[0][x[key]] >= minValue)
        .map(x => ({ ...seriesConfig[x[key]], value: x[key] }));

    return { data, series }
};

export const capitalise = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

export const listify = (l: string[], classes = "") => l.map(e => `<li class="${ classes }">${ e }</li>`).join('');

export default function (site) {
    site.filter('wafflify', wafflify);
    site.filter('capitalise', capitalise);
    site.filter('listify', listify);
    return site;
}

