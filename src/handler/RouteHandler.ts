import { parse } from "regexparam";
import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { HttpMethod, RequestHandler, Routes } from "../types";
import { Request } from "./Request";
import { Response } from "./Response";

export class RouteHandler {
  private routes: Routes[] = [];

  private middleware: RequestHandler[] = [];

  constructor() {}

  public use(handler: RequestHandler) {
    this.middleware.push(handler);
  }

  public set(method: HttpMethod, path: string, ...handler: RequestHandler[]) {
    this.routes.push({ handler, method, pattern: parse(path).pattern, path });
  }

  private applyMiddleware(req: Request, res: Response, done: VoidFunction) {
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

  private applyHandler(req: Request, res: Response, handler: RequestHandler[]) {
    for (let i = 0; i < handler.length; i++) {
      const currentHandler = handler[i];
      currentHandler(req, res);
    }
  }

  private matchPath(path: string, method: HttpMethod): string | undefined {
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].method === method || this.routes[i].method === "all") {
        if (this.routes[i].pattern.test(path)) {
          return this.routes[i].path;
        }
      }
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

    const upRequest = new Request(req, res, this.matchPath);
    const upResponse = new Response(req, res);

    this.applyMiddleware(upRequest, upResponse, () => {
      const handler = this.matchRoute(url, method);

      if (handler) {
        this.applyHandler(upRequest, upResponse, handler);
      } else {
        res.end("Not Found");
      }
    });
  }

  private sortRoute() {
    this.routes = this.routes.sort((_) => (_.method === "all" ? 1 : 0));
  }

  public bootstrap() {
    this.sortRoute();
  }
}
