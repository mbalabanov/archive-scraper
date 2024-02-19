import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import {
  outputSuccessMessage,
  paths,
  outputWelcomeMessage7,
  correctJsonFile,
} from "./utility.js";

/* ************************** */
/*  7. Get URLs of PDF files  */
/*   in Literature Category   */
/* ************************** */
outputWelcomeMessage7();
getFiles("literature");

async function getPDFPathsFromHTML(htmlFilePath) {
  const today = new Date();
  
  console.log(
    "\n" +
      today.getHours() +
      ":" +
      today.getMinutes() +
      ":" +
      today.getSeconds() +
      " - " +
      htmlFilePath
  );

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const content = await fs.promises.readFile("./" + htmlFilePath, "utf8");
  await page.setContent(content);

  // Find links to PDF files
  const pdfLink = await page.$$eval('a[href$=".pdf"]', (links) =>
    links.map((link) => link.href)
  );

  await browser.close();

  if (pdfLink.length > 0 && pdfLink[0] === pdfLink[1]) {
    return { pdfLink: pdfLink[0] };
  }

  return { pdfLink };
}

async function writeLargeImagePathsToJSON(arrayOfImagePaths, jsonFilePath) {
  const saveData = JSON.stringify(arrayOfImagePaths);

  try {
    await fs.promises.appendFile(jsonFilePath, saveData + ",");
    console.log("Data appended successfully.\n\n");
  } catch (err) {
    console.error("Failed to append to the file:", err);
  }
}

async function getFiles(type) {
  const folderPath = paths[type].directory_path;
  const fileJsonPath = `./scrape/1_urls/d_pdf_urls/literature_pdf_files.json`;

  const files = await fs.promises.readdir(folderPath);
  const htmlFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === ".html"
  );

  await fs.promises.writeFile(fileJsonPath, "");

  for (let [index, file] of htmlFiles.entries()) {
    const absoluteFilePath = path.join(folderPath, file);
    const pdfPaths = await getPDFPathsFromHTML(absoluteFilePath);

    if (pdfPaths.pdfLink.length > 0) {
      console.log(
        `${index + 1} of ${htmlFiles.length}. PDF paths in ${file}:`,
        pdfPaths
      );

      await writeLargeImagePathsToJSON(pdfPaths, fileJsonPath);
    }
  }
  if (fs.existsSync(fileJsonPath)) {
    correctJsonFile(fileJsonPath);
  }

  outputSuccessMessage();
}
