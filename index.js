import { LokaliseApi } from "@lokalise/node-api";
import fs from "fs";
import fetch from "node-fetch";
import StreamZip from "node-stream-zip";
import * as dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.LOKALISE_API_KEY;
const PROJECT_ID = process.env.LOKALISE_PROJECT_ID;
const LOCALES_FOLDER = "./static/locales/";
const ZIP_PATH = `${LOCALES_FOLDER}translation-files.zip`;

const downloadOptions = {
  all_platforms: false,
  exclude_tags: ["how_it_works"], // Not downloading these keys saves about 20kb per language
  export_sort: "a_z",
  filter_langs: ["en", "es", "pt", "it", "fr", "de", "es_MX"],
  format: "xml",
  json_unescaped_slashes: true,
  language_mapping: [
    {
      original_language_iso: "es_MX",
      custom_language_iso: "es-MX",
    },
  ],
  replace_breaks: false,
  original_filenames: false,
  bundle_structure: "values-%LANG_ISO%/strings.%FORMAT%",
  indentation: "2sp",
};

const getLokaliseKeys = async () => {
  console.log("[Lokalise] Signing in to the Lokalise API...");
  const lokaliseApi = new LokaliseApi({ apiKey: API_KEY });

  console.log("[Lokalise] Getting files URL...");
  const { bundle_url: url } = await lokaliseApi
    .files()
    .download(PROJECT_ID, downloadOptions);

  console.log("[Lokalise] Downloading the zip...");
  const res = await fetch(url);
  const dest = fs.createWriteStream(ZIP_PATH);
  const stream = res.body.pipe(dest);

  const returnPromise = new Promise((resolve, reject) => {
    stream.on("finish", () => {
      console.log("[Lokalise] Listing entries...");
      const zip = new StreamZip({ file: ZIP_PATH, storeEntries: true });

      zip.on("error", (err) => {
        console.error("[ERROR]", err);
        reject(err);
      });

      zip.on("ready", () => {
        console.log("[Lokalise] Unzipping...");

        Object.values(zip.entries()).forEach((val) => {
          const desc = val.isDirectory ? "directory" : `${val.size} bytes`;
          console.log(`Entry ${val.name}: ${desc}`);
        });

        zip.extract(null, LOCALES_FOLDER, (err, count) => {
          if (err) {
            console.log("[Lokalise] Extract error");
            reject(err);
          }
          zip.close();
          console.log(`[Lokalise] Extracted ${count} entries`);
          resolve();
        });
      });
    });
  });

  return returnPromise;
};

getLokaliseKeys()
  .then(() => {
    console.log("[Lokalise] Completed update");
  })
  .catch((err) => {
    console.error("[Lokalise]", err);
    process.exit(1);
  });
