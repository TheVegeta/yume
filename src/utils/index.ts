import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { body, getUploadedFile, headers, params, query } from "../handler/Req";
import { ICustomRequest, ICustomResponse } from "../types";

export const voidFunction = () => {};

export const handleArrayBuffer = (message: ArrayBuffer | string) => {
  if (message instanceof ArrayBuffer) {
    const decoder = new TextDecoder();
    return decoder.decode(message);
  }
  return message;
};

export const bootstrapReqRes = (
  req: HttpRequest,
  res: HttpResponse
): { upReq: ICustomRequest; upRes: ICustomResponse } => {
  let upReq = {
    headers: headers(req),
    params: params(req),
    query: query(req),
    body: body(req, res),
    getUploadedFile: getUploadedFile(req, res),
  };

  return {
    upReq: Object.assign(req, upReq) as unknown as ICustomRequest,
    upRes: res as unknown as ICustomResponse,
  };
};
