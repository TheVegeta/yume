import { HttpRequest, HttpResponse } from "uWebSockets.js";

export interface ICustomRequest extends HttpRequest {
  // headers: <T>() => T | null;
  // params: <T>() => T | null;
  // query: <T>() => T | null;
  // body: <T>() => Promise<T | null>;
  // getUploadedFile: Promise<() => Promise<MultipartField[] | undefined>>;
}

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

export type HttpContentType =
  | "application/x-www-form-urlencoded"
  | "application/json";
