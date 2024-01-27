import {
  App,
  AppOptions,
  RecognizedString,
  WebSocketBehavior,
} from "uWebSockets.js";
import { RouteHandler } from "./handler/RouteHandler";
import { IErrorHandler, IRequestHandler } from "./types";

export class Yume extends RouteHandler {
  private app;

  constructor(options: AppOptions = {}) {
    super();
    this.app = App(options);
  }

  public get(path: string, ...handler: IRequestHandler[]) {
    super.set("get", path, ...handler);
  }

  public post(path: string, ...handler: IRequestHandler[]) {
    super.set("post", path, ...handler);
  }

  public put(path: string, ...handler: IRequestHandler[]) {
    super.set("put", path, ...handler);
  }

  public patch(path: string, ...handler: IRequestHandler[]) {
    super.set("patch", path, ...handler);
  }

  public del(path: string, ...handler: IRequestHandler[]) {
    super.set("delete", path, ...handler);
  }

  public options(path: string, ...handler: IRequestHandler[]) {
    super.set("options", path, ...handler);
  }

  public head(path: string, ...handler: IRequestHandler[]) {
    super.set("head", path, ...handler);
  }

  public connect(path: string, ...handler: IRequestHandler[]) {
    super.set("connect", path, ...handler);
  }

  public trace(path: string, ...handler: IRequestHandler[]) {
    super.set("trace", path, ...handler);
  }

  public all(path: string, ...handler: IRequestHandler[]) {
    super.set("all", path, ...handler);
  }

  public use(middleware: IRequestHandler) {
    super.use(middleware);
  }

  public error(cb: IErrorHandler) {
    super.error(cb);
  }

  public notFound(cb: IRequestHandler) {
    super.notFound(cb);
  }

  public ws<T>(pattern: RecognizedString, behavior: WebSocketBehavior<T>) {
    this.app.ws(pattern, behavior);
  }

  public listen(port: number, cb: VoidFunction) {
    this.app.any("/*", (res, req) => super.processRoute(req, res));
    this.app.listen(port, cb);
  }
}
