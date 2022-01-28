/*
1. get page html
  - if SPA render using playwright and grep html
  - otherwise make simple get request
2. parse html using jsdom 
3. save examples as json
*/

import fs from "fs/promises";
import { constants as fsConstants } from "fs";
import { chromium } from "playwright";
import { JSDOM } from "jsdom";

async function getPageHtml(url) {
  const ssr = true;

  if (ssr) {
    return await renderPage(url);
  } else {
    return await fetchPage(url);
  }
}

async function renderPage(url) {
  console.log("open browser");
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
  });

  const page = await browser.newPage();

  console.log("open url");
  await page.goto(url, { waitUntil: "networkidle" });

  if (await isCaptchaPage(page)) {
    await browser.close();
    throw Error("captcha :(");
  }

  console.log("grab html");
  const html = await page.content();

  console.log("close browser");
  await browser.close();

  return html;
}

async function fetchPage(url) {}

async function parsePage(html) {
  console.log("parse html");
  return new JSDOM(html);
}

async function getExamplesJson(dom) {
  console.log("grab examples");
  const examples = dom.window.document.querySelectorAll(".example_wrapper");

  return Array.from(examples).map((example) => {
    return {
      en: example.children[0].textContent.replace(/\s+/g, " ").trim(),
      ru: example.children[1].textContent.replace(/\s+/g, " ").trim(),
    };
  });
}

async function isFileOrDirExists(path) {
  return fs
    .access(path, fsConstants.R_OK)
    .then(() => true)
    .catch(() => false);
}

async function saveExamples(examples, fileName) {
  if (!(await isFileOrDirExists(isFileOrDirExists("results")))) {
    await fs.mkdir("results");
  }

  const saveFilePath = `results/${fileName}.json`;

  console.log("save examples to", saveFilePath);
  await fs.writeFile(saveFilePath, JSON.stringify(examples));
}

async function getYandexTranslateExamples({ searchExpression }) {
  const baseUrl = "https://translate.yandex.by/?ui=ru&lang=en-ru&text=";
  const url = `${baseUrl}${encodeURIComponent(searchExpression)}`;

  console.log(url);

  const html = await getPageHtml(url);
  const dom = await parsePage(html);

  return await getExamplesJson(dom);
}

async function isCaptchaPage(page) {
  const currentPageUrl = await page.url();
  return currentPageUrl.startsWith("https://translate.yandex.by/showcaptcha");
}

async function main() {
  try {
    const searchExpression = "bored stiff";
    const examples = await getYandexTranslateExamples({ searchExpression });
    await saveExamples(examples, searchExpression.replace(/\W/g, "").replace(/\s/g, "_"));
  } catch (e) {
    console.error(e);
  }
}

await main();
