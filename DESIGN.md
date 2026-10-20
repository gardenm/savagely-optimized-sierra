---
name: Savagely Optimized
description: An original chunky cartoon adventure through a real career.
colors:
  paper: "#fff2d3"
  ink: "#30213e"
  muted: "#6c5678"
  line: "#d9bdd9"
  rust: "#9e3e3b"
  purple: "#51336c"
  gold: "#ffd36b"
  verb-text: "#c9a3e8"
  game-surface: "#26192f"
  game-text: "#fff1cc"
  action-ink: "#39213e"
  terminal-text: "#fff0c8"
  primary-hover: "#6a468b"
  terminal-hover: "#ffe5a0"
typography:
  display: { fontFamily: "Lilita One, sans-serif", fontSize: "clamp(38px, 5.5vw, 70px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.04em" }
  scene-title: { fontFamily: "DM Sans, sans-serif", fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }
  title: { fontFamily: "Lilita One, sans-serif", fontSize: "26px", fontWeight: 400, letterSpacing: "-0.025em" }
  body: { fontFamily: "DM Sans, sans-serif", fontSize: "14px", fontWeight: 400, lineHeight: 1.9 }
  label: { fontFamily: "DM Sans, sans-serif", fontSize: "12px", fontWeight: 400 }
  game-command: { fontFamily: "Day Of The Tentacle, Comic Neue, cursive", fontSize: "28px", fontWeight: 400, lineHeight: 1.3, letterSpacing: "0.01em" }
  game-verb: { fontFamily: "Day Of The Tentacle, Comic Neue, cursive", fontSize: "36px", fontWeight: 400, lineHeight: 1.1, letterSpacing: "0.01em" }
  terminal-action: { fontFamily: "Comic Neue, cursive", fontSize: "21px", fontWeight: 700 }
rounded:
  action: "3px"
  chip: "6px"
  verb: "0"
  terminal-action: "7px 11px 8px 10px"
  game: "0"
  terminal: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  control: "10px"
  compact: "12px"
  md: "16px"
  mobile-gutter: "18px"
  lg: "24px"
  xl: "32px"
  desktop-gutter: "44px"
components:
  button-primary: { backgroundColor: "{colors.purple}", textColor: "{colors.paper}", typography: "{typography.label}", rounded: "{rounded.action}", padding: "14px 18px" }
  button-primary-hover: { backgroundColor: "{colors.primary-hover}" }
  button-text: { textColor: "{colors.rust}", typography: "{typography.label}", padding: "16px 0" }
  button-terminal: { backgroundColor: "{colors.gold}", textColor: "{colors.action-ink}", typography: "{typography.terminal-action}", rounded: "{rounded.terminal-action}", padding: "13px 12px", width: "100%" }
  button-terminal-hover: { backgroundColor: "{colors.terminal-hover}" }
  genre-chip: { textColor: "{colors.terminal-text}", rounded: "{rounded.chip}", padding: "12px 6px" }
  genre-chip-selected: { backgroundColor: "{colors.gold}", textColor: "{colors.action-ink}" }
  navigation-link: { textColor: "{colors.ink}", padding: "12px 0" }
  navigation-link-current: { textColor: "{colors.rust}" }
  verb-selected: { textColor: "{colors.gold}", rounded: "{rounded.verb}", padding: "0 8px" }
  game-window: { backgroundColor: "{colors.game-surface}", textColor: "{colors.game-text}", rounded: "{rounded.game}" }
  inventory: { backgroundColor: "{colors.game-surface}", padding: "8px 16px" }
---

# Design System: Savagely Optimized

## Overview

**Creative North Star: The room leads.**

An original chunky, slightly goofy **Day of the Tentacle-inspired** cartoon world: leaning lilac architecture, bold outlines and exaggerated proportions. McGill's orange floorboards extend into Nortel's crooked raised-floor tiles, teal OME racks and looping yellow fibre, then SMART's fabric-partitioned cubicle farm and large interactive whiteboard. The owner-approved McGill room is the style authority for these original extensions and their transparent scene props. Preserve the original McGill/Nortel backgrounds, both photo-guided character sprites and both anatomical tattoo orientations. Character display remains 30% of scene width and 54% of scene height, with feet anchored to the floor in all three rooms.

The owner explicitly wants less exposition and accepts that some visitors may not figure out the game. The wordmark, navigation and short-version link remain. Each scene has one understated label: **McGill University, 2006**, **Nortel** or **SMART Technologies**. No Nortel or SMART employment dates have been supplied; SMART's circa 2009–2013 reference describes the hardware era. There is no marketing headline, scene slogan, opening instruction, objective checklist, hint, walkthrough, duplicate object list, or initial dialogue. The reflection sidebar and placeholder text are removed; the game is centred.

## Colors and typography

Custard paper, plum ink, rust navigation and the existing self-hosted lettering remain. The flat game interface uses deep plum `#26192f`, lavender verbs `#c9a3e8`, and gold `#ffd36b` for hover, selection and action sentences. It has no selected-verb pill or nested panels.

Lilita One 400 remains the wordmark and reading-route display face. The owner-supplied Day Of The Tentacle 400 supplies verbs (36px desktop, 30px tablet, 26px phone, 24px at 360px and below) and action sentences (28px/24px), with .01em tracking. Comic Neue 700 remains for speech (20px/14px) and terminal controls. DM Sans supplies the 14px medium-weight scene label and biography copy. Biography measures remain 70ch and chapter rows 66ch.

## Layout

The shell is centred at 1280px with 44px gutters and grows to 1480px at 1550px and above. The game and its scene label are independently centred at a maximum width of 1000px; there is no sidebar. At 1100px and below gutters become 28px; phone gutters are 18px. The 3:2 artwork and approved relative character scale are preserved.

The game frame is square and borderless. A centered action sentence starts empty and reserves one full line plus 10px vertical padding (`calc(1.3em + 10px)`). Its height stays constant while empty, hovered, or focused, so the verb grid never shifts. Long text stays on one line and ellipsizes when necessary. Below it, a three-column, three-row verb grid sits on the left and a pictorial inventory on the right. Desktop columns are 1:1.25. On phones the inventory gets 76px and the verbs use the remaining width; they stay beside one another. At 360px and below, inventory narrows to 56px and verbs use 24px type to retain word spacing. Each verb has a minimum 44px height. Empty inventory is simply empty space.

The career overview uses Matt Garden as its main heading and links directly to the owner’s LinkedIn profile. Only the career overview prints. Navigation, artwork, game controls and footer are hidden for printing.

## Interaction

The classic verbs are Give / Pick up / Use, Open / Look at / Push, Close / Talk to / Pull. Floor clicks walk directly; walking is the initial mode. Hover or focus on an object builds the selected action sentence. Scene hotspots remain real labelled buttons with visible keyboard focus. There are no floating object-name chips or duplicate object links.

Character speech appears over the room only after an interaction. It is centered warm text with a dark offset outline/shadow for legibility and has live status semantics. Looking at or using the research papers reveals a gold, underlined “Read the paper (PDF)” link below the response. The link opens the supplied McGill PDF in a new tab; its accessible name announces that behavior. Only the link receives pointer events; the speech itself does not intercept clicks. The link has a 44px minimum touch height and clears with the next response. Selecting an inventory item chooses Use, or keeps Give if already selected; switching to another verb clears inventory selection. Contextual responses support the classic verbs. The Cinema ticket, anti-static strap and SMART items share one catalogue; acquired items remain visible, named and selectable across all three rooms. All doors freely return to the chapter map before or after solving a local puzzle. The exit waits for the walk, skips that delay for reduced motion, and is cancelled if the visitor navigates away.

W/L/U and arrow keys operate only when focus is within the active game, with no open puzzle dialog, modifiers, or form/details target. Escape closes the native dialog and restores focus. Mobile hotspots and all verb controls have at least 44px touch dimensions. Reduced motion removes walking transitions, bobbing and the footfall marker animation. Sound requires an explicit action. A quiet Restart button remains in the footer; its confirmation describes clearing items and progress across all rooms. Restart resets all three room positions and stays in the current room. One adventure save preserves shared inventory and milestones, independent room positions and the last room; the root URL, adventure backlinks and reading-route reloads resume that room, including SMART. Browser-storage failures allow in-memory play and are announced without an on-screen coaching message.

## Reading routes and terminal

Chapter map and short-version navigation stay directly accessible. McGill, Nortel and SMART can be entered directly from the chapter map; Lightspeed and Shopify remain planned. SMART is also directly accessible at `#smart`. The McGill chapter uses the owner's supplied 2006 scene label; do not infer other career dates. The Recommendz terminal preserves its plum protected-focus dialog and gold action, with only the film brief, genres, recommendation and result. Errors give concise validation feedback without spelling out the solution.

Nortel's current local puzzle stays in the room: an anti-static strap on the bench and one loose yellow cable beside the OME racks. Use the room strap to wear and ground it; Pick up only carries it until Use is chosen on the inventory strap. The shared inventory renders the worn check marker and accessible name in all three rooms without changing the approved character drawings. Ungrounded hardware contact gives the character a brief jolt (0.45s) and a spark at the hand (650ms); the room dims during an automatic self-test (1.8s), then recovers. The lab console can reset it immediately. Reduced motion preserves the still spark and recovery feedback while removing the jolt. Once grounded, using the loose cable restores the link, removes its loose sprite and turns the link lamp green. The exit remains available throughout. Recommendz and this local puzzle remain operational while the full five-room interlocking adventure in docs/puzzle-web.md is future work. There is no port-selection dialog or configuration step, checklist or introductory coaching.

SMART extends the same surface with a traditional cubicle farm, period iMac and PC workstations, a SMART Board, a high ledge and a separate transparent stylus. Entry is silent. Its scene adapter reuses the tested plane/stylus/receipt/sketch rules: a paper plane knocks the stylus to the floor, pickup removes the sprite, and the receipt and stylus enable a checkout sketch on the board. The fall has no timing challenge and becomes immediate for reduced motion. Public SMART currently supports exploration; future-source items are supplied only in test fixtures, with no temporary sources added to the game. Lightspeed, Shopify and the full public story cutover remain future work, so these captures do not demonstrate a naturally completable cross-room adventure.

Reading surfaces remain flat and ruled. The terminal retains its offset soft shadow, 3px structural outline, 14px corners and dark backdrop. Existing shell and terminal focus treatments remain. The footer keeps the domain joke and Restart, without the old explanatory copy.

## Constraints and evidence

Room geography follows the owner's confirmed locations: Timney Lab at Western University in London, Ontario; McGill in Montréal; and Nortel, SMART Technologies, Lightspeed and Shopify in Ottawa. SMART's window now shows an imagined Ottawa skyline with Parliament's Peace Tower. Use these locations for future room artwork, including Ottawa views for every post-McGill workplace.

All personal facts come from supplied information; all three rooms and their puzzles are fictional framing. Nortel's lab layout, static fault and restored link are illustrative, not a claimed employer incident or achievement. SMART's office depicts the supplied hardware era, not verified employment dates or an exact office reconstruction. Raw reference photos remain outside the repository and public site. Both character sprite files and the original McGill/Nortel backgrounds are unchanged. The original Nortel and SMART artwork use the established rooms as style references. SMART adds `public/art/smart-office-ottawa.webp` and the transparent `public/art/smart-stylus.webp`; the existing anti-static strap and loose-cable sprites remain. Exact prompts and sources are recorded in docs/art-provenance.json and embedded as XMP, verified across all eight shipping rasters. The extension preserves the approved scale, original walking jiggle, shell, typography and design tokens. Do not mirror the character, add coaching back into the scene, or invent dates and achievements. Add owner-written reflections only when supplied; do not restore placeholder prose.

The project uses plain TypeScript, HTML and CSS built with Vite. Pure shared-progress functions, a reducer and room modules own rules; mounted views patch existing DOM nodes and browser services perform effects. Hotspot geometry lives in the room definition. The shared save retains the `savagely-optimized:adventure:v1` storage key and now writes payload version 2. It reads existing two-room version 1 world saves and imports old McGill/Nortel chapter saves when no world save exists, preserving progress and adding SMART's spawn; legacy chapter keys remain unchanged. Malformed or unsupported adventure saves, including invalid SMART state and unknown item IDs, remain untouched until explicit Restart; play continues in memory with a save-status announcement. Storage failures also retain in-memory play. The future story-slice codec's version 2 is separate; its full migration is inactive. See docs/architecture.md for boundaries and tests, and docs/puzzle-web.md for the future five-room graph. `npm run build` emits the static `dist/` site; no server is required. The owner has confirmed the Cloudflare custom domain works over HTTPS after enabling its redirect; this does not establish that the current checkout is deployed.

Desktop/mobile renders of all three rooms and Nortel's entry, static-shock and connected states provide visual evidence alongside the production browser tests. Shared-inventory captures are `.impeccable/review/desktop-shared-inventory-mcgill.png`, `mobile-shared-inventory-mcgill.png`, `desktop-shared-inventory-nortel.png` and `mobile-shared-inventory-nortel.png`. SMART evidence is `.impeccable/review/desktop-smart.png`, `mobile-smart.png`, `desktop-smart-stylus-down.png`, `mobile-smart-stylus-down.png`, `desktop-smart-sketch.png` and `mobile-smart-sketch.png`; entry is silent and the latter two state pairs use fixture-seeded future items. Existing entry, shock, connected and Recommendz terminal captures remain alongside them. A fresh finish review opened all six SMART captures and returned **SHIP**, with no material fixes. Validation passed the production build, 117 unit tests, 42 existing browser journeys and six SMART browser tests after correcting touch overlaps. The Impeccable launcher, context helper and detector remain unavailable; no hook score, independent catalog quality bar, approved page comp, comp score or formal certification is claimed. This precise extension did not receive a separately approved comp. Sidecar snippets represent components only, not the application runtime; their tokens and component definitions are preserved.
