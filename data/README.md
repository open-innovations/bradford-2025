The whole upstream data directory is mirrored with the following command

```sh
dvc import -o data/ git@github.com:bradford-2025/open-data-pipelines data/processed/
```

To fetch the currently defined version of the data, run the following

```sh
dvc fetch data/processed.dvc 
```

To update the version to the latest available on the remote repository, run the command

```sh
dvc update data/processed.dvc 
```

