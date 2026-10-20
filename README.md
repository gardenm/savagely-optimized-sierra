# Savagely Optimized

A personal point-and-click career adventure for **savagelyoptimized.co**. Two playable chapters take place in imagined McGill / CIM and Nortel labs, drawn in a chunky, goofy cartoon style inspired by Day of the Tentacle. The remaining career rooms appear on a map and are clearly marked as planned.

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

For development checks: use the Recommendz computer, choose **Adventure**, **Comedy**, and **Sci-fi**, take the ticket, then use it with the door. The character walks to the exit and the next scene is Nortel. Reduced motion makes the transition immediate.

Nortel (`#nortel`) contains OME racks, an anti-static strap, a loose cable, a lab console, and an exit. Use the strap to wear and ground it, then use the loose cable to reconnect it and leave for the chapter map. Picking up the strap alone does not ground it: choose Use and click its inventory icon to wear it. Touching electronics without it gives the character a brief static shock and trips the equipment. A self-test recovers after 1.8 seconds; using the console resets it immediately. No port-selection or configuration step is required. This is an illustrative puzzle, not a reconstruction of actual OME hardware or a real lab incident. Nortel's year is intentionally omitted until the owner supplies it.

Both rooms are directly accessible from the chapter map. The owner explicitly requested removing objectives, hints, walkthroughs, and repeated guidance from the site; these developer instructions do not appear in the game. A quiet **Restart** control resets only the current chapter. Each chapter saves independently, with the original McGill save format preserved. The reflection sidebar is removed; the game is centred at a maximum width of 1000px with no placeholder text. The self-hosted Day Of The Tentacle face supplies the command lettering; speech remains Comic Neue.

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

The entry point starts a small application coordinator. `src/chapters.ts` registers typed room definitions and puzzle views; `src/chapter.ts` runs one reducer session and performs its effects. Pure game rules live in `src/game`, with each chapter's puzzle and scene data in its own room module. DOM views live in `src/ui`, browser services in `src/browser`, and biography content in `src/content`. The existing McGill save format is preserved.

See [the architecture guide](docs/architecture.md) for data flow, module boundaries, testing, and adding another chapter.

## Build and deploy

```sh
npm run build
npm run preview
```

`dist/` is the deployable site. Cloudflare Pages, Netlify, Vercel, or another static host can use `npm run build` with output directory `dist`. Hash navigation keeps both rooms, map, and CV working on static hosting without rewrite rules. The owner has confirmed HTTPS works on the custom domain after enabling Cloudflare's HTTPS redirect.

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

All personal facts come from the owner's supplied outline. The room, film puzzle, and dialogue are fictionalized framing. The character now uses actual uploaded face, body/sleeve, and chest-tattoo photographs, with the owner's updated brown tortoiseshell frames and earlier corrections. It has a higher hairline, full mostly brown tapered beard, slim/fit build, sage V-neck shirt, left-arm Japanese-style sleeve, and a small paw/cloud detail at the collar. The two directional drawings are separate assets so tattoos stay on the correct arm. The owner has approved the character; both poses now display 50% larger without changing the artwork. Raw reference photos stay outside this repository and website. The toy puzzle does not reproduce the original Recommendz algorithm. The approved room still contains its record-player illustration. The broader personal theme is art and music; a Birch Green Jazzmaster could appear in a later Shopify room.

See [PRODUCT.md](PRODUCT.md) for confirmed product facts and [docs/adventure.md](docs/adventure.md) for the chapter plan.

Command font: the owner supplied **Day Of The Tentacle** by Jenny Barck (1997). Its accompanying note labels it **Freeware, Non-Commercial**. The original file and usage notice are self-hosted; see [font provenance](docs/font-provenance.md).
