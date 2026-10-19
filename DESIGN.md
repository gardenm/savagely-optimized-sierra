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

An original chunky, slightly goofy **Day of the Tentacle-inspired** cartoon world: leaning lilac architecture, huge orange floorboards, bold outlines and exaggerated proportions. The owner has approved the room and photo-guided character. Preserve all three artwork files and both anatomical tattoo orientations. Character display remains 30% of scene width and 54% of scene height, with feet anchored to the floor.

The owner explicitly wants less exposition and accepts that some visitors may not figure out the game. The wordmark, navigation and short-version link remain. The scene has one understated label: **McGill University, 2006**. There is no marketing headline, scene slogan, opening instruction, objective checklist, hint, walkthrough, duplicate object list, or initial dialogue. The reflection sidebar and placeholder text are removed; the game is centred.

## Colors and typography

Custard paper, plum ink, rust navigation and the existing self-hosted lettering remain. The flat game interface uses deep plum `#26192f`, lavender verbs `#c9a3e8`, and gold `#ffd36b` for hover, selection and action sentences. It has no selected-verb pill or nested panels.

Lilita One 400 remains the wordmark and reading-route display face. The owner-supplied Day Of The Tentacle 400 supplies verbs (36px desktop, 30px tablet, 26px phone, 24px at 360px and below) and action sentences (28px/24px), with .01em tracking. Comic Neue 700 remains for speech (20px/14px) and terminal controls. DM Sans supplies the 14px medium-weight scene label and biography copy. Biography measures remain 70ch and chapter rows 66ch.

## Layout

The shell is centred at 1280px with 44px gutters and grows to 1480px at 1550px and above. The game and its scene label are independently centred at a maximum width of 1000px; there is no sidebar. At 1100px and below gutters become 28px; phone gutters are 18px. The 3:2 artwork and approved relative character scale are preserved.

The game frame is square and borderless. A centered action sentence starts empty and reserves one full line plus 10px vertical padding (`calc(1.3em + 10px)`). Its height stays constant while empty, hovered, or focused, so the verb grid never shifts. Long text stays on one line and ellipsizes when necessary. Below it, a three-column, three-row verb grid sits on the left and a pictorial inventory on the right. Desktop columns are 1:1.25. On phones the inventory gets 76px and the verbs use the remaining width; they stay beside one another. At 360px and below, inventory narrows to 56px and verbs use 24px type to retain word spacing. Each verb has a minimum 44px height. Empty inventory is simply empty space.

The career overview uses Matt Garden as its main heading and links directly to the owner’s LinkedIn profile. Only the career overview prints. Navigation, artwork, game controls and footer are hidden for printing.

## Interaction

The classic verbs are Give / Pick up / Use, Open / Look at / Push, Close / Talk to / Pull. Floor clicks walk directly; walking is the initial mode. Hover or focus on an object builds the selected action sentence. Scene hotspots remain real labelled buttons with visible keyboard focus. There are no floating object-name chips or duplicate object links.

Character speech appears over the room only after an interaction. It is centered warm text with a dark offset outline/shadow for legibility and has live status semantics. Looking at or using the research papers reveals a gold, underlined “Read the paper (PDF)” link below the response. The link opens the supplied McGill PDF in a new tab; its accessible name announces that behavior. Only the link receives pointer events; the speech itself does not intercept clicks. The link has a 44px minimum touch height and clears with the next response. Selecting a ticket chooses Use, or keeps Give if already selected; switching to another verb clears inventory selection. Contextual responses support the classic verbs. The existing Recommendz puzzle and exit continue to work.

W/L/U and arrow keys operate only when focus is within the game on the adventure route, with no open terminal, modifiers, or form/details target. Escape closes the native dialog and restores focus. Mobile hotspots and all verb controls have at least 44px touch dimensions. Reduced motion removes walking transitions, bobbing and the footfall marker animation. Sound requires an explicit action. A quiet Restart button remains in the footer; confirmation resets progress and returns to the room. Browser-storage failures are announced without an on-screen coaching message.

## Reading routes and terminal

Chapter map and short-version navigation stay directly accessible. Future chapters are explicitly planned. The McGill chapter uses the owner's supplied 2006 scene label; do not infer other career dates. The terminal preserves its plum protected-focus dialog and gold action, with only the film brief, genres, recommendation and result. Errors give concise validation feedback without spelling out the solution.

Reading surfaces remain flat and ruled. The terminal retains its offset soft shadow, 3px structural outline, 14px corners and dark backdrop. Existing shell and terminal focus treatments remain. The footer keeps the domain joke and Restart, without the old explanatory copy.

## Constraints and evidence

All personal facts come from supplied information; the room and puzzle are fictional framing. Raw reference photos remain outside the repository and public site. Both sprite files and the approved room artwork are unchanged. Do not mirror the character, add coaching back into the scene, or invent dates and achievements. Add owner-written reflections only when supplied; do not restore placeholder prose.

The project uses plain TypeScript, HTML and CSS built with Vite. `npm run build` emits the static `dist/` site; no server is required. The owner has tested the temporary Cloudflare URL, with GitHub builds configured and custom-domain activation in progress.

Desktop/mobile renders and production browser tests provide the visual and functional evidence. The Impeccable launcher remains unavailable; no hook score, comp score or formal certification is claimed. Sidecar snippets represent components only, not the application runtime.
