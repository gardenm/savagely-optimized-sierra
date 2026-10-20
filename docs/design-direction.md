# Room direction

Status: the owner explicitly replaced the initial painterly, slightly pixelated direction with a chunkier, caricatured, slightly goofy Day of the Tentacle-inspired cartoon world. The McGill room is owner-approved. The character has now been rebuilt using four inspected uploaded reference photographs and the owner's appearance corrections; the owner has approved it and requested only a larger display scale. Nortel extends this world with an original optical lab.

The owner rejected the old description-only character as too naturalistic and insufficiently similar. The replacement uses the real higher hairline, broader frames, longer tapered beard, natural slim/fit build, sage shirt, and tattoo references, with a larger head, simpler angular cel shading, and bolder contours. Both directional poses preserve the sleeve's anatomical side. The approved room file is byte-for-byte unchanged. Private attachments now supply the needed references despite the unresolved external-link proxy failure. The owner has approved the new character. Preserve the sprite artwork and room; increase only the display scale, from 20%/36% to 30%/54% of scene width/height.

## Experience

The room leads the first viewport: an original cartoon university lab with leaning lilac walls, a bulging green CRT, a skewed door, enormous orange floorboards, leaning papers, noticeboard, record player, and a Montréal view. Big ink outlines, simplified cel-shaded shapes, and deliberately wonky perspective carry the new visual direction. A custard shell supports a flat deep-plum game UI, lavender text verbs and gold selected actions. The owner requested removing the marketing headline, scene slogan, instructions, objectives, hints and explanatory footer. One understated scene label reads “McGill University, 2006”. Lilita One supplies chunky display lettering; The owner-supplied Day Of The Tentacle 400 supplies irregular adventure-game lettering for game verbs and action sentences; Comic Neue remains for speech and terminal controls; DM Sans keeps biographical text readable. The CV and chapter map remain available in navigation.

The classic nine-verb grid and pictorial inventory support choosing an action, exploring a room prop, using Recommendz, acquiring a ticket, and carrying it to the door. The action sentence starts empty; hover/focus supplies object names. Speech appears over the room only after interaction. Walk motion is short and lightly bobbing. It becomes instant for reduced motion. The game's W/L/U and arrow shortcuts are active only while focus is within the game. Separate left- and right-facing drawings preserve the anatomical left-arm tattoo sleeve instead of mirroring it to the opposite arm.

The character brief is in character.md: short swept brown hair with receding temples, a longer mostly-brown beard with a little grey, Persol-style brown tortoiseshell glasses, a natural slim/fit build, left-arm sperm whale / squid / anchor sleeve, and only tiger foreleg/paw plus clouds peeking above the sage V-neck. Photographs guide the features and outfit; the owner's explicit corrections govern the glasses colour, restrained grey, lower muscle mass, and collar detail.

The game and scene label are centred at a maximum width of 1000px and fill smaller containers. There is no reflection sidebar or placeholder text; the owner may supply reflections later. Verbs and inventory stay side by side. There is no task journal, objective checklist, hint, walkthrough or duplicate object list. The film puzzle has a protected-focus terminal dialog. Other reading happens through hash routes, not modals.

## Nortel extension

McGill's ticket puzzle now leads through its doorway into the Nortel room at `#nortel`. Both chapters are directly accessible from the chapter map, save independently, and restart only the current room. The exit waits for the character's walk, becomes immediate for reduced motion, and is cancelled if the visitor navigates away. The legacy McGill save key and schema are preserved.

Nortel is an ordinary extension of the established visual world: an original imagined optical equipment lab with multiple leaning teal OME racks, cream card shelves, yellow and orange fibre loops, a spare-fibre bench, configuration console, circuit sheet and crooked purple door. The approved McGill room supplied the style reference. Thick plum outlines, exaggerated proportions, cel shading and a clear walking floor continue the same world. The original McGill artwork and both directional sprites remain untouched; character display remains 30% of scene width and 54% of scene height. The shared centred shell, nine verbs, empty entry action sentence, empty entry speech and pictorial inventory remain. The understated scene label is “Nortel”, with no invented year, hints, objectives or sidebar.

The room's fictional puzzle lets the visitor inspect the circuit sheet, collect fibre, connect OME A shelf 2 port 3 to OME B shelf 1 port 2, then use the configuration console before leaving for the chapter map. The owner's factual work was PDH configuration on OME metro equipment; the room, patch endpoints, dialogue and successful connection are illustrative framing, not a reported employer incident or achievement.

The patch-bay closeup uses the incumbent plum terminal frame, Lilita One heading and Comic Neue hardware labels. Two teal shelf panels remain side by side on phone and desktop, with four numbered cream ports in each. Custard fill and a gold border identify selected ports. An SVG cable follows the selected sockets, appearing dashed before connection and solid gold after carrier restoration; green sockets and explicit status text communicate success. Keyboard focus and Escape handling use the native dialog, with focus returned on close. This closeup shows hardware and status without adding coaching to the room.

## Visual evidence

- `public/art/mcgill-lab.webp`: original generated chunky cartoon room artwork.
- `public/art/adventurer-right.webp` and `adventurer-left.webp`: original generated directional character studies with native alpha.
- `.impeccable/review/desktop.png` and `mobile.png`: final full-page captures.
- `.impeccable/review/desktop-computer.png` and `mobile-computer.png`: final terminal viewport captures.
- `public/art/nortel-lab.webp`: original generated optical lab, with the approved McGill room as style reference.
- `.impeccable/review/desktop-nortel.png` and `mobile-nortel.png`: Nortel entry captures with the unchanged shared shell and controls.
- `.impeccable/review/desktop-patchbay.png` and `mobile-patchbay.png`: unconnected optical-shelf closeup captures.
- `.impeccable/review/desktop-patchbay-connected.png` and `mobile-patchbay-connected.png`: connected closeup captures with cable and carrier status.

Exact generation prompts and sources are preserved in `docs/art-provenance.json` and embedded as XMP metadata in the shipped WebP files. Both rooms are imagined settings, not verified reconstructions of actual employer or university labs.

## Tooling limits

The Impeccable context/launcher binary was unavailable in this checkout. Context was read directly; visual and functional review use rendered screenshots and Playwright. No launcher-based concept roll, catalog quality bar, hook detector, or comp-diff score is claimed. No page comp was separately approved. The replacement follows the owner's explicit Day of the Tentacle-style request and appearance corrections; remaining visual details are reviewable prototype decisions.
