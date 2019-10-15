import { existsSync, statSync, createReadStream } from "fs";
import { parse } from "url";
import { RequestAction, JsonResult, BypassResult } from "@furystack/http-api";

export const StreamVideoAction: RequestAction = async injector => {
  const req = injector.getRequest();
  const resp = injector.getResponse();
  const videoPath = parse(req.url || "?video=", true).query.video.toString();
  if (!videoPath || !existsSync(videoPath.toString())) {
    return JsonResult(
      {
        error: `Video '${videoPath}' does not exists!`
      },
      500
    );
  }

  const stat = statSync(videoPath);
  const fileSize = stat.size;
  const { range } = req.headers;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/h264"
    };
    resp.writeHead(206, head);
    file.pipe(resp);
    return BypassResult();
  }
  const head = {
    "Content-Length": fileSize,
    "Content-Type": "video/h264"
  };
  resp.writeHead(200, head);
  createReadStream(videoPath).pipe(resp);
  return BypassResult();
};
