import { parse } from "regexparam";
import { HttpRequest, HttpResponse } from "uWebSockets.js";
import {
  ErrorHandler,
  HttpMethod,
  MiddlewareHandler,
  RequestHandler,
  Routes,
} from "../types";
import { errHandlerFn, notFoundFn } from "../utils";
import { Request } from "./Request";
import { Response } from "./Response";

export class RouteHandler {
  private routes: Routes[] = [];

  private errorHandler: ErrorHandler = errHandlerFn;
  private notFoundHandler: RequestHandler = notFoundFn;

  private middleware: RequestHandler[] = [];

  constructor() {}

  public use(handler: MiddlewareHandler) {
    this.middleware.push(handler);
  }

  public set(method: HttpMethod, path: string, ...handler: RequestHandler[]) {
    this.routes.push({ handler, method, pattern: parse(path).pattern, path });
  }

  public error(cb: ErrorHandler) {
    this.errorHandler = cb;
  }

  public notFound(cb: RequestHandler) {
    this.notFoundHandler = cb;
  }

  private applyMiddleware(req: Request, res: Response, done: VoidFunction) {
    if (this.middleware.length === 0) {
      done();
    } else {
      for (let i = 0; i < this.middleware.length; i++) {
        this.middleware[i](req, res, () => {
          if (i === this.middleware.length - 1) {
            done();
          }
        });
      }
    }
  }

  private applyHandler(req: Request, res: Response, handler: RequestHandler[]) {
    for (let i = 0; i < handler.length; i++) {
      handler[i](req, res);
    }
  }

  private matchRoute(path: string, method: HttpMethod): Routes | undefined {
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].method === method || this.routes[i].method === "all") {
        if (this.routes[i].pattern.test(path)) {
          return this.routes[i];
        }
      }
    }
  }

  public processRequest(req: HttpRequest, res: HttpResponse) {
    const url = req.getUrl();
    const method = req.getMethod() as HttpMethod;

    const handler = this.matchRoute(url, method);

    const request = new Request(req, res, handler);
    const response = new Response(res);

    try {
      this.applyMiddleware(request, response, () => {
        if (handler) {
          this.applyHandler(request, response, handler.handler);
        } else {
          this.notFoundHandler(request, response);
        }
      });
    } catch (err) {
      this.errorHandler(err, request, response);
    }
  }
}
