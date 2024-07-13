import { ReadStream } from "fs";
import { HttpResponse } from "uWebSockets.js";
import { Request } from "./handler/Request";
import { Response } from "./handler/Response";

export const notFoundFn = (_req: Request, res: Response) => {
  res.uWebSocketsRes.writeStatus("404").end("Not Found");
};

export const toArrayBuffer = (buffer: ArrayBufferView): ArrayBuffer => {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
};

export const onAbortedOrFinishedResponse = (
  res: HttpResponse,
  readStream: NodeJS.ReadableStream
): void => {
  let openStreams = 0;

  if (res.id == -1) {
    console.log(
      "ERROR! onAbortedOrFinishedResponse called twice for the same res!"
    );
  } else {
    console.log("Stream was closed, openStreams: " + --openStreams);
    console.timeEnd(res.id);
    readStream.unpipe();
  }

  res.id = -1;
};

export const pipeStreamOverResponse = (
  res: HttpResponse,
  readStream: ReadStream,
  totalSize: number
) => {
  readStream
    .on("data", (chunk: ArrayBufferView) => {
      const ab = toArrayBuffer(chunk);
      let lastOffset = res.getWriteOffset();
      let [ok, done] = res.tryEnd(ab, totalSize);

      if (done) {
        onAbortedOrFinishedResponse(res, readStream);
      } else if (!ok) {
        readStream.pause();

        res.ab = ab;
        res.abOffset = lastOffset;

        res.onWritable((offset) => {
          let [ok, done] = res.tryEnd(
            res.ab.slice(offset - res.abOffset),
            totalSize
          );
          if (done) {
            onAbortedOrFinishedResponse(res, readStream);
          } else if (ok) {
            readStream.resume();
          }

          return ok;
        });
      }
    })
    .on("error", () => {
      console.log(
        "Unhandled read error from Node.js, you need to handle this!"
      );
    });

  res.onAborted(() => {
    onAbortedOrFinishedResponse(res, readStream);
  });
};
