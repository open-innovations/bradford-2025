# Contributing to this site

The site is being developed for Bradford 2025 by Open Innovations, and this
guide is primarily aimed at OI developers working on adding or updating new
features.

## General principles

### Check in as little data as possible

Source data should not be checked in to this repository, if at all possible. The
primary source of the data is a private GitHub repository in the Bradford 2025
organisation. This is currently only visible to approved users, as there is a
possibility of sensitive data being leaked during development. This risk extends
to data imported into this repository, hence the principle.

During development of the visualisation, we should also not check in derived
data, as prior to formal publication approval, data may be redacted. This would
mean that we'd need to remove history, and it's easier not to check in in first
place.

## Procedures

### Python environment

Python dependencies are documented in a `pipenv` `Pipfile`. To set up an
environment, first ensure that `pipenv` is installed on your development
machine. Once this is done, you can run the `pipenv install` to set up the
environment. Periodically, particularly if others have added new dependencies,
you should run `pipenv sync` to keep your environment up to spec. To start a
shell in the environment, run `pipenv shell`.

### Setting up GitHub SSH authentication

The data provisioning requires you to have a working GitHub SSH configuration,
and to be added to the relevant Bradford 2025 organisation.

To add SSH keys, follow the guidance at
[Adding a new SSH key to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
on the GitHub documentation. Note that if you're using Windows, and develop in
WSL, you will need to set up the key to be accessible in that subsystem rather
than the main Windows host.

It might also be helpful to set up an
[SSH config file](https://linuxize.com/post/using-the-ssh-config-file/) which
associates the key with GitHub. A simple `config` file to achieve this would
look like this:

```
Host github.com
    IdentityFile _Path_To_SSH_Private_Key_
```

### Data provisioning

Data is provisioned using DVC commands. The source data has been imported from
the Bradford 2025 data pipelines repository using two `dvc import` commands. It
should not be necessary to add further imports, as each of the current ones will
mirror the entire tree to `data/published` and `data/metadata`.

This stores two `.dvc` files in the `data` directory, each containing a
reference to a specific commit in the data repository.

To get the currently referenced data, you can run a `dvc pull` command. This
will not get the latest data from the remote repository, but will fetch the data
contained in the commit (md5 hash) referenced in the `.dvc` file.

```sh
dvc pull -R data/
```

If you wish to update to the latest available data, you can run `dvc update`.
This will also update the `.dvc` files with the latest available commit
consistent with the `rev` (i.e. branch name) specified in that file (or the
default branch if that's not specified).

```sh
dvc update -R data/
```

These commands will need to be run in an environment where dvc is available. The
easiest way to do this is to start a `pipenv shell`.

These commands have been encapsulated as Deno tasks in `deno.json`, and can be
run as follows:

Get the currently referenced data.

```
deno task data:pull
```

Update to the latest available data.

```
deno task data:update
```

### Running pipelines

Once the data is downloaded, you'll need to run some pipelines to update the
data used for visualisations. Again, this is managed via `dvc`.

```
dvc repro pipelines/dvc.yaml
```

This will run any pipelines that have changed dependencies (data).

This is also encapsualed in the `deno task data:pipeline` task.

### Git branch usage

Development should be performed against the `dev` branch, and only merged into
`main` when it has been confirmed.

It may be helpful for new visualisations to work on on a separate branch, named
something like `feature/<theme>` (e.g `feature/volunteers`), particularly if
there are other people working on the code. These should be merged back into
`dev` once ready for review with the client.

### Developing new features

Care needs to be taken when building new pages to protect against data leakage.
Working against the `dev` branch will mean that the published site does not
include data before it's been approved. The following guidelines will help
ensure that no leakage takes place.

1. Any new pages should include the `draft: true` data either in frontmatter or
   in a `_data.*` file. This will prevent the page being generated unless the
   `LUME_DRAFTS=true` environment variable is set. Running `deno task dev` will
   set this environment variable.
2. Until such time as the data release is approved, no data derived from the
   source data (via pipelines) should be published. The easy way to do this is
   to create a `.gitignore` file in the same folder as the page with the a
   general exclusion of `/_data/*`. Exceptions can be added if needed. Once the
   data is approved for publication, this file can be removed.


## DVC Remote access

Remote files are loaded from git repos as follows:

```sh
dvc import -o TARGET_PATH git@github.com:GIT_ORG/GIT_REPO REPO_PATH
```

> _e.g._ to import data from the `data` directory of the **bradford-2025**
> repo **my-repo** into the `data/my-data` directory, run the following command
>
> ```sh
> dvc import -o data/my-data git@github.com:bradford-2025/huq-data data 
> ```

If the repo is private, you will need to have permission to access this data
via your GitHub account, or will need to provide a deploy key for the repository.