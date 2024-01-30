import { Request } from "./handler/Request";
import { Response } from "./handler/Response";

export const notFoundFn = (_req: Request, res: Response) => {
  res.status(404).end("Not Found");
};

export const errHandlerFn = (_err: any, _req: Request, res: Response) => {
  res.status(500).end("Error");
};

export const handleArrayBuffer = (message: ArrayBuffer | string) => {
  if (message instanceof ArrayBuffer) return new TextDecoder().decode(message);

  return message;
};

export const voidFunction = () => {};

export const exec = (
  path: string,
  pattern: RegExp | undefined,
  keys: string[]
) => {
  if (typeof pattern === "undefined") return {};

  let i = 0;
  const out: Record<string, string | null> = {};

  let matches = pattern.exec(path);

  while (i < keys.length) {
    out[keys[i]] = (matches && matches[++i]) || null;
  }

  return out;
};
