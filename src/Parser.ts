import { Browser, chromium, Page } from "playwright";
import { JSDOM } from "jsdom";
import { Examples } from "./Example.js";
import got from "got";

export type SourceUrl = string;
export type AfterRenderHook = ({ page, browser }: { page: Page; browser: Browser }) => Promise<void>;
export type GrepExamplesHook = ({ dom }: { dom: JSDOM }) => Promise<Examples>;
export type ReceiveHtmlStrategy = "render" | "fetch";
export interface Hooks {
  afterRender?: AfterRenderHook;
  grepExamples: GrepExamplesHook;
}
export interface ParserConstructor {
  receiveHtmlStrategy?: ReceiveHtmlStrategy;
  hooks: Hooks;
}

export class Parser {
  receiveHtmlStrategy?: ReceiveHtmlStrategy;
  hooks: Hooks;

  constructor({ receiveHtmlStrategy, hooks }: ParserConstructor) {
    this.receiveHtmlStrategy = receiveHtmlStrategy;
    this.hooks = hooks;
  }

  async run({ url }: { url: SourceUrl }): Promise<Examples> {
    console.log(url);

    const html = await this.getPageHtml(url);
    const dom = await this.parsePage(html);

    return await this.getExamplesJson(dom);
  }

  async getPageHtml(url: string): Promise<string> {
    switch (this.receiveHtmlStrategy) {
      case "fetch":
        return await this.fetchPage(url);
      case "render":
        return await this.renderPage(url);
      default:
        return await this.fetchPage(url);
    }
  }

  async renderPage(url: string): Promise<string> {
    console.log("open browser");
    const browser = await chromium.launch({
      headless: true,
      channel: "chrome",
    });

    const page = await browser.newPage();

    console.log("open url");
    await page.goto(url, { waitUntil: "networkidle" });

    console.log("hooks: afterRender");
    await this.hooks?.afterRender?.({ page, browser });

    console.log("grab html");
    const html = await page.content();

    console.log("close browser");
    await browser.close();

    return html;
  }

  async fetchPage(url: string): Promise<string> {
    const response = await got.get(url);
    return response.body;
  }

  async parsePage(html: string): Promise<JSDOM> {
    console.log("parse html");
    return new JSDOM(html);
  }

  async getExamplesJson(dom: JSDOM): Promise<Examples> {
    console.log("grep examples");
    return this.hooks.grepExamples({ dom });
  }
}
