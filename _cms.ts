import lumeCMS from "lume/cms/mod.ts";
import { dashboardConfig }  from "./cmsConfig.ts";
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

for (const { id, name, description } of [
    {
        id: null,
        name: "Bradford 2025 dashboard",
        description: "Main dashboard covering the cumulative programme, 2023 to date"
    },
    {
        id: 'q1',
        name: "January to March 2025 dashboard",
        description: "Dashboard of measurement for the first quarter of 2025",
    },
    {
        id: 'q2',
        name: "April to June 2025 dashboard",
        description: "Dashboard of measurement for the first quarter of 2025",
    },
]) {
    cms.collection({
        name,
        description,
        store: [src, 'insights/dashboard', id, '_data/metrics/*.yml'].filter(x => x).join('/'),
        ...dashboardConfig,
    });    
}

cms.collection({
    name: "Glossary",
    description: "Definition of terms used in Bradford 2025 evaluation",
    store: src + "/glossary/term/*.md",
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