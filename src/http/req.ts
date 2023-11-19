import url from "node:url";
import { MultipartField, getParts } from "uWebSockets.js";
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

export const getUploadedFile = async (
  req: ICustomRequest,
  res: ICustomResponse
): Promise<MultipartField[] | undefined> => {
  const header = req.getHeader("content-type");

  return await new Promise((resolve) => {
    let buffer = Buffer.from("");

    res
      .onData((ab, isLast) => {
        const chunk = Buffer.from(ab);
        buffer = Buffer.concat([buffer, chunk]);

        if (isLast) {
          const data = getParts(buffer, header);

          resolve(data);
        }
      })
      .onAborted(voidFunction);
  });
};
