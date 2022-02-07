import { GrepExamplesHook, OnGetResponseHook, Parser } from "./Parser.js";
import { Examples } from "./Example.js";
import { SiteParser } from "./SiteParser.js";

export class OxfordLearnersDictionaryParser implements SiteParser {
  static id = "oxford";

  sectionId?: string;

  async onGetResponse({ response }: Parameters<OnGetResponseHook>[0]): Promise<void> {
    if (!response.redirectUrls.length) return;
    this.sectionId = response.redirectUrls[response.redirectUrls.length - 1].hash;
  }

  async grepExamples({ dom }: Parameters<GrepExamplesHook>[0]): Promise<Examples> {
    if (!this.sectionId) throw Error("no section ID");

    const examplesSectionId = this.sectionId;
    const examplesSection = dom.window.document.querySelector(`${examplesSectionId} .examples`);

    if (!examplesSection) throw Error("examples not found");

    const parsedExamples = [];

    const getValue = (element: Element): string | null => {
      return element?.children[0]?.textContent;
    };

    for (const example of examplesSection.children) {
      const enExample = getValue(example);

      const formatValue = (value: string): string => {
        return value.replace(/\s+/g, " ").trim();
      };

      if (!enExample) continue;

      parsedExamples.push({
        en: formatValue(enExample),
      });
    }

    return parsedExamples;
  }

  async run({ searchExpression }: { searchExpression: string }): Promise<Examples> {
    const parser = new Parser({
      hooks: {
        grepExamples: this.grepExamples.bind(this),
        onGetResponse: this.onGetResponse.bind(this),
      },
    });

    const baseUrl = "https://www.oxfordlearnersdictionaries.com/search/english/direct/?q=";
    const url = `${baseUrl}${encodeURIComponent(searchExpression)}`;

    return parser.run({ url });
  }
}
