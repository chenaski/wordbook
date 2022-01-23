/*
1. get page html
  - if SPA render using playwright and grep html
  - otherwise make simple get request
2. parse html using jsdom 
3. save examples as json
*/

async function getPageHtml(url) {
  const ssr = true;

  if (ssr) {
    return await renderPage(url);
  } else {
    return await fetchPage(url);
  }
}

async function renderPage(url) {}

async function fetchPage(url) {}

async function parsePage(html) {}

async function getExamplesJson(dom) {}

async function saveExamples(examples) {}

async function getYandexTranslateExamples() {
  const url = "";

  const html = await getPageHtml(url);
  const dom = await parsePage(html);

  return await getExamplesJson(dom);
}

async function main() {
  try {
    const examples = await getYandexTranslateExamples();
    await saveExamples(examples);
  } catch (e) {
    console.error(e);
  }
}

await main();
