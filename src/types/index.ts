import { Request } from "../handler/Request";
import { Response } from "../handler/Response";

export type RequestHandler = (
  req: Request,
  res: Response,
  next?: VoidFunction
) => void;

export type ErrorHandler = (err: any, req: Request, res: Response) => void;

export interface Routes {
  pattern: RegExp;
  method: HttpMethod;
  handler: RequestHandler[];
  path: string;
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
