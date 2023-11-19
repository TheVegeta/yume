import { HttpRequest, HttpResponse } from "uWebSockets.js";

export interface ICustomRequest extends HttpRequest {
  _internalReqParams?: string;
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

export type HttpContentType =
  | "application/x-www-form-urlencoded"
  | "application/json";
