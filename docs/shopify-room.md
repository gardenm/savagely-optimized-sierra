# Shopify home office

A fifth freely accessible room at `#shopify`, within the existing adventure shell. The owner's home office is the physical reference; this is not an employer office reconstruction or a claim about a real work incident.

## Visual references and privacy

The supplied office photograph shows a white standing desk, widescreen monitor, elevated silver laptop, blue mesh chair, grey walls and dark botanical hexagon wallpaper. The planned Palmo cabinet and three-tier hutch replace the black IKEA cabinet. The warm acacia/walnut finish, rounded posts, thick shelves and two-door base follow Structube's product photography:

- https://www.structube.com/en_ca/palmo-modernretro-3tier-hutch-shelf-110cm-73-59-15?pid=73977
- https://www.structube.com/en_ca/palmo-modernretro-2door-sideboard-69-56-81?pid=73971

The family photograph supplies the low wooden Sears Silvertone console and portrait cues. The separate dog photograph supplies the sheepadoodle's black ears/eye patches, white blaze and muzzle, and red collar. Photos above the computer are original cartoon interpretations of wife, son and dog, not embedded photographs. A Birch Green offset-waist Jazzmaster stands beside the cabinet and stereo. Moving the stereo into this scene and replacing the storage anticipate the owner's stated plans, not the current photographed layout. Exact cabinet size was not supplied; the compact two-door arrangement is an illustrative composition.

Raw photographs remain outside the checkout and public site. No personal image assets are copied into the build. The existing rooms, character poses, tattoos, display scale, typography, silent entry and nine-verb controls remain unchanged.

## Active artwork and direction

The owner explicitly wants an original point-and-click adventure in a Day of the Tentacle-inspired style: chunky exaggerated objects, crooked perspective, bold dark-plum outlines, angular painted shadows, warm orange wood, violet walls and teal trim. They rejected the earlier code-authored SVG as too flat and unlike the other rooms, and supplied a painted Shopify room as a much closer visual reference.

`public/art/shopify-office-painted.png` is the active background. It was produced with the built-in OpenAI `image_gen` tool by editing the owner's supplied painted room. That painting governs composition; the approved McGill room governs the wider game's rendering style. The office, family/stereo and sheepadoodle photographs guide personal details. The exact prompt is preserved in `docs/shopify-image-prompt.txt` and `docs/art-provenance.json`. The generated 1536×1024 PNG is copied into the project without pixel edits.

The three private Desktop photographs were inspected directly. The wife's portrait follows her shoulder-length brown hair, glasses atop her head, broad smile and denim jacket over floral clothing. The son's portrait follows his swept light-brown hair and black shirt and tie. The dog's portrait follows the black ears and eye patches, long white muzzle and blaze, brown eyes, red collar and round tag. These remain original cartoon paintings inside the existing skewed frames.

The wallpaper alternates bamboo and bonsai inside the dark hexagons. The Silvertone has a walnut front, ribbed speaker ends, dark glass tuner, metal legs, open lid and visible platter. At the owner's explicit request, a small green Shopify shopping-bag statue with a white S sits on the desktop; this ornament was not in the photographs. The white standing desk, blue chair, central Palmo hutch, green Jazzmaster, window, rug, warm floor and right doorway follow the supplied painting. Portrait, cabinet, guitar and console hotspots are aligned to the painted objects. The collectible guitar pick remains a separate overlay, with no painted duplicate.

The SVG remains as a superseded source and is no longer referenced by the game. The earlier HTTP 403 applied to a different configured image service; it did not block this successful built-in image-generation edit. The owner approved the painted result and requested that the furniture be called simply “cabinet” in the game. Palmo is a visual reference only; the hotspot, action sentence, dialogue and image description use the generic name.

## Playable scope

Each portrait, guitar, cabinet and stereo has a separate labelled hotspot and short personal response. The guitar pick is a separate SVG overlay and collectable hotspot; both disappear on pickup and return on restart. The real pick can travel to Lightspeed to open its drawer without a test fixture.

The computer adapts existing Shopify story rules: give/use the checkout sketch and faulty receipt as context, use the computer to prepare a candidate, test it at Lightspeed with Nortel's link restored, and return the candidate-bound test receipt for review. Shared adventure state preserves this evidence through room changes and reloads. This is deterministic fictional puzzle logic: no live model, external API, or representation of a real Shopify implementation.

The full five-room puzzle web is still not naturally completable from fresh public play: McGill's paper-plane source and the full McGill/Nortel story cutover remain separate work. The browser candidate/review test explicitly seeds SMART's downstream sketch prerequisites. Do not describe that fixture journey as a complete fresh-play walkthrough.

## Verification

Desktop/mobile browser tests cover silent entry, all personal details, real pick collection, drawer use, travel, persistence, resume and restart. A separate fixture-based journey exercises briefing, candidate persistence, independent sale testing and review. Screenshots are written to `.impeccable/review/desktop-shopify.png` and `mobile-shopify.png` for visual inspection.

The owner rejected the earlier SVG's visual style and approved the painted replacement. Release validation after the generic cabinet rename passed the production build, all 133 unit tests and all 60 desktop/mobile browser tests against the production bundle. These include the separate-pick lifecycle, travel, persistence and fixture-based candidate/test/review flow. Desktop and phone captures were visually inspected with the existing character and controls. Production publication uses the repository's existing Cloudflare Workers Builds integration on `main`.
