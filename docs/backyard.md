# Backyard hot dog Easter egg

A URL-only **Experience** surface extending the existing Day of the Tentacle-inspired painted world. The sunny yard, closed barbecue and unopened package of hot dogs lead; the existing shell and controls stay quiet. The joke is that the character keeps postponing cooking.

## Access and isolation

Open [http://localhost:5173/?scene=hotdogs](http://localhost:5173/?scene=hotdogs) locally. The production path form is `/?scene=hotdogs`; this document does not establish deployment.

Only the case-sensitive query value `scene=hotdogs` selects the backyard. Other query parameters may coexist. There is no chapter-map entry, hash route, hidden click target or doorway from the normal rooms, and the backyard is absent from the adventure's saved-room registry. The garden gate is a prop, not an exit. The scene adds `noindex, nofollow` metadata while mounted.

[`src/app.ts`](../src/app.ts) branches into the scene before opening the normal adventure save store. [`src/browser/secret-scene.ts`](../src/browser/secret-scene.ts) owns query matching. Header links remove the scene query: The adventure resumes the visitor's normal saved room, while Chapter map and The short version open their usual routes. The normal inventory, progress and save bytes remain untouched throughout the backyard visit, including reload and Restart.

## Walking and postponement replies

The character walks across the open patio with the normal restrained leg animation. Floor clicks choose a destination; arrow keys move within the patio bounds. The table, hot dog packet, barbecue, fence and gate each have their own approach position. Clicking an object in the default walking mode approaches it and answers, so the yard responds immediately without requiring a verb first.

Every object interaction postpones or refuses the action. Replies rotate between an object-specific deferral and the owner's requested tone: “I don't want to.”, “After I play some Street Fighter.” and “I'll do that later.” Selecting a verb or hovering only updates the command sentence; it does not advance the joke. All nine verbs work, including keyboard activation of hotspots. The initial hot-dog line remains on entry; clicking the floor clears speech as in the other rooms.

The grill stays closed and unlit, the packet stays unopened, and the inventory stays empty. The garden gate does not leave the scene. Movement and response variety are transient: there is no cooking, collecting, puzzle progression, or access to the normal adventure's inventory/save. Restart cancels movement and resets only the backyard's position and replies. The footer domain button supplies another postponement without restarting the scene.

[`src/game/rooms/backyard.ts`](../src/game/rooms/backyard.ts) delegates movement and verb selection to the shared reducer, adds the refusal dialogue, and emits only walk effects. Persistence requests are discarded at this boundary. [`src/ui/backyard.ts`](../src/ui/backyard.ts) plays those effects through the existing adventure view. It has no catch-all stage-click handler that can overwrite object actions or movement.

This supersedes the initial implementation, which deliberately kept the player stationary and repeated one fixed line for every input.

## Visual direction and artwork

The scene inherits [DESIGN.md](../DESIGN.md) and the existing tokens and components represented in [`.impeccable/design.json`](../.impeccable/design.json). It adds no design-system tokens or component variants. Preserve the original overlaid character artwork, anatomical orientation, approved scale, nine-verb controls, labelled hotspots, keyboard focus and responsive 3:2 stage. The entry line is specific to this joke; normal adventure rooms retain their existing entry behavior.

The owner rejected the initial naturalistic yard and requested a fresh study of actual DoTT backgrounds. The active [`public/art/backyard-hotdogs-dott.png`](../public/art/backyard-hotdogs-dott.png) is an original opaque 1536×1024 redraw made with the built-in OpenAI `image_gen` tool, using four inspected official Double Fine screenshots as style references and the rejected yard for content/layout only. It uses distorted planes and proportions, large colour regions, a leaning house, uneven fence, twisted trees, angular clouds and exaggerated furniture. The grill stays closed and unlit and the packet stays unopened. The foreground remains clear for the unchanged character overlay. No raw private photographs or official screenshots are published in the game; the generated pixels are unchanged after copying.

The exact prompt is in [`backyard-image-prompt.txt`](backyard-image-prompt.txt) and embedded in the PNG's text metadata; generation metadata and references are in [`art-provenance.json`](art-provenance.json).

## Verification evidence

The 2026-10-31 behavior correction passed the production build, all 139 unit tests and 16 focused production-browser tests covering the backyard and shared character walking at desktop and phone sizes. Entry and interaction captures at both sizes were inspected. The targeted detector returned no findings. This correction changes behavior and replies, not the approved background or character artwork.

[`tests/unit/backyard.test.ts`](../tests/unit/backyard.test.ts) covers query isolation, bounded movement without save effects, all verbs and default object clicks, response variety, hover/verb selection, restart and inventory isolation. [`tests/e2e/backyard.spec.ts`](../tests/e2e/backyard.spec.ts) covers desktop/phone walking and animation, all nine verbs across all five props, repeated responses, keyboard/reduced-motion interaction, reset during movement, unchanged protected saves, reload, and leaving mid-walk to resume the normal adventure.

Entry captures are [desktop](../.impeccable/review/desktop-backyard.png) and [phone](../.impeccable/review/mobile-backyard.png), both showing the replacement. Interaction captures use the additional `-backyard-interaction.png` suffix. The initial favorable finish review was superseded by the owner's rejection of its style; it does not approve the replacement. See [the DoTT review](dott-art-direction-review.md) for the official references, corrected direction and assessment of the other backgrounds. The targeted mechanical detector returned no findings before the redraw. No approved comp or formal certification is claimed.

Historical art-redraw validation: immediately before the replacement image and room image path/alt revision, 135 unit tests and all 72 desktop/mobile browser tests against the production bundle passed. After that revision, the production build/typecheck and all six focused backyard production-browser tests passed again. The full-suite results cover the pre-redraw state; the rebuilt bundle, focused checks and fresh captures cover the replacement. A fresh independent finish review compared official screenshots 000, 003 and 012 with both current captures and returned **SHIP**, with no blocking style mismatch. It noted somewhat stronger angular faceting than DoTT's rubbery curves as a nonblocking distinction. This is source/screenshot review, not independently rerun tests or owner approval. No production deployment is claimed here.
