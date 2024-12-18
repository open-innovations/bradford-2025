import lumeCMS from "lume/cms/mod.ts";

const cms = lumeCMS();

// Configuration here

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