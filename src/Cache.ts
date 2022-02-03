import fs from "fs/promises";
import { constants as fsConstants } from "fs";
import { Examples } from "./Example.js";

export interface CacheConstructor {
  id: string;
  cacheDir: string;
}

export class Cache {
  id: string;
  cacheDir: string;

  constructor({ id, cacheDir }: CacheConstructor) {
    this.id = id;
    this.cacheDir = `${cacheDir}/${id}`;
  }

  async init(): Promise<void> {
    await this.createCacheDir();
  }

  async createCacheDir(): Promise<void> {
    if (!(await this.isFileOrDirExists(this.cacheDir))) {
      await fs.mkdir(this.cacheDir, { recursive: true });
    }
  }

  async isFileOrDirExists(path: string): Promise<boolean> {
    return fs
      .access(path, fsConstants.R_OK)
      .then(() => true)
      .catch(() => false);
  }

  getCacheKey(key: string): string {
    return key.replace(/\W/g, "").replace(/\s/g, "_");
  }

  getPathKey(key: string): string {
    const cacheKey = this.getCacheKey(key);
    return `${this.cacheDir}/${cacheKey}.json`;
  }

  async add(examples: Examples, key: string): Promise<void> {
    const saveFilePath = this.getPathKey(key);

    console.log("save examples to", saveFilePath);
    await fs.writeFile(saveFilePath, JSON.stringify(examples));
  }

  async has(key: string): Promise<boolean> {
    const cachedFilePath = this.getPathKey(key);

    return await this.isFileOrDirExists(cachedFilePath);
  }

  async get(key: string): Promise<Examples | undefined> {
    if (await this.has(key)) {
      const cachedFilePath = this.getPathKey(key);
      const file = await fs.readFile(cachedFilePath);

      return file.toJSON() as unknown as Examples;
    }
  }
}
