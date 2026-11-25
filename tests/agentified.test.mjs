// Tests for the agentified birthday e-card site.
//
// Run from the project folder:
//   node --test tests/agentified.test.mjs
//
// The page script (card.js) is imported under Node with a stub document, so the
// actions run against the real page code, not a copy of its rules.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { StubDocument } from "./stub_document.mjs";
import { StubElement } from "./stub_element.mjs";
import { StubOption } from "./stub_option.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const read = (name) => readFileSync(join(ROOT, name), "utf-8");
const ORIGIN = "http://localhost:8080";

// One model call (system prompt + tool definitions) must stay under this.
const CALL_BUDGET = 16000;

let doc;
let card;
let cardActions;
let bridgeActions;
let site;
let manifest;
let network;

function segButton(attr, value, pressed) {
  const b = new StubElement("button");
  b.setAttribute(`data-${attr}`, value);
  b.setAttribute("aria-pressed", pressed ? "true" : "false");
  return b;
}

function provideSegs() {
  const occasion = {
    birthday: segButton("occasion", "birthday", true),
    love: segButton("occasion", "love", false),
    anniversary: segButton("occasion", "anniversary", false),
  };
  const illus = {
    photo: segButton("illus", "photo", true),
    flowers: segButton("illus", "flowers", false),
    bear: segButton("illus", "bear", false),
    leaves: segButton("illus", "leaves", false),
    none: segButton("illus", "none", false),
  };
  const music = {
    synth: segButton("music", "synth", true),
    upload: segButton("music", "upload", false),
    none: segButton("music", "none", false),
  };
  const theme = {
    peach: segButton("theme", "peach", true),
    mint: segButton("theme", "mint", false),
    blue: segButton("theme", "blue", false),
  };
  const tpl = {};
  for (const key of ["warm", "fun", "friend", "elder"]) {
    const b = new StubElement("button");
    b.setAttribute("data-tpl", key);
    tpl[key] = b;
  }
  doc.provide("[data-occasion]", Object.values(occasion));
  doc.provide("[data-illus]", Object.values(illus));
  doc.provide("[data-music]", Object.values(music));
  doc.provide("[data-theme]", Object.values(theme));
  doc.provide("[data-tpl]", Object.values(tpl));
  doc.provide(".step[data-goto]", []);
  doc.provide("[data-i18n]", []);
  doc.provide(".editor", [new StubElement("section")]);
  doc.provide("#ns-input", []);
  // currentOccasion() asks for the pressed occasion button. Resolve it from the
  // segmented buttons, as a browser would, instead of a fixed element.
  const origQuerySelector = doc.querySelector.bind(doc);
  doc.querySelector = (selector) => {
    if (selector === '[data-occasion][aria-pressed="true"]') {
      return Object.values(occasion).find((b) => b.getAttribute("aria-pressed") === "true") || null;
    }
    return origQuerySelector(selector);
  };
  return { occasion, illus, music, theme, tpl };
}

let segs;

/** Put the card back on the birthday preset with the v4 default words. */
function resetCard() {
  card.setOccasion("birthday");
  card.setCardText({
    title: "生日快乐",
    kicker: "HAPPY BIRTHDAY",
    name: "文文",
    blessing: "愿新的一岁，日子都像今天一样甜。\n想吃的蛋糕有人陪你吃，想去的地方有人陪你去，\n所有的愿望，都轻轻落在你手心。\n生日快乐！",
    signature: "—— 火火和文文",
  });
}

before(async () => {
  const html = read("index.html");
  doc = StubDocument.fromHtml(html, `${ORIGIN}/`);
  segs = provideSegs();
  globalThis.document = doc;
  // Node exposes navigator as a getter-only global; define it instead.
  Object.defineProperty(globalThis, "navigator", { value: {}, configurable: true });
  globalThis.location = {
    hash: "",
    origin: ORIGIN,
    pathname: "/",
    href: `${ORIGIN}/`,
  };
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, v),
    },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    addEventListener: () => {},
  };
  globalThis.Option = StubOption;
  card = await import("../card.js");
  cardActions = await import("../card-actions.js");
  bridgeActions = await import("../bridge/bridge-actions.js");
  manifest = JSON.parse(read("agent-manifest.json"));
  network = JSON.parse(read("birthday_ecard_assistant.network.json"));
  resetCard();
});

function actionDefs() {
  const defs = [];
  cardActions.registerActions({ register: (def) => defs.push(def) });
  return defs;
}

function expand(text) {
  const reps = network.commondefs.replacement_strings;
  let out = text;
  for (const [key, value] of Object.entries(reps)) {
    out = out.split(`{${key}}`).join(value);
  }
  return out;
}

test("network: four agents, front reachable, no demo_mode, Otari default model", () => {
  assert.equal(manifest.networks.length, 1);
  assert.equal(manifest.networks[0].name, "birthday_ecard_assistant");
  assert.equal(manifest.networks[0].front_man, "card_coordinator");
  assert.equal(manifest.networks[0].hocon, "./birthday_ecard_assistant.network.json");
  const agents = network.tools;
  assert.ok(agents.length >= 2, "at least two agents");
  assert.equal(agents[0].name, "card_coordinator");
  const names = new Set(agents.map((a) => a.name));
  assert.ok(names.has("blessing_writer"));
  assert.ok(names.has("template_stylist"));
  assert.ok(names.has("card_builder"));
  // Every agent is reachable from the front agent through "tools".
  const seen = new Set(["card_coordinator"]);
  const queue = ["card_coordinator"];
  while (queue.length) {
    const name = queue.shift();
    const cur = agents.find((a) => a.name === name);
    for (const next of cur.tools || []) {
      if (names.has(next) && !seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  assert.deepEqual([...seen].sort(), [...names].sort());
  assert.equal(network.llm_config.model_name, "alibaba/qwen3.8-flash");
  assert.equal(network.max_steps, 12);
  assert.equal(network.cruse.version, 1);
  assert.ok(!JSON.stringify(network).includes("demo_mode"), "no demo_mode");
  assert.ok(!JSON.stringify(network).includes("${"), "no ${} substitutions left");
  assert.deepEqual(manifest.networks[0].sample_queries, network.metadata.sample_queries);
  assert.deepEqual(manifest.actions.agentTools, [
    "get_card_state", "set_card_text", "apply_blessing_template", "set_occasion",
    "set_theme", "set_illustration", "set_decoration", "set_music", "generate_share_link",
  ]);
  assert.equal(manifest.llm_router.base_url, "https://api.otari.ai/api/v1");
  assert.equal(manifest.llm_router.mock, false);
  assert.equal(manifest.peer_policy.mode, "closed");
  assert.equal(manifest.actions.module, "./card-actions.js");
});

test("network: no TODO or placeholder text in the published files", () => {
  for (const name of ["birthday_ecard_assistant.hocon", "agent-manifest.json", "card-actions.js", "site.js", "bridge/bridge-actions.js"]) {
    const text = read(name);
    assert.ok(!text.includes("TODO"), `${name} has a TODO`);
    assert.ok(!text.includes("<Site name>"), `${name} has a placeholder`);
    assert.ok(!text.includes("<network_name>"), `${name} has a placeholder`);
  }
});

test("prompt budget: one front-agent call stays under 16,000 characters", () => {
  const front = network.tools[0];
  const instructions = expand(front.instructions);
  assert.ok(!instructions.includes("{grounding_rules}"), "placeholders expand");
  assert.ok(!instructions.includes("{cruse_rules}"), "placeholders expand");
  // The front agent's instructions name specialists, not website_* actions to call:
  // another site running this network has no website_* tools. The grounding rules
  // may still mention website_* results in general terms.
  assert.ok(!instructions.includes("website_set_"), "front instructions name no write action");
  assert.ok(!instructions.includes("website_generate_"), "front instructions name no irreversible action");
  assert.ok(!instructions.includes("website_apply_"), "front instructions name no template action");
  const defs = actionDefs();
  const tools = defs.map((d) => ({ type: "function", function: { name: `website_${d.name}`, description: d.description, parameters: d.inputSchema } }));
  for (const name of front.tools) {
    const agent = network.tools.find((a) => a.name === name);
    tools.push({ type: "function", function: { name, description: agent.function.description, parameters: agent.function.parameters } });
  }
  // The runtime adds CRUSE context on top of the instructions; allow 2,000 for it.
  const total = instructions.length + 2000 + JSON.stringify(tools).length;
  assert.ok(total < CALL_BUDGET, `front call is ${total} chars, over ${CALL_BUDGET}`);
});

test("actions: get_card_state reads the real card", () => {
  resetCard();
  const defs = actionDefs();
  const read = defs.find((d) => d.name === "get_card_state");
  assert.equal(read.effect, "read");
  const st = read.execute();
  assert.equal(st.occasion, "birthday");
  assert.equal(st.theme, "peach");
  assert.equal(st.illustration, "photo");
  assert.equal(st.title, "生日快乐");
  assert.equal(st.name, "文文");
  assert.ok(st.blessing.includes("生日快乐"));
  assert.equal(typeof st.version, "number");
  assert.ok(st.version >= 1, "init bumps the version");
  assert.ok(st.templates.warm.en.startsWith("May your new year"));
  assert.equal(st.occasions.length, 3);
  assert.equal(st.themes.length, 3);
  assert.equal(st.illustrations.length, 5);
  assert.ok(st.notSupportedByAssistant.join(" ").includes("uploading a photo"));
  assert.ok(st.notSupportedByAssistant.join(" ").includes("recording a voice"));
});

test("actions: set_card_text changes words, bumps the version, refuses too-long text", () => {
  resetCard();
  const defs = actionDefs();
  const set = defs.find((d) => d.name === "set_card_text");
  assert.equal(set.effect, "write");
  const before = set.execute ? card.getCardState().version : 0;
  const out = card.setCardText({ title: "Happy Day", blessing: "Have a wonderful year." });
  assert.equal(out.ok, true);
  assert.equal(out.state.title, "Happy Day");
  assert.equal(out.state.blessing, "Have a wonderful year.");
  assert.equal(out.state.name, "文文", "untouched fields stay");
  assert.ok(out.state.version > before, "version bumps");
  const bad = card.setCardText({ title: "This title is far too long" });
  assert.equal(bad.ok, false);
  assert.equal(bad.field, "title");
  assert.equal(card.getCardState().title, "Happy Day", "refusal changes nothing");
  const notString = card.setCardText({ title: 42 });
  assert.equal(notString.ok, false);
});

test("actions: apply_blessing_template swaps the blessing; unknown template refuses", () => {
  resetCard();
  const out = card.applyBlessingTemplate("fun");
  assert.equal(out.ok, true);
  assert.ok(out.state.blessing.includes("One year older"));
  const bad = card.applyBlessingTemplate("scary");
  assert.equal(bad.ok, false);
  assert.equal(bad.field, "template");
});

test("actions: set_occasion resets the card to that occasion; unknown refuses", () => {
  resetCard();
  const out = card.setOccasion("love");
  assert.equal(out.ok, true);
  assert.equal(out.state.occasion, "love");
  assert.equal(out.state.title, "我喜欢你");
  assert.equal(out.state.illustration, "bear");
  assert.equal(card.setOccasion("wedding").ok, false);
});

test("actions: set_theme changes colours; bad hex refuses", () => {
  resetCard();
  const out = card.setTheme("mint");
  assert.equal(out.ok, true);
  assert.equal(out.state.theme, "mint");
  const custom = card.setTheme("blue", { bg: "#111111", accent: "#222222", text: "#333333" });
  assert.equal(custom.ok, true);
  assert.deepEqual(custom.state.colors, { bg: "#111111", accent: "#222222", text: "#333333" });
  const bad = card.setTheme("blue", { bg: "red", accent: "#222222", text: "#333333" });
  assert.equal(bad.ok, false);
  assert.equal(bad.field, "colors");
  assert.equal(card.setTheme("purple").ok, false);
});

test("actions: set_illustration, set_decoration and set_music", () => {
  resetCard();
  const illus = card.setIllustration("leaves");
  assert.equal(illus.ok, true);
  assert.equal(illus.state.illustration, "leaves");
  assert.equal(card.setIllustration("dog").ok, false);
  const deco = card.setDecoration({ fireworks: true, animStyle: "rise" });
  assert.equal(deco.ok, true);
  assert.equal(deco.state.deco.fireworks, true);
  assert.equal(deco.state.animStyle, "rise");
  assert.equal(deco.state.deco.confetti, true, "untouched decorations stay");
  assert.equal(card.setDecoration({ animStyle: "spin" }).ok, false);
  const music = card.setMusic("none");
  assert.equal(music.ok, true);
  assert.equal(music.state.music, "none");
  const upload = card.setMusic("upload");
  assert.equal(upload.ok, false, "the assistant cannot pick a file");
});

test("actions: typing in the page bumps the version, so a stale link is refused", async () => {
  resetCard();
  const v1 = card.getCardState().version;
  const blessingIn = doc.getElementById("blessingIn");
  blessingIn.value = "A blessing typed by hand.";
  blessingIn.dispatch("input");
  assert.ok(card.getCardState().version > v1, "manual edit bumps the version");
  const stale = await card.generateShareLink({ expectedVersion: v1 });
  assert.equal(stale.ok, false);
  assert.equal(stale.field, "expectedVersion");
});

test("actions: generate_share_link refuses an empty blessing, then makes a link", async () => {
  resetCard();
  card.setCardText({ blessing: "   " });
  const empty = await card.generateShareLink({ expectedVersion: card.getCardState().version });
  assert.equal(empty.ok, false);
  assert.equal(empty.field, "blessing");
  card.setCardText({ blessing: "Have a wonderful year, Mum." });
  const version = card.getCardState().version;
  const out = await card.generateShareLink({ expectedVersion: version });
  assert.equal(out.ok, true);
  assert.ok(out.link.startsWith(`${ORIGIN}/#c=`), out.link.slice(0, 40));
  const payload = out.link.split("#c=")[1];
  const decoded = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8"));
  assert.equal(decoded.title, "生日快乐");
  assert.equal(decoded.blessing, "Have a wonderful year, Mum.");
  assert.equal(decoded.name, "文文");
  assert.equal(card.getCardState().shareLink, out.link);
});

test("i18n: default English, Chinese toggle swaps the page language", () => {
  assert.equal(card.getLang(), "en");
  assert.equal(doc.title, "Happy Birthday · HuoHuo & WenWen E-Card");
  card.setLang("zh");
  assert.equal(card.getLang(), "zh");
  assert.equal(doc.documentElement.lang, "zh-CN");
  assert.equal(doc.title, "生日快乐 · 火火文文电子贺卡");
  assert.equal(card.currentTemplates().warm, card.TEMPLATES_ZH.warm);
  card.setLang("en");
  assert.equal(doc.documentElement.lang, "en");
  assert.equal(card.currentTemplates().warm, card.TEMPLATES_EN.warm);
});

test("bridge: get_card_catalog shares only public facts, no visitor card", () => {
  const defs = [];
  bridgeActions.registerActions({ register: (def) => defs.push(def) });
  assert.equal(defs.length, 1);
  assert.equal(defs[0].name, "get_card_catalog");
  assert.equal(defs[0].effect, "read");
  assert.deepEqual(defs[0].callerOrigins, ["*"]);
  const catalog = defs[0].execute();
  assert.equal(catalog.occasions.length, 3);
  assert.equal(catalog.themes.length, 3);
  assert.equal(catalog.illustrations.length, 5);
  assert.ok(catalog.templates.warm.en.startsWith("May your new year"));
  assert.ok(catalog.templates.warm.zh.includes("生日快乐"));
  assert.deepEqual(catalog.musicOptions, ["synth", "upload", "none"]);
  assert.ok(!("blessing" in catalog), "no visitor blessing");
  assert.ok(!("title" in catalog), "no visitor title");
  assert.ok(!("name" in catalog), "no visitor name");
});

test("dialog: generate_share_link shows the card and refuses a stale version", async () => {
  delete globalThis.window;
  site = await import("../site.js");
  resetCard();
  card.setCardText({ blessing: "Have a wonderful year, Mum." });
  const version = card.getCardState().version;
  const content = site.AssistantMount.dialogContent({
    action: "generate_share_link",
    origin: ORIGIN,
    effect: "irreversible",
    arguments: { expectedVersion: version },
  });
  assert.equal(content.title, "Make the share link?");
  assert.equal(content.confirm, "Make the share link");
  assert.equal(content.decline, "Don't make it yet");
  assert.equal(content.details["Title"], "生日快乐");
  assert.equal(content.details["For"], "文文");
  assert.ok(content.details["Blessing"].includes("Have a wonderful year"));
  assert.equal(content.details["Occasion"], "birthday");
  assert.equal(content.refusal, undefined);
  assert.ok(content.exact.includes("generate_share_link"));

  const stale = site.AssistantMount.dialogContent({
    action: "generate_share_link",
    origin: ORIGIN,
    effect: "irreversible",
    arguments: { expectedVersion: version + 99 },
  });
  assert.ok(stale.refusal.includes("changed since it was last read"));

  // The visitor confirms: review() resolves true and the dialog is gone.
  const item = {
    action: "generate_share_link",
    origin: ORIGIN,
    effect: "irreversible",
    arguments: { expectedVersion: version },
  };
  const pending = site.AssistantMount.review([item]);
  const dialog = doc.body.children.find((c) => c.tag === "dialog");
  assert.ok(dialog, "the dialog opened");
  const confirm = dialog.children.find((c) => c.textContent === "Make the share link");
  assert.ok(confirm, "the confirm button is named after what it does");
  confirm.dispatch("click");
  assert.equal(await pending, true);
  assert.equal(dialog.removed, true);

  // The visitor declines: review() resolves false and nothing runs.
  const pending2 = site.AssistantMount.review([item]);
  const dialog2 = doc.body.children.find((c) => c.tag === "dialog" && !c.removed);
  const decline = dialog2.children.find((c) => c.textContent === "Don't make it yet");
  decline.dispatch("click");
  assert.equal(await pending2, false);

  // A stale version throws before any dialog opens.
  await assert.rejects(
    site.AssistantMount.review([{
      action: "generate_share_link",
      origin: ORIGIN,
      effect: "irreversible",
      arguments: { expectedVersion: version + 99 },
    }]),
    /changed since it was last read/,
  );
});
