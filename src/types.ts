import { HttpRequest, HttpResponse, MultipartField } from "uWebSockets.js";

export interface ICustomRequest extends HttpRequest {
  _internalReqParams?: string;
  headers?: <T>(req: ICustomRequest) => T | null;
  params?: <T>(req: ICustomRequest) => T | null;
  query?: <T>(req: ICustomRequest) => T | null;
  body?: <T>(req: ICustomRequest, res: ICustomResponse) => Promise<T | null>;
  getUploadedFile?: (
    req: ICustomRequest,
    res: ICustomResponse
  ) => Promise<MultipartField[] | undefined>;
}

export interface ICustomResponse extends HttpResponse {}

export type Route = {
  pattern: RegExp;
  method: string;
  handlers: RequestHandler[];
};

export interface IServerBootstrapOptions {
  requestOptions:
    | boolean
    | {
        headers: boolean;
        params: boolean;
        query: boolean;
        body: boolean;
        getUploadedFile: boolean;
      };
  responseOptions: boolean | {};
}

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
