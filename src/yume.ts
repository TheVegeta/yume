import { App, RecognizedString, WebSocketBehavior } from "uWebSockets.js";
import { RouteHandler } from "./handler/RouteHandler";
import { ErrorHandler, RequestHandler } from "./types";

class Yume extends RouteHandler {
  private app;

  constructor() {
    super();
    this.app = App();
  }

  public get(path: string, ...handler: RequestHandler[]) {
    super.set("get", path, ...handler);
  }

  public post(path: string, ...handler: RequestHandler[]) {
    super.set("post", path, ...handler);
  }

  public put(path: string, ...handler: RequestHandler[]) {
    super.set("put", path, ...handler);
  }

  public patch(path: string, ...handler: RequestHandler[]) {
    super.set("patch", path, ...handler);
  }

  public del(path: string, ...handler: RequestHandler[]) {
    super.set("delete", path, ...handler);
  }

  public options(path: string, ...handler: RequestHandler[]) {
    super.set("options", path, ...handler);
  }

  public head(path: string, ...handler: RequestHandler[]) {
    super.set("head", path, ...handler);
  }

  public connect(path: string, ...handler: RequestHandler[]) {
    super.set("connect", path, ...handler);
  }

  public trace(path: string, ...handler: RequestHandler[]) {
    super.set("trace", path, ...handler);
  }

  public all(path: string, ...handler: RequestHandler[]) {
    super.set("all", path, ...handler);
  }

  public ws<T>(pattern: RecognizedString, behavior: WebSocketBehavior<T>) {
    this.app.ws(pattern, behavior);
  }

  public error(cb: ErrorHandler) {
    super.error(cb);
  }

  public notFound(cb: RequestHandler) {
    super.notFound(cb);
  }

  public listen(port: number, cb: VoidFunction) {
    this.app.any("/*", (req, res) => super.processRequest(res, req));
    this.app.listen(port, cb);
  }
}

export { Yume };
