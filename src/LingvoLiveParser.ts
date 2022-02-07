import { GrepExamplesHook, Parser } from "./Parser.js";
import { Examples } from "./Example.js";
import { SiteParser } from "./SiteParser.js";

export class LingvoLiveParser implements SiteParser {
  static id = "lingvo-live";

  async grepExamples({ dom }: Parameters<GrepExamplesHook>[0]): Promise<Examples> {
    const examples = dom.window.document.querySelectorAll("[name='#quote'] blockquote");

    if (!examples?.length) throw Error("examples not found");

    const parsedExamples = [];

    const getValue = (element: Element): string | null => {
      return element.textContent;
    };

    for (const example of examples) {
      const [enExampleNode, ruExampleNode] = example.children[0].children;

      if (!enExampleNode || !ruExampleNode) continue;

      const formatValue = (value: string): string => {
        return value.replace(/\s+/g, " ").trim();
      };

      const enExample = getValue(enExampleNode);
      const ruExample = getValue(ruExampleNode);

      if (!enExample || !ruExample) continue;

      parsedExamples.push({
        ru: formatValue(ruExample),
        en: formatValue(enExample),
      });
    }

    return parsedExamples;
  }

  async run({ searchExpression }: { searchExpression: string }): Promise<Examples> {
    const parser = new Parser({
      hooks: {
        grepExamples: this.grepExamples.bind(this),
      },
    });

    const baseUrl = "https://www.lingvolive.com/en-us/translate/en-ru/";
    const url = `${baseUrl}${encodeURIComponent(searchExpression)}`;

    return parser.run({ url });
  }
}
