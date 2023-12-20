import { HttpRequest, HttpResponse } from "uWebSockets.js";

export class Response {
  constructor(private _req: HttpRequest, private res: HttpResponse) {}

  pause() {
    return this.res.pause;
  }

  resume() {
    return this.res.resume;
  }

  writeStatus() {
    return this.res.writeStatus;
  }

  writeHeader() {
    return this.res.writeHeader;
  }

  write() {
    return this.res.write;
  }

  end() {
    return this.res.end;
  }

  endWithoutBody() {
    return this.res.endWithoutBody;
  }

  tryEnd() {
    return this.res.tryEnd;
  }

  close() {
    return this.res.close;
  }

  getWriteOffset() {
    return this.res.getWriteOffset;
  }

  onWritable() {
    return this.res.onWritable;
  }

  onAborted() {
    return this.res.onAborted;
  }

  onData() {
    return this.res.onData;
  }

  getRemoteAddress() {
    return this.res.getRemoteAddress;
  }

  getRemoteAddressAsText() {
    return this.res.getRemoteAddressAsText;
  }

  getProxiedRemoteAddress() {
    return this.res.getProxiedRemoteAddress;
  }

  getProxiedRemoteAddressAsText() {
    return this.res.getProxiedRemoteAddressAsText;
  }

  cork() {
    return this.res.cork;
  }

  upgrade() {
    return this.res.upgrade;
  }

  json<T>(data: T) {
    return this.res
      .writeHeader("content-type", "application/json")
      .end(JSON.stringify(data));
  }
}
