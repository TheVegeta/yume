import { parse } from "regexparam";
import { HttpRequest, HttpResponse } from "uWebSockets.js";
import {
  ErrorHandler,
  HttpMethod,
  MiddlewareHandler,
  RequestHandler,
  Routes,
} from "../types";
import { Request } from "./Request";
import { Response } from "./Response";

export class RouteHandler {
  private routes: Routes[] = [];

  private errorHandler: ErrorHandler | undefined;
  private notFoundHandler: RequestHandler | undefined;

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

    const upRequest = new Request(req, res, handler);
    const upResponse = new Response(res);

    try {
      this.applyMiddleware(upRequest, upResponse, () => {
        if (handler) {
          this.applyHandler(upRequest, upResponse, handler.handler);
        } else {
          if (this.notFoundHandler) {
            this.notFoundHandler(upRequest, upResponse);
          } else {
            upResponse.writeStatus(404).end("Not Found");
          }
        }
      });
    } catch (err) {
      if (this.errorHandler) {
        this.errorHandler(err, upRequest, upResponse);
      } else {
        upResponse.writeStatus(500).end("Err");
      }
    }
  }
}
