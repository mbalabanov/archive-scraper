import path from "path";
import fs from "fs";

function outputTerminatingMessage() {
  console.log("\n┌────────────────────────┐");
  console.log("│ Application TERMINATED │");
  console.log("└────────────────────────┘\n");
}

function outputSuccessMessage() {
  console.log("\n┌──────────────────────┐");
  console.log("│ Application finished │");
  console.log("└──────────────────────┘\n");
}

function outputWelcomeMessage1() {
  console.log("\n┌───────────────────────────────┐");
  console.log("│   1. Get SEARCH RESULT URLs   │");
  console.log("└───────────────────────────────┘\n");
  console.log("Crawl ADA for the Search Results Pages of Each Category");
  console.log(
    "At present it is adapted to crawl the Archive of Digital Art (ADA) at digitalartarchive.at\n\n"
  );
}

function outputUsageMessage1() {
  console.log(
    "Please enter the URL of the first page of the search results, and the name of the output file to save the URLs in."
  );
  console.log("\nThe expected ARGUMENTS are:");
  console.log(
    " 1. URL of the first page of the search results for a category (e.g. artists, works, literature, etc.)"
  );
  console.log(" 2. Path to the destination JSON file.");

  console.log("\nEXAMPLE:");
  console.log(
    "node 1_get_search_result_pages.js https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B2%5D=artist ./scrape/1_urls/b_page_urls/test-urls.json\n"
  );
}

function outputWelcomeMessage2() {
  console.log("\n┌──────────────────────┐");
  console.log("│   2. Get PAGE URLs   │");
  console.log("└──────────────────────┘\n");
  console.log(
    "Reads the search page URLs from the JSON file in scrape/1_urls/a_category_index/, then scrapes the pages for the actual article URLs and finally saves all page URLs for each category in separate JSON files.\n"
  );
}

function outputUsageMessage2() {
  console.log(
    "The JSON file cannot be found or is broken. The JSON file should be in the directorz scrape/1_urls_a_category_index. Please check the directory and try again, or run the step 1_get_search_result_pages.js first."
  );
}

function outputWelcomeMessage3() {
  console.log("\n┌──────────────────────┐");
  console.log("│   3. Crawl CONTENT   │");
  console.log("└──────────────────────┘\n");
  console.log(
    "It takes a JSON list of URLs, scrapes the content of each page and saves it."
  );
  console.log(
    "At present it is adapted to crawl the Archive of Digital Art (ADA) at digitalartarchive.at"
  );
  console.log(
    "(This application works in conjunction with 2_get_page_urls.js)\n"
  );
}

function outputUsageMessage3() {
  console.log(
    "Please enter file path to the URL list and the type of content to scrape. Make sure you ran 2_get_page_urls.js first."
  );
  console.log("\nThe expected ARGUMENT is:");
  console.log(
    " 1. Type of content to scrape. These are the content types available:"
  );
  console.log("    " + returnAllTypes());
  console.log("\nEXAMPLE:");
  console.log("node 3_crawl-content.js works\n");
}

function outputWelcomeMessage4() {
  console.log("\n┌──────────────────────────────────────────────────────────┐");
  console.log("│   4. Parse saved HTML files and save CONTENTS to JSON    │");
  console.log("└──────────────────────────────────────────────────────────┘\n");
  console.log(
    "Read the previously saved HTML files and export their contents to JSON."
  );
}

function outputUsageMessage4() {
  console.log("\nPlease enter a valid category type:");
  console.log(returnAllTypes());
  console.log("\nEXAMPLE: node 6_parse-offline-pages.js scholars\n");
}

function outputWelcomeMessage5() {
  console.log("\n┌─────────────────────────────────┐");
  console.log("│   5. Get URLs of large images   │");
  console.log("└─────────────────────────────────┘\n");
  console.log(
    "This reads the thumbnail URLs and converts them to the assumed URLs of the respective large images. This is only applicable to the category 'works'.\n\n"
  );
}

function outputWelcomeMessage6() {
  console.log("\n┌──────────────────────────────┐");
  console.log("│   6. DOWNLOAD large Images   │");
  console.log("└──────────────────────────────┘\n");
  console.log(
    "This reads the thumbnail URLs and converts them to the assumed URLs of the respective large images. This is only applicable to the category 'works'.\n\n"
  );
}

function outputWelcomeMessage7() {
  console.log("\n┌─────────────────────┐");
  console.log("│   7. Get PDF URLs   │");
  console.log("└─────────────────────┘\n");
  console.log(
    "This finds the PDF links on all downloaded pages of the category literature and saves their URLs.\n\n"
  );
}

function outputWelcomeMessage8() {
  console.log("\n┌───────────────────────────┐");
  console.log("│   7. DOWNLOAD PDF files   │");
  console.log("└───────────────────────────┘\n");
  console.log(
    "This reads the PDF links from the JSON file and downloads the PDFs to the directory with all the literature pages.\n\n"
  );
}

function writeToFile(filePath, saveData) {
  fs.writeFile(filePath, saveData, function (err) {
    if (err) {
      console.log(err);
      outputTerminatingMessage();
      process.exit(0);
    } else {
      outputSuccessMessage();
      process.exit(1);
    }
  });
}

function returnAllTypes() {
  let allTypes = "";

  for (const key in types) {
    if (types.hasOwnProperty(key)) {
      allTypes += key + ", ";
    }
  }

  allTypes = allTypes.slice(0, -2);

  return allTypes;
}

function getFilenameFromUrl(url) {
  return path.basename(url);
}

// Types of content in the archive and their main div class
const types = {
  works: {
    divName: "works_single_item",
    folderName: "works",
  },
  artists: {
    divName: "artist_single_item",
    folderName: "artists",
  },
  institutions: {
    divName: "lit_single_item",
    folderName: "institutions",
  },
  literature: {
    divName: "lit_single_item",
    folderName: "literature",
  },
  events: {
    divName: "lit_single_item",
    folderName: "events",
  },
  scholars: {
    divName: "artist_single_item",
    folderName: "scholars",
  },
};

const paths = {
  works: {
    search_page_url:
      "https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B4%5D=work",
    url_json_path: "./scrape/1_urls/b_page_urls/works_urls.json",
    directory_path: "./scrape/2_pages/works/",
    page_json_path: "./scrape/3_json/works_data.json",
  },
  artists: {
    search_page_url:
      "https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B2%5D=artist",
    url_json_path: "./scrape/1_urls/b_page_urls/artists_urls.json",
    directory_path: "./scrape/2_pages/artists/",
    page_json_path: "./scrape/3_json/artists_data.json",
  },
  institutions: {
    search_page_url:
      "https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B18%5D=vainst",
    url_json_path: "./scrape/1_urls/b_page_urls/institutions_urls.json",
    directory_path: "./scrape/2_pages/institutions/",
    page_json_path: "./scrape/3_json/institutions_data.json",
  },
  literature: {
    search_page_url:
      "https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B12%5D=Literature",
    url_json_path: "./scrape/1_urls/b_page_urls/literature_urls.json",
    directory_path: "./scrape/2_pages/literature/",
    page_json_path: "./scrape/3_json/literature_data.json",
  },
  events: {
    search_page_url:
      "https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B14%5D=vaexh",
    url_json_path: "./scrape/1_urls/b_page_urls/events_urls.json",
    directory_path: "./scrape/2_pages/events/",
    page_json_path: "./scrape/3_json/events_data.json",
  },
  scholars: {
    search_page_url:
      "https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B35%5D=scholar",
    url_json_path: "./scrape/1_urls/b_page_urls/scholars_urls.json",
    directory_path: "./scrape/2_pages/scholars/",
    page_json_path: "./scrape/3_json/scholars_data.json",
  },
};

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readDirectoryContents(directory_path) {
  return fs.readdirSync(directory_path);
}

function cleanUpJsonFile(jsonFilePath) {
  fs.readFile(jsonFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return false;
    }

    const updatedData = data.split("}],[{").join("},{").slice(0, -1);

    fs.writeFile(jsonFilePath, updatedData, "utf8", (writeErr) => {
      if (writeErr) {
        console.error("Error writing to the file:", writeErr);
        return false;
      }

      console.log("JSON file cleaned up successfully!");
      return true;
    });
  });
}

function correctJsonFile(jsonFilePath) {
  fs.readFile(jsonFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return false;
    }

    let updatedData = data;

    if (data[data.length - 2] === ",") {
      updatedData = data.slice(0, -2);
    } else if (data[data.length - 1] === ",") {
      updatedData = data.slice(0, -1);
    }

    if (data[0] !== "[") {
      updatedData = "[" + updatedData + "]";
    }

    fs.writeFile(jsonFilePath, updatedData, "utf8", (writeErr) => {
      if (writeErr) {
        console.error("Error writing to the file:", writeErr);
        return false;
      }

      console.log("JSON file ammended successfully!");
      return true;
    });
  });
}

function appendFailedURL(urls, failedDownloadsLogPath) {
  // Has to check if file exists first and create it if it doesn't.
  fs.appendFileSync(failedDownloadsLogPath, `${urls},\n`, "utf8", (err) => {
    if (err) {
      console.error(
        "Error writing to :" + failedDownloadsLogPath + " with error: \n",
        err.message
      );
    }
  });
}

function createDirectoryIfNotExists(directory_path) {
  if (!fs.existsSync(directory_path)) {
    fs.mkdirSync(directory_path);
  }
}

export {
  outputTerminatingMessage,
  outputSuccessMessage,
  writeToFile,
  outputWelcomeMessage1,
  outputWelcomeMessage2,
  outputWelcomeMessage3,
  outputWelcomeMessage4,
  outputWelcomeMessage5,
  outputWelcomeMessage6,
  outputWelcomeMessage7,
  outputWelcomeMessage8,
  outputUsageMessage1,
  outputUsageMessage2,
  outputUsageMessage3,
  outputUsageMessage4,
  returnAllTypes,
  getFilenameFromUrl,
  readDirectoryContents,
  readFile,
  cleanUpJsonFile,
  correctJsonFile,
  appendFailedURL,
  createDirectoryIfNotExists,
  types,
  paths,
};
