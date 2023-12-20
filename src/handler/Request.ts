import url from "node:url";
import {
  HttpRequest,
  HttpResponse,
  MultipartField,
  getParts,
} from "uWebSockets.js";
import { HttpContentType } from "../types";
import { handleArrayBuffer, voidFunction } from "../utils";
import { RouteHandler } from "./RouteHandler";

export class Request {
  constructor(
    private req: HttpRequest,
    private res: HttpResponse,
    private matchPath: RouteHandler["matchPath"]
  ) {}

  public getHeader() {
    return this.req.getHeader;
  }

  public getParameter() {
    return this.req.getParameter;
  }

  public getUrl() {
    return this.req.getUrl;
  }

  public getMethod() {
    return this.req.getMethod;
  }

  public getCaseSensitiveMethod() {
    return this.req.getCaseSensitiveMethod;
  }

  public getQuery() {
    return this.req.getQuery;
  }

  public setYield() {
    return this.req.setYield;
  }

  public headers<T>(): T | null {
    try {
      const obj: any = {};
      this.req.forEach((k, v) => {
        obj[k] = v;
      });

      return obj as T;
    } catch (err) {
      return null;
    }
  }

  public params<T>(): T | null {
    return null;
  }

  public query<T>(): T | null {
    try {
      const { query } = url.parse(`?${this.req.getQuery()}`, true);
      return (query as T) || null;
    } catch (err) {
      return null;
    }
  }

  public async body<T>(): Promise<T | null> {
    return await new Promise<T | null>(async (resolve) => {
      try {
        const reqType = this.req.getHeader("content-type") as HttpContentType;

        this.res
          .onData((data) => {
            const response = handleArrayBuffer(data);

            if (reqType === "application/json") {
              resolve(JSON.parse(response) as T);
            } else if (reqType === "application/x-www-form-urlencoded") {
              const { query } = url.parse(`?${response}`, true);
              resolve(query as T);
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
          const chunk = Buffer.from(ab);
          buffer = Buffer.concat([buffer, chunk]);

          if (isLast) {
            const data = getParts(buffer, header);

            resolve(data);
          }
        })
        .onAborted(voidFunction);
    });
  }
}
