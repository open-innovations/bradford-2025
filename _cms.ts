import lumeCMS from "lume/cms/mod.ts";
import dashboardFields from "./cmsConfig.ts";
import GitHub from "lume/cms/storage/github.ts";
import { Octokit } from "npm:octokit@4.1.3";
import { createAppAuth } from "npm:@octokit/auth-app@7.2.1";

// Get environment variables
const username = Deno.env.get("USERNAME")!;
const password = Deno.env.get("PASSWORD")!;
const store = Deno.env.get("STORE") || "github";

// Get the storage type
const src = (store=='github')?"gh:src":"src:";

// Set options based on storage type
const opts = (store=='github')?{
    auth: {
        method: "basic",
        users: {
            [username]: password,
          },
    },
}:{};

// Define the CMS
const cms = lumeCMS(opts);

// Set the storage configurations based on storage type
if (store == 'github') {
    const githubAuthDetails = {
        appId: Deno.env.get("GITHUB_APP_ID")!,
        installationId: Deno.env.get("GITHUB_INSTALLATION_ID")!,
        privateKey: Deno.env.get("GITHUB_PRIVATE_KEY")!,
    };
    // Configure the CMS to use GitHub as the storage method
    cms.storage(
        "gh",
        new GitHub({
            client: new Octokit({
                authStrategy: createAppAuth,
                auth: githubAuthDetails
            }),
        owner: "open-innovations",
        repo: "bradford-2025",
        }),
    );
}

// Configuration here

cms.upload("assets", src + "/assets/");

// cms.collection({
//     name: "blocks",
//     description: "Content blocks referenced in the site",
//     store: src + "_includes/cms/block/*.md",
//     fields: [
//         { name: "reference", type: "text", view: "admin" },
//         { name: "content", type: "markdown" },
//     ],
//     nameField: "reference"
// });

cms.collection({
    name: "2025 dashboard",
    store: src + "insights/dashboard/_data/metrics/*.yml",
    fields: dashboardFields,
    documentName: "{title}.yml",
    // create: false,
    delete: false,
});

cms.collection({
    name: "January to March 2025 dashboard",
    store: src + "insights/dashboard/q1/_data/metrics/*.yml",
    fields: dashboardFields,
    documentName: "{title}.yml",
    // create: false,
    delete: false,
});

cms.collection({
    name: "April to June 2025 dashboard",
    store: src + "insights/dashboard/q2/_data/metrics/*.yml",
    fields: dashboardFields,
    documentName: "{title}.yml",
    // create: false,
    delete: false,
});

cms.collection({
    name: "Glossary",
    store: src + "glossary/term/*.md",
    fields: [ 
        { name: "title", type: "text", attributes: { required: true } },
        { name: "description", type: "markdown" },
        { name: "content", type: "markdown" },
    ],
    documentName: "{title}.md",
    // create: false,
    delete: false,
});

export default cms;