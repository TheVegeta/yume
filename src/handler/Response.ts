import fs from "fs";
import { HttpRequest, HttpResponse, RecognizedString } from "uWebSockets.js";
import { pipeStreamOverResponse } from "../utils";

export class Response {
  private uWebSocketsReq;
  public uWebSocketsRes;

  constructor(req: HttpRequest, res: HttpResponse) {
    this.uWebSocketsReq = req;
    this.uWebSocketsRes = res;
  }

  public send(body: string) {
    this.uWebSocketsRes.end(body, true);
  }

  public json(body: any) {
    this.uWebSocketsRes
      .writeHeader("Content-Type", "application/json")
      .end(JSON.stringify(body), true);
  }

  public render(body: string) {
    this.uWebSocketsRes
      .writeHeader("Content-Type", "text/html; charset=utf-8")
      .end(body, true);
  }

  public redirect(url: string) {
    this.uWebSocketsRes.writeStatus("302").writeHeader("location", url).end("");
  }

  public status(status: number) {
    this.uWebSocketsRes.writeStatus(status.toString());
    return this;
  }

  public sendFile(fileName: string) {
    const totalSize = fs.statSync(fileName).size;
    const readStream = fs.createReadStream(fileName);
    pipeStreamOverResponse(this.uWebSocketsRes, readStream, totalSize);
  }

  public set(key: RecognizedString, value: RecognizedString) {
    this.uWebSocketsRes.writeHeader(key, value);
    return this;
  }

  public end(body: string) {
    this.uWebSocketsRes.end(body, true);
  }

  public startAsync() {
    this.uWebSocketsRes.onAborted(() => {
      this.uWebSocketsRes.aborted = true;
    });
  }

  public endAsync(cb: VoidFunction) {
    if (!this.uWebSocketsRes.aborted) {
      this.uWebSocketsRes.cork(cb);
    }
  }
}
