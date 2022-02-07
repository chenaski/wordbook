import { Page } from "playwright";
import { AfterRenderHook, GrepExamplesHook, Parser } from "./Parser.js";
import { Examples } from "./Example.js";
import { SiteParser } from "./SiteParser.js";

export class YandexParser implements SiteParser {
  static id = "yandex";

  async afterRender({ page, browser }: Parameters<AfterRenderHook>[0]): Promise<void> {
    if (await this.isCaptchaPage(page)) {
      await browser.close();
      throw Error("captcha :(");
    }
  }

  async grepExamples({ dom }: Parameters<GrepExamplesHook>[0]): Promise<Examples> {
    const examples = dom.window.document.querySelectorAll(".example_item");

    if (!examples) throw Error("examples not found");

    const parsedExamples = [];

    for (const example of examples) {
      const enExample = example.getAttribute("data-text");
      const ruExample = example.getAttribute("data-translation");

      if (!enExample || !ruExample) continue;

      parsedExamples.push({
        ru: ruExample,
        en: enExample,
      });
    }

    if (!parsedExamples.length) throw Error("examples not found");

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
