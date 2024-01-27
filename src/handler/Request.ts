import url from "node:url";
import {
  HttpRequest,
  HttpResponse,
  MultipartField,
  RecognizedString,
  getParts,
} from "uWebSockets.js";
import { HttpContentType, HttpMethod } from "../types";
import { handleArrayBuffer, voidFunction } from "../utils";

export class Request {
  public url: string;
  public method: HttpMethod;
  private path: string = "";

  constructor(private req: HttpRequest, private res: HttpResponse) {
    this.url = req.getUrl();
    this.method = req.getMethod() as HttpMethod;
  }

  public _setPath(path: string | undefined) {
    if (path) this.path = path;
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
    if (!this.path) return null;

    const urlArr = this.req.getUrl().split("/");
    const pathArr = this.path.split("/");

    const obj: Record<string, string> = {};

    for (let i = 0; i < pathArr.length; i++) {
      if (pathArr[i] !== urlArr[i]) {
        obj[pathArr[i].substring(1)] = urlArr[i];
      }
    }

    return (obj as T) || null;
  }

  public query<T>(): T | null {
    try {
      return (url.parse(`?${this.req.getQuery()}`, true).query as T) || null;
    } catch (err) {
      return null;
    }
  }

  public async body<T>(): Promise<T | null> {
    const reqType = this.req.getHeader("content-type") as HttpContentType;

    return new Promise<T | null>(async (resolve) => {
      try {
        this.res
          .onData((data) => {
            const response = handleArrayBuffer(data);

            if (reqType === "application/json") {
              resolve(JSON.parse(response) as T);
            } else if (reqType === "application/x-www-form-urlencoded") {
              resolve(url.parse(`?${response}`, true).query as T);
            } else {
              console.error("Unsupported content type: " + reqType);
            }
          })
          .onAborted(voidFunction);
      } catch (err) {
        resolve(null);
      }
    });
  }

  public async file(): Promise<MultipartField[] | undefined> {
    const header = this.req.getHeader("content-type");

    return await new Promise<MultipartField[] | undefined>((resolve) => {
      let buffer = Buffer.from("");

      this.res
        .onData((ab, isLast) => {
          buffer = Buffer.concat([buffer, Buffer.from(ab)]);

          if (isLast) {
            resolve(getParts(buffer, header));
          }
        })
        .onAborted(voidFunction);
    });
  }
}
