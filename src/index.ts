import merge from "lodash/merge";
import { parse } from "regexparam";
import uws, { AppOptions } from "uWebSockets.js";
import { bootstrapRequestAndResponse } from "./http/bootstrap";
import { body, getUploadedFile, headers, params, query } from "./http/req";
import {
  ErrorHandler,
  HttpContentType,
  HttpMethod,
  ICustomRequest,
  ICustomResponse,
  IServerBootstrapOptions,
  RequestHandler,
  Route,
} from "./types";

class Yume {
  private serverOptions: AppOptions = {};
  private methodConfig: IServerBootstrapOptions = {
    requestOptions: {
      body: false,
      getUploadedFile: false,
      headers: false,
      params: false,
      query: false,
    },
    responseOptions: {},
  };

  private routes: Route[] = [];
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
    this.useRouterAdapter = this.useRouterAdapter.bind(this);
    this.use = this.use.bind(this);
    this.get = this.get.bind(this);
    this.head = this.head.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.delete = this.delete.bind(this);
    this.connect = this.connect.bind(this);
    this.options = this.options.bind(this);
    this.trace = this.trace.bind(this);
    this.patch = this.patch.bind(this);
    this.notFound = this.notFound.bind(this);
    this.errHandler = this.errHandler.bind(this);
    this.setServerOptions = this.setServerOptions.bind(this);
    this.configServer = this.configServer.bind(this);
    this.listen = this.listen.bind(this);
  }

  private setRoute(
    method: HttpMethod,
    path: string,
    ...handlers: RequestHandler[]
  ) {
    this.routes.push({
      pattern: parse(path).pattern,
      method: method.toLowerCase(),
      handlers,
    });
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
    handlers: RequestHandler[]
  ) {
    let index = 0;

    const runNextHandler = () => {
      if (index < handlers.length) {
        const currentHandler = handlers[index++];
        currentHandler(req, res, runNextHandler);
      }
    };

    runNextHandler();
  }

  private matchRoute(
    method: HttpMethod,
    pathname: string
  ): RequestHandler[] | undefined {
    for (const route of this.routes) {
      if (route.method === method && route.pattern.test(pathname)) {
        return route.handlers;
      }
    }
  }

  private requestHandler(res: ICustomResponse, req: ICustomRequest) {
    const url = req.getUrl();
    const method = req.getMethod() as HttpMethod;

    bootstrapRequestAndResponse(req, res, this.methodConfig);

    this.applyMiddleware(req, res, () => {
      const handler = this.matchRoute(method, url);

      if (handler) {
        this.processRequest(req, res, handler);
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

  public configServer(options: IServerBootstrapOptions) {
    this.methodConfig = merge(this.methodConfig, options);
  }

  public listen(port: number, cb: VoidFunction) {
    const app = uws.App(this.serverOptions);
    app.any("/*", this.requestHandler);
    app.listen(port, cb);
  }
}

export {
  ErrorHandler,
  HttpContentType,
  HttpMethod,
  ICustomRequest,
  ICustomResponse,
  IServerBootstrapOptions,
  RequestHandler,
  Route,
  Yume,
  body,
  getUploadedFile,
  headers,
  params,
  query,
};
