# Backyard hot dog Easter egg

A URL-only **Experience** surface extending the existing Day of the Tentacle-inspired painted world. The sunny yard, closed barbecue and unopened package of hot dogs lead; the existing shell and controls stay quiet. The joke is that the character keeps postponing cooking.

## Access and isolation

Open [http://localhost:5173/?scene=hotdogs](http://localhost:5173/?scene=hotdogs) locally. The production path form is `/?scene=hotdogs`; this document does not establish deployment.

Only the case-sensitive query value `scene=hotdogs` selects the backyard. Other query parameters may coexist. There is no chapter-map entry, hash route, hidden click target or doorway from the normal rooms, and the backyard is absent from the adventure's saved-room registry. The garden gate is a prop, not an exit. The scene adds `noindex, nofollow` metadata while mounted.

[`src/app.ts`](../src/app.ts) branches into the scene before opening the normal adventure save store. [`src/browser/secret-scene.ts`](../src/browser/secret-scene.ts) owns query matching. Header links remove the scene query: The adventure resumes the visitor's normal saved room, while Chapter map and The short version open their usual routes. The normal inventory, progress and save bytes remain untouched throughout the backyard visit, including reload and Restart.

## Fixed response

The character says exactly:

> What's the rush? I'll cook the hot dogs a little later

The line is visible on entry and persists through every supported game input and reload. All nine verbs, the barbecue, package, picnic table, fence, garden gate, floor and empty scenery clicks, W/L/U, arrow keys, Restart and the footer domain joke retain the same response. The character remains stationary. The grill stays closed and unlit; the package stays unopened. There are no collectibles, cooking states, timing challenges, progression, instructions or save effects.

[`src/game/rooms/backyard.ts`](../src/game/rooms/backyard.ts) owns the fixed line, prop geometry and isolated state update. It emits no effects and preserves progress. [`src/ui/backyard.ts`](../src/ui/backyard.ts) mounts the existing shell, adventure view and character, supplies the line immediately, hides the irrelevant sound control and handles query-free navigation. Restart repeats the response without opening the normal adventure's reset confirmation.

## Visual direction and artwork

The scene inherits [DESIGN.md](../DESIGN.md) and the existing tokens and components represented in [`.impeccable/design.json`](../.impeccable/design.json). It adds no design-system tokens or component variants. Preserve the original overlaid character artwork, anatomical orientation, approved scale, nine-verb controls, labelled hotspots, keyboard focus and responsive 3:2 stage. The permanent entry line is specific to this joke; normal adventure rooms retain their existing entry behavior.

The owner rejected the initial naturalistic yard and requested a fresh study of actual DoTT backgrounds. The active [`public/art/backyard-hotdogs-dott.png`](../public/art/backyard-hotdogs-dott.png) is an original opaque 1536×1024 redraw made with the built-in OpenAI `image_gen` tool, using four inspected official Double Fine screenshots as style references and the rejected yard for content/layout only. It uses distorted planes and proportions, large colour regions, a leaning house, uneven fence, twisted trees, angular clouds and exaggerated furniture. The grill stays closed and unlit and the packet stays unopened. The foreground remains clear for the unchanged character overlay. No raw private photographs or official screenshots are published in the game; the generated pixels are unchanged after copying.

The exact prompt is in [`backyard-image-prompt.txt`](backyard-image-prompt.txt) and embedded in the PNG's text metadata; generation metadata and references are in [`art-provenance.json`](art-provenance.json).

## Verification evidence

[`tests/unit/backyard.test.ts`](../tests/unit/backyard.test.ts) covers strict query selection, absence from normal routes and saved rooms, the exact line for every action, preserved progress and empty effects. [`tests/e2e/backyard.spec.ts`](../tests/e2e/backyard.spec.ts) covers undiscoverability in normal navigation, desktop/phone inputs, stationary character, persistent speech, untouched protected saves, reload and resuming the normal saved adventure.

Current captures are [desktop](../.impeccable/review/desktop-backyard.png) and [phone](../.impeccable/review/mobile-backyard.png), both showing the replacement. The initial favorable finish review was superseded by the owner's rejection of its style; it does not approve the replacement. See [the DoTT review](dott-art-direction-review.md) for the official references, corrected direction and assessment of the other backgrounds. The targeted mechanical detector returned no findings before the redraw. No approved comp or formal certification is claimed.

Immediately before the replacement image and room image path/alt revision, 135 unit tests and all 72 desktop/mobile browser tests against the production bundle passed. After that revision, the production build/typecheck and all six focused backyard production-browser tests passed again. The full-suite results cover the pre-redraw state; the rebuilt bundle, focused checks and fresh captures cover the replacement. A fresh independent finish review compared official screenshots 000, 003 and 012 with both current captures and returned **SHIP**, with no blocking style mismatch. It noted somewhat stronger angular faceting than DoTT's rubbery curves as a nonblocking distinction. This is source/screenshot review, not independently rerun tests or owner approval. No production deployment is claimed here.
