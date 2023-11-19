import {
  ICustomRequest,
  ICustomResponse,
  IServerBootstrapOptions,
} from "../types";
import { body, getUploadedFile, headers, params, query } from "./req";

export const bootstrapRequestAndResponse = (
  req: ICustomRequest,
  res: ICustomResponse,
  config: IServerBootstrapOptions
) => {
  if (typeof config.requestOptions === "boolean") {
    if (config.requestOptions === true) {
      req.headers = headers;
      req.params = params;
      req.query = query;
      req.body = body;
      res.getUploadedFile = getUploadedFile;
    }
  } else {
    if (config.requestOptions.headers === true) {
      req.headers = headers;
    }

    if (config.requestOptions.params === true) {
      req.params = params;
    }

    if (config.requestOptions.query === true) {
      req.query = query;
    }

    if (config.requestOptions.body === true) {
      req.body = body;
    }

    if (config.requestOptions.getUploadedFile === true) {
      res.getUploadedFile = getUploadedFile;
    }
  }
};
