export function healthcheck({ status }) {
    const detail = status.map(x => ({...x, healthy: !x.outdated }))
    const healthy = detail.reduce((a, c) => a && c.healthy, true);

    return { healthy, detail };
}