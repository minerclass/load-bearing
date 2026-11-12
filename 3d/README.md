# Load-Bearing 3D (prototype)

A 3D version of Load-Bearing. Each of six lessons builds one bay of a bridge across a gorge, then three loads cross it. From the road, a polished bay looks more finished than a built one. From underneath, it does not.

Open `index.html` through any static server, for example `python3 -m http.server` from the repository root, then visit `/3d/`.

## What is different from the 2D game

- **Placement matters.** A bay carries what is under it plus half of what is under each neighbour. Two thin lessons side by side fail where one thin lesson between two strong ones might hold.
- **The shortcut is not labelled.** Cards show the work and the class time. What a card built is visible only by looking underneath.
- **Access is not a penalty.** An access brace carries like a two-member bay, and support chosen before a barrier appears prevents the barrier.
- **Every run can be won.** The page checks the deal before it starts.

## Files

- `rules.js`: all game logic, with no DOM or 3D code.
- `scene.js`: the Three.js scene. Low-poly, no textures, shadows, or post-processing. It redraws only when something moves.
- `game.js`: the page controller. Every decision is an ordinary button.
- `vendor/three.min.js`: Three.js r160, MIT licence, copied from the Echoes repository.

## Accessibility and low-power devices

- The plan view is a text table of the same bridge. It opens automatically when 3D is unavailable, and `?plan=1` forces it.
- All choices work by keyboard (1 to 3 for cards, 1 and 2 for load calls, X for the underside).
- Reduced-motion settings skip the build and crossing animations.
- `?low=1` forces the low-power renderer. It is chosen automatically on devices with four or fewer cores.

## Not yet done

- Not measured on a school Chromebook.
- Not tested with a screen reader or on a real touch device.
- No automated tests yet. `rules.js` is written so they can be added.
- The conference-length mode from the 2D game is not included.

The numbers are an illustrative model of the pedagogical friction framework, not a validated measure of learning. Maya, Jordan, and Sam are fictional design profiles.
