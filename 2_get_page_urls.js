import puppeteer from "puppeteer";
import fs from "fs";
import {
  outputUsageMessage2,
  outputSuccessMessage,
  outputWelcomeMessage2,
} from "./utility.js";

/* ******************* */
/*   2. Get PAGE URLs  */
/* ******************* */

const filePath = "./scrape/1_urls/a_category_index/all_search_indexes.json";

outputWelcomeMessage2();
scrapeUrlsBasedOnList(filePath);

async function scrapeUrlsBasedOnList(readFromUrlsFile) {
  try {
    if (!fs.existsSync(readFromUrlsFile)) {
      outputUsageMessage2();
      outputTerminatingMessage();
      process.exit(1);
    }

    let rawdata = fs.readFileSync(readFromUrlsFile);
    let jsonArray = JSON.parse(rawdata);

    for (let obj of jsonArray) {
      for (let key in obj) {
        const thisFilePath = `./scrape/1_urls/b_page_urls/${key}_urls.json`;

        let pageIndex = 0;
        for (let element of obj[key]) {
          await getUrls(element.searchPageUrl, thisFilePath);
          pageIndex++;
          console.log(
            key.toUpperCase() +
              ": Search page " +
              pageIndex +
              " of " +
              obj[key].length +
              " (" +
              key +
              "_urls.json)"
          );
        }
      }
    }
  } catch (err) {
    console.error("Error in scrapeUrlsBasedOnList: ", err);
  } finally {
    outputSuccessMessage();
  }
}

async function getUrls(urlElement, saveToUrlsFile) {
  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();

    await page.goto(urlElement, {
      waitUntil: "networkidle0",
    });

    const pageUrls = await page.evaluate(() => {
      const urlList = document.querySelectorAll(".ke_search_item");

      return Array.from(urlList).map((url) => {
        const urlContents = url.querySelector("a").href;
        return { urlContents };
      });
    });

    let existingUrls = [];
    if (fs.existsSync(saveToUrlsFile)) {
      existingUrls = JSON.parse(fs.readFileSync(saveToUrlsFile));
    }

    const saveData = JSON.stringify([...existingUrls, ...pageUrls]);
    fs.writeFileSync(saveToUrlsFile, saveData);
  } catch (err) {
    console.error("Error in getUrls: ", err);
  } finally {
    await browser.close();
  }
}
