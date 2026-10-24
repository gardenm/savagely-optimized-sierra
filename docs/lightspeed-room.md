# Lightspeed office

Mode: Experience. A fourth room within the existing adventure surface.

The owner approved using the Castle (Gare Viger, Lightspeed's Montréal headquarters) as architectural inspiration: exposed brick, timber beams, arches and a POS testing counter. Their job was in Ottawa; the chapter-map biography stays Ottawa. The inspected interior photographs document a 2020 renovation and establish visual references, not employment dates or an exact historical reconstruction.

## Direction contract

THESIS: a crooked old railway-hotel interior occupied by an iOS POS team; the architecture gives the testing counter its character.

OWN-WORLD: the current redraw uses official DoTT screenshots for visual grammar, the owner-approved backyard for continuity and the previous Lightspeed room for composition and prop authority. Taper/bow timber, skew the arch and group brick/shadow shapes into broad painted planes. Preserve the registered counter geometry, shell, self-hosted lettering, approved character scale and current lower-body walking cycle.

STORY: use the till to print the faulty coffee receipt, read its arithmetic and carry it to SMART. Notice the jammed drawer; the future Shopify pick opens it to reveal the retaining clip. No replacement sources or full-story cutover before Shopify exists.

FIRST VIEWPORT: the existing centred 3:2 stage has an exposed brick rear wall, exaggerated roof beams, a large arched passage on the right and a POS testing counter on the left. A tilted iPad, receipt printer and shallow drawer read as distinct objects. Clear floor fills the lower third for the unchanged character. Nine verbs, reserved action sentence and shared inventory stay below; entry is silent.

FORM: precise extension of the incumbent adventure, following the owner's approved reference-based composition. No new identity or page-comp selection. Signature interaction: the till prints a readable, inspectable receipt; the drawer opens and its clip disappears on collection. Reduced motion removes drawer/receipt transitions without gating an action.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Reference evidence

- [Exterior](https://commons.wikimedia.org/wiki/File:Gare_Viger_02.jpg): Thomas1313, CC BY-SA 3.0. Turrets, steep roofs and brick/stone materials.
- [Interior gallery](https://officesnapshots.com/2021/01/13/lightspeed-offices-montreal/): ACDF Architecture, photography by Maxime Brouillet, Phase 3 completed January 2020. Inspected beam, archway and meeting-room photographs.
- Unmodified reference copies and full notes live outside the checkout at `/workspace/lightspeed-references/`.

## Current artwork (2026-10-24)

`public/art/lightspeed-office-dott.png` is the active opaque 1536×1024 background, generated with built-in OpenAI image generation and copied without pixel edits. `public/art/lightspeed-office.webp` remains preserved. Official screenshots [003](https://assets.doublefine.com/images/screenshots/DOTT/dott-remastered-003.jpg) and [012](https://assets.doublefine.com/images/screenshots/DOTT/dott-remastered-012.jpg) supply style only, not room content. Exact prompts are in `docs/dott-room-image-prompts.md`, `docs/art-provenance.json` and the PNG's `impeccable:prompt` text metadata. The prompt's shorthand “Montreal's historic Gare Viger” names the architectural reference; it does not change the owner's Ottawa career location.

The redraw strengthens the timber silhouettes, crooked arch, interrupted brick groups and graphic purple shadows. The left counter and slanted drawer opening remain in their registered plane: target opening corners on the 1536×1024 artwork are `(156,642)`, `(540,584)`, `(538,722)` and `(155,789)`. Printer paper, open drawer and retaining clip stay separate runtime state. The earlier approved three-surface drawer projection remains unchanged and was visually checked against the new cabinet in desktop and phone open-drawer captures.

The production build, 135 unit tests and all 72 production-browser tests passed with the four new backgrounds. Entry, printed receipt and open-drawer captures were inspected on desktop and phone. The initial independent 20-capture review found only Nortel lamp registration; after that fix, the follow-up review returned **SHIP** at the lamp-fix scope with no visible regression. The owner approved the backyard and requested this redraw; approval of the new Lightspeed image and deployment are not established.

## Drawer registration and original delivery boundary

The open drawer is registered to the cabinet's painted opening. `src/ui/lightspeed-drawer.ts` projects the existing raster's front, tray and right side separately, aligning the rear rim with the slot and the front with the cabinet's upward-right perspective. A dark recess covers the painted closed front and handle. The full-scene canvas scales with the 3:2 room; the retaining clip and open-drawer hotspot follow the projected tray. Both source rasters remain unchanged. The drawer and clip appear only after the prop has decoded and been prepared, and asynchronous preparation is ignored after room disposal.

Add free chapter-map and direct `#lightspeed` entry, meaningful room interactions and the existing Lightspeed puzzle rules. Preserve all earlier saves and puzzles. The faulty receipt can now travel to SMART naturally; the drawer's pick and the later candidate/test-sale path still depend on Shopify. Browser fixtures may supply the future pick, but normal play must not mint it here. The new browser payload protects older cached clients while reading previous world versions. No new career dates, employer claims, instructions or reflection prose.
