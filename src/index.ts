import { YandexParser } from "./YandexParser.js";
import { Cache } from "./Cache.js";

async function main() {
  try {
    const searchExpression = "bored stiff";

    const yandexParser = new YandexParser();
    const cache = new Cache({ id: YandexParser.id, cacheDir: "results" });

    await cache.init();

    if (await cache.has(searchExpression)) {
      console.log("get from cache");
      return cache.get(searchExpression);
    }

    const examples = await yandexParser.run({ searchExpression });
    await cache.add(examples, searchExpression);
  } catch (e) {
    console.error(e);
  }
}

(async () => {
  await main();
})();
