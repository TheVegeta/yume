import * as url from "node:url";
import uws, { AppOptions } from "uWebSockets.js";
import {
  ErrorHandler,
  HttpMethod,
  ICustomRequest,
  ICustomResponse,
  RequestHandler,
  Route,
} from "./types";

class Yume {
  private serverOptions: AppOptions = {};

  private routes: Array<Route> = [];
  private middleware: RequestHandler[] = [];

  private notFoundFn: RequestHandler | undefined;
  private errHandlerFn: ErrorHandler | undefined;

  constructor() {
    this.setRoute = this.setRoute.bind(this);
    this.applyMiddleware = this.applyMiddleware.bind(this);
    this.runnotFoundFn = this.runnotFoundFn.bind(this);
    this.runerrHandlerFn = this.runerrHandlerFn.bind(this);
    this.processRequest = this.processRequest.bind(this);
    this.matchRoute = this.matchRoute.bind(this);
    this.requestHandler = this.requestHandler.bind(this);
  }

  private setRoute(
    method: HttpMethod,
    path: string,
    ...handlers: RequestHandler[]
  ) {
    this.routes.push({ handlers, method: method.toLowerCase(), path });
  }

  private applyMiddleware(
    req: ICustomRequest,
    res: ICustomResponse,
    done: () => void
  ): void {
    let index = 0;

    const next = () => {
      if (index < this.middleware.length) {
        const currentMiddleware = this.middleware[index++];
        index++;
        currentMiddleware(req, res, next);
      } else {
        done();
      }
    };
    next();
  }

  private runnotFoundFn(req: ICustomRequest, res: ICustomResponse) {
    if (this.notFoundFn) {
      this.notFoundFn(req, res);
    } else {
      res
        .writeStatus("400")
        .writeHeader("Content-Type", "text/plain")
        .end("Not Found");
    }
  }

  private runerrHandlerFn(
    err: Error | any,
    req: ICustomRequest,
    res: ICustomResponse
  ) {
    if (this.errHandlerFn) {
      this.errHandlerFn(err, req, res);
    } else {
      console.error("Unexpected Error:" + err);
      res
        .writeStatus("500")
        .writeHeader("Content-Type", "text/plain")
        .end("Internal Server Error");
    }
  }

  private processRequest(
    req: ICustomRequest,
    res: ICustomResponse,
    route: {
      route: Route;
      params: {
        [key: string]: string;
      };
    }
  ) {
    let index = 0;

    const runNextHandler = () => {
      if (index < route.route.handlers.length) {
        const currentHandler = route.route.handlers[index];
        index++;
        currentHandler(req, res, runNextHandler);
      }
    };

    runNextHandler();
  }

  private matchRoute(
    method: HttpMethod,
    pathname: string
  ):
    | {
        route: Route;
        params: {
          [key: string]: string;
        };
      }
    | undefined {
    for (const route of this.routes) {
      const routePathSegments = route.path.split("/");
      const requestPathSegments = (pathname || "").split("/");

      if (
        route.method === method &&
        routePathSegments.length === requestPathSegments.length
      ) {
        const params: { [key: string]: string } = {};

        const isMatch = routePathSegments.every((segment, index) => {
          if (segment.startsWith(":")) {
            const paramName = segment.slice(1);
            params[paramName] = requestPathSegments[index];
            return true;
          } else {
            return segment === requestPathSegments[index];
          }
        });

        if (isMatch) {
          return { route, params };
        }
      }
    }
  }

  private requestHandler(res: ICustomResponse, req: ICustomRequest) {
    const reqUrl = req.getUrl();
    const method = req.getMethod() as HttpMethod;
    const parsedUrl = url.parse(reqUrl || "", true);
    const { pathname } = parsedUrl;

    this.applyMiddleware(req, res, () => {
      const matchedResponse = this.matchRoute(method, pathname || "");

      if (matchedResponse) {
        req._internalReqParams = JSON.stringify(matchedResponse.params);
        this.processRequest(req, res, matchedResponse);
      } else {
        this.runnotFoundFn(req, res);
      }
    });
  }

  public useRouterAdapter(routerAdapter: (adapter: Yume) => void) {
    routerAdapter(this);
  }

  public use(...handlers: RequestHandler[]) {
    for (const handler of handlers) {
      this.middleware.push(handler);
    }
  }

  public get(path: string, ...handler: RequestHandler[]) {
    this.setRoute("GET", path, ...handler);
  }

  public head(path: string, ...handler: RequestHandler[]) {
    this.setRoute("HEAD", path, ...handler);
  }

  public post(path: string, ...handler: RequestHandler[]) {
    this.setRoute("POST", path, ...handler);
  }

  public put(path: string, ...handler: RequestHandler[]) {
    this.setRoute("PUT", path, ...handler);
  }

  public delete(path: string, ...handler: RequestHandler[]) {
    this.setRoute("DELETE", path, ...handler);
  }

  public connect(path: string, ...handler: RequestHandler[]) {
    this.setRoute("CONNECT", path, ...handler);
  }

  public options(path: string, ...handler: RequestHandler[]) {
    this.setRoute("OPTIONS", path, ...handler);
  }

  public trace(path: string, ...handler: RequestHandler[]) {
    this.setRoute("TRACE", path, ...handler);
  }

  public patch(path: string, ...handler: RequestHandler[]) {
    this.setRoute("PATCH", path, ...handler);
  }

  public notFound(handler: RequestHandler) {
    this.notFoundFn = handler;
  }

  public errHandler(handler: ErrorHandler) {
    this.errHandlerFn = handler;
  }

  public setServerOptions(options: AppOptions = {}) {
    this.serverOptions = options;
  }

  public listen(port: number, cb: VoidFunction) {
    const app = uws.App(this.serverOptions);

    app.any("/*", this.requestHandler);

    app.listen(port, cb);
  }
}

export { Yume };
