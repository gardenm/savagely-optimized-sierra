# Savagely Optimized

A personal point-and-click career adventure for **savagelyoptimized.co**. The first playable prototype takes place in a fictionalized McGill / CIM lab, now drawn in a chunky, goofy cartoon style inspired by Day of the Tentacle. The remaining career rooms appear on a map and are clearly marked as planned.

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

## Play the first chapter

The scene is labelled **McGill University, 2006**. Click the floor to walk, or choose a verb and an object. The nine-verb grid follows the classic adventure layout; object hover or keyboard focus builds the action sentence. The inventory is pictorial. Responses appear as dialogue over the room, only after an interaction. The approved room and character assets are preserved; the character remains at the enlarged display scale.

For development checks: use the Recommendz computer, choose **Adventure**, **Comedy**, and **Sci-fi**, take the ticket, then use it with the door. The next view is a chapter map, not a second playable room yet. The owner explicitly requested removing objectives, hints, walkthroughs, and repeated guidance from the site. A quiet **Restart** control remains in the footer. Progress is saved locally when browser storage is available. The reflection sidebar deliberately contains Lorem ipsum until the owner writes the reflection.

Tab reaches the controls and objects. While focus is inside the game, arrow keys move the character and W / L / U select actions. Escape closes the computer and restores focus. Reduced-motion preferences are respected. Sound starts only after an explicit click and uses an original synthesized ambient chord; no album audio is included.

**The short version** opens a factual career overview without requiring any play. The overview can be printed.

## Validate

```sh
npm run build
npm test
```

To run the same checks against the deployable bundle instead of the development server:

```sh
npm run build
PLAYWRIGHT_USE_PREVIEW=1 npm test
```

The 12 browser checks exercise the full puzzle and exit, wrong and incomplete answers, persistence, CV access, classic verb commands, inventory selection, keyboard controls, dialog focus, reset, sound, unavailable storage, art loading, and mobile overflow. They run at desktop and mobile sizes. By default they use `/usr/bin/chromium`; set `CHROMIUM_PATH` to your installed Chromium executable if needed. Example on macOS:

```sh
CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm test
```

For a standard Playwright-managed browser, run `npx playwright install chromium` and set `CHROMIUM_PATH` to that executable. Visual checks are written to `.impeccable/review/` and are not committed.

## Build and deploy

```sh
npm run build
npm run preview
```

`dist/` is the deployable site. Cloudflare Pages, Netlify, Vercel, or another static host can use `npm run build` with output directory `dist`. Hash navigation keeps the adventure, map, and CV working on static hosting without rewrite rules. The production build was validated locally; no public deployment or DNS changes have been made.

After selecting a host, connect `savagelyoptimized.co` through that host's custom-domain flow. Use the exact DNS records provided there; domain verification and DNS changes are a separate publishing step.

Recommended route: **Cloudflare Pages with GitHub integration**.

1. Commit and push the project to `gardenm/savagely-optimized-sierra`.
2. Create a Pages project connected to that repository, using `main` as the production branch.
3. Set the build command to `npm run build`, output directory to `dist`, and `NODE_VERSION` to `24`. The app root is the repository root; the framework preset can be Vite or None with these explicit settings.
4. Review the generated `pages.dev` URL. Later pushes rebuild automatically, and pull requests can get preview deployments.
5. Add `savagelyoptimized.co` as a custom domain. Cloudflare Pages requires the apex domain's DNS zone to be managed in Cloudflare; if its nameservers are elsewhere, review that DNS move before changing them. Existing mail and other records must be retained. HTTPS is handled by the host.

The application itself needs no runtime secrets, database, or server process. The `dist/` output is portable to another static host if preferred.

## Content still needed

- Preferred display name. The owner has approved the photo-guided character, with a 50% display-scale increase applied. Four unique attached photographs have been inspected and used; the earlier external links remain blocked, but that no longer prevents reference-based drawing.
- Real McGill anecdotes, room details, and tone corrections.
- Career dates beyond the supplied McGill scene label (2006), exact publication titles and links, contact links, and optional downloadable CV.
- Favourite albums and any audio you want to include with appropriate permission.
- A specific Shopify agentic-engineering story to shape that room's puzzle.

All personal facts come from the owner's supplied outline. The room, film puzzle, and dialogue are fictionalized framing. The character now uses actual uploaded face, body/sleeve, and chest-tattoo photographs, with the owner's updated brown tortoiseshell frames and earlier corrections. It has a higher hairline, full mostly brown tapered beard, slim/fit build, sage V-neck shirt, left-arm Japanese-style sleeve, and a small paw/cloud detail at the collar. The two directional drawings are separate assets so tattoos stay on the correct arm. The owner has approved the character; both poses now display 50% larger without changing the artwork. Raw reference photos stay outside this repository and website. The toy puzzle does not reproduce the original Recommendz algorithm. The record-player illustration establishes the music corner; it is not an exact model of the owner's Kanto Obi3 Gen2.

See [PRODUCT.md](PRODUCT.md) for confirmed product facts and [docs/adventure.md](docs/adventure.md) for the chapter plan.
