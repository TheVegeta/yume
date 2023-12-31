import {
  HttpRequest,
  HttpResponse,
  RecognizedString,
  us_socket_context_t,
} from "uWebSockets.js";

export class Response {
  constructor(private _req: HttpRequest, private res: HttpResponse) {}

  private statusCode: string = "200";

  pause() {
    return this.res.pause();
  }

  resume() {
    return this.res.resume();
  }

  writeStatus(status: number) {
    this.statusCode = status.toString();
    return this;
  }

  writeHeader(key: RecognizedString, value: RecognizedString) {
    return this.res.writeHeader(key, value);
  }

  write(chunk: RecognizedString) {
    return this.res.write(chunk);
  }

  end(
    body?: RecognizedString | undefined,
    closeConnection?: boolean | undefined
  ) {
    return this.res.writeStatus(this.statusCode).end(body, closeConnection);
  }

  endWithoutBody(
    reportedContentLength?: number | undefined,
    closeConnection?: boolean | undefined
  ) {
    return this.res.endWithoutBody(reportedContentLength, closeConnection);
  }

  tryEnd(fullBodyOrChunk: RecognizedString, totalSize: number) {
    return this.res.tryEnd(fullBodyOrChunk, totalSize);
  }

  close() {
    return this.res.close();
  }

  getWriteOffset() {
    return this.res.getWriteOffset();
  }

  onWritable(handler: (offset: number) => boolean) {
    return this.res.onWritable(handler);
  }

  onAborted(handler: () => void) {
    return this.res.onAborted(handler);
  }

  onData(handler: (chunk: ArrayBuffer, isLast: boolean) => void) {
    return this.res.onData(handler);
  }

  getRemoteAddress() {
    return this.res.getRemoteAddress();
  }

  getRemoteAddressAsText() {
    return this.res.getRemoteAddressAsText();
  }

  getProxiedRemoteAddress() {
    return this.res.getProxiedRemoteAddress();
  }

  getProxiedRemoteAddressAsText() {
    return this.res.getProxiedRemoteAddressAsText();
  }

  cork(cb: () => void) {
    return this.res.cork(cb);
  }

  status(status: number) {
    this.statusCode = status.toString();
    return this;
  }

  upgrade<UserData>(
    userData: UserData,
    secWebSocketKey: RecognizedString,
    secWebSocketProtocol: RecognizedString,
    secWebSocketExtensions: RecognizedString,
    context: us_socket_context_t
  ) {
    return this.res.upgrade(
      userData,
      secWebSocketKey,
      secWebSocketProtocol,
      secWebSocketExtensions,
      context
    );
  }

  json<T>(data: T) {
    return this.res
      .writeStatus(this.statusCode)
      .writeHeader("content-type", "application/json")
      .end(JSON.stringify(data));
  }
}
