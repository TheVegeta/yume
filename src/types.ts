import { Request } from "./handler/Request";
import { Response } from "./handler/Response";

export interface IRoute {
  regExp: RegExp;
  path: string;
  handler: IRequestHandler[];
  method: HttpMethod;
  keys: string[];
}

export type IRequestHandler = (
  req: Request,
  res: Response,
  next?: VoidFunction
) => void;

export type IMiddlewareHandler = (
  req: Request,
  res: Response,
  next: VoidFunction
) => void;

export type HttpMethod =
  | "get"
  | "head"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "connect"
  | "trace"
  | "all";

export type IErrorHandler = (err: any, req: Request, res: Response) => void;

export type HttpContentType =
  | "application/x-www-form-urlencoded"
  | "application/json"
  | string;
