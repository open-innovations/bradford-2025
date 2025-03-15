# Bradford 2025 data dashboard

_TL;DR:_ This site depends on data which is not checked in to git.
Assuming you have a working `deno` and `pipenv` environment, the task `deno task daily` will prepare the site for build.
For running the local version you probably want `deno task dev`.

## Pre-requisites

1. Ensure that you can run `ssh git@github.com` successfully. If not, follow
   instructions to
   [Add a new SSH key to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account).
2. Install Deno, Python and Pipenv for your platform
3. Run `pipenv install`

## Minimal build steps

Prepare the build using this - probably once a day.

1. Run `git pull --rebase`
2. Run `pipenv shell`
3. RUn `deno task data:pull`
4. Run `deno task data:pipeline`

The dev site is built from the `main` branch, but generates all pages with
`draft: true` set. To build and serve the dev site, run

```sh
deno task dev
```

## Troubleshooting build

Make sure you've installed all the required libraries

```
pipenv sync
```
