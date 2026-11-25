# 部署说明（备选方案）：Cloudflare Worker + R2

> **这是备选。**主部署目标是轻量服务器上的 `server.js`（见 `README-deploy-server.md`）。
> 只有轻量服务器那条路走不通时，才用这一版。

## 架构

```
用户浏览器 ── https://<worker>.workers.dev/upload ──► Cloudflare Worker
                                                          │ putObject
                                                          ▼
                                                    R2 bucket（MEDIA_BUCKET）
                                                          │
                                    GET /m/<id>.<ext> ◄───┘（Worker 从 R2 取回）
```

- 前端 `STORE.endpoint` 填 `https://<worker>.workers.dev/upload`。
- 文件存在 R2，Worker 只做上传中转和取回，不存本地磁盘。

## 前置条件

- 一个 Cloudflare 账号（免费版即可）。
- 本机装好 Node.js（用来跑 wrangler），见主方案 README 第 1 步。

## 部署步骤

### 1. 建 R2 bucket

1. Cloudflare 控制台 → R2 对象存储 → 创建存储桶，名字如 `ecard-media`。
2. 开启公开访问（二选一）：
   - **推荐**：Settings → 自定义域，绑一个你自己的域名（如 `media.suniancard.top`，需在 DNS 加 CNAME），之后 `PUBLIC_BASE` 就填它；
   - 省事：直接用 R2 给的公开子域名 `https://pub-xxxxxxxx.r2.dev`（Settings → 公开访问 → 允许访问）。

### 2. 建 Worker 并绑定 R2

1. 控制台 → Workers 和 Pages → 创建 Worker，名字如 `ecard-media`。
2. 把同目录的 `worker.js` 内容粘贴进 Worker 编辑器（或用 wrangler 部署，见下一步）。
3. Worker → 设置 → 变量 → R2 存储桶绑定 → 添加绑定，变量名填 `MEDIA_BUCKET`，选刚建的 `ecard-media`。
4. 如用了自定义公开域名，再加一个环境变量：`PUBLIC_BASE` = `https://media.suniancard.top`（不填则默认用 Worker 自身域名出链接）。

用 wrangler 部署时，在 `worker.js` 同目录放一个 `wrangler.toml`：

```toml
name = "ecard-media"
main = "worker.js"
compatibility_date = "2026-11-25"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "ecard-media"

[vars]
PUBLIC_BASE = "https://media.suniancard.top"   # 用 R2.dev 公开域名时删掉这一行
```

```bash
npm install -g wrangler
npx wrangler login
npx wrangler deploy
```

### 3. 填 STORE.endpoint

在部署好的 `index.html` 里（只改部署出去那份，本地仓库保持空）：

```js
var STORE = { endpoint: "https://ecard-media.<你的子域名>.workers.dev/upload" };
```

### 4. 验证

```bash
curl -s -F "file=@/path/to/照片.jpg" https://ecard-media.<你的子域名>.workers.dev/upload
# 应返回 {"url":"https://.../m/....jpg"}，浏览器打开应直接显示图片
```

再按主方案 README 里的浏览器端 4 步走一遍（做卡 → 生成链接 → 微信扫码 → 收卡人能看照片、听语音）。

## 费用与提醒

- R2 免费额度：每月 10GB 存储、100 万次 A 类操作（写入）、1000 万次 B 类操作（读取），以 Cloudflare 官网当前额度为准；小流量基本不花钱，超出按量计费。
- Workers 免费版每天 10 万次请求，小流量够用。
- 提醒：`*.workers.dev` 域名在微信内置浏览器里偶尔会被拦截或打开很慢，**这是它只是备选的原因之一**。主方案用自己的域名 `suniancard.top`，微信打开最稳。
- R2 里的文件删了就没了，重要文件同样要备份。
