// The actions this site shares with other agent sites, through its action bridge.
// The build names this file in bridge/agent-manifest.json. When another site's assistant
// calls this site, the bridge loads it in a hidden frame on this site's origin, which has
// no page. Only the names in the manifest's "actions.agentTools" reach a partner's agents.
//
// The shared read returns only the public catalog: occasions, themes, illustrations,
// blessing templates and music options. It never returns one visitor's card, so any
// site may call it. This site shares no write.
import {
  TEMPLATES_EN,
  TEMPLATES_ZH,
  OCCASION_LIST,
  THEME_LIST,
  ILLUSTRATION_LIST,
  MUSIC_OPTIONS,
} from "../js/site-data.js";

/**
 * Shares this site's public catalog with the partner sites that call its network.
 *
 * A partner's agent calls it from the partner's page. The read runs here, in a hidden
 * frame on this site's origin, with this site's own code. Nothing here can see the page
 * or what one visitor did on it, such as their card.
 */
class BridgeActions {
  /**
   * The sites allowed to call these reads, as exact origins with the port.
   * No partner calls this site yet, so the list is empty; the catalog read below uses
   * EVERY_SITE instead, because it returns only what the public page shows.
   */
  static CALLERS = [];

  /**
   * Every site on the web, for a read that returns only what the public page shows.
   */
  static EVERY_SITE = ["*"];

  /**
   * Register the shared read.
   *
   * :param actions: The runtime registry facade with a register(definition) method.
   */
  static registerActions(actions) {
    actions.register(BridgeActions.readCatalogAction());
  }

  /**
   * Describe the shared read of the site's public catalog.
   *
   * :return: The action definition.
   */
  static readCatalogAction() {
    return {
      name: "get_card_catalog",
      description: "Read the public catalog of the birthday e-card site: the occasions, themes and colours, illustrations, built-in blessing templates (English and Chinese) and music options. Changes nothing. Call it before answering about what cards this site can make.",
      effect: "read",
      availability: "bridge",
      callerOrigins: BridgeActions.EVERY_SITE,
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      execute: BridgeActions.readCatalog,
    };
  }

  /**
   * Read the site's public catalog.
   *
   * :return: The catalog data.
   */
  static readCatalog() {
    return {
      occasions: OCCASION_LIST,
      themes: THEME_LIST,
      illustrations: ILLUSTRATION_LIST,
      templates: {
        warm: { en: TEMPLATES_EN.warm, zh: TEMPLATES_ZH.warm },
        fun: { en: TEMPLATES_EN.fun, zh: TEMPLATES_ZH.fun },
        friend: { en: TEMPLATES_EN.friend, zh: TEMPLATES_ZH.friend },
        elder: { en: TEMPLATES_EN.elder, zh: TEMPLATES_ZH.elder },
      },
      musicOptions: MUSIC_OPTIONS,
    };
  }
}

// The bridge calls the module's registerActions export.
export const registerActions = BridgeActions.registerActions;
