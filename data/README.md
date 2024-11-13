The whole upstream data directory is mirrored with the following commands

```sh
dvc import --out data/published/ --rev main git@github.com:bradford-2025/open-data-pipelines data/processed/

dvc import --out data/metadata/ --rev main git@github.com:bradford-2025/open-data-pipelines data/metadata/processed/
```

To fetch the currently defined version of the data, run the following

```sh
dvc pull data/published.dvc data/metadata.dvc
```

To update the version to the latest available on the remote repository, run the command

```sh
dvc update data/published.dvc data/metadata.dvc
```

