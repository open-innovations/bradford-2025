import { expandGlob, WalkEntry } from "jsr:@std/fs@1.0.5";
import { parse } from "jsr:@std/csv@1.0.3";

type DataPublisherOptions = {
  publishedRoot: string;
  metadataRoot: string;
  exclude: string[];
  sitePublishedDataRoot?: string;
};

export default async function plugin(options: DataPublisherOptions) {
  // Get published datasets
  const publishedFiles = (await Array.fromAsync(
    expandGlob(
      "**/*.csv",
      {
        root: options.publishedRoot,
        exclude: options.exclude,
        includeDirs: false,
      },
    ),
  )).map((f: WalkEntry) => f.path);

  const metadataFiles = (await Array.fromAsync(
    expandGlob(
      "**/*.meta.csv",
      {
        root: options.metadataRoot,
        exclude: options.exclude,
        includeDirs: false,
      },
    ),
  )).map((f: WalkEntry) => f.path);

  const decoder = new TextDecoder("utf-8");

  const metadata = await Promise.all(
    metadataFiles
      .map(async (source: string) => {
        const data = await Deno.readFile(source);
        const [theme, name] = source.replace(options.metadataRoot, "").replace(
          /\.meta\.csv$/,
          "",
        ).split("/");
        return {
          name,
          theme,
          schema: parse(decoder.decode(data), { skipFirstRow: true }),
        };
      }),
  );

  const sitePublishedData = `${
    options.sitePublishedDataRoot || "data"
  }/published/`;
  const siteCataloguePath = "/catalogue";

  return (site) => {
    // Iterate over the published files
    for (const source of publishedFiles) {
      const target = source.replace(options.publishedRoot, sitePublishedData);
      console.log({ target, source });
      site.remoteFile(target, source);
    }
    // Copy the site data to the result
    site.copy(sitePublishedData);

    // Set up the shared data
    site.data("metadata", metadata, siteCataloguePath);
  };
}
