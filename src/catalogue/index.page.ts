export const tags = ['dataset'];
export const layout = 'templates/dataset.vto';

const capitalise = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

export default function *({ metadata, url: baseUrl, search }) {
    for (const item of metadata) {
        const { theme, name, schema } = item;
        const key = `${theme}/${name}`;
        const url = `${baseUrl}${key}/`;
        const title = [theme, name].map(capitalise).map(s => `<span>${s}</span>`).join('::');

        yield {
            url,
            theme,
            name,
            key,
            title,
            schema,
            draft: true,
        }
    }
}