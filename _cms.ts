import lumeCMS from "lume/cms/mod.ts";

const cms = lumeCMS();

// Configuration here

// cms.collection({
//     name: "pages",
//     description: "Individual pages managed via CMS",
//     store: "src:pages/*.md",
//     fields: [
//         { name: "title", type: "text", attributes: { required: true } },
//         { name: "description", type: "markdown" },
//         { name: "draft", type: "checkbox" },
//         { name: "url", label: "URL", type: "text" },
//         { name: "content", type: "markdown" },
//     ],
//     nameField: "title"
// });

cms.upload("assets", "src:assets/");

// cms.collection({
//     name: "blocks",
//     description: "Content blocks referenced in the site",
//     store: "src:_includes/cms/block/*.md",
//     fields: [
//         { name: "reference", type: "text", view: "admin" },
//         { name: "content", type: "markdown" },
//     ],
//     nameField: "reference"
// });

cms.collection({
    name: "Dashboard metrics",
    store: "src:insights/dashboard/_data/metrics/*.yml",
    fields: [ 
        { name: "title", type: "text", attributes: { required: true }, description: 'The title of the dashboard panel' },
        { name: "description", description: "This will be displayed as narrative on the site", type: "markdown", upload: false },
        { name: "flash", type: "text", description: 'The text displayed in the the ribbon across the top-right of the panel' },
        { name: "upTo", type: "date", description: 'The date shown on the dashboard panel' },
        { name: "notes", description: "Internal notes, not for public display", type: "markdown", upload: false },
    ],
    documentName: "{title}.yml",
    // create: false,
    delete: false,
})

cms.collection({
    name: "Glossary",
    store: "src:glossary/term/*.md",
    fields: [ 
        { name: "title", type: "text", attributes: { required: true } },
        { name: "description", type: "markdown" },
        { name: "content", type: "markdown" },
    ],
    documentName: "{title}.md",
    // create: false,
    delete: false,
})

export default cms;