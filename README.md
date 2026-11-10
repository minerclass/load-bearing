# Load-Bearing

A visual simulation about unproductive success and process evidence. You design a six-lesson unit on Reconstruction and watch it become a bridge. Structural choices add trusses under the deck. AI shortcuts add polish on top. From the road the two bridges look the same, and only the load test tells them apart.

Allow about fifteen minutes. Written for teacher professional learning.

Play it at <https://minerclass.github.io/load-bearing/>.

## How it works

- **Six lesson slots and a twelve-hour budget.** You pick one of three cards per slot. Deep work costs time. Shortcuts are free.
- **Three kinds of card.** Structural cards add truss members. AI-shortcut cards add cladding with nothing behind it. Access cards repair cracks for two student profiles, Maya and Jordan, without weakening any load.
- **An X-ray.** Hold the X-ray button or press X at any time to see what is under the deck.
- **A principal walkthrough.** After the midpoint, a scripted visit responds to what the bridge looks like from the road.
- **Three load tests.** Recall, Application, and Transfer, each heavier than the last. Before each one you call whether the bridge holds or fails, with keys 1 and 2.
- **A debrief.** The artifact view and the X-ray view sit side by side, with a line on how accurate your calls were.

A third profile, Sam, takes the shortcut whenever polish exists without process evidence.

Add `?conference=1` to the URL for a shorter version with three slots and six time units.

## Run it locally

Open `index.html` in a current browser. There is no build step, framework, package manager, or account. The page links one shared stylesheet, `https://minerclass.github.io/tokens.css`, and falls back to its own colours when that file is unavailable.

## Conceptual grounding

Pedagogical friction, productive and exclusionary friction, and unproductive success as used here come from the framework Micah Miner is developing in his dissertation research. They are presented as proposals in progress, not as established terms or completed findings.

The game's argument is that polish predicts little about what a student can do, and that process evidence is the classroom version of the X-ray.

## What this does not claim

- All scores, stats, and achievements are illustrative models of the pedagogical friction framework, not validated learning assessment instruments.
- The students in the game are fictional design profiles. They are not participants and do not represent real learners.
- Nothing here calls an AI service. The "AI" choices are scripted teaching examples.
- The game does not measure learning, does not evidence any dissertation claim, and reports no findings.
- No participant, student, or staff data is used, collected, stored, or transmitted.

## Accessibility

Card selection, the X-ray, and the continue action work from the keyboard. An aria-live region announces changes. With the system reduced-motion setting on, each load resolves to a static result. The game was checked at 390px width with no horizontal overflow. Contrast was measured on the landing screen only, so later game states are unmeasured.

## Implementation

Three files: `index.html`, `style.css`, and `game.js`. The bridge is drawn on a 2D canvas with no physics engine. The calibration constants `PRODUCTIVE_CHALLENGE = [55, 80]` and `BARRIER_ACCESSIBLE_MAX = 20` sit near the top of `game.js`. Run `node --check game.js` after any code edit. GitHub Pages publishes from `main` through `.github/workflows/pages.yml`.

## Related simulation

Answerable: <https://minerclass.github.io/answerable/>

## Logs

`BUILD_LOG.md` records how the game was built and what was verified. `AGENT_LOG.md` is an append-only record of agent-assisted changes. Neither file holds participant data, credentials, or tokens.

## Related

- Games hub: <https://minerclass.github.io/games-hub/>
- Dissertation overview: <https://minerclass.github.io/dissertation-overview/>
