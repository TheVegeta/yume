import {
  getParts,
  HttpRequest,
  HttpResponse,
  MultipartField,
} from "uWebSockets.js";
import URL from "url";
import { HttpContentType } from "../types";

export class Request {
  public uWebSocketsReq;
  private uWebSocketsRes;

  public url = "";
  public method = "";

  private keys: string[] = [];
  private regExp: RegExp = new RegExp("");

  constructor(req: HttpRequest, res: HttpResponse) {
    this.uWebSocketsReq = req;
    this.uWebSocketsRes = res;

    this.url = req.getUrl();
    this.method = req.getMethod();
  }

  public setRegExp(regExp: RegExp) {
    this.regExp = regExp;
  }

  public setkeys(keys: string[]) {
    this.keys = keys;
  }

  public async getBody<T>(): Promise<T | null> {
    const reqType = this.uWebSocketsReq.getHeader(
      "content-type"
    ) as HttpContentType;

    return new Promise<T | null>(async (resolve, reject) => {
      this.uWebSocketsRes.onData((data) => {
        let response;

        if (data instanceof ArrayBuffer) {
          const decoder = new TextDecoder();
          response = decoder.decode(data);
        } else {
          response = data;
        }

        if (reqType === "application/json") {
          resolve(JSON.parse(response) as T);
        } else if (reqType === "application/x-www-form-urlencoded") {
          resolve(URL.parse(`?${response}`, true).query as T);
        } else if (reqType.includes("text/plain;")) {
          resolve(response as T);
        } else {
          resolve(response as T);
        }
      });

      this.uWebSocketsRes.onAborted(() => reject(null));
    });
  }

  public async getFile(): Promise<MultipartField[] | undefined> {
    const header = this.uWebSocketsReq.getHeader("content-type");

    return await new Promise<MultipartField[] | undefined>(
      (resolve, reject) => {
        let buffer = Buffer.from("");

        this.uWebSocketsRes.onData((ab, isLast) => {
          buffer = Buffer.concat([buffer, Buffer.from(ab)]);

          if (isLast) {
            resolve(getParts(buffer, header));
          }
        });

        this.uWebSocketsRes.onAborted(() => reject(null));
      }
    );
  }

  public getQuery<T>(): T {
    return URL.parse(`?${this.uWebSocketsReq.getQuery()}`, true).query as T;
  }

  public getParams<T>(): T {
    let i = 0;
    let out = {} as Record<string, string | null>;

    let matches = this.regExp.exec(this.url);

    while (i < this.keys.length) {
      if (matches) out[this.keys[i]] = matches[++i] || null;
    }

    return out as T;
  }

  public getHeaders<T>(): T {
    const obj = {} as Record<string, string | null>;

    this.uWebSocketsReq.forEach((k, v) => {
      obj[k] = v;
    });

    return obj as T;
  }
}
