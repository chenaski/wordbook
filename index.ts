/*
1. get page html
  - if SPA render using playwright and grep html
  - otherwise make simple get request
2. parse html using jsdom 
3. save examples as json
*/

import fs from "fs/promises";
import { constants as fsConstants } from "fs";
import { chromium, Page } from "playwright";
import { JSDOM } from "jsdom";

async function getPageHtml(url: string) {
  const ssr = true;

  if (ssr) {
    return await renderPage(url);
  } else {
    return await fetchPage(url);
  }
}

async function renderPage(url: string) {
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

async function fetchPage(url: string) {
  return "";
}

async function parsePage(html: string) {
  console.log("parse html");
  return new JSDOM(html);
}

async function getExamplesJson(dom: JSDOM): Promise<{ en: string; ru: string }[]> {
  console.log("grab examples");
  const examples = dom.window.document.querySelectorAll(".example_wrapper");
  const parsedExamples = [];

  const getValue = (element: Element): string | null => {
    return element?.children[0]?.textContent;
  };

  for (const example of examples) {
    const ruExample = getValue(example.children[0]);
    const enExample = getValue(example.children[1]);

    if (!ruExample || !enExample) continue;

    parsedExamples.push({
      ru: enExample.replace(/\s+/g, " ").trim(),
      en: ruExample.replace(/\s+/g, " ").trim(),
    });
  }

  return parsedExamples;
}

async function isFileOrDirExists(path: string) {
  return fs
    .access(path, fsConstants.R_OK)
    .then(() => true)
    .catch(() => false);
}

async function saveExamples(examples: { en: string; ru: string }[], fileName: string) {
  if (!(await isFileOrDirExists("results"))) {
    await fs.mkdir("results");
  }

  const saveFilePath = `results/${fileName}.json`;

  console.log("save examples to", saveFilePath);
  await fs.writeFile(saveFilePath, JSON.stringify(examples));
}

async function getYandexTranslateExamples({ searchExpression }: { searchExpression: string }) {
  const baseUrl = "https://translate.yandex.by/?ui=ru&lang=en-ru&text=";
  const url = `${baseUrl}${encodeURIComponent(searchExpression)}`;

  console.log(url);

  const html = await getPageHtml(url);
  const dom = await parsePage(html);

  return await getExamplesJson(dom);
}

async function isCaptchaPage(page: Page) {
  const currentPageUrl = page.url();
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
