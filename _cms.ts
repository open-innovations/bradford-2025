import lumeCMS from "lume/cms/mod.ts";
import dashboardFields from "./cmsConfig.ts";

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
    name: "2025 dashboard",
    store: "src:insights/dashboard/_data/metrics/*.yml",
    fields: dashboardFields,
    documentName: "{title}.yml",
    // create: false,
    delete: false,
})

cms.collection({
    name: "Janunary to March 2025 dashboard",
    store: "src:insights/dashboard/q1/_data/metrics/*.yml",
    fields: dashboardFields,
    documentName: "{title}.yml",
    // create: false,
    delete: false,
})

cms.collection({
    name: "April to June 2025 dashboard",
    store: "src:insights/dashboard/q1/_data/metrics/*.yml",
    fields: dashboardFields,
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