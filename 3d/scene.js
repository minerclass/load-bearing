/* Load-Bearing 3D — scene.
   Draws the gorge and the bridge from the rules state. It holds no game logic.
   Three.js r160, global build (vendor/three.min.js). Low-poly, no textures,
   no shadows, no post-processing, and it only redraws when something moved. */
window.LBScene = (function () {
  "use strict";
  const BAY_LEN = 4, BAYS = 6, HALF = BAY_LEN * BAYS / 2, DECK_W = 3, DEPTH = 2.2;

  const VIEWS = {
    road:  { pos: [-17, 3.1, 1.5], target: [3, -0.3, 0] },
    under: { pos: [-4, -5.2, 15], target: [-1, -0.9, 0] },
    side:  { pos: [0, 2.6, 20], target: [0, -1.3, 0] }
  };

  function create(canvas, opts) {
    opts = opts || {};
    const T = window.THREE;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: !opts.low, powerPreference: "default" });
    } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.low ? 1 : 1.5));

    const scene = new T.Scene();
    const SKY = 0xcfdadb;
    scene.background = new T.Color(SKY);
    scene.fog = new T.Fog(SKY, 38, 95);
    const camera = new T.PerspectiveCamera(48, 1, 0.1, 140);
    scene.add(new T.HemisphereLight(0xeef4f5, 0x4a5a50, 2.1));
    const sun = new T.DirectionalLight(0xfff0d2, 2.4);
    sun.position.set(-9, 16, 12);
    scene.add(sun);

    const mat = function (color, extra) {
      return new T.MeshLambertMaterial(Object.assign({ color: color, flatShading: true }, extra || {}));
    };
    const M = {
      rock: mat(0x46565e), rockDark: mat(0x37454c), grass: mat(0x6f8468), road: mat(0x2c363b),
      water: mat(0x3d6d7c), timber: mat(0x8d7352), timberDark: mat(0x5c4a36), rope: mat(0x3a3f42),
      steel: mat(0xd9a13a), brace: mat(0x4fb7ad), gate: mat(0xd4685d), plank: mat(0xb9ab8e),
      cream: new T.MeshPhongMaterial({ color: 0xf5ecd8, shininess: 90, specular: 0x9a8a60, flatShading: true }),
      brass: new T.MeshPhongMaterial({ color: 0xe2b24a, shininess: 110, specular: 0xfff0b0, flatShading: true }),
      cart: mat(0x22303a), wheel: mat(0x11181d),
      band: [mat(0x8fb3c9), mat(0xd9a13a), mat(0xd4685d)]
    };
    const unitBox = new T.BoxGeometry(1, 1, 1);
    function box(parent, w, h, d, material, x, y, z) {
      const m = new T.Mesh(unitBox, material);
      m.scale.set(w, h, d); m.position.set(x, y, z);
      parent.add(m); return m;
    }

    /* ---- gorge ---- */
    [-1, 1].forEach(function (side) {
      const cx = side * (HALF + 16);
      box(scene, 32, 18, 44, M.rock, cx, -9.01, 0);
      box(scene, 32, 0.3, 44, M.grass, cx, 0.0, 0);
      box(scene, 32, 0.34, 3.6, M.road, cx, 0.0, 0);
      // a few ledges so the wall is not one flat face: [y, z, w, h, d]
      [[-7, 9, 2.6, 5, 8], [-11, -7, 3.4, 6, 10], [-6, -15, 2, 3, 6], [-12, 15, 3, 5, 9]].forEach(function (r) {
        box(scene, r[2], r[3], r[4], M.rockDark, side * (HALF - r[2] / 2 + 0.3), r[0], r[1]);
      });
    });
    box(scene, 60, 0.2, 90, M.water, 0, -15, 0);
    // distant ridges
    [[-34, -46, 16], [8, -52, 22], [40, -44, 14], [-10, 50, 18], [30, 54, 20]].forEach(function (r) {
      const hill = new T.Mesh(new T.ConeGeometry(r[2], r[2] * 0.7, 5), M.rockDark);
      hill.position.set(r[0], -2, r[1]); hill.rotation.y = r[0];
      scene.add(hill);
    });
    // guide ropes that span the gorge before anything is built
    [-1, 1].forEach(function (s) { box(scene, HALF * 2, 0.05, 0.05, M.rope, 0, 1.05, s * (DECK_W / 2)); });
    [-1, 1].forEach(function (e) { [-1, 1].forEach(function (s) { box(scene, 0.16, 1.3, 0.16, M.timberDark, e * (HALF + 0.2), 0.6, s * (DECK_W / 2)); }); });

    /* ---- bays ---- */
    const bays = [];
    for (let i = 0; i < BAYS; i++) {
      const g = new T.Group();
      g.position.x = -HALF + BAY_LEN * i + BAY_LEN / 2;
      scene.add(g); bays.push({ group: g, grow: 1, fall: null });
    }
    const solid = [], narrow = [];   // which bays can be walked on, and which are a single plank
    function clear(g) { while (g.children.length) g.remove(g.children[0]); }
    function diagonal(g, material, z, x0, y0, x1, y1) {
      const dx = x1 - x0, dy = y1 - y0;
      const m = box(g, Math.sqrt(dx * dx + dy * dy), 0.16, 0.16, material, (x0 + x1) / 2, (y0 + y1) / 2, z);
      m.rotation.z = Math.atan2(dy, dx);
    }
    function vee(g, material, z) {
      diagonal(g, material, z, -BAY_LEN / 2, -0.05, 0, -DEPTH - 0.1);
      diagonal(g, material, z, 0, -DEPTH - 0.1, BAY_LEN / 2, -0.05);
    }
    function buildBay(i, bay) {
      const b = bays[i], g = b.group, z = DECK_W / 2 - 0.2;
      clear(g); g.visible = true; g.position.y = 0; g.rotation.set(0, 0, 0); b.fall = null;
      solid[i] = !!bay; narrow[i] = !!bay && bay.kind === "idle";
      if (!bay) return;
      if (bay.kind === "idle") {
        box(g, BAY_LEN, 0.08, 0.7, M.plank, 0, 0.1, 0);
      } else if (bay.kind === "clad" || bay.kind === "trap") {
        box(g, BAY_LEN, 0.2, DECK_W, M.cream, 0, 0.08, 0);
        [-1, 1].forEach(function (s) {
          box(g, BAY_LEN, 0.85, 0.1, M.cream, 0, 0.6, s * (DECK_W / 2));
          box(g, BAY_LEN, 0.08, 0.22, M.brass, 0, 1.06, s * (DECK_W / 2));
        });
        if (bay.polish >= 3) [-1, 1].forEach(function (s) {
          box(g, 0.1, 1.5, 0.1, M.brass, 0, 1.8, s * (DECK_W / 2));
          const lamp = new T.Mesh(new T.OctahedronGeometry(0.2), M.cream);
          lamp.position.set(0, 2.65, s * (DECK_W / 2)); g.add(lamp);
        });
      } else {
        box(g, BAY_LEN, 0.2, DECK_W, M.timber, 0, 0.08, 0);
        for (let p = -1.5; p <= 1.5; p += 1) box(g, 0.05, 0.21, DECK_W, M.timberDark, p, 0.08, 0);
        [-1, 1].forEach(function (s) {
          [-1.9, 0, 1.9].forEach(function (x) { box(g, 0.1, 1.0, 0.1, M.timberDark, x, 0.6, s * (DECK_W / 2)); });
          box(g, BAY_LEN, 0.07, 0.07, bay.kind === "nuance" ? M.brass : M.timberDark, 0, 1.06, s * (DECK_W / 2));
        });
        if (bay.kind === "nuance") box(g, BAY_LEN, 0.03, DECK_W - 0.4, M.cream, 0, 0.2, 0);
      }
      // what is underneath
      if (bay.brace) {
        vee(g, M.brace, z); vee(g, M.brace, -z);
        box(g, BAY_LEN, 0.04, 0.5, M.brace, 0, 0.2, DECK_W / 2 - 0.45);
      } else {
        if (bay.members >= 1) vee(g, M.steel, z);
        if (bay.members >= 2) vee(g, M.steel, -z);
        if (bay.members >= 3) {
          [-1, 1].forEach(function (s) { box(g, BAY_LEN, 0.16, 0.16, M.steel, 0, -DEPTH - 0.1, s * z); });
          [-BAY_LEN / 2 + 0.1, 0, BAY_LEN / 2 - 0.1].forEach(function (x) { box(g, 0.14, 0.14, z * 2, M.steel, x, x === 0 ? -DEPTH - 0.1 : -0.2, 0); });
        }
      }
      // an open barrier: a gate across the deck
      if (bay.crack) {
        [-1, 1].forEach(function (s) { box(g, 0.14, 1.5, 0.14, M.gate, -1.4, 0.9, s * 1.15); });
        box(g, 0.12, 0.14, 2.4, M.gate, -1.4, 1.5, 0);
        box(g, 0.12, 0.14, 2.4, M.gate, -1.4, 0.8, 0).rotation.x = 0.45;
      }
    }
    function setBay(i, bay, animate) {
      buildBay(i, bay);
      bays[i].grow = animate && !reduced ? 0 : 1;
      applyGrow(bays[i]);
      dirty = true;
    }
    function applyGrow(b) {
      const e = 1 - Math.pow(1 - b.grow, 3);
      b.group.scale.set(1, Math.max(0.001, e), 1);
    }

    /* ---- load cart ---- */
    const cart = new T.Group();
    box(cart, 1.7, 0.9, 1.5, M.cart, 0, 0.75, 0);
    const band = box(cart, 1.72, 0.22, 1.52, M.band[0], 0, 0.95, 0);
    [-0.55, 0.55].forEach(function (x) { [-0.8, 0.8].forEach(function (zz) {
      const w = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 0.16, 10), M.wheel);
      w.rotation.x = Math.PI / 2; w.position.set(x, 0.28, zz); cart.add(w);
    }); });
    cart.visible = false; scene.add(cart);
    let run = null;

    function runLoad(k, failBay, done) {
      const s = [0.75, 1.0, 1.3][k];
      cart.scale.set(s, s, s); band.material = M.band[k];
      cart.position.set(-HALF - 5, 0.18, 0); cart.rotation.set(0, 0, 0); cart.visible = true;
      const failX = failBay < 0 ? null : bays[failBay].group.position.x;
      if (reduced) {
        if (failBay >= 0) { bays[failBay].group.visible = false; cart.visible = false; solid[failBay] = false; if (mode === "walk") placeWalk(); }
        else cart.position.x = HALF + 5;
        dirty = true; setTimeout(done, 300); return;
      }
      run = { failBay: failBay, failX: failX, done: done, v: 0, falling: false, t: 0 };
    }
    function stepRun(dt) {
      if (!run) return;
      if (!run.falling) {
        cart.position.x += 7.5 * dt;
        if (run.failX !== null && cart.position.x >= run.failX - 0.4) { run.falling = true; }
        else if (cart.position.x >= HALF + 5) { const d = run.done; run = null; d(); }
      } else {
        run.t += dt; run.v += 22 * dt;
        const g = bays[run.failBay].group;
        g.position.y -= run.v * dt; g.rotation.z -= 0.9 * dt; g.rotation.x += 0.5 * dt;
        cart.position.y -= run.v * dt; cart.position.x += 2 * dt; cart.rotation.z -= 1.6 * dt;
        if (run.t > 1.5) {
          g.visible = false; cart.visible = false; solid[run.failBay] = false;
          if (mode === "walk") placeWalk();
          const d = run.done; run = null; d();
        }
      }
      dirty = true;
    }

    /* ---- camera ---- */
    const target = new T.Vector3(), sph = new T.Spherical();
    let tween = null, reduced = !!opts.reduced, dirty = true;
    function place() {
      sph.phi = Math.max(0.25, Math.min(Math.PI - 0.25, sph.phi));
      sph.radius = Math.max(9, Math.min(44, sph.radius));
      camera.position.setFromSpherical(sph).add(target);
      camera.lookAt(target); dirty = true;
    }
    function view(name, instant) {
      const v = VIEWS[name]; if (!v) return;
      if (mode === "walk") { mode = "orbit"; releaseAll(); resize(); }
      const p = new T.Vector3().fromArray(v.pos), t = new T.Vector3().fromArray(v.target);
      if (instant || reduced) {
        target.copy(t); sph.setFromVector3(p.sub(t)); tween = null; place(); return;
      }
      tween = { p0: camera.position.clone(), t0: target.clone(), p1: p, t1: t, k: 0 };
    }
    function stepTween(dt) {
      if (!tween) return;
      tween.k = Math.min(1, tween.k + dt / 0.8);
      const e = tween.k * tween.k * (3 - 2 * tween.k);
      target.lerpVectors(tween.t0, tween.t1, e);
      const p = new T.Vector3().lerpVectors(tween.p0, tween.p1, e);
      sph.setFromVector3(p.sub(target));
      if (tween.k >= 1) tween = null;
      place();
    }
    let drag = null;
    canvas.addEventListener("pointerdown", function (e) {
      drag = { x: e.clientX, y: e.clientY }; tween = null;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!drag) return;
      if (mode === "walk") {
        walk.yaw -= (e.clientX - drag.x) * 0.005; walk.pitch += (e.clientY - drag.y) * 0.005;
        drag.x = e.clientX; drag.y = e.clientY; placeWalk(); return;
      }
      sph.theta -= (e.clientX - drag.x) * 0.006; sph.phi -= (e.clientY - drag.y) * 0.006;
      drag.x = e.clientX; drag.y = e.clientY; place();
    });
    ["pointerup", "pointercancel"].forEach(function (n) { canvas.addEventListener(n, function () { drag = null; }); });
    canvas.addEventListener("wheel", function (e) {
      if (mode === "walk") return;
      e.preventDefault(); tween = null; sph.radius *= e.deltaY > 0 ? 1.08 : 0.93; place();
    }, { passive: false });
    canvas.addEventListener("keydown", function (e) {
      if (mode === "walk") {
        const name = WALK_KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
        if (name) { held[name] = true; e.preventDefault(); }
        return;
      }
      const step = 0.12;
      if (e.key === "ArrowLeft") sph.theta -= step;
      else if (e.key === "ArrowRight") sph.theta += step;
      else if (e.key === "ArrowUp") sph.phi -= step;
      else if (e.key === "ArrowDown") sph.phi += step;
      else if (e.key === "+" || e.key === "=") sph.radius *= 0.92;
      else if (e.key === "-") sph.radius *= 1.08;
      else return;
      e.preventDefault(); tween = null; place();
    });

    /* ---- walking the deck ----
       First person, at eye height. You can only go where there is deck:
       the walk stops at the first bay that is unbuilt or has fallen. */
    let mode = "orbit";
    const EYE = 1.75, FAR = HALF + 9;
    const walk = { x: 0, z: 0, yaw: 0, pitch: 0, where: null };
    const held = { forward: false, back: false, left: false, right: false };
    const WALK_KEYS = { w: "forward", s: "back", a: "left", d: "right",
      ArrowUp: "forward", ArrowDown: "back", ArrowLeft: "left", ArrowRight: "right" };
    function releaseAll() { held.forward = held.back = held.left = held.right = false; }
    function walkLimit() {
      for (let i = 0; i < BAYS; i++) if (!solid[i]) return -HALF + BAY_LEN * i - 0.35;
      return FAR;
    }
    function placeWalk() {
      const max = walkLimit();
      walk.x = Math.max(-FAR, Math.min(max, walk.x));
      const onBridge = walk.x > -HALF && walk.x < HALF;
      const i = onBridge ? Math.floor((walk.x + HALF) / BAY_LEN) : (walk.x <= -HALF ? -1 : BAYS);
      const half = onBridge ? (narrow[i] ? 0.2 : 1.15) : 1.5;
      walk.z = Math.max(-half, Math.min(half, walk.z));
      walk.pitch = Math.max(-1.2, Math.min(1.2, walk.pitch));
      camera.position.set(walk.x, EYE, walk.z);
      const cp = Math.cos(walk.pitch);
      camera.lookAt(walk.x + Math.cos(walk.yaw) * cp, EYE + Math.sin(walk.pitch), walk.z + Math.sin(walk.yaw) * cp);
      dirty = true;
      const atEdge = max < FAR && walk.x >= max - 0.01;
      const where = i + (atEdge ? "e" : "");
      if (where !== walk.where) { walk.where = where; if (opts.onBay) opts.onBay(i, atEdge); }
    }
    function startWalk() {
      mode = "walk"; tween = null; releaseAll();
      walk.x = -HALF - 5; walk.z = 0; walk.yaw = 0; walk.pitch = -0.06; walk.where = null;
      resize(); placeWalk();
    }
    function stepWalk(dt) {
      if (mode !== "walk") return;
      const turn = (held.right ? 1 : 0) - (held.left ? 1 : 0), move = (held.forward ? 1 : 0) - (held.back ? 1 : 0);
      if (!turn && !move) return;
      walk.yaw += turn * 1.7 * dt;
      walk.x += Math.cos(walk.yaw) * move * 4.2 * dt; walk.z += Math.sin(walk.yaw) * move * 4.2 * dt;
      placeWalk();
    }
    function nudge(name) {   // one step, for buttons pressed from the keyboard or a switch
      if (mode !== "walk") return;
      if (name === "left") walk.yaw -= 0.3; else if (name === "right") walk.yaw += 0.3;
      else { const m = name === "forward" ? 1.3 : -1.3; walk.x += Math.cos(walk.yaw) * m; walk.z += Math.sin(walk.yaw) * m; }
      placeWalk();
    }
    window.addEventListener("keyup", function (e) {
      const name = WALK_KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (name) held[name] = false;
    });
    window.addEventListener("blur", releaseAll);

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = mode === "walk" ? 66 : (w / h < 1 ? 62 : 48);
      camera.updateProjectionMatrix(); dirty = true;
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    window.addEventListener("resize", resize);

    let last = performance.now(), frames = 0, lost = false;
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); lost = true; if (opts.onLost) opts.onLost(); });
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      stepTween(dt); stepRun(dt); stepWalk(dt);
      bays.forEach(function (b) {
        if (b.grow < 1) { b.grow = Math.min(1, b.grow + dt / 0.6); applyGrow(b); dirty = true; }
      });
      if (dirty && !lost) { renderer.render(scene, camera); dirty = false; frames++; }
      requestAnimationFrame(loop);
    }
    resize(); view("road", true);
    requestAnimationFrame(loop);

    return {
      setBay: setBay,
      reset: function () { for (let i = 0; i < BAYS; i++) setBay(i, null, false); cart.visible = false; run = null; },
      view: view,
      walk: startWalk,
      hold: function (name, on) { if (mode === "walk" && name in held) held[name] = !!on; },
      nudge: nudge,
      runLoad: runLoad,
      setReduced: function (v) { reduced = !!v; },
      stats: function () { return { frames: frames, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }; }
    };
  }
  return { create: create };
})();
