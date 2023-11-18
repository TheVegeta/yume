import { ParsedUrlQuery } from "querystring";
import { HttpRequest, HttpResponse } from "uWebSockets.js";

export interface ICustomRequest<Params = undefined | ParsedUrlQuery>
  extends HttpRequest {
  params?: Params;
}
export interface ICustomResponse extends HttpResponse {}

export type RequestHandler = (
  req: ICustomRequest,
  res: ICustomResponse,
  next?: VoidFunction
) => void;

export type ErrorHandler = (
  err: Error,
  req: ICustomRequest,
  res: ICustomResponse
) => void;

export interface Route {
  method: string;
  path: string;
  handlers: RequestHandler[];
}

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD"
  | "CONNECT"
  | "TRACE";
