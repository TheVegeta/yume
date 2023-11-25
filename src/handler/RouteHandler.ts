import _ from "lodash";
import { parse } from "regexparam";
import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { HttpMethod, RequestHandler, Routes } from "../types";

export class RouteHandler {
  private routes: Routes[] = [];

  private middleware: RequestHandler[] = [];

  constructor() {}

  public use(handler: RequestHandler) {
    this.middleware.push(handler);
  }

  public set(method: HttpMethod, path: string, ...handler: RequestHandler[]) {
    this.routes.push({ handler, method, pattern: parse(path).pattern });
  }

  private applyMiddleware(
    req: HttpRequest,
    res: HttpResponse,
    done: VoidFunction
  ) {
    if (this.middleware.length === 0) {
      done();
    } else {
      for (let i = 0; i < this.middleware.length; i++) {
        const currentMiddleware = this.middleware[i];

        currentMiddleware(req, res, () => {
          if (i === this.middleware.length - 1) {
            done();
          }
        });
      }
    }
  }

  private applyHandler(
    req: HttpRequest,
    res: HttpResponse,
    handler: RequestHandler[]
  ) {
    for (let i = 0; i < handler.length; i++) {
      const currentHandler = handler[i];
      currentHandler(req, res);
    }
  }

  private matchRoute(
    path: string,
    method: HttpMethod
  ): RequestHandler[] | undefined {
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].method === method || this.routes[i].method === "all") {
        if (this.routes[i].pattern.test(path)) {
          return this.routes[i].handler;
        }
      }
    }
  }

  public processRequest(req: HttpRequest, res: HttpResponse) {
    const url = req.getUrl();
    const method = req.getMethod() as HttpMethod;

    this.applyMiddleware(req, res, () => {
      const handler = this.matchRoute(url, method);

      if (handler) {
        this.applyHandler(req, res, handler);
      } else {
        res.end("Not Found");
      }
    });
  }

  private sortRoute() {
    this.routes = _.sortBy(this.routes, (_) => (_.method === "all" ? 1 : 0));
  }

  public bootstrap() {
    this.sortRoute();
  }
}
