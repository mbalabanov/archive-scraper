import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import https from "https";

import {
  outputTerminatingMessage,
  returnAllTypes,
  types,
  getFilenameFromUrl,
  outputWelcomeMessage3,
  outputUsageMessage3,
  outputSuccessMessage,
  paths,
} from "./utility.js";

/* ******************* */
/*   3. Crawl CONTENT  */
/* ******************* */

outputWelcomeMessage3();

if (process.argv[2] != undefined) {
  const crawlPath = paths[process.argv[2]]["url_json_path"];

  terminateForInvalidateType(process.argv[2]);
  terminateForInvalidFilePath(crawlPath);

  saveFullPage(process.argv[2], crawlPath);
} else {
  outputUsageMessage3();
  process.exit(1);
}

async function saveFullPage(type, readFromUrlsFile) {
  console.log(readFromUrlsFile);
  console.log(type);

  ensureFolderExists(`./scrape/2_pages/${type}`);

  let rawdata = fs.readFileSync(readFromUrlsFile);
  let indexUrls = JSON.parse(rawdata);

  for (let [index, element] of indexUrls.entries()) {
    const thisPage = await getHTML(element.urlContents, type);
    let filename = getFilenameFromUrl(element.urlContents);

    if (type === "events") {
      filename =
        filename
          .replace("exhibition-detail.html?tx_vafe_pi1%5Bexh%5D=", "")
          .replace("&cHash=", "") + ".html";
    }

    if (type === "literature") {
      filename =
        filename
          .replace("literature-detail.html?tx_vafe_pi1%5Blit%5D=", "")
          .replace("&cHash=", "") + ".html";
    }

    if (type === "institutions") {
      filename =
        filename
          .replace("institution-detail.html?tx_vafe_pi1%5Binst%5D=", "")
          .replace("&cHash=", "") + ".html";
    }

    fs.writeFile(
      `./scrape/2_pages/${type}/${filename}`,
      thisPage,
      function (err) {
        if (err) throw err;
      }
    );

    console.log(`Saved ${index + 1} of ${indexUrls.length} pages`);
  }

  outputSuccessMessage();
}

async function getHTML(url, type) {
  const today = new Date();
  console.log(
    "\n" +
      url +
      "\n" +
      today.getHours() +
      ":" +
      today.getMinutes() +
      ":" +
      today.getSeconds()
  );

  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  const content = await page.content();
  const className = types[type]["divName"];
  const imageUrls = await page.$$eval(`.${className} img`, (images) =>
    images.map((img) => img.src)
  );

  console.log("imageUrls:");
  console.log(imageUrls);
  await saveImage(imageUrls, `./scrape/2_pages/${type}/images`);
  await browser.close();

  return content;
}

async function saveImage(urls, imageFolderName) {
  for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
    const imageUrl = urls[urlIndex];

    const filename = getFilenameFromUrl(imageUrl);
    const file = await fs.createWriteStream(`${imageFolderName}/${filename}`);
    https.get(imageUrl, (response) => {
      response.pipe(file);
    });
    file.on("finish", function () {
      file.close();
    });
  }
}

// Validators
function terminateForInvalidFilePath(filePath) {
  if (fs.existsSync(filePath)) {
    console.log("The file with the list of URLs exists.");
  } else {
    console.log(
      "ERROR: The file with the URLs does not exist. Please try again with a valid file path."
    );
    outputTerminatingMessage();
    process.exit(1);
  }
}

function terminateForInvalidateType(type) {
  if (types.hasOwnProperty(type)) {
    console.log("You entered the valid type: " + type);
  } else {
    console.log(
      "ERROR: " +
        type +
        " is an invalid type. Please try again with one of the following types: "
    );
    console.log(returnAllTypes());
    outputTerminatingMessage();
    process.exit(1);
  }
}

function ensureFolderExists(folderName) {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName, { recursive: true });
    const imagesFolder = path.join(folderName, "images");
    fs.mkdirSync(imagesFolder);
    console.log(
      `Directory '${folderName}' and subdirectory '${folderName}' created.`
    );
  } else {
    console.log(`Directory '${folderName}' already exists.`);
  }
}
