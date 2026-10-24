# Savagely Optimized

A personal point-and-click career adventure for **savagelyoptimized.co**. Five explorable rooms share inventory and a save: imagined McGill / CIM and Nortel labs, a SMART Technologies cubicle office, a Castle-inspired Lightspeed office, and Shopify in a photo-referenced home office. The optional Timney Lab prologue remains planned.

## Connected adventure blueprint

The connected design spans all five main career rooms with shared inventory, free travel, overlapping item paths and a Shopify task verified at Lightspeed. See [the puzzle web](docs/puzzle-web.md) for the room map, dependencies, item lifecycles and implementation sequence. SMART, Lightspeed and Shopify use the tested `src/game/story` rules. The full McGill/Nortel story cutover and McGill's paper-plane source remain unfinished; a fresh public game is not yet naturally completable.

## Run locally

Use Node **22.12+** (Node 24 was used to build this prototype).

```sh
npm ci
npm run dev
```

The development server uses port 5173 by default. This is a static Vite / TypeScript project with no backend, API keys, remote fonts, or required services. Fonts and artwork ship with the site.

In the Codex cloud environment, use a writable cache if the default home directory is restricted:

```sh
npm ci --cache /workspace/.cache/npm
```

## Play the chapters

The scene is labelled **McGill University, 2006**. Click the floor to walk, or choose a verb and an object. The nine-verb grid follows the classic adventure layout; object hover or keyboard focus builds the action sentence. The inventory is pictorial. Responses appear as dialogue over the room, only after an interaction. The approved room and character assets are preserved; the character remains at the enlarged display scale.

For development checks: use the Recommendz computer, choose **Adventure**, **Comedy**, and **Sci-fi**, take the cinema ticket, then open the door to return to the map. Both rooms can be visited before solving either puzzle. Reduced motion makes the transition immediate.

Nortel (`#nortel`) contains OME racks, an anti-static strap, a loose cable, a lab console, and an exit. Use the strap to wear and ground it, then use the loose cable to reconnect it and leave for the chapter map. Picking up the strap alone does not ground it: choose Use and click its inventory icon to wear it. Touching electronics without it gives the character a brief static shock and trips the equipment. A self-test recovers after 1.8 seconds; using the console resets it immediately. No port-selection or configuration step is required. This is an illustrative puzzle, not a reconstruction of actual OME hardware or a real lab incident. Nortel's year is intentionally omitted until the owner supplies it.

SMART (`#smart`) is a traditional fabric-partitioned cubicle office with a SMART Board, silver/black iMac and black PC workstation, using the owner's circa 2009–2013 hardware reference. The room label has no inferred employment dates. Explore its computers, printer and high ledge. Its real scene supports the planned plane → fallen stylus → copied receipt → checkout sketch rules, without adding temporary sources for items from unfinished rooms. Browser tests supply those future items as fixtures; normal play currently offers exploration while the full cross-room story is built.

Lightspeed (`#lightspeed`) borrows brickwork, exposed beams and arches from the Montréal headquarters at Gare Viger, at the owner's request. The biographical job location remains Ottawa. Use the iPad POS to print a faulty receipt, then look at the receipt printer to read it. Carry it to SMART and use it on the board to copy the example. The drawer requires Shopify's real guitar pick and reveals a collectible retaining clip. See [the scene brief and photo sources](docs/lightspeed-room.md).

Shopify (`#shopify`) interprets the owner's home office, including a wooden cabinet and shelves, Birch Green Jazzmaster, 1970s Sears Silvertone console, green shopping-bag desk statue and separate portraits of wife, son and sheepadoodle. The collectible pick disappears on pickup. The computer accepts a sketch and example, prepares a candidate, then reviews an independent Lightspeed test receipt. This path persists across rooms and reloads; browser tests explicitly seed the still-unavailable SMART sketch prerequisites. The owner-approved background is a painted image-generation edit of their supplied room, following the other scenes' Day of the Tentacle-inspired direction. Raw family photos are not published. See [the scene brief](docs/shopify-room.md).

All five rooms are directly accessible from the chapter map. The owner explicitly requested removing objectives, hints, walkthroughs, and repeated guidance from the site; these developer instructions do not appear in the game. A quiet **Restart** control resets the whole adventure after confirmation and stays in the current room. One adventure save holds shared inventory, milestones, candidate-bound evidence and all five positions. The existing storage key remains, with payload version 4 accepting/upgrading previous world versions 1–3. Old McGill/Nortel chapter saves are imported once without modifying their keys. Corrupt, future-version, unknown-item or inconsistent saves are preserved until an explicit Restart. The reflection sidebar is removed; the game is centred at a maximum width of 1000px with no placeholder text. The self-hosted Day Of The Tentacle face supplies the command lettering; speech remains Comic Neue.

Tab reaches the controls and objects. While focus is inside the game, arrow keys move the character and W / L / U select actions. Escape closes the current puzzle and restores focus. Reduced-motion preferences are respected. Sound starts only after an explicit click and uses an original synthesized ambient chord; no album audio is included.

**The short version** opens a factual career overview without requiring any play, with a direct link to Matt’s LinkedIn profile.

The overview identifies Matt Garden by name. Looking at the research papers in the lab reveals a link to the owner-supplied McGill PDF, opening in a new tab without leaving the adventure.

## Validate

```sh
npm run build
npm test
```

`npm test` runs Vitest unit tests followed by Playwright browser tests. Run either suite separately with `npm run test:unit` or `npm run test:e2e`. `npm run typecheck` checks the application, tests, and configuration, plus the game modules in isolation without DOM types. The build includes these checks.

To run the same checks against the deployable bundle instead of the development server:

```sh
npm run build
PLAYWRIGHT_USE_PREVIEW=1 npm test
```

The unit tests cover immutable reducer transitions, movement, inventory, puzzle rules, legacy saves, storage failures, and the audio lifecycle. Browser checks exercise the full puzzle, navigation, keyboard scoping, focus, persistence, sound failure, artwork, layout, and stable verb positions. They run at desktop and mobile sizes, using `CHROMIUM_PATH` when supplied, otherwise `/usr/bin/chromium` if installed, otherwise Playwright's managed Chromium. Example with a local Chrome installation:

```sh
CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:e2e
```

For a standard Playwright-managed browser, run `npx playwright install chromium`. Visual checks are written to `.impeccable/review/` and are not committed. GitHub Actions runs unit tests, the production build, and browser checks against the deployable bundle on pull requests and pushes to `main`.

## Architecture

The entry point starts a small application coordinator. `src/chapters.ts` registers typed room definitions and puzzle views; `src/chapter.ts` runs one reducer session and performs its effects. Pure game rules live in `src/game`, with each chapter's puzzle and scene data in its own room module. DOM views live in `src/ui`, browser services in `src/browser`, and biography content in `src/content`. Shared persistent progress lives in `src/game/adventure.ts`; its browser save adapter imports the old room formats and protects unreadable saves.

See [the architecture guide](docs/architecture.md) for data flow, module boundaries, testing, and adding another chapter.

## Build and deploy

```sh
npm run build
npm run preview
```

`dist/` is the deployable site. Cloudflare Pages, Netlify, Vercel, or another static host can use `npm run build` with output directory `dist`. Hash navigation keeps all rooms, map, and CV working on static hosting without rewrite rules. The owner has confirmed HTTPS works on the custom domain after enabling Cloudflare's HTTPS redirect.

After selecting a host, connect `savagelyoptimized.co` through that host's custom-domain flow. Use the exact DNS records provided there; domain verification and DNS changes are a separate publishing step.

Recommended route: **Cloudflare Pages with GitHub integration**.

1. Commit and push the project to `gardenm/savagely-optimized-sierra`.
2. Create a Pages project connected to that repository, using `main` as the production branch.
3. Set the build command to `npm run build`, output directory to `dist`, and `NODE_VERSION` to `24`. The app root is the repository root; the framework preset can be Vite or None with these explicit settings.
4. Review the generated `pages.dev` URL. Later pushes rebuild automatically, and pull requests can get preview deployments.
5. Add `savagelyoptimized.co` as a custom domain. Cloudflare Pages requires the apex domain's DNS zone to be managed in Cloudflare; if its nameservers are elsewhere, review that DNS move before changing them. Existing mail and other records must be retained. HTTPS is handled by the host.

The application itself needs no runtime secrets, database, or server process. The `dist/` output is portable to another static host if preferred.

## Content still needed

- Real McGill anecdotes, room details, and tone corrections.
- Career dates beyond the supplied McGill scene label (2006), further publications and contact details, and optional downloadable CV. The supplied LinkedIn and research-paper URLs are already linked.
- Optional art/music references and audio for future rooms.
- A specific Shopify agentic-engineering story to shape that room's puzzle.

All personal facts come from the owner's supplied outline and references. The rooms, puzzles, and dialogue are fictionalized framing. The approved photo-guided character retains its tortoiseshell glasses, mostly brown beard, sage shirt and anatomical left-arm tattoo sleeve; both separately drawn directional poses and their display scale are unchanged. Raw reference photos stay outside this repository and website. The toy puzzle does not reproduce the original Recommendz algorithm. The original McGill room keeps its record-player illustration; Shopify adds the owner's Jazzmaster and Silvertone console.

See [PRODUCT.md](PRODUCT.md) for confirmed product facts and [docs/adventure.md](docs/adventure.md) for the chapter plan.

Command font: the owner supplied **Day Of The Tentacle** by Jenny Barck (1997). Its accompanying note labels it **Freeware, Non-Commercial**. The original file and usage notice are self-hosted; see [font provenance](docs/font-provenance.md).
