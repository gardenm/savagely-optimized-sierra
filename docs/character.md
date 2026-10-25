# Character brief

The owner has successfully attached photographs. Eight local attachment files contain four unique images: front full body, side full body/left sleeve, face portrait, and chest tattoo. All four have been inspected. Private working copies are retained at `/workspace/.private-photo-references`, outside the checkout and published site. Do not copy raw photographs or private share URLs into the public repository or website.

The new directional character artwork is photo-guided and replaces the rejected description-only study. The owner approved this character, saying “Amazing, I love it” and explicitly requesting no change to the artwork, only a larger display scale. The owner’s preferred display name is Matt Garden.

Historical access issue: external LinkedIn/iCloud fetching was rejected by the workspace proxy even after the owner published the correct allowed hosts. Attachments now provide the required references, so that network failure no longer blocks character work. The cause of the earlier desktop attachment error has not been established; successful receipt of these files does not prove every attachment format/path is fixed. Do not request duplicate host permissions.

## Observed reference features

- High broad forehead and receding temples, with short brown hair swept up and across; avoid the old study's thick spiky hairstyle.
- Broad substantial rectangular-rounded glasses. The portrait shows dark frames; use the owner's updated brown tortoiseshell Persol-style frames.
- Long oval face, relaxed light grey-green eyes, a relatively straight narrow nose bridge and modest rounded tip; avoid a generic large hooked cartoon nose.
- A full brown beard/moustache tapering below the chin, with a lighter brown centre and only a few grey strands in the drawing.
- Natural slim/fit shoulders, arms, and torso in the full-body references; avoid the first study's broad muscular chest and biceps.
- A pale sage V-neck shirt and blue-grey trousers in the body photos. The new drawing uses that outfit with simple off-white trainers.
- The actual sleeve's muted teal/blue-grey waves and clouds, with whale/squid/anchor motifs and restrained rust accents. The chest reference informs the small paw/cloud detail above the collar; most of the design stays concealed.

## Supplied physical details

- Age 48; 5 ft 11 in; approximately 185 lb; athletic / muscular build.
- Refinement after the first drawing: less muscular. A normal fit adult build with relaxed, natural shoulders and arms; avoid an exaggerated bodybuilder chest or biceps.
- Brown hair, parted casually by hand from the anatomical left to right.
- Medium-length brown beard and moustache, neither very short nor long, with just a little grey. Most of the beard stays brown.
- White skin; the owner described their family background as half Ukrainian and half Welsh. This is supplied context, not an inference from the photographs.
- Persol-style brown tortoiseshell glasses.
- Full Japanese-style tattoo sleeve on the anatomical LEFT arm: sperm whale on the upper arm, squid and anchor on the forearm.
- Chest tattoo: tiger and fish. Only a tiger FORELEG / PAW and Japanese tattoo cloud work should show above the shirt collar. Do not draw a tiger head at the neckline. The rest of the design remains under the shirt.

## Drawing direction

The owner loves the revised cartoon ROOM but rejected the previous character as insufficiently similar and too naturalistic. The owner has now approved the new photo-guided sprites. Both artwork files must stay unchanged for the scale refinement. The room's artwork remains byte-for-byte unchanged.

Use the more exaggerated graphic-adventure silhouette of the new pass: a larger expressive head, compact slim body, simpler facial planes, fewer larger cel-shaded shapes, and bold chunky contours matching the room. Preserve adult age and natural fitness without bodybuilder shoulders or arms. The higher hairline, glasses, longer brown beard with very little grey, and left-arm sleeve remain identifying details.

Use the inspected private photographs for future corrections. The new pass references the actual face, side-body/sleeve, and chest photographs along with the approved room art. The owner-approved character is displayed 50% larger: a 30%-wide, 54%-high scene box, with unchanged aspect ratio and feet anchored to the same floor position.

The sage short-sleeved V-neck reveals the left sleeve and a little chest tattoo. The artwork has native alpha transparency. Tattoos remain simplified Japanese-style illustrated motifs suited to game scale, not a claim of a precise reproduction of every ink line.

Preserve anatomical tattoo placement when changing direction. Do not mirror the right-facing sprite to fake a left-facing one; use separate directional art so the left-arm sleeve does not migrate to the right arm.

## Current walking motion

The owner requested another restrained Day of the Tentacle-inspired walk attempt after rejecting earlier frames whose head size changed. Keep the hands in the pockets and preserve the approved head, torso, tattoos, proportions and display scale. The owner liked the new leg motion and reported an intermittent disappearance at the beginning of movement.

`src/ui/character-walk.ts` derives eight poses from the original directional rasters without editing either asset or generating new character art. Only the lower trousers and shoes deform, in a 720ms stepped cycle. The shoes translate rigidly while the trouser legs bend slightly. There is no whole-body walking bounce, rotation or scaling. The original upper body stays visibly mounted throughout; the lower canvas and upper image meet below both pockets. The existing Nortel electrical-shock jolt is a separate intentional effect.

The renderer waits for the requested directional sprite to decode before using it. While a left-facing sprite is unavailable, the ready right-facing idle sprite remains visible. Canvas frames are prepared before replacing the idle legs, and each replacement is one draw rather than a clear followed by a draw. Idle artwork is the fallback if frame preparation fails. Queued animation timestamps can predate the movement event; elapsed time is clamped to zero so they cannot select a negative frame index. Retargeting preserves the cycle phase, arrival restores the full idle image, hidden tabs stop frame work, and reduced motion uses the full idle image with immediate travel. Disposal cancels animation and releases the frame cache. No game framework or new dependency is required.

Browser regression coverage includes a delayed first left-facing sprite, repeated starts and direction reversal, stationary targets, navigation, reduced motion, nonempty frames, and pixel equality of the upper body across all eight poses. Captures are saved under `.impeccable/review/` as `desktop-walk-0.png` through `desktop-walk-7.png` and their mobile equivalents.
