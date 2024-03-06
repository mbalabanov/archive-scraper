import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import {
  outputSuccessMessage,
  paths,
  outputWelcomeMessage5,
  cleanUpJsonFile,
} from "./utility.js";

/* ***************************** */
/*  5. Get URLs of large images  */
/*       in Works Category       */
/* ***************************** */
outputWelcomeMessage5();
getFiles("works");

const today = new Date();

function parseImageUrl(originalImageUrl) {
  const parts = originalImageUrl.split("csm_");
  const adaptedImageUrl =
    "https://digitalartarchive.at/fileadmin/user_upload/Virtualart/Images/wizard/" +
    parts[1].replace(/_[^_]*\./, ".");
  return { originalImageUrl, adaptedImageUrl };
}

async function getLargeImagePathsFromHTML(htmlFilePath) {
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

  const imagePaths = await page.$$eval("img", (images) =>
    images.map((img) => img.src).filter((src) => src.includes("csm_"))
  );

  await browser.close();
  return imagePaths;
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
  const fileJsonPath = `./scrape/1_urls/c_image_urls/works_large_images.json`;

  const files = await fs.promises.readdir(folderPath);
  const htmlFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === ".html"
  );

  await fs.promises.writeFile(fileJsonPath, "");

  for (let [index, file] of htmlFiles.entries()) {
    const absoluteFilePath = path.join(folderPath, file);
    const imagePaths = await getLargeImagePathsFromHTML(absoluteFilePath);

    let parsedImagePaths = [];
    for (let imagePath of imagePaths) {
      parsedImagePaths.push(parseImageUrl(imagePath));
    }

    console.log(
      `${index + 1} of ${htmlFiles.length}. Image paths in ${file}:`,
      parsedImagePaths
    );

    await writeLargeImagePathsToJSON(parsedImagePaths, fileJsonPath);
  }

  cleanUpJsonFile(fileJsonPath);
  outputSuccessMessage();
}
