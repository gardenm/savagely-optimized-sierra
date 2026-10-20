# Savagely Optimized

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Implementation: plain TypeScript, HTML, and CSS, built with Vite. A pure reducer handles shared adventure state, room modules own puzzle rules and scene data, DOM views render state, and browser services perform effects. The result is a static site with no backend. Unit tests run with Vitest and browser tests with Playwright; GitHub Actions checks pull requests and pushes to main. See docs/architecture.md. The owner has confirmed the custom domain works over HTTPS after enabling Cloudflare's HTTPS redirect.

## Product Purpose

A personal CV and biography on savagelyoptimized.co, told as a playable point-and-click adventure through the owner's career. Visitors can explore the game or directly read the career overview.

## Positioning

Each career stage becomes a room inspired by the actual work. Puzzles form an interconnected adventure across those rooms, with shared inventory and reasons to revisit earlier and later stages. The domain is a joke: .co is a “savagely optimized” .com.

## Capabilities and Constraints

Two rooms are playable, sharing one inventory and adventure save. McGill supports movement, prop inspection, Recommendz and a collectible cinema ticket. Nortel contains OME racks, an anti-static wrist strap, a loose cable and a lab console; its current local puzzle remains wear/ground the strap and reconnect the cable. Ungrounded contact produces a brief character shock and recoverable fault. Both doors freely return to the map, including before solving a puzzle; room exits do not complete the whole adventure. Items, worn state, milestones and each room's position survive travel and reload. Restart clears the whole adventure and keeps the current room. Legacy McGill/Nortel saves are imported once and preserved as recovery data. Invalid or unsupported new saves stay protected until a deliberate Restart. Future scenes cover SMART Technologies, Lightspeed and Shopify, with Timney optional.

The planned connected adventure spans McGill, Nortel, SMART, Lightspeed and Shopify. All five main rooms will be freely accessible; items and progress cross the career chronology through overlapping paths rather than isolated chapters or room pairs. SMART's plan, Lightspeed's transaction example and Nortel's working network converge on a Shopify agent task, followed by an independent Lightspeed test and a return to Shopify. See docs/puzzle-web.md for the concrete blueprint, item recovery and transition from the current two-room implementation. Timney remains optional and outside the required path. Shared adventure state, inventory, saving and free travel are implemented for the two existing rooms. The five-room puzzle rules, atomic item lifecycles and future save migration now run through reducer fixtures, including multiple solution orders and recovery from every reachable milestone prefix. The remaining three scenes, new controls and public integration of those rules are next; they are not playable yet.

The owner wants minimal exposition and a UI much closer to Day of the Tentacle. Keep the wordmark and direct short-version link. The scene label is “McGill University, 2006”, supplied by the owner. Remove the career headline, scene slogan, initial instruction, objectives, task checklist, hints, walkthrough, duplicate object list, and introductory dialogue. The game uses nine plain verbs, a contextual action sentence, pictorial inventory, and dialogue only after interactions. Walking is the default action. After trying a drawn walk cycle, the owner preferred the original idle sprite with a small jiggle while moving; retain that simpler motion. The placeholder reflection sidebar is removed. The game and scene label are centred at a maximum width of 1000px, filling narrower screens. Reflections may return when the owner supplies real text. Commands use the self-hosted Day Of The Tentacle cartoon face; speech stays Comic Neue. Understanding or completing the game is optional.

The owner has successfully attached four unique photographs: a face portrait, front and side body/left-sleeve views, and a chest-tattoo reference. They have been inspected and used to create the new character. Raw references stay outside the checkout and published site. See docs/character.md for observed features and the owner's corrections. The owner has approved the current character artwork and requested only a larger display scale. The career overview identifies Matt Garden by name. The owner supplied https://www.linkedin.com/in/matthewgarden/ as the LinkedIn link for the career overview and https://cim.mcgill.ca/~mrl/pubs/mgarden/garden-semantic-eee05.pdf for inspecting the lab’s research papers. Preserve these exact URLs; the PDF contents have not been fetched in this environment. Career dates, further publications, and any further contact details remain open. Do not invent them. Do not imply future chapters are already playable. The lab, puzzle, dialogue, and film choices are fictionalized framing.

Earlier external photo links remained blocked by the runtime proxy even after the owner published the required host permissions. Uploaded attachments now bypass that reference-access blocker without changing the network policy. Do not request duplicate domain grants. The owner loves the revised cartoon room; it is preserved. The new character uses the actual photos and more exaggerated Day of the Tentacle proportions and is owner-approved. Preserve both directional artwork files; their display scale has been increased by 50%. Do not ship raw private photos or share URLs in the site.

## Brand Commitments

Name and domain: Savagely Optimized / savagelyoptimized.co. The owner explicitly replaced the first detailed, slightly pixelated direction with a chunkier, more caricatured and slightly goofy Day of the Tentacle-inspired style. Use original characters, exaggerated proportions, big readable shapes, crooked architecture, and bold cartoon outlines. The other adventure references remain background influences. Light adventure-game humour is welcome.

## Evidence on Hand

Owner's supplied career facts: Timney Lab at UWO: a few months as a high-school co-op student, then the first programming job while at university, programming vision tests including Gabor patches. Dr. Timney offered the job while visiting Shoppers Drug Mart for cold medicine, where the owner worked as a stockboy and cashier supervisor; movie-recommendation research with Greg Dudek and Recommendz at McGill's CIM; MSc earned and PhD left after two years; Nortel PDH configuration on OME metro equipment; SMART Notebook for Mac; Lightspeed iOS POS; Shopify retail POS and agentic engineering. More than a decade mentoring students in a high-school CS class. Loves art and listening to music, and has just started learning guitar. A Birch Green Jazzmaster is a possible prop for the future Shopify room. Keep the current public biography broad; do not centre it on record-player hardware or add detailed family/genre information. The owner supplied 2006 for the McGill scene label; other dates and external source links remain unverified.

## Product Principles

- Make the career legible without requiring the visitor to solve puzzles.
- Use interactions that explain the work and personality.
- Keep puzzles short and forgiving. Let visitors explore without coaching; the short version is always available.
- Distinguish factual biography from fictional framing.
- Preserve keyboard, touch, and reduced-motion access.
