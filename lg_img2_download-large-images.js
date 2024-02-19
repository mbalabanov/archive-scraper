import fs from "fs";
import path from "path";
import https from "https";
import {
  outputWelcomeMessage6,
  outputTerminatingMessage,
  outputSuccessMessage,
  correctJsonFile,
  appendFailedURL,
  createDirectoryIfNotExists,
} from "./utility.js";

/* ***************************** */
/*  6. Download large images in  */
/*         Works Category        */
/* ***************************** */

outputWelcomeMessage6();

let filePath = "./scrape/1_urls/c_image_urls/works_large_images.json";
let failedDownloadsLogPath =
  "./scrape/4_download_log/works_lg_images_failed.json";

downloadLargeImages();

function downloadLargeImages() {
  if (process.argv[2] === "failed") {
    console.log("\nAttempting to download previously failed image URLs.\n");

    const timestamp = new Date().getTime().toString();
    const newPath = `./scrape/4_download_log/works_lg_images_failed_${timestamp}.json`;

    fs.rename(failedDownloadsLogPath, newPath, (err) => {
      if (err) {
        console.log("\nFailed to rename file!\n");
        throw err;
      }
      filePath = newPath;
    });
  }

  fs.access(filePath, fs.F_OK, (err) => {
    if (err) {
      console.error(
        "ERROR: The file with the URLs does not exist. Please run lg_img1_get_urls_of_large_images.js first and make sure that the generated JSON file is in the directory scrape/1_urls/c_image_urls/."
      );
      outputTerminatingMessage();
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath));

    createDirectoryIfNotExists("./scrape/4_download_log");
    createDirectoryIfNotExists("./scrape/2_pages/works/lg_images");

    let imageCount = 0;

    let promises = data.map((entry, index) => {
      return new Promise((resolve, reject) => {
        const adaptedImageUrl = entry.adaptedImageUrl;
        const originalImageUrl = entry.originalImageUrl;
        const fileName = path.basename(adaptedImageUrl);

        https
          .get(adaptedImageUrl, (response) => {
            const fileStream = fs.createWriteStream(
              `./scrape/2_pages/works/lg_images/${fileName}`
            );
            console.log(`./scrape/2_pages/works/lg_images/${fileName}`);
            console.log(`Image ${index} of ${data.length}\n`);
            response.pipe(fileStream);
            fileStream.on("finish", () => {
              fileStream.close();
              resolve(fileName);
            });
          })
          .on("error", (error) => {
            console.error(
              `\n*** Error downloading ${adaptedImageUrl}:`,
              error.message
            );
            appendFailedURL(
              JSON.stringify({ originalImageUrl, adaptedImageUrl }),
              failedDownloadsLogPath
            );
            reject(error);
          });
      });
    });

    Promise.all(promises)
      .then(() => {
        console.log(
          "All possible downloads are completed. Please note that file count can unreliable due to different download sizes.\nzPlease check failed log for any missing files"
        );
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        outputSuccessMessage();
        if (fs.existsSync(failedDownloadsLogPath)) {
          correctJsonFile(failedDownloadsLogPath);
        }
      });
  });
}
