# 部署说明（主方案）：轻量服务器 + server.js

> **这是主部署目标。**等 ICP 备案下来后，在轻量服务器上跑起来。
> 备选方案（Cloudflare Worker + R2）见 `README-deploy-r2.md`，只有这条路走不通时才用。

## 架构

```
用户浏览器 ── https://suniancard.top ──► Nginx（80/443）
                                              │ 反向代理
                                              ▼
                                    Node server.js（127.0.0.1:3000）
                                              │ 文件存 ./data/media
                                              ▼
                                    GET /m/<id>.<ext> 直接回文件
```

- 前端还是同一个 `index.html`（单文件），只改一行配置：
  `STORE.endpoint = "https://suniancard.top/api/media"`
- 媒体文件（照片/音乐/语音）存在服务器磁盘 `./data/media`，按随机 id 命名。

## 前置条件（缺一不可）

1. **ICP 备案通过**：域名 `suniancard.top` 已完成备案，否则国内服务器不能对外提供网站服务。
2. **域名解析**：`suniancard.top` 的 A 记录指向轻量服务器公网 IP `39.105.99.245`。
3. **能 SSH 登录服务器**：轻量应用服务器（AlibabaCloudLinux，2 核 2G）。

## 部署步骤

### 1. 安装 Node.js（服务器上，20 LTS）

```bash
# AlibabaCloudLinux 4 自带 dnf；用 NodeSource 装 Node 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
node -v   # 应显示 v20.x
```

装不上 NodeSource 时的退路：去 nodejs.org 下 Linux x64 二进制包，解压后把 `bin` 加进 PATH。

### 2. 传文件到服务器

```bash
# 在你自己的电脑上执行（把文件传上去）
scp index.html server.js root@39.105.99.245:/srv/ecard/
```

> 只传这两个文件。`data/media` 目录由 server.js 启动时自动创建，不用手动建。
> `qrcode.png`、`index-v1.html`、`index-v3.html`、`sell-ready-check-2026-11-24.md` 不用传。

### 3. 填 STORE.endpoint（只改服务器上那份）

```bash
ssh root@39.105.99.245
cd /srv/ecard
# 把空 endpoint 换成正式地址（注意：本地仓库里的 index.html 保持空，永远不要把地址写进仓库文件）
sed -i 's#var STORE = { endpoint: "" };#var STORE = { endpoint: "https://suniancard.top/api/media" };#' index.html
grep -n "STORE = " index.html   # 核对一行，应显示 https://suniancard.top/api/media
```

### 4. 用 systemd 托管（开机自启、挂了自动拉起来）

新建 `/etc/systemd/system/ecard.service`：

```ini
[Unit]
Description=Birthday e-card media server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/srv/ecard
ExecStart=/usr/bin/node /srv/ecard/server.js
Restart=on-failure
RestartSec=5
Environment=PORT=3000
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ecard
sudo systemctl status ecard --no-pager   # 应显示 active (running)
curl http://127.0.0.1:3000/health        # 应返回 {"status":"ok"}
```

### 5. Nginx 反向代理 + HTTPS

```bash
sudo dnf install -y nginx
```

新建 `/etc/nginx/conf.d/ecard.conf`：

```nginx
server {
    listen 80;
    server_name suniancard.top;
    # 先走 80 跑通，再申请证书切 443；证书就绪后把这段改成 301 跳转到 https
    # return 301 https://$host$request_uri;

    client_max_body_size 12m;   # 上传上限 10MB，留一点 multipart 开销

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t && sudo systemctl enable --now nginx
curl http://suniancard.top/health   # 应返回 {"status":"ok"}
```

HTTPS（推荐 certbot，一条命令）：

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d suniancard.top
# 成功后 certbot 会自动把 80 改成 301 跳转、配好 443；到期自动续期
```

也可以用阿里云免费 SSL 证书（控制台申请 → 下载 Nginx 版 → 放进 `/etc/nginx/ssl/` 后在 conf 里加 `ssl_certificate` 两行），效果一样。

### 6. 安全组 / 防火墙

- 阿里云控制台安全组：放行 **80、443**（22 只留你自己的 IP）。
- 服务器本机防火墙如开着，同样放行 80、443：
  `sudo firewall-cmd --permanent --add-service={http,https} && sudo firewall-cmd --reload`

## 上线前验证（按顺序做完再发小红书）

```bash
# 1. 健康检查
curl -s https://suniancard.top/health
# 2. 上传一张图片（应返回 {"url":"/m/....jpg"}）
curl -s -F "file=@/path/to/照片.jpg" https://suniancard.top/api/media
# 3. 用返回的 URL 在浏览器打开，应直接显示图片
# 4. 拒绝测试：传一个 .exe 应返回 400；传一个 11MB 文件应返回 413
```

浏览器端（微信里实测最关键）：

1. 打开 `https://suniancard.top/`，做一张带**照片 + 音乐 + 语音**的卡，点底部“生成专属链接”。
2. 生成时按钮会显示“正在上传…”，完成后链接框旁出现二维码，警告不应出现。
3. 微信扫二维码：收卡人模式只显示卡片（没有编辑器），照片是上传的那张，点“播放生日歌”/“听听祝福”都能出声。
4. 再测旧链接：拿 v3 的 `#c=` 链接打开，应照常显示（不带照片/语音，只文字版）。

## 日常运维

```bash
sudo systemctl status ecard --no-pager        # 看运行状态
sudo journalctl -u ecard -f                    # 看日志
sudo systemctl restart ecard                   # 重启
# 升级：重新传 index.html / server.js 后重启 ecard 即可
# 备份：data/media 是全部用户上传的照片/音乐/语音，定期打包备份
tar -czf ecard-media-$(date +%F).tar.gz /srv/ecard/data
```

## 常见问题

- **生成链接时照片没传上去**：先看 `journalctl -u ecard` 有没有报错；再确认 Nginx 的 `client_max_body_size` 是 12m；再确认 `STORE.endpoint` 写的是 `https://suniancard.top/api/media`（不是 http，也不是裸域名）。
- **微信里打不开链接**：先确认备案已通过、域名已解析到 `39.105.99.245`；再用电脑浏览器打开同一链接对比。
- **上传提示 413**：文件超过 10MB（照片会自动压缩到最长边 1200px 再传，超限的基本是音乐/语音文件），换小一点的文件。
- **服务器重启后文件还在吗**：在，`data/media` 在磁盘上；但服务器到期释放就没了，记得备份。
