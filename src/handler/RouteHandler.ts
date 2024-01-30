import { parse } from "regexparam";
import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { HttpMethod, IErrorHandler, IRequestHandler, IRoute } from "../types";
import { errHandlerFn, notFoundFn } from "../utils";
import { Request } from "./Request";
import { Response } from "./Response";

export class RouteHandler {
  private routes: IRoute[] = [];
  private middlewares: IRequestHandler[] = [];

  private errorHandler: IErrorHandler = errHandlerFn;
  private notFoundHandler: IRequestHandler = notFoundFn;

  public set(method: HttpMethod, path: string, ...handler: IRequestHandler[]) {
    const { keys, pattern } = parse(path);
    this.routes.push({ handler, method, path, regExp: pattern, keys });
  }

  public use(middleware: IRequestHandler) {
    this.middlewares.push(middleware);
  }

  public error(cb: IErrorHandler) {
    this.errorHandler = cb;
  }

  public notFound(cb: IRequestHandler) {
    this.notFoundHandler = cb;
  }

  private findRoutes(path: string, method: HttpMethod): IRoute | undefined {
    for (const route of this.routes) {
      if (
        (route.method === method || route.method === "all") &&
        route.regExp.test(path)
      ) {
        return route;
      }
    }
  }

  private applyMiddleware(req: Request, res: Response, done: VoidFunction) {
    if (this.middlewares.length === 0) return done();

    for (let i = 0; i < this.middlewares.length; i++) {
      this.middlewares[i](req, res, () => {
        if (i === this.middlewares.length - 1) done();
      });
    }
  }

  private applyHandler(
    req: Request,
    res: Response,
    handlers: IRequestHandler[]
  ) {
    let index = 0;

    const next = () => {
      index++;
      if (index < handlers.length) {
        handlers[index](req, res, next);
      }
    };

    handlers[index](req, res, next);
  }

  public processRoute(request: HttpRequest, response: HttpResponse) {
    const req = new Request(request, response);
    const res = new Response(response);

    const route = this.findRoutes(req.url, req.method);

    if (route) req._setRegexparam(route.keys, route.regExp);

    try {
      this.applyMiddleware(req, res, () => {
        if (route) this.applyHandler(req, res, route.handler);
        else this.notFoundHandler(req, res);
      });
    } catch (err) {
      this.errorHandler(err, req, res);
    }
  }
}
