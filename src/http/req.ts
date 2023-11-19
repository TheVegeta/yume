import url from "node:url";
import { HttpContentType, ICustomRequest, ICustomResponse } from "../types";
import { handleArrayBuffer, voidFunction } from "../utils";

export const headers = <T>(req: ICustomRequest): T | null => {
  try {
    const obj: any = {};

    req.forEach((k, v) => {
      obj[k] = v;
    });

    return obj;
  } catch (err) {
    return null;
  }
};

export const params = <T>(req: ICustomRequest): T | null => {
  try {
    return JSON.parse(req._internalReqParams || "{}") as T | null;
  } catch (err) {
    return null;
  }
};

export const query = <T>(req: ICustomRequest): T | null => {
  try {
    const { query } = url.parse(`?${req.getQuery()}`, true);
    return (query as T) || null;
  } catch (err) {
    return null;
  }
};

export const body = async <T>(
  req: ICustomRequest,
  res: ICustomResponse
): Promise<T | null> => {
  return await new Promise(async (resolve) => {
    try {
      const reqType = req.getHeader("content-type") as HttpContentType;

      res
        .onData((data) => {
          const response = handleArrayBuffer(data);

          if (reqType === "application/json") {
            resolve(JSON.parse(response) as T);
          } else if (reqType === "application/x-www-form-urlencoded") {
            const { query } = url.parse(`?${response}`, true);
            resolve(query as T);
          } else {
            console.error("Unsupported content type: " + reqType);
          }
        })
        .onAborted(voidFunction);
    } catch (err) {
      resolve(null);
    }
  });
};
