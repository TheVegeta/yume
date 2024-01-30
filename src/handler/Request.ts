import {
  HttpRequest,
  HttpResponse,
  MultipartField,
  RecognizedString,
  getParts,
} from "uWebSockets.js";
import url from "url";
import { HttpContentType, HttpMethod } from "../types";
import { exec, handleArrayBuffer } from "../utils";

export class Request {
  public url: string;
  public method: HttpMethod;
  public keys: string[] = [];
  public regExp: RegExp | undefined;

  constructor(private req: HttpRequest, private res: HttpResponse) {
    this.url = req.getUrl();
    this.method = req.getMethod() as HttpMethod;
  }

  public _setRegexparam(keys: string[], regExp: RegExp) {
    this.keys = keys;
    this.regExp = regExp;
  }

  public getHeader(lowerCaseKey: RecognizedString) {
    return this.req.getHeader(lowerCaseKey);
  }

  public getParameter(index: number) {
    return this.req.getParameter(index);
  }

  public getUrl() {
    return this.req.getUrl();
  }

  public getMethod() {
    return this.req.getMethod();
  }

  public getCaseSensitiveMethod() {
    return this.req.getCaseSensitiveMethod();
  }

  public getQuery() {
    return this.req.getQuery();
  }

  public setYield(_yield: boolean) {
    return this.req.setYield(_yield);
  }

  public headers<T>(): T | null {
    const obj: any = {};

    this.req.forEach((k, v) => {
      obj[k] = v;
    });

    return obj as T;
  }

  public getParams<T>(): T | null {
    return exec(this.url, this.regExp, this.keys) as T;
  }

  public query<T>(): T {
    return url.parse(`?${this.req.getQuery()}`, true).query as T;
  }

  public async rawBody<T>(): Promise<T | null> {
    return new Promise<T | null>(async (resolve, reject) => {
      this.res.onData((data) => resolve(handleArrayBuffer(data) as T));
      this.res.onAborted(() => reject(null));
    });
  }

  public async body<T>(): Promise<T | null> {
    const reqType = this.req.getHeader("content-type") as HttpContentType;

    return new Promise<T | null>(async (resolve, reject) => {
      this.res.onData((data) => {
        const response = handleArrayBuffer(data);

        if (reqType === "application/json") {
          resolve(JSON.parse(response) as T);
        } else if (reqType === "application/x-www-form-urlencoded") {
          resolve(url.parse(`?${response}`, true).query as T);
        } else if (reqType.includes("text/plain;")) {
          resolve(response as T);
        } else {
          resolve(response as T);
        }
      });

      this.res.onAborted(() => reject(null));
    });
  }

  public async file(): Promise<MultipartField[] | undefined> {
    const header = this.req.getHeader("content-type");

    return await new Promise<MultipartField[] | undefined>(
      (resolve, reject) => {
        let buffer = Buffer.from("");

        this.res.onData((ab, isLast) => {
          buffer = Buffer.concat([buffer, Buffer.from(ab)]);

          if (isLast) {
            resolve(getParts(buffer, header));
          }
        });

        this.res.onAborted(() => reject(null));
      }
    );
  }
}
