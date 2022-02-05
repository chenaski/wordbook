import { Examples } from "./Example";

export abstract class SiteParser {
  static id: string;
  abstract run({ searchExpression }: { searchExpression: string }): Promise<Examples>;
}
