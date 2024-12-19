# GitHub CLI api
# https://cli.github.com/manual/gh_api


# GitHub CLI api
# https://cli.github.com/manual/gh_api

OWNER=open-innovations
REPO=bradford-2025
WORKFLOW=deploy-dev.yml

list() {
    gh api \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    /repos/${OWNER}/${REPO}/actions/workflows
}

# GitHub CLI api
# https://cli.github.com/manual/gh_api

run() {
    gh api \
    --method POST \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    /repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches \
    -f "ref=dev"
        # -f "inputs[name]=Mona the Octocat" -f "inputs[home]=San Francisco, CA"
}

$*