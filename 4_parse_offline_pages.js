import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import {
  paths,
  readFile,
  correctJsonFile,
  getFilenameFromUrl,
  outputWelcomeMessage4,
  outputUsageMessage4,
  outputSuccessMessage,
  readDirectoryContents,
} from "./utility.js";

/* ******************************* */
/*  4. Parse saved HTML files and  */
/*      save CONTENTS to JSON      */
/* ******************************* */
outputWelcomeMessage4();

if (process.argv[2] != undefined) {
  triggerScrape(process.argv[2]);
} else {
  outputUsageMessage4();
  process.exit(1);
}

const typeData = {
  works: {
    description_title: "works_single_head h2",
    image_main: "work_image_main",
    image_main_add: "work_image_main_add",
    related_images: "work_image_selecter",
    image_caption: "work_caption",
    keywords: "work_keywords",
    information: "content_information",
    description: "content_desc",
    technology: "content_tec",
    literature: "content_news",
    exhibitions: "content_ex",
  },
  artists: {
    description_title: "feature_info",
    description: "feature_text",
    about: "content_about",
    biography: "content_bio",
    related_works: "artist_content_work",
    news: "content_news",
    exhibitions: "content_ex",
    references: "artist_single_ref_content",
  },
  events: {
    description_title: "lit_single_head h2",
    description: "lit_single_item",
    related_works: "content_news",
    related_persons: "content_ex",
  },
  literature: {
    description_title: "lit_single_head h2",
    description: "lit_single_item",
    related_works: "content_news",
    related_persons: "content_ex",
  },
  institutions: {
    description_title: "lit_single_head h2",
    description: "lit_single_head",
    about: "content_about",
    specialization: "content_bio",
    publications: "content_ex",
    news: "content_news",
    events: "content_about",
    technology: "content_news",
    related_works: "artist_content_work",
  },
  scholars: {
    description_title: "feature_info",
    description: "feature_text",
    about: "content_about",
    biography: "content_bio",
    news: "content_news",
    exhibitions: "content_ex",
    references: "artist_single_ref_content",
  },
};

const areasWithLinks = [
  "exhibitions",
  "information",
  "literature",
  "related_works",
  "references",
  "related_persons",
  "publications",
  "news",
  "events",
];

async function triggerScrape(parseType) {
  const allFiles = readDirectoryContents(paths[parseType].directory_path);
  const allHtmlFiles = allFiles.filter((file) => file.includes(".html"));
  for (let i = 0; i < allHtmlFiles.length; i++) {
    const scrapedContents = await getPageContent(
      paths[parseType].directory_path + allHtmlFiles[i],
      parseType
    );
    appendDataToJsonFile(scrapedContents, paths[parseType].page_json_path);

    console.log(`Scraped ${i + 1} of ${allHtmlFiles.length} pages.`);
  }

  correctJsonFile(paths[parseType].page_json_path);
  outputSuccessMessage();
}

async function getPageContent(htmlFilePath, type) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const content = readFile(htmlFilePath);
  await page.setContent(content);
  const pageName = getFilenameFromUrl(htmlFilePath);
  const contentsJson = await extractContentData(page, pageName, type);
  await browser.close();

  return contentsJson;
}

async function appendDataToJsonFile(jsondata, filePath) {
  const saveData = JSON.stringify(jsondata);
  try {
    await fs.promises.appendFile(filePath, saveData + ",");
    console.log("Data appended successfully.\n\n");
  } catch (err) {
    console.error("Failed to append to the file: " + err + "\n\n");
  }
}

async function extractContentData(page, pageName, type) {
  const pageData = {};

  pageData["category"] = type;
  pageData["page"] = pageName;

  for (let key in typeData[type]) {
    if (key === "keywords") {
      const searchForClass = "." + typeData[type][key];
      try {
        const keywordsContents = await page.$eval(
          searchForClass,
          (div) => div.innerText
        );
        pageData[key] = keywordsContents;
      } catch (error) {
        console.log(searchForClass + " not found on scraped page.");
      }
    } else if (key === "image_main") {
      const searchForClass = "." + typeData[type][key];
      try {
        let imageContent = await page.$eval(searchForClass, (img) => img.src);
        if (imageContent !== undefined) {
          imageContent = path.basename(imageContent);
          pageData[key] = imageContent;
        }
      } catch (error) {
        console.log(searchForClass + " not found on scraped page.");
      }
    } else if (key === "related_images") {
      const searchForClass = "." + typeData[type][key];
      try {
        let relatedImages = await page.$eval(
          searchForClass,
          (div) => div.outerHTML
        );
        if (
          relatedImages !== undefined &&
          relatedImages.includes("single_work_slides")
        ) {
          page.setContent(relatedImages);

          let imagePaths = await page.$eval(
            "." + typeData[type][key],
            (div) => div.outerHTML
          );

          pageData[key] = imagePaths;
        }
      } catch (error) {
        console.log(searchForClass + " not found on scraped page.");
      }
    } else {
      const searchForClass = "." + typeData[type][key];
      try {
        let pageContents = await page.$eval(
          searchForClass,
          (div) => div.innerText
        );
        pageData[key] = pageContents;
      } catch (error) {
        console.log(searchForClass + " not found on scraped page.");
      }
    }

    if (areasWithLinks.includes(key)) {
      const allLinks = await page.$$eval(
        "." + typeData[type][key] + " a",
        (anchors) => {
          if (anchors.length === 0) {
            return [];
          }
          return anchors
            .filter((anchor) => anchor.href !== "")
            .map((anchor) => {
              return {
                href: anchor.href,
                text: anchor.textContent.trim(),
              };
            });
        }
      );

      pageData[key + "_links"] = allLinks;
    }
  }

  return pageData;
}
