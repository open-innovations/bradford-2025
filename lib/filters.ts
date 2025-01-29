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

export default function (site) {
    site.filter('wafflify', wafflify);
    return site;
}