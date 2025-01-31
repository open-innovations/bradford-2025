import lumeCMS from "lume/cms/mod.ts";

const cms = lumeCMS();

// Configuration here

cms.collection({
    name: "pages",
    description: "Individual pages managed via CMS",
    store: "src:pages/*.md",
    fields: [
        { name: "title", type: "text", attributes: { required: true } },
        { name: "description", type: "markdown" },
        { name: "draft", type: "checkbox" },
        { name: "url", label: "URL", type: "text" },
        { name: "content", type: "markdown" },
    ],
    nameField: "title"
});

cms.upload("assets", "src:assets/");

cms.collection({
    name: "blocks",
    description: "Content blocks referenced in the site",
    store: "src:_includes/cms/block/*.md",
    fields: [
        { name: "reference", type: "text", view: "admin" },
        { name: "content", type: "markdown" },
    ],
    nameField: "reference"
});

export default cms;