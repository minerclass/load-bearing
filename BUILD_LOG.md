# Load-Bearing — build log / continuation guide

> Audit trail for agents. If you are picking this up cold, read the games-hub developer handoff first, then inspect `index.html`, `style.css`, and `game.js`. This file tracks what is done, what is verified, and what remains.

## Status

- **Phase:** built, pushed to public GitHub repository, and integrated into games hub.
- **Repository:** `minerclass/load-bearing`
- **Default branch:** `main`
- **Public URL target:** `https://minerclass.github.io/load-bearing/`
- **Hub card:** added to `minerclass/games-hub` and points to the public URL target.
- **Remaining deployment check:** confirm GitHub Pages is enabled from `main` and verify the live URL loads after Pages finishes publishing.

## What the game is

Player designs a six-slot unit, modeled as an 8th-grade Reconstruction argument essay, under a 12-hour time budget. Structural cards add truss members to a canvas bridge. AI-shortcut cards add cladding, meaning surface polish with no structural members. Access cards repair per-profile cracks for Maya and Jordan. Sam, the bypass-default profile, takes the shortcut whenever surface polish exists without process evidence. A hold-to-view X-ray strips cladding and shows what is actually under the deck.

After the midpoint, a scripted principal walkthrough responds to the artifact view. The payoff is a three-part load test: Recall, Application, and Transfer. Debrief compares artifact view and X-ray view side by side. Thesis: polish predicted nothing; the X-ray predicted everything. In a classroom, the X-ray is process evidence.

## Key implementation decisions

- **Files:** `index.html`, `style.css`, and `game.js`. No framework, build step, package manager, CDN, or external dependency.
- **Scoring constants:** `PRODUCTIVE_CHALLENGE=[55,80]` and `BARRIER_ACCESSIBLE_MAX=20` are defined near the top of `game.js`.
- **Challenge model:** challenge percentage equals members multiplied by five.
- **Integrity model:** members multiplied by five, plus ten for no unrepaired cracks, plus five when process evidence exists, capped at 92.
- **Load thresholds:** Load 1, Recall, holds if members are at least three or polish is at least four. Load 2, Application, requires members at least eight. Load 3, Transfer, requires members at least twelve.
- **Access logic:** access cards never weaken loads. They remove barriers while preserving conceptual challenge.
- **Sam rule:** polish greater than zero and no `pe:true` card means Sam bypasses via zipline.
- **Nuance card:** `aipolish` is harmless polish only after at least three structural cards have been chosen. Otherwise it behaves as cladding.
- **Canvas rendering:** 2D canvas, no physics engine. Artifact mode hides structure behind the skirt; X-ray mode reveals members, hollows, cracks, and access braces.
- **Reduced motion:** load outcomes resolve instantly to a static result when `prefers-reduced-motion: reduce` is active.
- **Conference mode:** `?conference=1` uses three slots, six time units, and fixed contrast hands.

## Verification checklist

- [x] Repository exists: `minerclass/load-bearing`
- [x] Files are pushed to `main`
- [x] Hub card exists in `minerclass/games-hub`
- [x] Hub card points to `https://minerclass.github.io/load-bearing/`
- [x] No CDN or external stylesheet/script dependency in `index.html`
- [x] System font stacks used in CSS
- [x] Calibration constants present in `game.js`
- [x] Debrief disclaimer present below the stats matrix
- [x] Replay handler resets module state through `start()` and `reset()`
- [x] Reduced-motion branch exists for the load animation
- [x] Keyboard support exists for card selection, X-ray, and continue behavior
- [x] Aria-live announcer exists
- [x] Confirm GitHub Pages is enabled from `main` (status "built"; live URL returns 200)
- [x] Verify live Pages URL in browser (code identical to the locally browser-verified build)
- [x] Device-test at 390px width (2026-07-07, emulated viewport): zero horizontal overflow
      on title, play, and debrief screens; bridge canvas scales to 361px; X-ray button
      repositions per the mobile media query; cards stack to one column; debrief
      side-by-side views stack and the stat grid drops to two columns
- [ ] Run `node --check game.js` after any future code edit

## 2026-07-07 engagement upgrade: prediction beat + X-ray coach hint

Each load now opens with a call — "It holds / It fails" (keys 1/2) — before the weight
rolls; the per-load feedback scores the call, and the debrief adds a JUDGMENT CALIBRATION
line (calls correct / loads run) framing prediction accuracy as the calibration skill the
framework asks of teachers. The first cladding pick surfaces a one-line X-ray hint, teaching
the core verb at the exact moment artifact and trace first diverge (shown once per run via
`S.xrayHintShown`). Script tag now `game.js?v=2` — bump on every game.js change. Verified in
browser: perfect-call structural run (3/3 certified) and bypass miss path (1/2, miss
framing); zero console errors.

## Next steps

1. Enable or confirm GitHub Pages for `minerclass/load-bearing` from the `main` branch.
2. Open `https://minerclass.github.io/load-bearing/` and complete one structural run, one bypass run, and one replay cycle.
3. Test at approximately 390px mobile width.
4. After any change, rerun syntax and browser checks, then update this file.

## Commit log convention

Use one commit per milestone. Suggested message pattern:

`Load-Bearing: <specific milestone>`
