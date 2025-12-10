import { ReadStream } from "fs";
import { HttpResponse } from "uWebSockets.js";
import { Request } from "./handler/Request";
import { Response } from "./handler/Response";

export const notFoundFn = (_req: Request, res: Response) => {
  res.uWebSocketsRes.writeStatus("404").end("Not Found");
};

export const toArrayBuffer = (buffer: ArrayBufferView): ArrayBuffer => {
  const bytes = new Uint8Array(buffer.byteLength);
  bytes.set(
    new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  );
  return bytes.buffer;
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
    .on("data", (chunk: Buffer | string) => {
      const bufferChunk =
        typeof chunk === "string" ? Buffer.from(chunk) : chunk;
      const ab = toArrayBuffer(bufferChunk);
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
    .on("error", (err) => {
      console.error("Unhandled read error from Node.js:", err);
    });

  res.onAborted(() => {
    onAbortedOrFinishedResponse(res, readStream);
  });
};
