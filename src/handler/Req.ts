import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { HttpMethod } from "../types";

export class Req {
  public method: HttpMethod;
  public url: string;

  constructor(req: HttpRequest, res: HttpResponse) {
    this.method = req.getMethod() as HttpMethod;
    this.url = req.getUrl();
  }
}
