import { parse } from "regexparam";
import { App, AppOptions, HttpRequest, HttpResponse } from "uWebSockets.js";
import { Request } from "./handler/Request";
import { Response } from "./handler/Response";
import { HttpMethod, IRequestHandler, IRoute } from "./types";
import { notFoundFn } from "./utils";

export class Yume {
  private app;
  private routes: IRoute[] = [];
  private middlewares: IRequestHandler[] = [];
  private notFoundHandler: IRequestHandler = notFoundFn;

  constructor(options: AppOptions = {}) {
    this.app = App(options);
  }

  private set(path: string, method: HttpMethod, ...handler: IRequestHandler[]) {
    const { keys, pattern } = parse(path);
    this.routes.push({ regExp: pattern, keys, handler, method, path });
  }

  public use(middleware: IRequestHandler) {
    this.middlewares.push(middleware);
  }

  public get(path: string, ...handler: IRequestHandler[]) {
    this.set(path, "get", ...handler);
  }

  public head(path: string, ...handler: IRequestHandler[]) {
    this.set(path, "head", ...handler);
  }

  public post(path: string, ...handler: IRequestHandler[]) {
    this.set(path, "post", ...handler);
  }

  public put(path: string, ...handler: IRequestHandler[]) {
    this.set(path, "put", ...handler);
  }

  public patch(path: string, ...handler: IRequestHandler[]) {
    this.set(path, "patch", ...handler);
  }

  public del(path: string, ...handler: IRequestHandler[]) {
    this.set(path, "delete", ...handler);
  }

  public options(path: string, ...handler: IRequestHandler[]) {
    this.set(path, "options", ...handler);
  }

  public connect(path: string, ...handler: IRequestHandler[]) {
    this.set(path, "connect", ...handler);
  }

  public trace(path: string, ...handler: IRequestHandler[]) {
    this.set(path, "trace", ...handler);
  }

  public all(path: string, ...handler: IRequestHandler[]) {
    this.set(path, "all", ...handler);
  }

  private async applyMiddleware(
    req: Request,
    res: Response,
    done: VoidFunction
  ) {
    let i = 0;
    const next = () => {
      if (i < this.middlewares.length) {
        this.middlewares[i++](req, res, next);
      } else {
        done();
      }
    };
    next();
  }

  private applyHandler(
    req: Request,
    res: Response,
    handlers: IRequestHandler[]
  ) {
    let i = 0;
    const next = () => {
      if (i < handlers.length) {
        handlers[i++](req, res, next);
      }
    };
    next();
  }

  private processRoute(req: HttpRequest, res: HttpResponse) {
    const upReq = new Request(req, res);
    const upRes = new Response(req, res);

    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];

      const isMethodMatch =
        route.method === upReq.method || route.method === "all";

      upReq.setRegExp(route.regExp);
      upReq.setkeys(route.keys);

      if (isMethodMatch && route.regExp.test(upReq.url)) {
        this.applyMiddleware(upReq, upRes, () => {
          this.applyHandler(upReq, upRes, route.handler);
        });
        return;
      }
    }

    this.applyMiddleware(upReq, upRes, () => {
      this.notFoundHandler(upReq, upRes);
    });
  }

  public listen(port: number, cb: VoidFunction) {
    this.app.any("/*", (res, req) => this.processRoute(req, res));
    this.app.listen(port, cb);
  }
}
