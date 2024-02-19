# Archive Scrape: Archiving the Archive

This is a quick web scraper for the [Archive of Digital Art (ADA)](https://digitalartarchive.at). It is an example for the crawl and capture of a large amount of modestly complex content.

It's purpose is to crawl the archive and save the HTML content and the images. Additional components find the the related large versions of images and the PDF files and download them.
The final component runs through all of the locally saved HTML files and extracts their relevant content to saves it in JSON format for further processing.

ADA has many thousands of pages for artists, works, events, etc. We need a list of all URLs so that we can run through them and grab their content for further processing. If you scrape the whole ADA website, you will have around 2.1GB of data (with all the text and the images small and large where applicable).

ADA has the following content categories:

- artists
- events
- institutions
- literature
- scholars
- works

**Please note: ** All the components need to run in the order they are listed here. The first component generates the input for the second component, and so on.

## 1_get_search_result_pages.js

### Crawl ADA for the Search Results Pages of Each Category

First of all, we need to get the URLs of all search results pages for each category. So we crawl ADA for the search results and save them to a JSON file. This will be the basis for the next steps.

### Usage

As its first argument, this application takes the URL of the first page of the search results for a category (e.g. artists, works, literature, etc.).

Open the app with `node 1_get_search_result_pages.js ARG1 ARG2`. It then checks the number of available search result pages for this category and generates a JSON file with the remaining search result URLs for this category.

As its second argument it takes the path to the destination JSON file.

You'll have to repeat this for all the categories on ADA. Here's a reminder of the available categories:

**Artists:**
`https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B2%5D=artist`

**Events:**
`https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B14%5D=vaexh`

**Institutions:**
`https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B18%5D=vainst`

**Literature:**
`https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B12%5D=Literature`

**Scholars:**
`https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B35%5D=scholar`

**Works:**
`https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B4%5D=work`

### Example

`node 1_get_search_result_pages.js https://digitalartarchive.at/database/database-info/archive.html?tx_kesearch_pi1%5Bpage%5D=1&tx_kesearch_pi1%5Bfilter%5D%5B2%5D%5B2%5D=artist ./scrape/1_urls/a_category_index/artist-test-urls.json`

## 2_get_page_urls

### Get All the Article URLs from the Search Result Pages

Now that we have all the search page URLs, we need to read them from the JSON files and then scrape the pages for the actual article URLs.

### Example

`node 2_get_page_urls.js ./scrape/1_urls/a_category_index/artist-test-urls.json ./scrape/1_urls/b_page_urls/artist-pages-test-urls.json`

## 3_crawl-content.js

### Get all the page contents and reguler images (main web archive content scraper)

Now we are ready to crawl the actual contents of the pages. This component takes a JSON list of URLs, scrapes the content of each page and saves it.

### Usage

Open the app with `node 3_crawl-content.js ARG1 ARG2` where the first argument is the file path to the URL list and the second one is the type of content to scrape.

### Example

`node 3_crawl-content.js ./scrape/1_urls/page-urls/work-urls.json works`

## 4_get-urls-of-large-images.js

### Large Images for Each Thumbnail

Many of the articles in the 'works' category have images. The thumbnails on the pages show the small version of an image. When a user clicks on one of them a larger version opens in a new window.

This component reads the thumbnail URLs and converts them to the assumed URLs of the respective large images and saves them into a JSON file. This is only applicable to the category 'works', none of the other categories have large versions of their images.

### How Does It Work?

All settings in the component are already set for the 'works' category. The HTML files are read from the directory `/scrape/pages/works/` and then crawled for the thumbnail images, their URLs are then converted into the assumed URL of the corresponding large images. This assumption is mostly correct. These new URLs are saved in a JSON file together with the original thumbnail image URLs (for later reference). This file `works_large_images.json` is saved in the `scrape/1_urls/c_image_urls` directory.

In the next component, the URLs are used to download the large images. **Please note that you will need to have the works pages downloaded in the folder works before you can run this component.**

### Usage

As all the settings are predefined already to use the 'works' category, you simply need to launch the application with:

`node 4_get-urls-of-large-images.js`

## 5_download-large-images.js

### Download the Large Image Files

This component reads the large image URLs from `works_large_images.json` an uses them to download the large images from the web.

Not all thumbnail images actually have a large version, and in some cases, there might even be an issue while downloading. To keep track of this, any failed downloads are logged in `./4_download_log/works_lg_images_failed.txt`.

The downloads can then be repeated for the failed files. Keep in mind that there might not be a large image.

### Usage

Everything is set up to use the JSON file generated in component 4. You simply launch:

`node 5_download-large-images.js`

## 6_parse_offline_pages.js

### Read the Data from the HTML Files and Save it as JSON

This is the final component that actually reads the HTML files and extracts the relevant data from them. It then saves the data in JSON format in a massive file.

This component it adapted to the specific areas of a typical page in the different categories of ADA. It is not a general purpose component. You will have to run it for each category separately (artists, events, institutions, literature, scholars, works). Please keep in mind that the generated JSON file will be very large. For example, the 'works' category has more than 2,000 items. The 'events' category has nearly 5,000 items.

The local HTML files are parsed, so if the parsing fails at some point, the component will stop. You can then move the HTML files that have already been parsed out of the respective category folder, and then restart the component. It will continue where it left off. In the rare case that an HTML file is invalid or broken and the parsing fails, you can move it out of the folder and restart the component.

### Usage

The component takes one argument, the category for which it should run. Open the app with `node 6_parse_offline_pages.js ARG1`. As previously noted, the categories are: artists, events, institutions, literature, scholars, work:

### Example

`node 6_parse_offline_pages.js scholars`

### Additional Notes on this Component

The presets in the component are specific to the typical pages in the individual categories.

The parser runs through the HTML and pulls the content from the divs with specific class names. The structure of the pages and their class names differs between the different categories.

If you want to use this component for another website, you will have to adapt it to the structure of the pages on that website. The configuration of the class names is in component file 6_parse-offline-pages.js. The class names are defined in the variable `typeData` and listed by category name.

## Additions

The PDF scraper first needs to run through all of the HTML files in the Literature category and extract the URLs of the PDF files. Most Literature pages do not have PDF links, but the scraper needs to check all of them. The PDF scraper then saves the list of PDF URLs in the file `./scrape/1_urls/c_image_urls/literature_pdf_urls.json`. This file is then used by the PDF downloader to download the PDF files.

While the PDF URL scraper is running, make sure it is not interrupted. The JSON file it generates is not yet fully compliant. It is missing the opening an closing square brackets and has a comma at the end of every entry, including the last one. This is the reason why some IDEs will flag the file as incorrect if you look at it before the scraping has finished. Both the brackets and the trailing comma are fixed at the very end of the scrape.

If you happen to interrupt the process, then you can fix the file yourself by simply inserting an opeing square bracket at the beginning, removing the last comma and adding the closing square bracket at the end.

Once the PDF URLs have been saved to the JSON file, you can run the PDF downloader.
