import { Request } from "./handler/Request";
import { Response } from "./handler/Response";

export type IRequestHandler = (
  req: Request,
  res: Response,
  next?: VoidFunction
) => void;

export interface IRoute {
  regExp: RegExp;
  path: string;
  handler: IRequestHandler[];
  method: HttpMethod;
  keys: string[];
}

export type HttpMethod =
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

export type IErrorHandler = (err: any, req: Request, res: Response) => void;

export type HttpContentType =
  | "application/x-www-form-urlencoded"
  | "application/json"
  | string;
