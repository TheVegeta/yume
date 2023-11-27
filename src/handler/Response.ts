import { HttpRequest, HttpResponse } from "uWebSockets.js";

export class Response {
  constructor(private req: HttpRequest, private res: HttpResponse) {}
}
