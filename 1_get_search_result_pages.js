import puppeteer from "puppeteer";
import https from "https";

import {
  paths,
  outputTerminatingMessage,
  writeToFile,
  outputWelcomeMessage1,
  outputUsageMessage1,
} from "./utility.js";

/* *************************** */
/*  1. Get SEARCH RESULT URLs  */
/* *************************** */

outputWelcomeMessage1();
parseSearchPages();

async function parseSearchPages() {
  let allCategories = [];

  for (const [key, value] of Object.entries(paths)) {
    console.log(`${key}: ${value.search_page_url}`);

    terminateForInvalidUrl(value.search_page_url);

    const totalSearchResultPages = await getNumberOfSearchPages(
      value.search_page_url
    );

    console.log(
      `Total number of search result pages: ${totalSearchResultPages}\n`
    );

    const listOfSearchPageUrls = await generateListOfSearchResultPages(
      value.search_page_url,
      totalSearchResultPages
    );
    allCategories.push({ [key]: listOfSearchPageUrls });
  }

  const saveData = JSON.stringify(allCategories);
  writeToFile(
    `./scrape/1_urls/a_category_index/all_search_indexes.json`,
    saveData
  );
}

function terminateForInvalidUrl(url) {
  https.get(url, (response) => {
    if (response.statusCode == 404) {
      console.log(
        "ERROR: The URL does not exist. It might have been changed in the archive of digital art. Please check in the paths constant that the value of search_page_url in each cetagory has a  valid URL of a search results page."
      );
      outputTerminatingMessage();
      process.exit(1);
    }
  });
}

async function getNumberOfSearchPages(url) {
  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  // result_txt is the class of the div that shows the total number of search result pages
  const numberOfSearchPages = await page.$eval(
    ".result_txt",
    (div) => div.innerHTML
  );
  await browser.close();

  const numberOfSearchPagesArray = numberOfSearchPages.split("/ ");
  const numberOfSearchPagesString = numberOfSearchPagesArray[1];

  return numberOfSearchPagesString.slice(0, -1);
}

async function generateListOfSearchResultPages(url, totalSearchResultPages) {
  const splitLocation = "Bpage%5D=";

  const urlArray = url.split(splitLocation + "1");
  const searchResultPages = [];

  for (
    let currentPageNumber = 1;
    currentPageNumber <= totalSearchResultPages;
    currentPageNumber++
  ) {
    const searchPageUrl =
      urlArray[0] + splitLocation + currentPageNumber + urlArray[1];

    searchResultPages.push({ searchPageUrl });
  }

  return searchResultPages;
}
