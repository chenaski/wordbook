import { chromium } from "playwright";

async function getYandexTranslateExamples() {
  const baseUrl = "https://translate.yandex.by/?ui=ru&lang=en-ru&text=";
  const searchExpression = "bored stiff";
  const url = `${baseUrl}${encodeURIComponent(searchExpression)}`;

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
  });

  const page = await browser.newPage();

  console.log(url);

  await page.goto(url, { waitUntil: "networkidle" });

  await page.screenshot({
    path: "screenshot.png",
    fullPage: true,
  });

  await browser.close();
}

await getYandexTranslateExamples();
