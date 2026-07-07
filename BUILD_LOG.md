# Load-Bearing — build log / continuation guide

> Audit trail for agents. If you are picking this up cold: read
> `..\VISUAL_GAMES_HANDOFF.md` (§ "PRIORITY 1 — Load-Bearing") for the full spec, house rules,
> and the pitfalls checklist. This file tracks what is DONE vs. NEXT. Update it every commit.

## Status

- **Phase:** built, verified in browser — see checklist below
- **Location:** `C:\Users\mminer\OneDrive - bpd3.org\Desktop\Research\load-bearing\`
- **GitHub:** NOT yet created. Target: `minerclass/load-bearing` (public, GitHub Pages from
  main). Ask Micah before creating the repo / pushing.
- **Hub card:** NOT yet added to `minerclass/games-hub` (do this after Pages is live; card
  copy is in the handoff spec).

## What the game is (one paragraph)

Player designs a 6-slot unit (8th-grade Reconstruction argument essay) under a 12-unit time
budget. Structural cards add truss members to a canvas bridge; AI-shortcut cards add cladding
(polish, zero members); access cards repair per-profile cracks (Maya/ELL, Jordan/dysgraphia);
Sam (bypass-default) takes the shortcut whenever polish exists without process evidence. A
hold-to-view **X-ray** strips cladding. After slot 3 a scripted "principal walkthrough" praises
any polished bridge (artifact view fools everyone). Payoff: three loads cross the bridge —
Recall / Application / Transfer — and cladding shears off at the load it can't carry. Debrief
shows Artifact vs. X-ray side by side. Thesis: "Polish predicted nothing. The X-ray predicted
everything. In a classroom, the X-ray is process evidence."

## Key implementation decisions (so you don't re-litigate)

- **Files:** `index.html` + `style.css` + `game.js` (friction-game repo pattern). No CDN
  deps, system fonts only.
- **Scoring constants** (in game.js, top): `PRODUCTIVE_CHALLENGE=[55,80]`,
  `BARRIER_ACCESSIBLE_MAX=20`. challenge% = members×5. Integrity = members×5 + 10 (no
  unrepaired cracks) + 5 (process-evidence card present), capped 92 — a perfect run lands
  ~85–90, never 100 (deliberate: no ceiling-pinning).
- **Load thresholds (global, whole-bridge):** L1 Recall holds if members≥3 OR polish≥4
  (cramming survives recall — deliberate); L2 Application: members≥8; L3 Transfer:
  members≥12. Access cards never weaken loads (barrier removal ≠ less learning); their cost
  is the slot+time (honest opportunity cost).
- **Sam rule:** polish>0 AND no card with `pe:true` (oral defense / friction log / revision)
  → Sam bypasses (zipline, gray flag) regardless of structure.
- **Nuance card** (`aipolish`): counts as harmless polish if ≥3 structural cards already
  chosen, else counts as cladding — feedback text differs (AI-after-thinking vs.
  AI-instead-of-thinking).
- **Hand dealing:** each slot deals 3 cards — always ≥1 structural and ≥1 tempting
  (clad/nuance/trap), no repeats within a run.
- **Canvas:** 2D, scripted deformation (no physics engine). Artifact mode draws a plating
  skirt hiding the truss zone; X-ray hides skirt, shows members (gold) / hollow (coral
  dashed) / braces (teal). Reduced-motion: loads resolve instantly to a static result.
- **Conference mode:** `?conference=1` → 3 slots, 6 time, scripted contrast hands.

## Verification checklist (from handoff "Pitfalls") — status

- [x] No `\${` escapes; every JS-referenced id exists in HTML; no raw `**` in strings
- [x] No hardcoded names in output; divisors use collection lengths
- [x] Replay resets all module state
- [x] `node --check game.js` passes
- [x] Full browser playthrough incl. debrief + replay, zero console errors
      (structural run → all 3 loads held; bypass run → failed at Load 2, Sam ziplined)
- [x] Numeric sim: strong run lands challenge 70 / integrity 85 (in band, not pinned)
- [x] Reduced-motion + keyboard (1–3 pick, X x-ray, Enter continue) + aria-live announcer
- [ ] Mobile 390px pass (media queries written, not yet device-tested)
- [ ] GitHub repo + Pages + hub card (needs Micah's go-ahead)

## Next steps, in order

1. Device-test at 390px; tune `.cards` wrap if needed.
2. Ask Micah → `gh repo create minerclass/load-bearing --public`, push, enable Pages.
3. Add hub card to games-hub (copy in handoff §Load-Bearing), track `friction`.
4. Optional polish (only after the above): sound cues (Web Audio, off by default — copy
   the `cue()` pattern from orality_game), crack-propagation animation on load failure,
   X-ray flashlight radial reveal instead of full-canvas swap.

## Commit log convention

One commit per milestone, message starts with the milestone. Trailer:
`Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
