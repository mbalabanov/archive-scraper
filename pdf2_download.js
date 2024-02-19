import fs from "fs";
import path from "path";
import https from "https";
import {
  outputWelcomeMessage8,
  outputTerminatingMessage,
  outputSuccessMessage,
  appendFailedURL,
  createDirectoryIfNotExists,
  correctJsonFile,
} from "./utility.js";

/* *********************** */
/*  8. Download PDF files  */
/*  in Literature Category */
/* *********************** */

outputWelcomeMessage8();

const jsonFileWithPDFLinks = "./scrape/1_urls/d_pdf_urls/literature_pdf_files.json";
const downloadDirectory = "./scrape/2_pages/literature/pdf";
const failedPDFDownloadsLogPath =
  "./scrape/1_urls/d_pdf_urls/literature_pdf_files.json";

downloadPdf(jsonFileWithPDFLinks, downloadDirectory);

function downloadPdf(jsonFileWithPDFLinks, downloadDirectory) {
  fs.access(jsonFileWithPDFLinks, fs.F_OK, (err) => {
    if (err) {
      console.error(
        "ERROR: The file with the URLs does not exist. Please run pdf1_get_pdf_urls.js first and make sure that the generated JSON file is in the directory scrape/1_urls/d_pdf_urls/."
      );
      outputTerminatingMessage();
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(jsonFileWithPDFLinks));

    createDirectoryIfNotExists("./scrape/4_download_log");
    createDirectoryIfNotExists(downloadDirectory);

    let promises = data.map((entry) => {
      return new Promise((resolve, reject) => {
        const pdfLink = entry.pdfLink;

        const fileName = path.basename(pdfLink);

        https
          .get(pdfLink, (response) => {
            const fileStream = fs.createWriteStream(
              `${downloadDirectory}/${fileName}`
            );
            response.pipe(fileStream);
            fileStream.on("finish", () => {
              fileStream.close();
              resolve(fileName);
            });
            console.log("Downloaded: ", pdfLink);
          })
          .on("error", (error) => {
            console.error(`\n*** Error downloading ${pdfLink}:`, error.message);
            appendFailedURL(
              JSON.stringify({ pdfLink }),
              failedPDFDownloadsLogPath
            );
            reject(error);
          });
      });
    });

    Promise.all(promises)
      .then(() => {
        console.log("All downloads are completed successfully.");
      })
      .catch((error) => {
        console.error(
          "A download has failed and is now saved to the logs file.",
          error
        );
      })
      .finally(() => {
        outputSuccessMessage();
        if (fs.existsSync(failedPDFDownloadsLogPath)) {
          correctJsonFile(failedPDFDownloadsLogPath);
        }
      });
  });
}
