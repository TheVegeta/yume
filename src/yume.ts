import _ from "lodash";
import { parse } from "regexparam";
import { App, HttpRequest, HttpResponse } from "uWebSockets.js";

interface ICustomRequest extends HttpRequest {}
interface ICustomResponse extends HttpResponse {}

type RequestHandler = (
  req: ICustomRequest,
  res: ICustomResponse,
  next?: VoidFunction
) => void;

interface Routes {
  pattern: RegExp;
  method: HttpMethod;
  handler: RequestHandler[];
}

type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head"
  | "connect"
  | "trace"
  | "all";

class RouteHandler {
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
