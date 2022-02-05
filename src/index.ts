import { YandexParser } from "./YandexParser.js";
import { Cache } from "./Cache.js";
import { WooordHuntParser } from "./WooordHuntParser.js";
import { LingvoLiveParser } from "./LingvoLiveParser.js";

async function getYandexExamples({ searchExpression }: { searchExpression: string }) {
  const yandexParser = new YandexParser();
  const cache = new Cache({ id: YandexParser.id, cacheDir: "results" });

  await cache.init();

  if (await cache.has(searchExpression)) {
    console.log("get from cache");
    return cache.get(searchExpression);
  }

  const examples = await yandexParser.run({ searchExpression });
  await cache.add(examples, searchExpression);
}

async function getWooordHuntExamples({ searchExpression }: { searchExpression: string }) {
  const wooordHuntParser = new WooordHuntParser();
  const cache = new Cache({ id: WooordHuntParser.id, cacheDir: "results" });

  await cache.init();

  if (await cache.has(searchExpression)) {
    console.log("get from cache");
    return cache.get(searchExpression);
  }

  const examples = await wooordHuntParser.run({ searchExpression });
  await cache.add(examples, searchExpression);
}

async function getLingvoLiveExamples({ searchExpression }: { searchExpression: string }) {
  const lingvoLiveParser = new LingvoLiveParser();
  const cache = new Cache({ id: LingvoLiveParser.id, cacheDir: "results" });

  await cache.init();

  if (await cache.has(searchExpression)) {
    console.log("get from cache");
    return cache.get(searchExpression);
  }

  const examples = await lingvoLiveParser.run({ searchExpression });
  await cache.add(examples, searchExpression);
}

async function main() {
  try {
    const searchExpression = "bored stiff";

    // await getYandexExamples({searchExpression});
    // await getWooordHuntExamples({ searchExpression });
    await getLingvoLiveExamples({ searchExpression });
  } catch (e) {
    console.error(e);
  }
}

(async () => {
  await main();
})();
