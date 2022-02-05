import { AfterRenderHook, GrepExamplesHook, Parser } from "./Parser.js";
import { Examples } from "./Example.js";

export class WooordHuntParser {
  static id = "wooord-hunt";

  async grepExamples({ dom }: Parameters<GrepExamplesHook>[0]): Promise<Examples> {
    const examples = dom.window.document.querySelector(".ex_o")?.parentElement;

    if (!examples) throw Error("examples not found");

    const enBlocks = examples.querySelectorAll(".ex_o");
    const ruBlocks = examples.querySelectorAll(".ex_t");
    const groupedExamples = [...enBlocks].map((enExample, i) => {
      const ruExample = ruBlocks[i];

      enExample.querySelectorAll("span,a").forEach((element) => element.remove());
      ruExample.querySelectorAll("span,a").forEach((element) => element.remove());

      return {
        en: enExample,
        ru: ruExample,
      };
    });

    const parsedExamples = [];

    const getValue = (element: Element): string | null => {
      return element.textContent;
    };

    for (const example of groupedExamples) {
      const enExample = getValue(example.en);
      const ruExample = getValue(example.ru);

      const formatValue = (value: string): string => {
        return value.replace(/\s+/g, " ").trim();
      };

      if (!ruExample || !enExample) continue;

      parsedExamples.push({
        ru: formatValue(enExample),
        en: formatValue(ruExample),
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

    const baseUrl = "https://wooordhunt.ru/word/";
    const url = `${baseUrl}${encodeURIComponent(searchExpression)}`;

    return parser.run({ url });
  }
}
