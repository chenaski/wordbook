import { Page } from "playwright";
import { AfterRenderHook, GrepExamplesHook, Parser } from "./Parser.js";
import { Examples } from "./Example";

export class YandexParser {
  static id = "yandex";

  async afterRender({ page, browser }: Parameters<AfterRenderHook>[0]): Promise<void> {
    if (await this.isCaptchaPage(page)) {
      await browser.close();
      throw Error("captcha :(");
    }
  }

  async grepExamples({ dom }: Parameters<GrepExamplesHook>[0]): Promise<Examples> {
    const examples = dom.window.document.querySelectorAll(".example_wrapper");
    const parsedExamples = [];

    const getValue = (element: Element): string | null => {
      return element?.children[0]?.textContent;
    };

    for (const example of examples) {
      const ruExample = getValue(example.children[0]);
      const enExample = getValue(example.children[1]);

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

  async isCaptchaPage(page: Page): Promise<boolean> {
    const currentPageUrl = page.url();
    return currentPageUrl.startsWith("https://translate.yandex.by/showcaptcha");
  }

  async run({ searchExpression }: { searchExpression: string }): Promise<Examples> {
    const parser = new Parser({
      receiveHtmlStrategy: "render",
      hooks: {
        grepExamples: this.grepExamples.bind(this),
        afterRender: this.afterRender.bind(this),
      },
    });

    const baseUrl = "https://translate.yandex.by/?ui=ru&lang=en-ru&text=";
    const url = `${baseUrl}${encodeURIComponent(searchExpression)}`;

    return parser.run({ url });
  }
}
