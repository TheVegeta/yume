import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { Req } from "./handler/Req";
import { Res } from "./handler/Res";

export type IErrorFn = (
  err: Error,
  req: HttpRequest,
  res: HttpResponse
) => void;

export type INotFoundFn = (req: HttpRequest, res: HttpResponse) => void;

export type IHandlerFn = (req: Req, res: Res, next?: VoidFunction) => void;

export type IMiddlewareHandler = (
  req: Req,
  res: Res,
  next: VoidFunction
) => void;

export interface IRoute {
  path: string;
  regExp: RegExp;
  method: HttpMethod;
  keys: string[];
  handler: IHandlerFn[];
}

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
