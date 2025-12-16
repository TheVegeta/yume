import noop from "lodash/noop";
import { parse } from "regexparam";
import { App, AppOptions, HttpRequest, HttpResponse } from "uWebSockets.js";
import { Req } from "./handler/Req";
import { Res } from "./handler/Res";
import {
  HttpMethod,
  IErrorFn,
  IHandlerFn,
  IMiddlewareHandler,
  INotFoundFn,
  IRoute,
} from "./types";
import { defaultErrorFn, defaultNotFoundFn } from "./utils";

class Yume {
  private app;
  private errFn;
  private notFoundHandler;

  private routes: IRoute[] = [];
  private middlewares: IMiddlewareHandler[] = [];

  constructor(
    options: AppOptions = {},
    errFn: IErrorFn = defaultErrorFn,
    notFoundHandler: INotFoundFn = defaultNotFoundFn
  ) {
    this.app = App(options);
    this.errFn = errFn;
    this.notFoundHandler = notFoundHandler;
  }

  public use(middleware: IMiddlewareHandler) {
    this.middlewares.push(middleware);
  }

  private set(path: string, method: HttpMethod, ...handler: IHandlerFn[]) {
    const { keys, pattern } = parse(path);
    this.routes.push({ regExp: pattern, keys, handler, method, path });
  }

  public get(path: string, ...handler: IHandlerFn[]) {
    this.set(path, "get", ...handler);
  }

  public head(path: string, ...handler: IHandlerFn[]) {
    this.set(path, "head", ...handler);
  }

  public post(path: string, ...handler: IHandlerFn[]) {
    this.set(path, "post", ...handler);
  }

  public put(path: string, ...handler: IHandlerFn[]) {
    this.set(path, "put", ...handler);
  }

  public patch(path: string, ...handler: IHandlerFn[]) {
    this.set(path, "patch", ...handler);
  }

  public del(path: string, ...handler: IHandlerFn[]) {
    this.set(path, "delete", ...handler);
  }

  public options(path: string, ...handler: IHandlerFn[]) {
    this.set(path, "options", ...handler);
  }

  public connect(path: string, ...handler: IHandlerFn[]) {
    this.set(path, "connect", ...handler);
  }

  public trace(path: string, ...handler: IHandlerFn[]) {
    this.set(path, "trace", ...handler);
  }

  public all(path: string, ...handler: IHandlerFn[]) {
    this.set(path, "all", ...handler);
  }

  private async applyMiddleware(req: Req, res: Res, done: VoidFunction) {
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

  private applyHandler(req: Req, res: Res, handlers: IHandlerFn[]) {
    let i = 0;

    const next = () => {
      if (i < handlers.length) {
        handlers[i++](req, res, next);
      }
    };

    next();
  }

  private processRoute(req: HttpRequest, res: HttpResponse) {
    const upReq = new Req(req, res);
    const upRes = new Res(req, res);

    try {
      for (let i = 0; i < this.routes.length; i++) {
        const route = this.routes[i];

        const { method, url } = upReq;

        const isMethodMatch = route.method === method || method === "all";

        if (isMethodMatch && route.regExp.test(url)) {
          this.applyMiddleware(upReq, upRes, () => {
            this.applyHandler(upReq, upRes, route.handler);
          });

          return;
        }
      }

      this.applyMiddleware(upReq, upRes, () => {
        this.notFoundHandler(req, res);
      });
    } catch (err) {
      this.errFn(err as Error, req, res);
    }
  }

  public listen(port: number, cb: VoidFunction = noop) {
    this.app.any("/*", (res, req) => this.processRoute(req, res));
    this.app.listen(port, cb);
  }
}

export { Yume };
