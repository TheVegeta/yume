import { IErrorFn, INotFoundFn } from "./types";

export const defaultErrorFn: IErrorFn = (err, req, res) => {
  res.writeStatus("500").end("Internal Server Error");
};

export const defaultNotFoundFn: INotFoundFn = (_req, res) => {
  res.writeStatus("404").end("Not Found");
};
