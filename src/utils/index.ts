import { Request } from "../handler/Request";
import { Response } from "../handler/Response";

export const voidFunction = () => {};

export const handleArrayBuffer = (message: ArrayBuffer | string) => {
  if (message instanceof ArrayBuffer) {
    return new TextDecoder().decode(message);
  }
  return message;
};

export const notFoundFn = (req: Request, res: Response) =>
  res.writeStatus(404).end("Not Found");

export const errHandlerFn = (err: any, req: Request, res: Response) =>
  res.writeStatus(500).end("Err");
