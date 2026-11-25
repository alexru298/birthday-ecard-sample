// Public catalog for the birthday e-card site.
// Pure data: no DOM access, so the action bridge can import it too.
// The page (card.js) and the bridge (bridge/bridge-actions.js) share this file.

/* ---------- blessing templates ---------- */
export const TEMPLATES_ZH = {
  warm: "愿你新的一岁，睡得香、吃得好，\n笑得比去年更多一点。\n生日快乐，天天都开心。",
  fun: "又长大一岁啦，蛋糕先吃，\n愿望先许，变老的事明天再说。\n生日快乐！",
  friend: "认识你真好。\n新的一岁，继续一起吃饭、一起闹，\n好运都给你留着。\n生日快乐！",
  elder: "祝您身体硬朗，心情舒畅，\n儿孙绕膝，笑口常开。\n生日快乐，福寿安康！"
};

/* ---------- blessing templates, English versions ---------- */
export const TEMPLATES_EN = {
  warm: "May your new year bring sound sleep, good food,\\nand more laughter than last year.\\nHappy birthday — be happy every day.",
  fun: "One year older — eat the cake first,\\nmake the wish, and worry about getting old tomorrow.\\nHappy birthday!",
  friend: "So glad to know you.\\nIn the new year, let's keep sharing meals and laughs —\\nall the good luck is saved for you.\\nHappy birthday!",
  elder: "Wishing you good health, a cheerful heart,\\nfamily gathered around, and a smile always on your face.\\nHappy birthday, and many blessed years!"
};

/* ---------- public catalog (shared with the assistant and the bridge) ---------- */
export const OCCASION_LIST = [
  { key: "birthday", title: "生日快乐", kicker: "HAPPY BIRTHDAY", theme: "peach", illustration: "photo", music: "synth" },
  { key: "love", title: "我喜欢你", kicker: "I LOVE YOU", theme: "peach", illustration: "bear", music: "synth" },
  { key: "anniversary", title: "纪念日快乐", kicker: "HAPPY ANNIVERSARY", theme: "mint", illustration: "flowers", music: "synth" }
];
export const THEME_LIST = [
  { key: "peach", label: "蜜桃粉", page: "#FFF1E8", accent: "#E2574C", ink: "#5B3A2E" },
  { key: "mint", label: "薄荷绿", page: "#EAF6EE", accent: "#2E8B6A", ink: "#234434" },
  { key: "blue", label: "星空蓝", page: "#EAF0FB", accent: "#3B62B8", ink: "#26365A" }
];
export const ILLUSTRATION_LIST = [
  { key: "photo", label: "火火文文" },
  { key: "flowers", label: "简约花束" },
  { key: "bear", label: "气球小熊" },
  { key: "leaves", label: "森系绿叶" },
  { key: "none", label: "隐藏插画" }
];
export const MUSIC_OPTIONS = ["synth", "upload", "none"];
