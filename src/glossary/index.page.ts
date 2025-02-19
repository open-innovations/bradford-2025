export const layout = 'templates/glossary/index.vto'

export const title = 'Glossary';
export const description = `
    This site might refer to terms which are not in common use, or which have a
    very specific meaning.
    The glossary collects these terms into a single location
`;

export default function*({ search, paginate }) {
    const terms = search.pages('glossary term', 'title');

    yield {
        results: terms,
    }

    const options = {
        url: (n) => `/glossary/index/${n}/`,
        size: 10,
    };
    
    for (const page of paginate(terms, options)) {
        yield page;
    }
}