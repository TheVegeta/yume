import { HttpRequest, HttpResponse } from "uWebSockets.js";

export interface ICustomRequest extends HttpRequest {}
export interface ICustomResponse extends HttpResponse {}

export type RequestHandler = (
  req: ICustomRequest,
  res: ICustomResponse,
  next?: VoidFunction
) => void;

export interface Routes {
  pattern: RegExp;
  method: HttpMethod;
  handler: RequestHandler[];
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
