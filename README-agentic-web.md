# Birthday E-Card — Open Agentic Web Challenge

Agentified birthday e-card site, built from the v4 e-card sample. The visitor makes a
card on the page; an in-page assistant (4 agents, browser runtime) writes the blessing,
picks the look, and makes the share link.

## Spec

- Normative spec: `docs/worldwide_agentic_web_mvp_spec-0.2.md` — MVP Profile 0.2,
  6 November 2026, Cognizant AI Lab, commit `fd872b9221aeb8ff762b75a5badbf84b23c133cc`
  of https://github.com/cognizant-ai-labs/agentic-web (vendored copy).
- Runtime: copied from `skills/agentify-website/runtime/` (do not use a bundle's own
  runtime — it has no `website_*` tool bridge). Runtime revision in use: nsdeploy
  commit `53a787c` (2026-11-11).
- Protocol name: `nsdeploy`. Peer policy: closed (no partners yet).

## Network

- `birthday_ecard_assistant.hocon` — source of truth. Front agent `card_coordinator`
  + 3 specialists (`blessing_writer`, `template_stylist`, `card_builder`), plain
  delegation, no `demo_mode`, no AAOSA.
- LLM: `alibaba/qwen3.8-flash` via hosted Otari `https://api.otari.ai/api/v1`
  (default router; visitors may bring their own key in the settings panel).
- `max_steps` 12, CRUSE v1.
- The front agent applies all page changes; specialists return exact values as text.
  The only irreversible action is `generate_share_link`, confirmed in the visitor's
  own dialog with the card's details, and refused on a stale `expectedVersion` or an
  empty blessing.

## Site actions (`card-actions.js`, 9 tools)

Read: `get_card_state`. Writes (reversible, no dialog): `set_card_text`,
`apply_blessing_template`, `set_occasion`, `set_theme`, `set_illustration`,
`set_decoration`, `set_music`. Irreversible (dialog): `generate_share_link`.
The page's own rules are enforced in `card.js` (text length limits, hex colours,
enum values); bad input is refused with `{ok: false, reason, field}`.

The bridge (`bridge/bridge-actions.js`) shares one read with any site:
`get_card_catalog` — public catalog only (occasions, themes, illustrations,
templates, music options). No visitor card data, no writes.

## Interface

- English by default, 中文 toggle in the header (choice saved in localStorage).
  Card sample content stays as the maker wrote it.
- Assistant section below the editor: chat, agent activity, model settings (BYOK),
  structured action proposals (CRUSE), confirmation dialog. Hidden in recipient mode.
- `card.js` is the v4 page script as an ES module, with a state version counter
  (`touch()` on every card change) and the agent page API exported at the end.
  Public catalog data lives in `js/site-data.js`, shared by the page and the bridge.

## Build and check

```sh
SKILL=/tmp/agentic-web/skills/agentify-website
node $SKILL/scripts/build_network.mjs birthday_ecard_assistant.hocon \
  --manifest agent-manifest.json --runtime $SKILL/runtime
# check only: add --check
```

Writes: `birthday_ecard_assistant.network.json`, `agent-mcp.json`,
`.well-known/nsdeploy.json`, `.well-known/nsdeploy-agent.json`,
`bridge/action-bridge.html`, `bridge/agent-manifest.json`.

## Tests

```sh
node --test tests/agentified.test.mjs   # 14 tests, all passing (2026-11-25)
```

Covers: network validity + reachability + no `demo_mode`, prompt budget
(< 16,000 chars per front-agent call), all 9 actions incl. refusals, version
staleness (manual typing bumps the version), share-link generation + link decode,
i18n toggle, bridge catalog (no visitor data), confirmation dialog
(confirm / decline / stale refusal).

## Local verification (2026-11-25)

- `serve_site.mjs . --port 8091`: all 17 paths 200 (page, modules, manifest,
  network, agent-mcp, links, both `.well-known` files, bridge files, runtime).
- `Access-Control-Allow-Origin: *` on the agent files (manifest, network,
  `.well-known`); the dev server sends it only on public files by design —
  GitHub Pages sends it on everything.
- `check_partner.mjs http://127.0.0.1:8091/birthday_ecard_assistant`: all files
  readable from another site's perspective; bridge loads; network runs on the
  visitor's model or the front-agent model.

## Deploy (BLOCKED — needs push authorisation)

Target: GitHub Pages, public repo `alexru298/birthday-ecard-sample`
(https://alexru298.github.io/birthday-ecard-sample/). There is no local clone
in this workspace, `gh` is not logged in, and the fine-grained GitHub token
only covers `make-fun-guide`. Do not push until a token with write access to
`birthday-ecard-sample` is provided. `.nojekyll` is already in place (needed
for `.well-known/`). After push, re-check the public URLs with
`curl -sI` (CORS header) and `check_partner.mjs` against the public URL.

## Still missing

- GitHub Pages deployment (blocked, see above).
- A live-browser clean-visitor journey: the sandboxed Chromium here refuses to
  start (`Hatch WebGL domain policy is required for browser startup`), so the
  chat was verified in Node tests, not in a real browser. Needs a browser run:
  open the deployed page, add a key (BYOK or Otari default), and walk
  template → blessing → look → share link, confirming the dialog.
- An LLM key / Otari access for the live chat (BYOK panel is ready; no key is
  stored anywhere in this repo).
- A real cross-site partner (optional bonus): none configured. The bridge is
  honest — it shares only the public catalog, and `links.json` is empty.
- Devpost submission is a separate step (needs the 2-minute video with the
  user presenting, plus screenshots and the write-up).
