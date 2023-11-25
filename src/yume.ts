import { App } from "uWebSockets.js";
import { RouteHandler } from "./handler/RouteHandler";
import { RequestHandler } from "./types";

class Yume extends RouteHandler {
  constructor() {
    super();
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

  public listen(port: number, cb: VoidFunction) {
    super.bootstrap();

    const app = App();

    app.any("/*", (req, res) => {
      super.processRequest(res, req);
    });

    app.listen(port, cb);
  }
}
