// Registers this website's operations with the agent runtime.
// agent-manifest.json loads this module through "actions.module". Only the names in
// "actions.agentTools" become model tools, called website_<name>.
//
// Each action wraps a function the page already uses, so the assistant and the manual
// UI share one set of rules. Operations return {ok: false, reason, field} when they
// refuse input, before changing anything, and throw only on unexpected failures.
// A throw is reported as "unknown".
// Import the page script by the same URL the page uses (no ?v= query), or the actions
// get a second, separate copy of the page state.
import {
  getCardState,
  setCardText,
  applyBlessingTemplate,
  setOccasion,
  setTheme,
  setIllustration,
  setDecoration,
  setMusic,
  generateShareLink,
} from "./card.js";

/**
 * Describes the site's operations as actions the agents can call.
 */
class CardActions {
  /**
   * Register every site action with the runtime.
   *
   * :param actions: The runtime registry facade with a register(definition) method.
   */
  static registerActions(actions) {
    actions.register(CardActions.readStateAction());
    actions.register(CardActions.setCardTextAction());
    actions.register(CardActions.applyBlessingTemplateAction());
    actions.register(CardActions.setOccasionAction());
    actions.register(CardActions.setThemeAction());
    actions.register(CardActions.setIllustrationAction());
    actions.register(CardActions.setDecorationAction());
    actions.register(CardActions.setMusicAction());
    actions.register(CardActions.generateShareLinkAction());
  }

  /**
   * Describe the read action that returns the card's data and current state.
   *
   * :return: The action definition.
   */
  static readStateAction() {
    return {
      name: "get_card_state",
      description: "Read the actual card on this page: occasion, illustration, theme and colours, title, recipient name, blessing, signature, photo, music, voice blessing, decorations, its version, the latest share link, the built-in blessing templates, and what the assistant cannot do. Call it before answering about the card, and again in each turn that needs it: the visitor can also edit the page.",
      effect: "read",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      execute: CardActions.readState,
    };
  }

  /**
   * Return a fresh copy of the card state.
   *
   * :return: The card state as plain JSON data.
   */
  static readState() {
    return getCardState();
  }

  /**
   * Describe the write that changes the card's words.
   *
   * :return: The action definition.
   */
  static setCardTextAction() {
    return {
      name: "set_card_text",
      description: "Change the words on the card. Pass at least one of title, kicker, name, blessing or signature; fields you leave out stay as they are. The blessing is the main message; write it in English unless the visitor asks for Chinese. Returns the updated state with the new version, or ok false with a reason when a text is too long. The visitor can undo it on the page.",
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            maxLength: 12,
            description: "The big title on the card, at most 12 characters.",
          },
          kicker: {
            type: "string",
            maxLength: 24,
            description: "The small English line above the title, at most 24 characters.",
          },
          name: {
            type: "string",
            maxLength: 12,
            description: "The recipient's name, at most 12 characters.",
          },
          blessing: {
            type: "string",
            maxLength: 500,
            description: "The blessing message, at most 500 characters.",
          },
          signature: {
            type: "string",
            maxLength: 20,
            description: "The signature line, at most 20 characters.",
          },
        },
      },
      execute: CardActions.setCardText,
    };
  }

  /**
   * Change the card's words through the page's own function.
   *
   * :param args: The validated arguments.
   * :return: The updated card state, or {ok: false, reason, field} on refusal.
   */
  static setCardText(args) {
    return setCardText(args);
  }

  /**
   * Describe the write that swaps in a built-in blessing template.
   *
   * :return: The action definition.
   */
  static applyBlessingTemplateAction() {
    return {
      name: "apply_blessing_template",
      description: "Replace the blessing with one of the built-in templates from website_get_card_state: warm, fun, friend or elder. Use it when the visitor asks for a ready-made blessing. The visitor can still edit the text afterwards. Returns the updated state with the new version.",
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["template"],
        properties: {
          template: {
            type: "string",
            enum: ["warm", "fun", "friend", "elder"],
            description: "The template key from website_get_card_state.",
          },
        },
      },
      execute: CardActions.applyBlessingTemplate,
    };
  }

  /**
   * Swap in a blessing template through the page's own function.
   *
   * :param args: The validated arguments.
   * :return: The updated card state, or {ok: false, reason, field} on refusal.
   */
  static applyBlessingTemplate(args) {
    return applyBlessingTemplate(args.template);
  }

  /**
   * Describe the write that changes the occasion.
   *
   * :return: The action definition.
   */
  static setOccasionAction() {
    return {
      name: "set_occasion",
      description: "Switch the card to another occasion: birthday, love or anniversary. This resets the title, blessing, signature, theme, picture, music and decorations to that occasion's preset, so use it only when the visitor asks for a different occasion. Returns the updated state with the new version.",
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["occasion"],
        properties: {
          occasion: {
            type: "string",
            enum: ["birthday", "love", "anniversary"],
            description: "The occasion key from website_get_card_state.",
          },
        },
      },
      execute: CardActions.setOccasion,
    };
  }

  /**
   * Switch the occasion through the page's own function.
   *
   * :param args: The validated arguments.
   * :return: The updated card state, or {ok: false, reason, field} on refusal.
   */
  static setOccasion(args) {
    return setOccasion(args.occasion);
  }

  /**
   * Describe the write that changes the theme and colours.
   *
   * :return: The action definition.
   */
  static setThemeAction() {
    return {
      name: "set_theme",
      description: "Change the card's colour theme: peach, mint or blue. Optionally give custom colours as {bg, accent, text}, each a #RRGGBB hex code, to override the theme. Returns the updated state with the new version.",
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["theme"],
        properties: {
          theme: {
            type: "string",
            enum: ["peach", "mint", "blue"],
            description: "The theme key from website_get_card_state.",
          },
          colors: {
            type: "object",
            additionalProperties: false,
            required: ["bg", "accent", "text"],
            properties: {
              bg: { type: "string", description: "Page background, #RRGGBB hex code." },
              accent: { type: "string", description: "Main accent colour, #RRGGBB hex code." },
              text: { type: "string", description: "Text colour, #RRGGBB hex code." },
            },
          },
        },
      },
      execute: CardActions.setTheme,
    };
  }

  /**
   * Change the theme through the page's own function.
   *
   * :param args: The validated arguments.
   * :return: The updated card state, or {ok: false, reason, field} on refusal.
   */
  static setTheme(args) {
    return setTheme(args.theme, args.colors);
  }

  /**
   * Describe the write that changes the picture.
   *
   * :return: The action definition.
   */
  static setIllustrationAction() {
    return {
      name: "set_illustration",
      description: "Change the picture on the card: photo (the HuoHuo & WenWen characters), flowers, bear, leaves, or none to hide the picture. Optionally set showPhoto false to hide an uploaded photo. Returns the updated state with the new version.",
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["illustration"],
        properties: {
          illustration: {
            type: "string",
            enum: ["photo", "flowers", "bear", "leaves", "none"],
            description: "The illustration key from website_get_card_state.",
          },
          showPhoto: {
            type: "boolean",
            description: "Whether the photo shows on the card.",
          },
        },
      },
      execute: CardActions.setIllustration,
    };
  }

  /**
   * Change the picture through the page's own function.
   *
   * :param args: The validated arguments.
   * :return: The updated card state, or {ok: false, reason, field} on refusal.
   */
  static setIllustration(args) {
    return setIllustration(args.illustration, args.showPhoto);
  }

  /**
   * Describe the write that changes decorations and animation.
   *
   * :return: The action definition.
   */
  static setDecorationAction() {
    return {
      name: "set_decoration",
      description: "Change the card's decorations: confetti, hearts, cake, fireworks (each true or false), and the animation style fall or rise. Leave out anything that should stay as it is. Returns the updated state with the new version.",
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          confetti: { type: "boolean", description: "Show confetti on the card." },
          hearts: { type: "boolean", description: "Show floating hearts on the card." },
          cake: { type: "boolean", description: "Show the birthday cake on the card." },
          fireworks: { type: "boolean", description: "Show fireworks on the card." },
          animStyle: {
            type: "string",
            enum: ["fall", "rise"],
            description: "Confetti falls, or hearts float up.",
          },
        },
      },
      execute: CardActions.setDecoration,
    };
  }

  /**
   * Change decorations through the page's own function.
   *
   * :param args: The validated arguments.
   * :return: The updated card state, or {ok: false, reason, field} on refusal.
   */
  static setDecoration(args) {
    return setDecoration(args);
  }

  /**
   * Describe the write that changes the music.
   *
   * :return: The action definition.
   */
  static setMusicAction() {
    return {
      name: "set_music",
      description: "Change the card's music: synth for the built-in birthday song, or none for silence. There is no upload option here: uploading a music file needs the visitor to pick the file in the page. Returns the updated state with the new version.",
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["source"],
        properties: {
          source: {
            type: "string",
            enum: ["synth", "none"],
            description: "Built-in birthday song, or no music.",
          },
        },
      },
      execute: CardActions.setMusic,
    };
  }

  /**
   * Change the music through the page's own function.
   *
   * :param args: The validated arguments.
   * :return: The updated card state, or {ok: false, reason, field} on refusal.
   */
  static setMusic(args) {
    return setMusic(args.source);
  }

  /**
   * Describe the irreversible operation that makes the share link.
   *
   * :return: The action definition.
   */
  static generateShareLinkAction() {
    return {
      name: "generate_share_link",
      description: "Make the share link for the card as it is now. In the turn you call it, first call website_get_card_state and wait for its result: this needs its current version, and results from earlier turns are not kept. The browser asks the visitor to confirm. The site refuses a stale expectedVersion, and refuses when the blessing is empty. Returns the link.",
      effect: "irreversible",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["expectedVersion"],
        properties: {
          expectedVersion: {
            type: "integer",
            minimum: 0,
            description: "The latest version in this turn: from website_get_card_state, or from a card change made after that read.",
          },
        },
      },
      execute: CardActions.generateShareLink,
    };
  }

  /**
   * Make the share link through the page's own function.
   *
   * :param args: The validated, visitor-confirmed arguments.
   * :return: A promise of {ok, link, version, state}, or {ok: false, reason} on refusal.
   */
  static generateShareLink(args) {
    return generateShareLink(args);
  }
}

// The runtime calls the module's registerActions export.
export const registerActions = CardActions.registerActions;
