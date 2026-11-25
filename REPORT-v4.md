# 生日电子贺卡 v4 自测报告（2026-11-25）

v3 → v4 已做完，只改了本地文件，没有推送、没有注册账号、没有用任何用户凭证。

## 改了哪些文件

| 文件 | 说明 |
|---|---|
| `index.html` | v4 本体（984 行 → 1403 行，127KB → 145KB） |
| `index-v3.html` | 改前备份，v3 原样 |
| `server.js` | 新：媒体存储后端（主部署目标，纯 Node 内置模块，零依赖） |
| `worker.js` | 新：Cloudflare Worker + R2 版（备选） |
| `README-deploy-server.md` | 新：轻量服务器部署说明（主方案） |
| `README-deploy-r2.md` | 新：R2 部署说明（备选） |
| `REPORT-v4.md` | 本文件 |

没动：`index-v1.html`、`qrcode.png`、`sell-ready-check-2026-11-24.md`。
默认照片（80KB base64 火火文文）原样保留，改前改后 MD5 一致。

## v4 功能点（逐项）

1. **录音（语音祝福）**：音乐节后新增第 4 节。MediaRecorder，开始/停止、最长 60 秒、计时显示、试听、重录、删除；mimeType 按 audio/webm → audio/mp4 → opus → ogg 回退；录完卡片上出现“▶ 听听祝福”按钮（与生日歌并列，互斥播放）；无麦克风权限或浏览器不支持时提示“这里录不了，可以改用上传音乐”。录音存 `voiceBlob`，生成链接时按存储配置处理。
2. **收卡人模式**：带 `#c=` 或 `#card=` 的链接打开时，隐藏编辑器、步骤条、吸底按钮和“样品卡”标签，只显示卡片 + “我也要做一张”按钮（点开回不带参数的原页面）；音乐/语音按钮仍可用；页脚改为小字“火火文文电子贺卡”。
3. **界面与体验**：顶部步骤条（1 选场景 → 2 写祝福 → 3 照片音乐 → 4 语音祝福 → 5 生成链接），点一步跳到对应那节；各节标题前加步骤号，编辑器各节顺序已按步骤重排；祝福语 4 个一键模板（温馨/幽默/送朋友/送长辈），点后提示“已替换，可再改”；底部吸底大按钮“生成专属链接”常驻；生成后出现链接框 + “复制链接发给TA”按钮 + 二维码（api.qrserver.com 生成，加载失败显示“二维码没加载出来，复制链接发给收卡人也一样”）。文案全部短句人话。三套配色、动画、默认照片、现有功能均保留。
4. **存储适配**：脚本顶部 `var STORE = { endpoint: "" };`（默认空，未配置）。照片上传前 canvas 压缩（最长边 ≤1200px，JPEG 0.8）；音乐/录音不压缩。生成链接时：已配置则逐个 POST multipart 到 endpoint，返回 `{url}` 后放进 state（photoUrl/musicUrl/voiceUrl），上传中按钮显示“正在上传…”并禁用，某项失败时明确提示哪一项没传上去，链接仍可生成文字版；未配置则保持 v3 行为（文字版链接 + 明确警告）。收卡人打开时 state 里的 media URL 会加载（照片赋给 photoImg、音乐赋给 audioEl 且 musicSource 置为 upload、语音单独音频元素供“听听祝福”播放）。不带新字段的旧 `#c=` 链接照常打开（已测）。
5. **后端**：`server.js`（主）：GET `/` 返回 index.html、GET `/health` 返回 ok、POST `/api/media`（multipart，字段名 file，限 10MB，仅图片/音频，随机 id + 原扩展名存 `./data/media`，返回 `{url:"/m/<id>.<ext>"}`）、GET `/m/:id` 按扩展名返回正确 Content-Type。`worker.js`（备选）：POST `/upload` 存 R2、GET `/m/:id` 从 R2 取。两个后端都不需要改动前端除 `STORE.endpoint` 之外的内容。

## 自测结果

### 语法检查（全部通过）

- `node --check` 内联 JS（从 v4 的 index.html 抽出）：通过
- `node --check server.js`：通过
- `node --check worker.js`：通过
- HTML 解析检查（python html.parser）：无未闭合/不匹配标签
- 默认照片 base64 行：v3 与 v4 MD5 一致

### 前端逻辑自测（Node + DOM 桩，71 项，71 通过 0 失败）

测试脚本：`/tmp/v4_test.js`（一次性桩测试，不随仓库走）。

- 链接编解码往返：collectState → buildShareLink → parseSharedHash → applySharedState，occasion / illustration / theme / title / subtitle / name / blessing / signature / music / animStyle / colors / deco 全部一致
- 旧链接兼容：v3 格式 state（无新字段，music 为 synth）正常打开，收卡人模式正常，无 photoUrl/musicUrl/voiceUrl
- `#card=` 前缀可解析；非法 hash 返回 null
- 收卡人模式：带 hash 打开时 body 带 `recipient` 类、页脚文案为“火火文文电子贺卡”
- media URL 加载：photoUrl/musicUrl/voiceUrl 均正确赋给对应元素，语音按钮出现，musicSource 为 upload
- 录音降级：无 MediaRecorder 时点“开始录音”提示“这里录不了，可以改用上传音乐。”
- 祝福语模板：4 个模板均存在且能填入卡片与输入框
- 未配置端点：生成文字版链接 + 警告显示 + 二维码框出现且二维码地址正确编码了链接
- 上传失败降级：端点不可达时仍生成文字版链接，警告明确写“照片没传上去”，链接里无 photoUrl
- 端点上传全流程（跑真实 server.js）：照片压缩上传 + 音乐上传均返回 `/m/...` URL 并拼成绝对地址写进 state，无警告；收卡人打开后照片/音乐均加载；上传的照片可从服务器取回，字节一致

### server.js 实测（本地 18099 端口，curl）

- `GET /health` → `{"status":"ok"}`
- 上传 1×1 PNG → `{"url":"/m/<id>.png"}`，取回 200、Content-Type image/png、字节与原文件一致
- 传 `.exe` → 400（仅图片/音频）
- 传 11MB 文件 → 413（限 10MB）
- 路径穿越 `/m/..%2f..%2fserver.js` → 404；不存在的文件 → 404；`GET /` → 200

### 二维码服务实测

- `api.qrserver.com` 实测返回 HTTP 200、160×160 PNG（388 字节）。

## 因缺存储端点 / 真机暂时无法实测的项

- **真麦克风录音**：本机无麦克风，MediaRecorder 录制、60 秒自动停、试听音质未在真机上跑过；降级分支已测（无麦克风时友好提示）。
- **微信内置浏览器真机表现**：AudioContext 由点击触发、剪贴板 fallback、吸底条 safe-area、步骤条横向滚动等，均未在真机微信里验证；代码层面按微信 WebView 的常规能力写（fetch / Promise / MediaRecorder 均为主流支持）。
- **worker.js 实部署**：只做了语法检查，未在 Cloudflare 上实际部署测试（无账号、不注册）。它是备选，主路是 server.js。
- **正式域名端到端**：`https://suniancard.top/api/media` 的上传与收卡全流程，要等备案通过、部署上轻量服务器后，用真机微信实测（部署说明里已列验证步骤）。

## 部署前还差用户哪一步

1. **ICP 备案通过**（进行中，订单号 2035889624916，停在第 4 步等人脸核验 + 真实性承诺书）。
2. **备案通过后，在轻量服务器上部署**（按 `README-deploy-server.md`：装 Node → 传 `index.html` + `server.js` → systemd 托管 → Nginx 反代 → HTTPS；部署不做，本文只写了代码和说明）。
3. **部署时填 endpoint**：把服务器上那份 `index.html` 里的 `STORE.endpoint` 改成 `https://suniancard.top/api/media`（本地仓库文件保持空，不要写死地址）。
4. **真机微信实测一遍**：做一张带照片 + 音乐 + 语音的卡 → 生成链接 → 扫码 → 收卡人能看到照片、听到语音 → 再测一条 v3 旧链接。
