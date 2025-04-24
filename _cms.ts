import lumeCMS from "lume/cms/mod.ts";
import dashboardFields from "./cmsConfig.ts";
import GitHub from "lume/cms/storage/github.ts";
import { Octokit } from "npm:octokit@4.1.3";
import { createAppAuth } from "npm:@octokit/auth-app@7.2.1";

// Load users from environment variables prefixed with CMS_USER_
const username = Deno.env.get("USERNAME")!;
const password = Deno.env.get("PASSWORD")!;

const githubAuthDetails = {
    appId: Deno.env.get("GITHUB_APP_ID")!,
    installationId: Deno.env.get("GITHUB_INSTALLATION_ID")!,
    privateKey: Deno.env.get("GITHUB_PRIVATE_KEY")!,
}

const cms = lumeCMS({
    auth: {
        method: "basic",
        users: {
            [username]: password,
          },
    },
});

// Configuration here

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

cms.upload("assets", "gh:src/assets/");

// cms.collection({
//     name: "blocks",
//     description: "Content blocks referenced in the site",
//     store: "gh:src/_includes/cms/block/*.md",
//     fields: [
//         { name: "reference", type: "text", view: "admin" },
//         { name: "content", type: "markdown" },
//     ],
//     nameField: "reference"
// });

cms.collection({
    name: "2025 dashboard",
    store: "gh:src/insights/dashboard/_data/metrics/*.yml",
    fields: dashboardFields,
    documentName: "{title}.yml",
    // create: false,
    delete: false,
});

cms.collection({
    name: "January to March 2025 dashboard",
    store: "gh:src/insights/dashboard/q1/_data/metrics/*.yml",
    fields: dashboardFields,
    documentName: "{title}.yml",
    // create: false,
    delete: false,
});

cms.collection({
    name: "April to June 2025 dashboard",
    store: "gh:src/insights/dashboard/q1/_data/metrics/*.yml",
    fields: dashboardFields,
    documentName: "{title}.yml",
    // create: false,
    delete: false,
});

cms.collection({
    name: "Glossary",
    store: "gh:src/glossary/term/*.md",
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