import { TEMPLATES_ZH, TEMPLATES_EN, OCCASION_LIST, THEME_LIST, ILLUSTRATION_LIST, MUSIC_OPTIONS } from "./js/site-data.js";


/* ---------- 存储配置 ---------- */
// 部署时把后端地址填进来，例如 "https://suniancard.top/api/media"。
// 留空表示未配置：照片 / 音乐 / 语音不上传，专属链接只带文字设置。
var STORE = { endpoint: "" };

/* ---------- card state version ----------
   Bumped on every change to the card, so the assistant's irreversible
   "generate share link" action can refuse a stale request. */
var stateVersion = 0;
function touch() { stateVersion++; }

/* ---------- language ----------
   English by default (the competition's working language); a 中文 toggle
   sits in the header. Card sample content stays as the maker wrote it. */
var I18N = {
  en: {
    "docTitle": "Happy Birthday · HuoHuo & WenWen E-Card",
    "brand": "HuoHuo & WenWen · E-Card",
    "tag": "SAMPLE CARD",
    "step1": "Occasion", "step2": "Blessing", "step3": "Photo & music",
    "step4": "Voice blessing", "step5": "Share link",
    "editorTitle": "Make this card yours",
    "editorSub": "Every section is editable — the card above updates as you go.",
    "sceneH": "Occasion", "illusH": "Picture", "textH": "Write your blessing",
    "photoH": "Photo", "musicH": "Music", "voiceH": "Voice blessing",
    "decoH": "Animation & decorations", "colorH": "Colors", "shareH": "Share link",
    "lblTitle": "Big title", "lblKicker": "Small English line",
    "lblName": "Recipient's name", "lblBlessing": "Blessing", "lblFrom": "From",
    "tplWarm": "Warm", "tplFunny": "Funny", "tplFriend": "For a friend", "tplElder": "For an elder",
    "tplMsg": "Tap one to swap the blessing. You can still edit it after.",
    "photoNote": "Uploading replaces the HuoHuo & WenWen photo; it is cropped to the round frame.",
    "photoChoose": "Choose a photo…", "photoReset": "Restore default photo", "photoShow": "Show photo",
    "musicSynth": "Birthday song (built in)", "musicUpload": "Upload music", "musicNone": "No music",
    "musicChoose": "Choose a music file…",
    "voiceNote": "Record a message in your own voice — the recipient taps to hear it. Up to 60 seconds; listen back and re-record if you like.",
    "voiceRecord": "● Start recording", "voiceListen": "Listen", "voiceReRecord": "Re-record", "voiceDelete": "Delete",
    "voiceNoRecording": "Not recorded yet. Record a blessing and a “Hear the blessing” button appears on the card.",
    "decoConfetti": "Confetti", "decoHearts": "Hearts", "decoCake": "Cake", "decoFireworks": "Fireworks",
    "animStyle": "Animation style", "animFall": "Confetti falls", "animRise": "Hearts float up",
    "themePeach": "Peach", "themeMint": "Mint", "themeBlue": "Starry blue",
    "colorBg": "Background", "colorAccent": "Main color", "colorText": "Text",
    "colorReset": "Restore theme colors",
    "shareNote": "Make a personal link for this card. Anyone who opens it sees the same card.",
    "shareGen": "Generate share link", "shareCopy": "Copy link", "shareScan": "Scan to open this card.",
    "shareWarn": "This link doesn't include the photo, music or voice you just added — they only work on this page.",
    "hint": "This is a sample card: photos, music and voice live on your device for now. Until storage is set up, the share link carries only the words and the look; once storage is ready, photos, music and voice travel with the link and the recipient can see and hear them. The built-in music is a synthesized birthday tune with no copyright issue; for music you upload yourself, please make sure you have the right to use it.",
    "footerNote": "E-Card · Sample",
    "footerMusic": "Default music is a built-in synthesized tune, no copyright issue",
    "ctaGen": "Generate share link", "makeOwn": "Make one for me too",
    "occBirthday": "Birthday", "occLove": "For someone you love", "occAnniversary": "Anniversary",
    "illusPhoto": "HuoHuo & WenWen", "illusFlowers": "Simple bouquet", "illusBear": "Balloon bear",
    "illusLeaves": "Forest leaves", "illusNone": "Hide picture",
    "music.playing": "Playing… tap to stop", "music.none": "No music",
    "music.playUpload": "Play uploaded music", "music.playSynth": "Play birthday song",
    "music.nowSynth": "Music: birthday song (built-in synth)",
    "music.nowUpload": "Music: ", "music.uploadedNoFile": "uploaded (no file chosen)",
    "music.nowNone": "Music: none",
    "music.noSupport": "This browser can't play audio",
    "music.pickFileFirst": "Please choose a music file first",
    "music.cantPlay": "This audio file won't play — try another one",
    "music.pickAudio": "Please choose an audio file, such as an mp3",
    "music.noLocalAudio": "This browser can't play local audio",
    "music.uploadedMusic": "Uploaded music",
    "voice.listen": "Hear the blessing",
    "voice.cantRecord": "Recording doesn't work here — you can upload music instead.",
    "voice.ready": "Recorded. Tap Listen to hear it; re-record if you don't like it.",
    "voice.recording": "Recording… up to 60 seconds. Tap Stop when you're done.",
    "voice.cantPlay": "This recording won't play — try recording again.",
    "voice.stopListen": "Stop listening", "voice.listenBtn": "Listen",
    "voice.recordAgain": "Record another one.",
    "voice.deleted": "Deleted — the voice button is gone from the card too.",
    "voice.cantPlayShort": "This recording won't play",
    "voice.startRecord": "● Start recording", "voice.recordingStop": "Recording… tap to stop",
    "qr.scan": "Scan to open this card.",
    "qr.failed": "The QR code didn't load — copying the link works just as well.",
    "share.uploading": "Uploading…",
    "share.failedUploads": " didn't upload — the link carries only the words and what did upload. Generate again to retry.",
    "share.generatedPartial": "Link ready, but something didn't upload.",
    "share.generatedAll": "Link ready — photo, music and voice are all in it. Copy it and send it to the recipient.",
    "share.generated": "Link ready — copy it and the recipient opens the same card.",
    "share.changed": "The card changed — tap “Generate share link” to make a fresh one.",
    "share.copied": "Copied — send it to the recipient.",
    "share.copyFailed": "Auto-copy didn't work — long-press the link to copy it.",
    "share.tplReplaced": "Swapped — you can still edit it.",
    "footer.recipient": "HuoHuo & WenWen E-Card"
  },
  zh: {
    "docTitle": "生日快乐 · 火火文文电子贺卡",
    "brand": "火火文文 · 电子贺卡",
    "tag": "样 品 卡",
    "step1": "选场景", "step2": "写祝福", "step3": "照片音乐",
    "step4": "语音祝福", "step5": "生成链接",
    "editorTitle": "定制这张卡片",
    "editorSub": "每个模块都能改，上面那张卡会马上跟着变。",
    "sceneH": "选场景", "illusH": "形象 / 插画", "textH": "写祝福",
    "photoH": "照片", "musicH": "音乐", "voiceH": "语音祝福",
    "decoH": "动画 / 装饰", "colorH": "配色", "shareH": "生成链接",
    "lblTitle": "大标题", "lblKicker": "英文小字",
    "lblName": "收卡人的名字", "lblBlessing": "祝福语", "lblFrom": "落款",
    "tplWarm": "温馨", "tplFunny": "幽默", "tplFriend": "送朋友", "tplElder": "送长辈",
    "tplMsg": "点一个，祝福语就换成那句，换完还能再改。",
    "photoNote": "上传后会替换「火火文文」那张照片，照片会按相框裁切显示。",
    "photoChoose": "选择照片…", "photoReset": "恢复默认照片", "photoShow": "显示照片",
    "musicSynth": "默认生日歌", "musicUpload": "上传音乐", "musicNone": "无音乐",
    "musicChoose": "选择音乐文件…",
    "voiceNote": "录一句你自己的话，收卡人点一下就能听见。最长 60 秒，录完可以试听，不满意就重录。",
    "voiceRecord": "● 开始录音", "voiceListen": "试听", "voiceReRecord": "重录", "voiceDelete": "删除",
    "voiceNoRecording": "还没录。录一句祝福，卡片上会多一个“听听祝福”按钮。",
    "decoConfetti": "彩带", "decoHearts": "爱心", "decoCake": "蛋糕", "decoFireworks": "烟花",
    "animStyle": "动画风格", "animFall": "彩带飘落", "animRise": "爱心上浮",
    "themePeach": "蜜桃粉", "themeMint": "薄荷绿", "themeBlue": "星空蓝",
    "colorBg": "背景", "colorAccent": "主色", "colorText": "文字",
    "colorReset": "恢复主题配色",
    "shareNote": "把当前这张卡的样子生成一个专属链接，别人打开链接就能看到同一张卡。",
    "shareGen": "生成专属链接", "shareCopy": "复制链接", "shareScan": "扫码就能打开这张卡。",
    "shareWarn": "专属链接里不含你刚上传的照片/音乐/录音，它们只在当前页面有效",
    "hint": "这是一张样品卡：照片、音乐和语音先存在你这台设备上。存储没配好之前，专属链接里只有文字和样子；配好存储后，照片、音乐和语音也会跟着链接走，收卡人打开就能看到、听到。默认音乐是内置合成的生日旋律，无版权问题；自己上传的音乐请确认有使用权。",
    "footerNote": "电子贺卡 · 样品",
    "footerMusic": "默认音乐为内置合成旋律，无版权问题",
    "ctaGen": "生成专属链接", "makeOwn": "我也要做一张",
    "occBirthday": "生日", "occLove": "表白", "occAnniversary": "纪念日",
    "illusPhoto": "火火文文", "illusFlowers": "简约花束", "illusBear": "气球小熊",
    "illusLeaves": "森系绿叶", "illusNone": "隐藏插画",
    "music.playing": "正在播放…点按停止", "music.none": "无音乐",
    "music.playUpload": "播放上传的音乐", "music.playSynth": "播放生日歌",
    "music.nowSynth": "当前音乐：默认生日歌（内置合成）",
    "music.nowUpload": "当前音乐：", "music.uploadedNoFile": "已上传（未选择文件）",
    "music.nowNone": "当前音乐：无音乐",
    "music.noSupport": "当前浏览器不支持播放",
    "music.pickFileFirst": "请先选择一个音乐文件",
    "music.cantPlay": "这个音频文件放不出来，换一个试试",
    "music.pickAudio": "请选择音频文件，比如 mp3",
    "music.noLocalAudio": "当前浏览器不支持本地音频播放",
    "music.uploadedMusic": "已上传的音乐",
    "voice.listen": "听听祝福",
    "voice.cantRecord": "这里录不了，可以改用上传音乐。",
    "voice.ready": "录好了，点试听听一下，不满意可以重录。",
    "voice.recording": "正在录，最长 60 秒，点停止就录好了。",
    "voice.cantPlay": "这段录音放不出来，再录一句试试。",
    "voice.stopListen": "停止试听", "voice.listenBtn": "试听",
    "voice.recordAgain": "再录一句吧。",
    "voice.deleted": "删掉了，卡片上也没有语音按钮了。",
    "voice.cantPlayShort": "这段录音放不出来",
    "voice.startRecord": "● 开始录音", "voice.recordingStop": "正在录…点按停止",
    "qr.scan": "扫码就能打开这张卡。",
    "qr.failed": "二维码没加载出来，复制链接发给收卡人也一样。",
    "share.uploading": "正在上传…",
    "share.failedUploads": "没传上去，链接里只有文字和传成功的部分，重新生成可以再试一次。",
    "share.generatedPartial": "链接已生成，但有内容没传上去。",
    "share.generatedAll": "链接已生成，照片、音乐和语音都在链接里，复制后发给收卡人吧。",
    "share.generated": "链接已生成，复制后发给收卡人就能打开同一张卡。",
    "share.changed": "卡片改过了，点“生成专属链接”重新生成。",
    "share.copied": "已复制，去发给收卡人吧。",
    "share.copyFailed": "自动复制没成功，长按链接手动复制。",
    "share.tplReplaced": "已替换，可再改。",
    "footer.recipient": "火火文文电子贺卡"
  }
};
var lang = "en";
try {
  var savedLang = window.localStorage && window.localStorage.getItem("ecard-lang");
  if (savedLang === "zh" || savedLang === "en") { lang = savedLang; }
} catch (e) {}
function t(key) {
  var d = I18N[lang] || I18N.en;
  return (d && d[key] !== undefined) ? d[key] : (I18N.en[key] !== undefined ? I18N.en[key] : key);
}
function getLang() { return lang; }
function setLang(next) {
  if (next !== "en" && next !== "zh") { return; }
  lang = next;
  try { if (window.localStorage) { window.localStorage.setItem("ecard-lang", next); } } catch (e) {}
  applyLang();
}
function applyLang() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.title = t("docTitle");
  each(document.querySelectorAll("[data-i18n]"), function (el) {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  var lt = $("langToggle");
  if (lt) { lt.textContent = lang === "en" ? "中文" : "English"; }
  updateMusicLabel();
  updateMusicSourceName();
  if (!voiceRecording) {
    var rec = $("voiceRec");
    if (rec) { rec.innerHTML = t("voice.startRecord"); }
  }
  var vl = $("voiceLabel");
  if (vl && (voiceBlob || (voiceAudio && voiceAudio.getAttribute("src")))) { vl.textContent = t("voice.listen"); }
}

function currentTemplates() { return lang === "zh" ? TEMPLATES_ZH : TEMPLATES_EN; }



function $(id) { return document.getElementById(id); }
function each(list, fn) { for (var i = 0; i < list.length; i++) { fn(list[i], i); } }
function makeObjectURL(file) {
  try {
    if (window.URL && window.URL.createObjectURL) { return window.URL.createObjectURL(file); }
  } catch (e) {}
  return null;
}
function revokeURL(url) {
  try {
    if (url && window.URL && window.URL.revokeObjectURL) { window.URL.revokeObjectURL(url); }
  } catch (e) {}
}

var card = $("card");

/* ---------- confetti ---------- */
var confettiBox = $("confetti");
var colors = ["#E2574C", "#FFC93C", "#2E8B6A", "#3B62B8", "#F2A18F", "#FF8A3D"];
for (var i = 0; i < 26; i++) {
  var piece = document.createElement("i");
  piece.style.left = (Math.random() * 100).toFixed(1) + "%";
  piece.style.background = colors[i % colors.length];
  piece.style.animationDuration = (5 + Math.random() * 5).toFixed(1) + "s";
  piece.style.animationDelay = (-Math.random() * 9).toFixed(1) + "s";
  if (i % 3 === 0) { piece.style.borderRadius = "50%"; piece.style.width = "9px"; piece.style.height = "9px"; }
  confettiBox.appendChild(piece);
}

/* ---------- segmented button helper ---------- */
function bindSeg(attr, onSelect) {
  // NB: [data-theme] also matches <body data-theme="...">, so only
  // <button> elements count as segmented controls. Without this, a
  // click anywhere on the page bubbles up to <body> and re-applies
  // the peach theme, wiping any custom colours.
  var all = document.querySelectorAll("[data-" + attr + "]");
  var btns = [];
  each(all, function (b) { if (b.tagName === "BUTTON") { btns.push(b); } });
  each(btns, function (b) {
    b.addEventListener("click", function () {
      each(btns, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      onSelect(b.getAttribute("data-" + attr));
        touch();
    });
  });
  return {
    set: function (v) {
      each(btns, function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-" + attr) === v ? "true" : "false"); });
    },
    clear: function () {
      each(btns, function (x) { x.setAttribute("aria-pressed", "false"); });
    }
  };
}

/* ---------- text (live) ---------- */
function setText(inputId, outputId, value, fallback) {
  touch();
  var inp = $(inputId);
  inp.value = value;
  $(outputId).textContent = (value || "").trim() || fallback;
}
function bindText(inputId, outputId, fallback) {
  var inp = $(inputId);
  inp.addEventListener("input", function () {
    $(outputId).textContent = inp.value.trim() || fallback;
    touch();
  });
}
bindText("titleIn", "titleOut", "生日快乐");
bindText("kickerIn", "kickerOut", "HAPPY BIRTHDAY");
bindText("nameIn", "nameOut", "你");
bindText("blessingIn", "blessingOut", "生日快乐！");
bindText("fromIn", "fromOut", "——");

/* ---------- illustration ---------- */
var photoImg = $("photoImg");
var defaultPhotoSrc = photoImg.getAttribute("src");
var illusFrame = $("illusFrame");
var illusEls = { flowers: $("illusFlowers"), bear: $("illusBear"), leaves: $("illusLeaves") };
var currentIllus = "photo";
var photoVisible = true;
var photoURL = null;
var photoFile = null; // 用户上传的照片原文件（上传前压缩）
var remotePhotoUrl = null; // 链接里带来的照片地址（已上传）
var uploadedPhotoUrl = null, uploadedMusicUrl = null, uploadedVoiceUrl = null;
var remoteMusicUrl = null, remoteVoiceUrl = null;

function applyIllus() {
  touch();
  var showFrame = currentIllus !== "none" && !(currentIllus === "photo" && !photoVisible);
  illusFrame.style.display = showFrame ? "" : "none";
  photoImg.style.display = currentIllus === "photo" ? "" : "none";
  each(Object.keys(illusEls), function (k) {
    illusEls[k].classList.toggle("on", currentIllus === k);
  });
}
var illusSeg = bindSeg("illus", function (v) {
  currentIllus = v;
  applyIllus();
});

/* ---------- photo upload ---------- */
$("photoIn").addEventListener("change", function () {
  var f = this.files && this.files[0];
  if (!f) { return; }
  if (f.type && f.type.indexOf("image/") !== 0) { return; }
  var url = makeObjectURL(f);
  if (!url) { return; }
  revokeURL(photoURL);
  photoURL = url;
  photoFile = f;
  remotePhotoUrl = null;
  uploadedPhotoUrl = null;
  photoImg.src = url;
  photoVisible = true;
  $("photoShow").checked = true;
  currentIllus = "photo";
  illusSeg.set("photo");
  applyIllus();
});
$("photoReset").addEventListener("click", function () {
  revokeURL(photoURL);
  photoURL = null;
  photoFile = null;
  remotePhotoUrl = null;
  uploadedPhotoUrl = null;
  photoImg.src = defaultPhotoSrc;
  $("photoIn").value = "";
  photoVisible = true;
  $("photoShow").checked = true;
  currentIllus = "photo";
  illusSeg.set("photo");
  applyIllus();
});
$("photoShow").addEventListener("change", function () {
  photoVisible = this.checked;
  applyIllus();
});

/* ---------- themes + custom colors ---------- */
var THEMES = {
  peach: { page: "#FFF1E8", accent: "#E2574C", ink: "#5B3A2E" },
  mint:  { page: "#EAF6EE", accent: "#2E8B6A", ink: "#234434" },
  blue:  { page: "#EAF0FB", accent: "#3B62B8", ink: "#26365A" }
};
var CUSTOM_PROPS = ["--page", "--accent", "--accent-soft", "--card1", "--card2", "--swatch", "--ink", "--muted"];
function hexRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) { hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]; }
  return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
}
function rgbHex(r, g, b) {
  function h(n) { var s = Math.round(n).toString(16); return s.length === 1 ? "0" + s : s; }
  return "#" + h(r) + h(g) + h(b);
}
function mixHex(hex, white, t) {
  var c = hexRgb(hex);
  return rgbHex(c[0] + (white[0] - c[0]) * t, c[1] + (white[1] - c[1]) * t, c[2] + (white[2] - c[2]) * t);
}
function clearCustomColorProps() {
  touch();
  each(CUSTOM_PROPS, function (p) { document.body.style.removeProperty(p); });
}
function syncColorInputs(t) {
  $("colorPage").value = t.page;
  $("colorAccent").value = t.accent;
  $("colorInk").value = t.ink;
}
var customColors = false;
function applyCustomColors() {
  touch();
  customColors = true;
  var page = $("colorPage").value, accent = $("colorAccent").value, ink = $("colorInk").value;
  var st = document.body.style;
  st.setProperty("--page", page);
  st.setProperty("--accent", accent);
  st.setProperty("--accent-soft", mixHex(accent, [255, 255, 255], 0.85));
  st.setProperty("--card1", mixHex(accent, [255, 255, 255], 0.78));
  st.setProperty("--card2", mixHex(accent, [255, 255, 255], 0.95));
  st.setProperty("--swatch", accent);
  st.setProperty("--ink", ink);
  st.setProperty("--muted", mixHex(ink, [255, 255, 255], 0.45));
  themeSeg.clear();
}
var themeSeg = bindSeg("theme", function (key) {
  var t = THEMES[key];
  if (!t) { return; }
  document.body.setAttribute("data-theme", key);
  clearCustomColorProps();
  customColors = false;
  syncColorInputs(t);
});
each(["colorPage", "colorAccent", "colorInk"], function (id) {
  $(id).addEventListener("input", applyCustomColors);
});
$("colorReset").addEventListener("click", function () {
  clearCustomColorProps();
  customColors = false;
  var key = document.body.getAttribute("data-theme") || "peach";
  syncColorInputs(THEMES[key]);
  themeSeg.set(key);
});

/* ---------- music ---------- */
var NOTE_FREQ = { G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
// Happy Birthday, 1 beat = 0.42s
var MELODY = [
  ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 1.75],
  ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 1.75],
  ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 1.75],
  ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2]
];
var BEAT = 0.42;
var audioCtx = null, stopTimer = null, playing = false;
var musicBtn = $("musicBtn");
var musicLabel = $("musicLabel");
var audioEl = $("audioEl");
var musicSource = "synth"; // synth | upload | none
var musicURL = null, musicName = "";
var musicFile = null; // 用户上传的音乐原文件

function updateMusicLabel() {
  if (playing) { musicLabel.textContent = t("music.playing"); }
  else if (musicSource === "none") { musicLabel.textContent = t("music.none"); }
  else if (musicSource === "upload") { musicLabel.textContent = t("music.playUpload"); }
  else { musicLabel.textContent = t("music.playSynth"); }
  musicBtn.disabled = (musicSource === "none");
}
function updateMusicSourceName() {
  var el = $("musicSourceName");
  if (musicSource === "synth") { el.textContent = t("music.nowSynth"); }
  else if (musicSource === "upload") { el.textContent = t("music.nowUpload") + (musicName || t("music.uploadedNoFile")); }
  else { el.textContent = t("music.nowNone"); }
}
function stopMusic() {
  playing = false;
  if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
  if (audioCtx) { audioCtx.close().catch(function () {}); audioCtx = null; }
  try { audioEl.pause(); } catch (e) {}
  try { if (typeof voiceAudio !== "undefined" && voiceAudio) { voiceAudio.pause(); } } catch (e) {}
  try {
    if (typeof voiceBtn !== "undefined" && voiceBtn) {
      voiceBtn.classList.remove("playing");
      var _vl = $("voiceLabel");
      if (_vl) { _vl.textContent = t("voice.listen"); }
    }
  } catch (e) {}
  musicBtn.classList.remove("playing");
  updateMusicLabel();
}
function playNote(freq, startAt, dur) {
  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.22, startAt + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur * 0.92);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(startAt);
  osc.stop(startAt + dur);
}
function playSynth() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    musicLabel.textContent = t("music.noSupport");
    return;
  }
  playing = true;
  musicBtn.classList.add("playing");
  updateMusicLabel();
  var t = audioCtx.currentTime + 0.05;
  var total = 0;
  MELODY.forEach(function (note) {
    var dur = note[1] * BEAT;
    playNote(NOTE_FREQ[note[0]], t, dur);
    t += dur;
    total += dur;
  });
  stopTimer = setTimeout(stopMusic, total * 1000 + 400);
}
musicBtn.addEventListener("click", function () {
  if (playing) { stopMusic(); return; }
  if (musicSource === "none") { return; }
  if (musicSource === "upload") {
    if (!audioEl.getAttribute("src")) {
      $("musicSourceName").textContent = t("music.pickFileFirst");
      return;
    }
    var p = audioEl.play();
    if (p && p.catch) { p.catch(function () { $("musicSourceName").textContent = t("music.cantPlay"); }); }
    playing = true;
    musicBtn.classList.add("playing");
    updateMusicLabel();
    return;
  }
  playSynth();
});
audioEl.addEventListener("ended", function () { stopMusic(); });

var musicSeg = bindSeg("music", function (v) {
  stopMusic();
  musicSource = v;
  $("musicUploadRow").hidden = (v !== "upload");
  updateMusicLabel();
  updateMusicSourceName();
});
function setMusicSource(v) {
  touch();
  musicSeg.set(v);
  stopMusic();
  musicSource = v;
  $("musicUploadRow").hidden = (v !== "upload");
  updateMusicLabel();
  updateMusicSourceName();
}
$("musicIn").addEventListener("change", function () {
  var f = this.files && this.files[0];
  if (!f) { return; }
  var okType = (f.type && f.type.indexOf("audio/") === 0) || /\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(f.name || "");
  if (!okType) {
    $("musicSourceName").textContent = t("music.pickAudio");
    return;
  }
  var url = makeObjectURL(f);
  if (!url) {
    $("musicSourceName").textContent = t("music.noLocalAudio");
    return;
  }
  revokeURL(musicURL);
  musicURL = url;
  musicFile = f;
  musicName = f.name;
  remoteMusicUrl = null;
  uploadedMusicUrl = null;
  audioEl.src = url;
  setMusicSource("upload");
});


/* ---------- voice blessing (MediaRecorder) ---------- */
var voiceBtn = $("voiceBtn");
var voiceAudio = $("voiceAudio");
var mediaRecorder = null, voiceChunks = [], voiceBlob = null, voiceURL = null, voiceMime = "";
var voiceRecording = false, voiceTimerId = null, voiceSeconds = 0;
var VOICE_MAX_SEC = 60;

function pickVoiceMime() {
  if (typeof MediaRecorder === "undefined") { return ""; }
  var cands = ["audio/webm", "audio/mp4", "audio/webm;codecs=opus", "audio/ogg"];
  for (var i = 0; i < cands.length; i++) {
    try { if (MediaRecorder.isTypeSupported(cands[i])) { return cands[i]; } } catch (e) {}
  }
  return "";
}
function fmtTime(sec) {
  var m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}
function clearVoice(clearRemote) {
  touch();
  if (voiceTimerId) { clearInterval(voiceTimerId); voiceTimerId = null; }
  voiceRecording = false;
  revokeURL(voiceURL);
  voiceURL = null;
  voiceBlob = null;
  voiceAudio.removeAttribute("src");
  voiceBtn.hidden = true;
  voiceBtn.classList.remove("playing");
  $("voiceLabel").textContent = t("voice.listen");
  $("voiceTimer").hidden = true;
  $("voiceAfter").hidden = true;
  $("voiceRec").innerHTML = t("voice.startRecord");
  if (clearRemote) { remoteVoiceUrl = null; uploadedVoiceUrl = null; }
}
function stopVoiceRec() {
  if (voiceTimerId) { clearInterval(voiceTimerId); voiceTimerId = null; }
  voiceRecording = false;
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    try { mediaRecorder.stop(); } catch (e) {}
  }
}
function startVoiceRec() {
  if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    $("voiceStatus").textContent = t("voice.cantRecord");
    return;
  }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
    voiceMime = pickVoiceMime();
    try {
      mediaRecorder = voiceMime ? new MediaRecorder(stream, { mimeType: voiceMime }) : new MediaRecorder(stream);
    } catch (e) {
      stream.getTracks().forEach(function (t) { t.stop(); });
      $("voiceStatus").textContent = t("voice.cantRecord");
      return;
    }
    voiceChunks = [];
    mediaRecorder.ondataavailable = function (e) { if (e.data && e.data.size) { voiceChunks.push(e.data); } };
    mediaRecorder.onstop = function () {
      stream.getTracks().forEach(function (t) { t.stop(); });
      voiceBlob = new Blob(voiceChunks, { type: voiceMime || "audio/webm" });
        touch();
      revokeURL(voiceURL);
      voiceURL = makeObjectURL(voiceBlob);
      voiceAudio.src = voiceURL;
      remoteVoiceUrl = null;
      uploadedVoiceUrl = null;
      voiceBtn.hidden = false;
      $("voiceTimer").hidden = true;
      $("voiceAfter").hidden = false;
      $("voiceRec").innerHTML = t("voice.startRecord");
      $("voiceStatus").textContent = t("voice.ready");
    };
    mediaRecorder.start();
    voiceRecording = true;
    voiceSeconds = 0;
    $("voiceTimer").hidden = false;
    $("voiceTimer").textContent = "00:00";
    $("voiceRec").innerHTML = "<span class=\"rec-dot\"></span>" + t("voice.recordingStop");
    $("voiceStatus").textContent = t("voice.recording");
    voiceTimerId = setInterval(function () {
      voiceSeconds++;
      $("voiceTimer").textContent = fmtTime(voiceSeconds);
      if (voiceSeconds >= VOICE_MAX_SEC) { stopVoiceRec(); }
    }, 1000);
  }).catch(function () {
    $("voiceStatus").textContent = t("voice.cantRecord");
  });
}
$("voiceRec").addEventListener("click", function () {
  if (voiceRecording) { stopVoiceRec(); return; }
  startVoiceRec();
});
$("voicePlay").addEventListener("click", function () {
  if (!voiceAudio.getAttribute("src")) { return; }
  if (voiceAudio.paused) {
    var p = voiceAudio.play();
    if (p && p.catch) { p.catch(function () { $("voiceStatus").textContent = t("voice.cantPlay"); }); }
    $("voicePlay").textContent = t("voice.stopListen");
  } else {
    voiceAudio.pause();
    $("voicePlay").textContent = t("voice.listenBtn");
  }
});
voiceAudio.addEventListener("ended", function () { $("voicePlay").textContent = t("voice.listenBtn"); });
$("voiceRedo").addEventListener("click", function () {
  clearVoice(true);
  $("voiceStatus").textContent = t("voice.recordAgain");
});
$("voiceDel").addEventListener("click", function () {
  clearVoice(true);
  $("voiceStatus").textContent = t("voice.deleted");
});
voiceBtn.addEventListener("click", function () {
  if (!voiceAudio.getAttribute("src")) { return; }
  if (voiceAudio.paused) {
    stopMusic();
    var p = voiceAudio.play();
    if (p && p.catch) { p.catch(function () { $("voiceLabel").textContent = t("voice.cantPlayShort"); }); }
    voiceBtn.classList.add("playing");
    $("voiceLabel").textContent = t("music.playing");
  } else {
    voiceAudio.pause();
    voiceBtn.classList.remove("playing");
    $("voiceLabel").textContent = t("voice.listen");
  }
});
voiceAudio.addEventListener("ended", function () {
  voiceBtn.classList.remove("playing");
  $("voiceLabel").textContent = t("voice.listen");
});

/* ---------- media upload (STORE) ---------- */
function compressPhoto(file) {
  return new Promise(function (resolve) {
    var url = makeObjectURL(file);
    if (!url) { resolve(file); return; }
    var img = new Image();
    img.onload = function () {
      var max = 1200, w = img.naturalWidth || 0, h = img.naturalHeight || 0;
      if (!w || !h || (w <= max && h <= max)) { revokeURL(url); resolve(file); return; }
      var sc = Math.min(max / w, max / h);
      var cv = document.createElement("canvas");
      cv.width = Math.round(w * sc);
      cv.height = Math.round(h * sc);
      try { cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); }
      catch (e) { revokeURL(url); resolve(file); return; }
      revokeURL(url);
      if (cv.toBlob) {
        cv.toBlob(function (b) { resolve(b || file); }, "image/jpeg", 0.8);
      } else { resolve(file); }
    };
    img.onerror = function () { revokeURL(url); resolve(file); };
    img.src = url;
  });
}
function uploadMedia(file, filename) {
  var fd = new FormData();
  fd.append("file", file, filename);
  return fetch(STORE.endpoint, { method: "POST", body: fd }).then(function (r) {
    if (!r.ok) { throw new Error("HTTP " + r.status); }
    return r.json();
  }).then(function (j) {
    if (!j || typeof j.url !== "string" || !j.url) { throw new Error("bad response"); }
    // 后端可能只返回 "/m/xxx.png" 这样的路径，在这里拼成绝对地址，
    // 这样收卡人在任何地方打开链接都能找到这张图。
    try { return new URL(j.url, STORE.endpoint).href; }
    catch (e) { return j.url; }
  });
}
function hasLocalMedia() {
  return photoFile !== null || (musicSource === "upload" && musicFile !== null) || voiceBlob !== null;
}
function showQR(link) {
  var box = $("qrBox"), img = $("qrImg"), msg = $("qrMsg");
  box.hidden = false;
  msg.textContent = t("qr.scan");
  img.style.display = "";
  img.onerror = function () {
    img.style.display = "none";
    msg.textContent = t("qr.failed");
  };
  img.src = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=" + encodeURIComponent(link);
}
function generateShare() {
  var genBtn = $("shareGen"), ctaBtn = $("ctaGen");
  var prevText = genBtn.textContent;
  genBtn.disabled = true;
  ctaBtn.disabled = true;
  genBtn.textContent = t("share.uploading");
  var failed = [];
  uploadedPhotoUrl = null;
  uploadedMusicUrl = null;
  uploadedVoiceUrl = null;
  var chain = Promise.resolve();
  if (STORE.endpoint) {
    if (photoFile) {
      chain = chain.then(function () {
        return compressPhoto(photoFile).then(function (blob) {
          return uploadMedia(blob, "photo.jpg");
        }).then(function (u) { uploadedPhotoUrl = u; }).catch(function () { failed.push("照片"); });
      });
    }
    if (musicSource === "upload" && musicFile) {
      chain = chain.then(function () {
        return uploadMedia(musicFile, musicFile.name || "music.mp3").then(function (u) { uploadedMusicUrl = u; }).catch(function () { failed.push("音乐"); });
      });
    }
    if (voiceBlob) {
      chain = chain.then(function () {
        var ext = (voiceMime && voiceMime.indexOf("mp4") !== -1) ? "m4a" : "webm";
        return uploadMedia(voiceBlob, "voice." + ext).then(function (u) { uploadedVoiceUrl = u; }).catch(function () { failed.push("语音"); });
      });
    }
  }
  return chain.then(function () {
    genBtn.disabled = false;
    ctaBtn.disabled = false;
    genBtn.textContent = prevText;
    var link = buildShareLink();
    $("shareLink").value = link;
    $("shareBox").hidden = false;
    showQR(link);
    if (STORE.endpoint) {
      if (failed.length) {
        $("shareWarn").hidden = false;
        $("shareWarn").textContent = failed.join("、") + t("share.failedUploads");
        $("shareMsg").textContent = t("share.generatedPartial");
      } else {
        $("shareWarn").hidden = true;
        $("shareMsg").textContent = t("share.generatedAll");
      }
    } else {
      var hasUpload = hasLocalMedia();
      $("shareWarn").hidden = !hasUpload;
      if (hasUpload) { $("shareWarn").textContent = t("share.warnUpload"); }
      $("shareMsg").textContent = t("share.generated");
    }
    return link;
  });
}

/* ---------- decorations ---------- */
var fwCanvas = $("fireworks");
var fwCtx = null;
try { fwCtx = fwCanvas.getContext("2d"); } catch (e) { fwCtx = null; }
var fwParts = [], fwRunning = false, fwTimer = null, fwRaf = null;
var raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
var caf = window.cancelAnimationFrame || function (id) { clearTimeout(id); };

function fwResize() {
  var w = card.clientWidth || 360, h = card.clientHeight || 600;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  fwCanvas.width = Math.round(w * dpr);
  fwCanvas.height = Math.round(h * dpr);
  if (fwCtx) { fwCtx.setTransform(dpr, 0, 0, dpr, 0, 0); }
}
function fwBurst() {
  var w = (fwCanvas.width || 360) / Math.min(window.devicePixelRatio || 1, 2);
  var h = (fwCanvas.height || 600) / Math.min(window.devicePixelRatio || 1, 2);
  var x = w * (0.15 + Math.random() * 0.7);
  var y = h * (0.08 + Math.random() * 0.35);
  var hue = Math.floor(Math.random() * 360);
  for (var k = 0; k < 26; k++) {
    var a = Math.random() * Math.PI * 2;
    var sp = 0.8 + Math.random() * 2.6;
    fwParts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, hue: hue });
  }
}
function fwTick() {
  if (fwCtx) {
    var w = fwCanvas.width / Math.min(window.devicePixelRatio || 1, 2);
    var h = fwCanvas.height / Math.min(window.devicePixelRatio || 1, 2);
    fwCtx.clearRect(0, 0, w, h);
    for (var k = 0; k < fwParts.length; k++) {
      var p = fwParts[k];
      p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.life -= 0.016;
      if (p.life > 0) {
        fwCtx.beginPath();
        fwCtx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        fwCtx.fillStyle = "hsla(" + p.hue + ", 85%, 60%, " + Math.max(p.life, 0) + ")";
        fwCtx.fill();
      }
    }
  } else {
    for (var j = 0; j < fwParts.length; j++) {
      var q = fwParts[j];
      q.x += q.vx; q.y += q.vy; q.vy += 0.03; q.life -= 0.016;
    }
  }
  fwParts = fwParts.filter(function (p) { return p.life > 0; });
  if (fwRunning || fwParts.length > 0) { fwRaf = raf(fwTick); }
  else { fwRaf = null; }
}
function startFireworks() {
  fwResize();
  if (fwRunning) { return; }
  fwRunning = true;
  fwBurst();
  fwTimer = setInterval(fwBurst, 1100);
  if (fwRaf === null) { fwRaf = raf(fwTick); }
}
function stopFireworks() {
  fwRunning = false;
  if (fwTimer) { clearInterval(fwTimer); fwTimer = null; }
  if (fwRaf !== null) { caf(fwRaf); fwRaf = null; }
  fwParts = [];
  if (fwCtx) {
    var w = fwCanvas.width / Math.min(window.devicePixelRatio || 1, 2);
    var h = fwCanvas.height / Math.min(window.devicePixelRatio || 1, 2);
    fwCtx.clearRect(0, 0, w, h);
  }
}
window.addEventListener("resize", function () { if (fwRunning) { fwResize(); } });

function applyDeco() {
  touch();
  $("confetti").style.display = $("decoConfetti").checked ? "" : "none";
  $("hearts").style.display = $("decoHearts").checked ? "" : "none";
  $("cake").style.display = $("decoCake").checked ? "" : "none";
  if ($("decoFireworks").checked) { startFireworks(); } else { stopFireworks(); }
  card.classList.toggle("rise", $("animStyle").value === "rise");
}
each(["decoConfetti", "decoHearts", "decoCake", "decoFireworks"], function (id) {
  $(id).addEventListener("change", applyDeco);
});
$("animStyle").addEventListener("change", applyDeco);

/* ---------- occasions ---------- */
var OCCASIONS = {
  birthday: {
    title: "生日快乐", kicker: "HAPPY BIRTHDAY", name: "文文",
    blessing: "愿新的一岁，日子都像今天一样甜。\n想吃的蛋糕有人陪你吃，想去的地方有人陪你去，\n所有的愿望，都轻轻落在你手心。\n生日快乐！",
    from: "—— 火火和文文", theme: "peach", illus: "photo", music: "synth",
    deco: { confetti: true, hearts: true, cake: true, fireworks: false }, anim: "fall"
  },
  love: {
    title: "我喜欢你", kicker: "I LOVE YOU", name: "文文",
    blessing: "遇见你，是我今年最幸运的事。\n以后的每一个日子，都想和你一起过。\n我喜欢你，很认真那种。",
    from: "—— 偷偷喜欢你的人", theme: "peach", illus: "bear", music: "synth",
    deco: { confetti: false, hearts: true, cake: false, fireworks: true }, anim: "rise"
  },
  anniversary: {
    title: "纪念日快乐", kicker: "HAPPY ANNIVERSARY", name: "文文",
    blessing: "又一年了，谢谢你一直在。\n以后的日子，还想和你一起慢慢走。\n纪念日快乐！",
    from: "—— 你的另一半", theme: "mint", illus: "flowers", music: "synth",
    deco: { confetti: true, hearts: true, cake: false, fireworks: true }, anim: "fall"
  }
};
function applyOccasion(key) {
  touch();
  var o = OCCASIONS[key];
  if (!o) { return; }
  occasionSeg.set(key);
  stopMusic();
  setText("titleIn", "titleOut", o.title, "生日快乐");
  setText("kickerIn", "kickerOut", o.kicker, "HAPPY BIRTHDAY");
  setText("nameIn", "nameOut", o.name, "你");
  setText("blessingIn", "blessingOut", o.blessing, "生日快乐！");
  setText("fromIn", "fromOut", o.from, "——");
  var t = THEMES[o.theme];
  document.body.setAttribute("data-theme", o.theme);
  clearCustomColorProps();
  customColors = false;
  syncColorInputs(t);
  themeSeg.set(o.theme);
  currentIllus = o.illus;
  illusSeg.set(o.illus);
  applyIllus();
  setMusicSource(o.music);
  $("decoConfetti").checked = o.deco.confetti;
  $("decoHearts").checked = o.deco.hearts;
  $("decoCake").checked = o.deco.cake;
  $("decoFireworks").checked = o.deco.fireworks;
  $("animStyle").value = o.anim;
  applyDeco();
}
var occasionSeg = bindSeg("occasion", applyOccasion);

/* ---------- share link (#c=) ---------- */
// Shared state shape (all fields optional on decode; bad values are ignored):
// { occasion, illustration, theme, colors?: {bg, accent, text},
//   title, subtitle, name, blessing, signature,
//   photo: "default"|"hidden", music: "synth"|"upload"|"none",
//   photoUrl?, musicUrl?, voiceUrl?,
//   deco: {confetti, hearts, cake, fireworks}, animStyle: "fall"|"rise" }
// photoUrl / musicUrl / voiceUrl only exist when a storage backend
// (STORE.endpoint) uploaded the file and returned a URL. Without them,
// uploaded photos / music / voice stay in the maker's browser only
// (photo falls back to the default picture, music to the synth melody,
// voice button simply does not appear). Old links without these fields
// keep working exactly as before.
function b64urlEncode(str) {
  var b = btoa(unescape(encodeURIComponent(str)));
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) { s += "="; }
  return decodeURIComponent(escape(atob(s)));
}
function currentOccasion() {
  var b = document.querySelector('[data-occasion][aria-pressed="true"]');
  return b ? b.getAttribute("data-occasion") : "birthday";
}
function collectState() {
  var st = {
    occasion: currentOccasion(),
    illustration: currentIllus,
    theme: document.body.getAttribute("data-theme") || "peach",
    title: $("titleIn").value,
    subtitle: $("kickerIn").value,
    name: $("nameIn").value,
    blessing: $("blessingIn").value,
    signature: $("fromIn").value,
    photo: photoVisible ? "default" : "hidden",
    music: musicSource,
    deco: {
      confetti: $("decoConfetti").checked,
      hearts: $("decoHearts").checked,
      cake: $("decoCake").checked,
      fireworks: $("decoFireworks").checked
    },
    animStyle: $("animStyle").value
  };
  if (customColors) {
    st.colors = { bg: $("colorPage").value, accent: $("colorAccent").value, text: $("colorInk").value };
  }
  if (uploadedPhotoUrl) { st.photoUrl = uploadedPhotoUrl; }
  else if (remotePhotoUrl) { st.photoUrl = remotePhotoUrl; }
  if (uploadedMusicUrl) { st.musicUrl = uploadedMusicUrl; }
  else if (remoteMusicUrl) { st.musicUrl = remoteMusicUrl; }
  if (uploadedVoiceUrl) { st.voiceUrl = uploadedVoiceUrl; }
  else if (remoteVoiceUrl) { st.voiceUrl = remoteVoiceUrl; }
  return st;
}
function isHexColor(v) {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
}
function applySharedState(s) {
  if (!s || typeof s !== "object" || Array.isArray(s)) { return; }
  var occ = (typeof s.occasion === "string" && OCCASIONS[s.occasion]) ? s.occasion : "birthday";
  applyOccasion(occ);
  if (typeof s.title === "string") { setText("titleIn", "titleOut", s.title, "生日快乐"); }
  if (typeof s.subtitle === "string") { setText("kickerIn", "kickerOut", s.subtitle, "HAPPY BIRTHDAY"); }
  if (typeof s.name === "string") { setText("nameIn", "nameOut", s.name, "你"); }
  if (typeof s.blessing === "string") { setText("blessingIn", "blessingOut", s.blessing, "生日快乐！"); }
  if (typeof s.signature === "string") { setText("fromIn", "fromOut", s.signature, "——"); }
  if (typeof s.theme === "string" && THEMES[s.theme]) {
    var t = THEMES[s.theme];
    document.body.setAttribute("data-theme", s.theme);
    clearCustomColorProps();
    customColors = false;
    syncColorInputs(t);
    themeSeg.set(s.theme);
  }
  if (s.colors && typeof s.colors === "object" && isHexColor(s.colors.bg) && isHexColor(s.colors.accent) && isHexColor(s.colors.text)) {
    $("colorPage").value = s.colors.bg;
    $("colorAccent").value = s.colors.accent;
    $("colorInk").value = s.colors.text;
    applyCustomColors();
  }
  if (typeof s.illustration === "string" && (s.illustration === "photo" || s.illustration === "flowers" || s.illustration === "bear" || s.illustration === "leaves" || s.illustration === "none")) {
    currentIllus = s.illustration;
    illusSeg.set(s.illustration);
  }
  if (s.photo === "hidden") { photoVisible = false; $("photoShow").checked = false; }
  else if (s.photo === "default") { photoVisible = true; $("photoShow").checked = true; }
  applyIllus();
  if (typeof s.photoUrl === "string" && /^https?:\/\//.test(s.photoUrl) && s.photoUrl.length < 2000) {
    remotePhotoUrl = s.photoUrl;
    photoImg.src = s.photoUrl;
    photoVisible = true;
    $("photoShow").checked = true;
    currentIllus = "photo";
    illusSeg.set("photo");
    applyIllus();
  }
  if (s.music === "synth" || s.music === "none") { setMusicSource(s.music); }
  else if (s.music === "upload") {
    if (typeof s.musicUrl === "string" && /^https?:\/\//.test(s.musicUrl) && s.musicUrl.length < 2000) {
      remoteMusicUrl = s.musicUrl;
      musicName = t("music.uploadedMusic");
      audioEl.src = s.musicUrl;
      setMusicSource("upload");
    } else {
      setMusicSource("synth");
    }
  }
  if (typeof s.voiceUrl === "string" && /^https?:\/\//.test(s.voiceUrl) && s.voiceUrl.length < 2000) {
    remoteVoiceUrl = s.voiceUrl;
    voiceAudio.src = s.voiceUrl;
    voiceBtn.hidden = false;
  }
  if (s.deco && typeof s.deco === "object") {
    if (typeof s.deco.confetti === "boolean") { $("decoConfetti").checked = s.deco.confetti; }
    if (typeof s.deco.hearts === "boolean") { $("decoHearts").checked = s.deco.hearts; }
    if (typeof s.deco.cake === "boolean") { $("decoCake").checked = s.deco.cake; }
    if (typeof s.deco.fireworks === "boolean") { $("decoFireworks").checked = s.deco.fireworks; }
  }
  if (s.animStyle === "fall" || s.animStyle === "rise") { $("animStyle").value = s.animStyle; }
  applyDeco();
}
function parseSharedHash() {
  try {
    var h = location.hash || "";
    var raw = null;
    if (h.indexOf("#c=") === 0) { raw = h.slice(3); }
    else if (h.indexOf("#card=") === 0) { raw = h.slice(6); }
    else { return null; }
    if (!raw) { return null; }
    var s = JSON.parse(b64urlDecode(raw));
    if (!s || typeof s !== "object" || Array.isArray(s)) { return null; }
    return s;
  } catch (e) { return null; }
}
function buildShareLink() {
  return buildShareLinkFrom(collectState());
}
function buildShareLinkFrom(st) {
  return location.origin + location.pathname + "#c=" + b64urlEncode(JSON.stringify(st));
}
function copyText(text, ok, fail) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(ok, function () { fallbackCopy(text, ok, fail); });
  } else {
    fallbackCopy(text, ok, fail);
  }
}
function fallbackCopy(text, ok, fail) {
  try {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var done = document.execCommand("copy");
    document.body.removeChild(ta);
    if (done) { ok(); } else { fail(); }
  } catch (e) { fail(); }
}
function markShareStale(e) {
  if ($("shareBox").hidden) { return; }
  var id = (e.target && e.target.id) || "";
  if (id === "shareLink" || id === "shareCopy" || id === "shareGen" || id === "shareMsg") { return; }
  $("shareMsg").textContent = t("share.changed");
}
document.querySelector(".editor").addEventListener("input", markShareStale);
document.querySelector(".editor").addEventListener("change", markShareStale);
$("shareGen").addEventListener("click", function () {
  generateShare();
});
$("ctaGen").addEventListener("click", function () {
  var sec = $("sec-share");
  if (sec && sec.scrollIntoView) {
    try { sec.scrollIntoView({ behavior: "smooth", block: "start" }); }
    catch (e) { sec.scrollIntoView(); }
  }
  generateShare();
});
$("shareLink").addEventListener("click", function () { this.select(); });
$("shareCopy").addEventListener("click", function () {
  var link = $("shareLink").value;
  if (!link) { return; }
  copyText(link,
    function () { $("shareMsg").textContent = t("share.copied"); },
    function () { $("shareMsg").textContent = t("share.copyFailed"); });
});


each(document.querySelectorAll("[data-tpl]"), function (b) {
  b.addEventListener("click", function () {
    var t = currentTemplates()[b.getAttribute("data-tpl")];
    if (typeof t !== "string") { return; }
    setText("blessingIn", "blessingOut", t, "生日快乐！");
    $("tplMsg").textContent = t("share.tplReplaced");
  });
});

/* ---------- steps nav: tap a step to jump to that section ---------- */
each(document.querySelectorAll(".step[data-goto]"), function (el) {
  el.addEventListener("click", function () {
    var target = $(el.getAttribute("data-goto"));
    if (target && target.scrollIntoView) {
      try { target.scrollIntoView({ behavior: "smooth", block: "start" }); }
      catch (e) { target.scrollIntoView(); }
    }
  });
});

/* ---------- recipient mode: "我也要做一张" ---------- */
$("makeOwn").addEventListener("click", function () {
  location.href = location.href.split("#")[0];
});

/* ---------- init ---------- */
applyIllus();
applyDeco();
updateMusicLabel();
updateMusicSourceName();
var shared = parseSharedHash();
if (shared) {
  applySharedState(shared);
  // 收卡人模式：只看卡片，不看编辑器。
  document.body.classList.add("recipient");
  $("pageFooter").textContent = t("footer.recipient");
}$("langToggle").addEventListener("click", function () {
  setLang(lang === "en" ? "zh" : "en");
});
applyLang();

/* ---------- agent page API ----------
   The site actions (card-actions.js) call these. They share the site's own
   rules: text length limits, hex colours, enum values. Bad input is refused
   with { ok: false, reason, field } instead of changing anything. */
var MAX_TEXT = { title: 12, kicker: 24, name: 12, blessing: 500, signature: 20 };
function getVersion() { return stateVersion; }
function getCardState() {
  var st = collectState();
  st.version = stateVersion;
  st.templates = {
    warm: { en: TEMPLATES_EN.warm, zh: TEMPLATES_ZH.warm },
    fun: { en: TEMPLATES_EN.fun, zh: TEMPLATES_ZH.fun },
    friend: { en: TEMPLATES_EN.friend, zh: TEMPLATES_ZH.friend },
    elder: { en: TEMPLATES_EN.elder, zh: TEMPLATES_ZH.elder }
  };
  st.occasions = OCCASION_LIST;
  st.themes = THEME_LIST;
  st.illustrations = ILLUSTRATION_LIST;
  st.musicOptions = MUSIC_OPTIONS;
  st.photoState = photoFile ? "uploaded" : (remotePhotoUrl ? "linked" : st.photo);
  st.hasVoice = !!(voiceBlob || remoteVoiceUrl);
  st.shareLink = $("shareLink").value || null;
  st.storage = STORE.endpoint ? "configured" : "not configured — share links carry words and look only";
  st.notSupportedByAssistant = [
    "uploading a photo or music file (the visitor picks the file in the page)",
    "recording a voice blessing (the visitor records in the page)",
    "sending the card by email or message"
  ];
  return st;
}
function setCardText(args) {
  args = args || {};
  var fields = [
    ["title", "titleIn", "titleOut", "生日快乐"],
    ["kicker", "kickerIn", "kickerOut", "HAPPY BIRTHDAY"],
    ["name", "nameIn", "nameOut", "你"],
    ["blessing", "blessingIn", "blessingOut", "生日快乐！"],
    ["signature", "fromIn", "fromOut", "——"]
  ];
  var i, f;
  for (i = 0; i < fields.length; i++) {
    f = fields[i];
    if (args[f[0]] === undefined) { continue; }
    if (typeof args[f[0]] !== "string") { return { ok: false, reason: "not a string", field: f[0] }; }
    if (args[f[0]].length > MAX_TEXT[f[0]]) { return { ok: false, reason: "too long (max " + MAX_TEXT[f[0]] + " characters)", field: f[0] }; }
  }
  for (i = 0; i < fields.length; i++) {
    f = fields[i];
    if (args[f[0]] === undefined) { continue; }
    setText(f[1], f[2], args[f[0]], f[3]);
  }
  return { ok: true, state: getCardState() };
}
function applyBlessingTemplate(key) {
  if (!currentTemplates()[key]) { return { ok: false, reason: "unknown template (warm, fun, friend, elder)", field: "template" }; }
  setText("blessingIn", "blessingOut", currentTemplates()[key], "生日快乐！");
  $("tplMsg").textContent = t("share.tplReplaced");
  return { ok: true, state: getCardState() };
}
function setOccasion(key) {
  if (!OCCASIONS[key]) { return { ok: false, reason: "unknown occasion (birthday, love, anniversary)", field: "occasion" }; }
  applyOccasion(key);
  return { ok: true, state: getCardState() };
}
function setTheme(theme, colors) {
  if (!THEMES[theme]) { return { ok: false, reason: "unknown theme (peach, mint, blue)", field: "theme" }; }
  if (colors !== undefined && colors !== null) {
    if (!isHexColor(colors.bg) || !isHexColor(colors.accent) || !isHexColor(colors.text)) {
      return { ok: false, reason: "colors must be #RRGGBB {bg, accent, text}", field: "colors" };
    }
  }
  var th = THEMES[theme];
  document.body.setAttribute("data-theme", theme);
  clearCustomColorProps();
  customColors = false;
  syncColorInputs(th);
  themeSeg.set(theme);
  if (colors) {
    $("colorPage").value = colors.bg;
    $("colorAccent").value = colors.accent;
    $("colorInk").value = colors.text;
    applyCustomColors();
  }
  return { ok: true, state: getCardState() };
}
function setIllustration(illustration, showPhoto) {
  var ok = ["photo", "flowers", "bear", "leaves", "none"];
  if (ok.indexOf(illustration) === -1) { return { ok: false, reason: "unknown illustration (photo, flowers, bear, leaves, none)", field: "illustration" }; }
  currentIllus = illustration;
  illusSeg.set(illustration);
  if (showPhoto !== undefined) {
    photoVisible = !!showPhoto;
    $("photoShow").checked = !!showPhoto;
  }
  applyIllus();
  return { ok: true, state: getCardState() };
}
function setDecoration(deco) {
  deco = deco || {};
  var boxes = [["confetti", "decoConfetti"], ["hearts", "decoHearts"], ["cake", "decoCake"], ["fireworks", "decoFireworks"]];
  var i;
  for (i = 0; i < boxes.length; i++) {
    if (deco[boxes[i][0]] !== undefined) {
      if (typeof deco[boxes[i][0]] !== "boolean") { return { ok: false, reason: "must be true or false", field: boxes[i][0] }; }
      $(boxes[i][1]).checked = deco[boxes[i][0]];
    }
  }
  if (deco.animStyle !== undefined) {
    if (deco.animStyle !== "fall" && deco.animStyle !== "rise") { return { ok: false, reason: "unknown animation style (fall, rise)", field: "animStyle" }; }
    $("animStyle").value = deco.animStyle;
  }
  applyDeco();
  return { ok: true, state: getCardState() };
}
function setMusic(source) {
  if (source === "upload") { return { ok: false, reason: "upload needs a file — the visitor picks it in the page", field: "source" }; }
  if (source !== "synth" && source !== "none") { return { ok: false, reason: "unknown music source (synth, none)", field: "source" }; }
  setMusicSource(source);
  return { ok: true, state: getCardState() };
}
function checkGenerateShare(args) {
  args = args || {};
  if (args.expectedVersion !== undefined && args.expectedVersion !== stateVersion) {
    return { ok: false, reason: "the card changed since it was last read — read the card again first", field: "expectedVersion" };
  }
  if (!($("blessingIn").value || "").trim()) {
    return { ok: false, reason: "the blessing is empty — write a blessing first", field: "blessing" };
  }
  var st = getCardState();
  return { ok: true, version: stateVersion, title: st.title, name: st.name, blessing: st.blessing, occasion: st.occasion };
}
function generateShareLink(args) {
  var check = checkGenerateShare(args);
  if (!check.ok) { return Promise.resolve(check); }
  return generateShare().then(function (link) {
    return { ok: true, link: link, version: stateVersion, state: getCardState() };
  });
}

export { getVersion, getCardState, setCardText, applyBlessingTemplate, setOccasion, setTheme, setIllustration, setDecoration, setMusic, checkGenerateShare, generateShareLink, getLang, setLang, applyLang, currentTemplates, TEMPLATES_ZH, TEMPLATES_EN, OCCASIONS, THEMES, OCCASION_LIST, THEME_LIST, ILLUSTRATION_LIST, MUSIC_OPTIONS };
