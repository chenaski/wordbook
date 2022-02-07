import { YandexParser } from "./YandexParser.js";
import { Cache } from "./Cache.js";
import { WooordHuntParser } from "./WooordHuntParser.js";
import { LingvoLiveParser } from "./LingvoLiveParser.js";
import { SiteParser } from "./SiteParser.js";
import { OxfordLearnersDictionaryParser } from "./OxfordLearnersDictionaryParser.js";

async function runParser(
  Parser: { id: string; new (): SiteParser },
  { searchExpression }: { searchExpression: string }
) {
  const parser = new Parser();
  const cache = new Cache({ id: Parser.id, cacheDir: "results" });

  await cache.init();

  if (await cache.has(searchExpression)) {
    console.log("get from cache");
    return cache.get(searchExpression);
  }

  const examples = await parser.run({ searchExpression });
  await cache.add(examples, searchExpression);
}

async function main() {
  try {
    const searchExpression = "bored stiff";

    await runParser(YandexParser, { searchExpression });
    await runParser(WooordHuntParser, { searchExpression });
    await runParser(LingvoLiveParser, { searchExpression });
    await runParser(OxfordLearnersDictionaryParser, { searchExpression });
  } catch (e) {
    console.error(e);
  }
}

(async () => {
  await main();
})();
