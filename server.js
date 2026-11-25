"use strict";
/**
 * 生日电子贺卡 v4 —— 媒体存储后端（主部署目标：阿里云轻量服务器）
 *
 * 纯 Node.js 内置模块（http / fs / path / crypto），零外部依赖。
 * 部署说明见同目录 README-deploy-server.md。
 *
 * 路由：
 *   GET  /            -> index.html（同目录）
 *   GET  /index.html  -> index.html
 *   GET  /health      -> {"status":"ok"}
 *   POST /api/media   -> multipart/form-data，字段名 file，限 10MB，
 *                        仅图片/音频，返回 {"url":"/m/<id>.<ext>"}
 *   GET  /m/<id>.<ext> -> 按扩展名返回正确 Content-Type 的文件
 *
 * 启动：PORT=3000 node server.js（默认端口 3000，监听 0.0.0.0）
 * 前端 STORE.endpoint 指向 https://suniancard.top/api/media（经 Nginx 反代）。
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
const MEDIA_DIR = path.join(ROOT, "data", "media");

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB（文件本身）
const MAX_BODY_BYTES = 11 * 1024 * 1024; // 含 multipart 开销的请求体上限

// 允许的扩展名 -> Content-Type（上传校验与回传共用同一张表）
const MIME_BY_EXT = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  ogg: "audio/ogg",
  aac: "audio/aac",
  flac: "audio/flac",
  webm: "audio/webm",
  mp4: "audio/mp4",
};

function log(msg) {
  console.log(new Date().toISOString() + " " + msg);
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendText(res, status, text) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(text),
  });
  res.end(text);
}

function extOf(filename) {
  const m = /\.([A-Za-z0-9]+)$/.exec(filename || "");
  return m ? m[1].toLowerCase() : "";
}

/**
 * 最小 multipart/form-data 解析（无外部依赖）。
 * 只取第一个 name="file" 的 part，返回 { filename, contentType, data: Buffer }。
 * 找不到返回 null；请求体超限返回 { tooLarge: true }。
 */
function parseMultipart(body, boundary) {
  const sep = Buffer.from("--" + boundary);
  let start = body.indexOf(sep);
  if (start === -1) { return null; }
  // 每个 part：--boundary\r\n headers \r\n\r\n data \r\n
  while (start !== -1) {
    let pos = start + sep.length;
    if (body[pos] === 0x2d && body[pos + 1] === 0x2d) { break; } // 结束分隔符 --
    if (body[pos] === 0x0d && body[pos + 1] === 0x0a) { pos += 2; }
    const headerEnd = body.indexOf("\r\n\r\n", pos);
    if (headerEnd === -1) { return null; }
    const headers = body.slice(pos, headerEnd).toString("latin1");
    const dataStart = headerEnd + 4;
    let next = body.indexOf(sep, dataStart);
    if (next === -1) { return null; }
    // 数据末尾的 \r\n 不属于文件内容
    let dataEnd = next;
    if (dataEnd >= 2 && body[dataEnd - 2] === 0x0d && body[dataEnd - 1] === 0x0a) {
      dataEnd -= 2;
    }
    const nameMatch = /name="([^"]*)"/.exec(headers);
    if (nameMatch && nameMatch[1] === "file") {
      const fileMatch = /filename="([^"]*)"/.exec(headers);
      const typeMatch = /Content-Type:\s*([^\r\n]+)/i.exec(headers);
      return {
        filename: fileMatch ? fileMatch[1] : "",
        contentType: typeMatch ? typeMatch[1].trim() : "",
        data: body.slice(dataStart, dataEnd),
      };
    }
    start = next;
  }
  return null;
}

function handleUpload(req, res) {
  const chunks = [];
  let total = 0;
  let aborted = false;
  req.on("data", (chunk) => {
    if (aborted) { return; }
    total += chunk.length;
    if (total > MAX_BODY_BYTES) {
      aborted = true;
      sendJson(res, 413, { error: "file too large (max 10MB)" });
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });
  req.on("end", () => {
    if (aborted) { return; }
    try {
      const ctype = req.headers["content-type"] || "";
      const bMatch = /boundary=(?:"([^"]+)"|([^;]+))/.exec(ctype);
      if (!bMatch) {
        sendJson(res, 400, { error: "expected multipart/form-data" });
        return;
      }
      const boundary = (bMatch[1] || bMatch[2]).trim();
      const body = Buffer.concat(chunks);
      const part = parseMultipart(body, boundary);
      if (!part || !part.data) {
        sendJson(res, 400, { error: "no file field" });
        return;
      }
      if (part.data.length === 0) {
        sendJson(res, 400, { error: "empty file" });
        return;
      }
      if (part.data.length > MAX_FILE_BYTES) {
        sendJson(res, 413, { error: "file too large (max 10MB)" });
        return;
      }
      const ext = extOf(part.filename);
      const declared = (part.contentType || "").toLowerCase();
      const typeOk = declared.indexOf("image/") === 0 || declared.indexOf("audio/") === 0;
      if (!ext || !MIME_BY_EXT[ext] || !typeOk) {
        sendJson(res, 400, { error: "only image/audio files are accepted" });
        return;
      }
      // 扩展名与声明类型大类一致（图片只能是图片扩展名，音频同理）
      const isImageExt = MIME_BY_EXT[ext].indexOf("image/") === 0;
      if ((declared.indexOf("image/") === 0) !== isImageExt) {
        sendJson(res, 400, { error: "file type mismatch" });
        return;
      }
      const id = crypto.randomBytes(16).toString("hex");
      const name = id + "." + ext;
      const dest = path.join(MEDIA_DIR, name);
      fs.writeFileSync(dest, part.data);
      log("saved " + name + " (" + part.data.length + " bytes, " + part.contentType + ")");
      sendJson(res, 200, { url: "/m/" + name });
    } catch (e) {
      log("upload error: " + (e && e.message));
      if (!res.writableEnded) { sendJson(res, 500, { error: "upload failed" }); }
    }
  });
  req.on("error", () => {
    if (!res.writableEnded) { sendJson(res, 500, { error: "upload failed" }); }
  });
}

function handleMediaGet(req, res, name) {
  // 只接受 <32位hex>.<白名单扩展名>，杜绝 ../ 穿越
  const m = /^([a-f0-9]{32})\.([a-z0-9]+)$/.exec(name || "");
  if (!m || !MIME_BY_EXT[m[2]]) {
    sendText(res, 404, "Not Found");
    return;
  }
  const file = path.join(MEDIA_DIR, m[1] + "." + m[2]);
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      sendText(res, 404, "Not Found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME_BY_EXT[m[2]],
      "Content-Length": st.size,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": "inline",
    });
    fs.createReadStream(file).pipe(res);
  });
}

function handleIndex(res) {
  const file = path.join(ROOT, "index.html");
  fs.readFile(file, (err, data) => {
    if (err) {
      sendText(res, 500, "index.html missing");
      return;
    }
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": data.length,
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  try {
    const u = new URL(req.url || "/", "http://127.0.0.1");
    const p = decodeURIComponent(u.pathname);
    if (req.method === "GET" && (p === "/" || p === "/index.html")) {
      handleIndex(res);
    } else if (req.method === "GET" && p === "/health") {
      sendJson(res, 200, { status: "ok" });
    } else if (req.method === "POST" && p === "/api/media") {
      handleUpload(req, res);
    } else if (req.method === "GET" && p.indexOf("/m/") === 0) {
      handleMediaGet(req, res, p.slice(3));
    } else {
      sendText(res, 404, "Not Found");
    }
  } catch (e) {
    log("request error: " + (e && e.message));
    if (!res.writableEnded) { sendText(res, 500, "Internal Error"); }
  }
});

fs.mkdirSync(MEDIA_DIR, { recursive: true });
server.listen(PORT, HOST, () => {
  log("ecard media server listening on " + HOST + ":" + PORT + " (media dir: " + MEDIA_DIR + ")");
});
