/**
 * 生日电子贺卡 v4 —— 媒体存储后端（备选方案：Cloudflare Worker + R2）
 *
 * 注意：这是备选。主部署目标是阿里云轻量服务器上的 server.js，
 * 只有轻量服务器那条路走不通时才用这一版。
 * 部署说明见同目录 README-deploy-r2.md。
 *
 * 需要在 Worker 上绑定一个 R2 bucket，绑定名 MEDIA_BUCKET，
 * 并设置公开访问（R2 公开域名或自定义域名），见 README。
 * 可选环境变量 PUBLIC_BASE：对外公开的 R2 访问域名，
 * 例如 https://pub-xxxxxxxx.r2.dev；不填则用 Worker 自身域名。
 *
 * 路由：
 *   POST /upload  -> multipart/form-data，字段名 file，限 10MB，
 *                    仅图片/音频，返回 {"url":"<公开地址>/m/<id>.<ext>"}
 *   GET  /m/:id    -> 从 R2 取文件，按扩展名返回正确 Content-Type
 *   GET  /         -> {"ok":true}
 */

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

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

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function extOf(filename) {
  const m = /\.([A-Za-z0-9]+)$/.exec(filename || "");
  return m ? m[1].toLowerCase() : "";
}

function randomId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function handleUpload(request, env, url) {
  let form;
  try {
    form = await request.formData();
  } catch (e) {
    return json(400, { error: "expected multipart/form-data" });
  }
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return json(400, { error: "no file field" });
  }
  if (file.size === 0) {
    return json(400, { error: "empty file" });
  }
  if (file.size > MAX_FILE_BYTES) {
    return json(413, { error: "file too large (max 10MB)" });
  }
  const ext = extOf(file.name);
  const declared = (file.type || "").toLowerCase();
  const typeOk = declared.startsWith("image/") || declared.startsWith("audio/");
  if (!ext || !MIME_BY_EXT[ext] || !typeOk) {
    return json(400, { error: "only image/audio files are accepted" });
  }
  const isImageExt = MIME_BY_EXT[ext].startsWith("image/");
  if (declared.startsWith("image/") !== isImageExt) {
    return json(400, { error: "file type mismatch" });
  }
  const key = "m/" + randomId() + "." + ext;
  const buf = await file.arrayBuffer();
  await env.MEDIA_BUCKET.put(key, buf, {
    httpMetadata: { contentType: MIME_BY_EXT[ext] },
  });
  const base = (env.PUBLIC_BASE || url.origin).replace(/\/$/, "");
  return json(200, { url: base + "/" + key });
}

async function handleMediaGet(env, name) {
  const m = /^([a-f0-9]{32})\.([a-z0-9]+)$/.exec(name || "");
  if (!m || !MIME_BY_EXT[m[2]]) {
    return new Response("Not Found", { status: 404 });
  }
  const obj = await env.MEDIA_BUCKET.get("m/" + m[1] + "." + m[2]);
  if (!obj) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(obj.body, {
    headers: {
      "Content-Type": MIME_BY_EXT[m[2]],
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": "inline",
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/upload") {
      return handleUpload(request, env, url);
    }
    if (request.method === "GET" && url.pathname.startsWith("/m/")) {
      return handleMediaGet(env, url.pathname.slice(3));
    }
    if (request.method === "GET" && url.pathname === "/") {
      return json(200, { ok: true, service: "ecard-media" });
    }
    return new Response("Not Found", { status: 404 });
  },
};
