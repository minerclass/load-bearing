/* Load-Bearing 3D — page controller.
   Every decision is an ordinary button, so the game is fully playable by
   keyboard and screen reader. The 3D scene and the plan-view table both
   draw from the same rules state (rules.js). */
(function () {
  "use strict";
  const R = window.LBRules;
  const $ = function (id) { return document.getElementById(id); };
  const params = new URLSearchParams(location.search);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowPower = params.get("low") === "1" ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4);

  let S = null, scene = null, busy = false;

  /* ---------- 3D or plan view ---------- */
  function planOnly() {
    scene = null;
    $("scene").hidden = true; $("nogl").hidden = false;
    document.querySelector(".views").hidden = true;
    $("plan").open = true;
  }
  if (params.get("plan") === "1" || !window.THREE) planOnly();
  else {
    scene = window.LBScene.create($("scene"), { low: lowPower, reduced: reduced, onLost: planOnly });
    if (!scene) planOnly();
  }

  /* ---------- helpers ---------- */
  function announce(text) { $("announcer").textContent = ""; setTimeout(function () { $("announcer").textContent = text; }, 30); }
  function step(id) {
    ["stepIntro", "stepChoose", "stepFeedback", "stepLoad", "stepDebrief"].forEach(function (s) { $(s).hidden = s !== id; });
    const h = $(id).querySelector("h1,h2");
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  function setView(name) {
    if (!scene) return;
    scene.view(name);
    [["road", "viewRoad"], ["under", "viewUnder"], ["side", "viewSide"]].forEach(function (v) {
      $(v[1]).setAttribute("aria-pressed", String(v[0] === name));
    });
    currentView = name;
  }
  let currentView = "road";
  function hud() {
    $("slotLabel").textContent = S.slot < R.BAYS ? "Lesson " + (S.slot + 1) + " of " + R.BAYS : "Load test";
    $("hoursVal").textContent = S.time;
  }
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ---------- plan view ---------- */
  function roadText(b) {
    if (!b) return "Not built yet";
    if (b.kind === "idle") return "A loose plank";
    if (b.kind === "clad" || b.kind === "trap") return "Polished deck, panelled parapet" + (b.polish >= 3 ? ", lamps" : "");
    if (b.kind === "nuance") return "Timber deck with a polished finish";
    return "Plain timber deck";
  }
  function underText(b) {
    if (!b) return "";
    if (b.brace) return "An access brace";
    if (b.members <= 0) return "Nothing";
    return b.members + (b.members === 1 ? " truss set" : " truss sets") + " of 3";
  }
  function renderPlan() {
    const body = $("planTable").tBodies[0];
    body.textContent = "";
    for (let i = 0; i < R.BAYS; i++) {
      const b = S ? S.bays[i] : null, tr = el("tr");
      tr.appendChild(el("th", "", String(i + 1))).scope = "row";
      tr.appendChild(el("td", "", b ? b.card.name : ""));
      tr.appendChild(el("td", "", roadText(b)));
      tr.appendChild(el("td", "under", underText(b)));
      tr.appendChild(el("td", b && b.crack ? "no" : "", b && b.crack ? "Gate closed to " + R.STUDENTS[b.crack] : (b ? "None" : "")));
      if (S && S.failedBay === i) tr.className = "broke";
      body.appendChild(tr);
    }
  }
  $("planUnder").addEventListener("change", function (e) { $("plan").classList.toggle("show-under", e.target.checked); });

  /* ---------- build phase ---------- */
  function start() {
    let seed = parseInt(params.get("seed"), 10) || (Date.now() & 0xffffff);
    for (let tries = 0; tries < 12 && !R.solvable(seed); tries++) seed += 1;
    S = R.newState(seed);
    busy = false;
    if (scene) { scene.reset(); setView("road"); }
    renderPlan(); showChoose();
  }
  function showChoose() {
    const hand = R.deal(S);
    hud();
    $("chooseHead").textContent = "Lesson " + (S.slot + 1) + ". Choose the work.";
    const wrap = $("cards"); wrap.textContent = "";
    hand.forEach(function (c, i) {
      const b = el("button", "card"); b.type = "button";
      const top = el("span", "top");
      top.appendChild(el("kbd", "", String(i + 1)));
      top.appendChild(el("span", "cost", c.time === 0 ? "No class time" : c.time + (c.time === 1 ? " hr" : " hrs")));
      b.appendChild(top);
      b.appendChild(el("span", "name", c.name));
      b.appendChild(el("span", "desc", c.desc));
      b.addEventListener("click", function () { pick(i); });
      wrap.appendChild(b);
    });
    step("stepChoose");
    announce("Lesson " + (S.slot + 1) + " of " + R.BAYS + ". " + S.time + " hours left. Three options.");
  }
  function pick(i) {
    if (!S || !S.hand || !S.hand[i]) return;
    const bayIndex = S.slot;
    const res = R.choose(S, i);
    if (scene) res.changed.forEach(function (j) { scene.setBay(j, S.bays[j], j === bayIndex); });
    renderPlan(); hud();
    $("fbHead").textContent = "Bay " + (bayIndex + 1) + ": " + res.card.name;
    $("fbText").textContent = res.feedback;
    const visit = S.slot === 3 ? principal() : null;
    $("visit").hidden = !visit;
    if (visit) $("visitQuote").textContent = visit;
    $("continueBtn").textContent = S.slot < R.BAYS ? "Next lesson" : "Go to the load test";
    step("stepFeedback");
    announce(res.feedback + (visit ? " The principal, walking past: " + visit : ""));
  }
  function principal() {
    const polish = S.bays.some(function (b) { return b.polish > 0; });
    if (polish) return "I looked in on my way past. This unit looks complete and polished. Whatever you are doing, keep doing it.";
    if (R.totalMembers(S) >= 7) return "Students seemed to be struggling in there today. A few looked stuck. Are you sure this approach is working?";
    return "Hard to tell where this one is heading. Keep me posted.";
  }
  $("continueBtn").addEventListener("click", function () {
    if (S.slot < R.BAYS) showChoose(); else showLoad();
  });

  /* ---------- load test ---------- */
  function showLoad() {
    const L = R.LOADS[S.load];
    hud(); setView("side");
    $("loadHead").textContent = "Load " + (S.load + 1) + " of 3: " + L.name;
    $("loadDesc").textContent = L.desc;
    $("predictRow").hidden = false; $("loadResult").hidden = true; $("loadNext").hidden = true;
    step("stepLoad");
    announce("Load " + (S.load + 1) + " of 3, " + L.name + ". " + L.desc + " Make your call: holds, or fails.");
  }
  function predict(call) {
    if (busy || !S || S.slot < R.BAYS || $("predictRow").hidden) return;
    busy = true;
    $("predictRow").hidden = true;
    const r = R.runLoad(S, call);
    const finish = function () {
      busy = false;
      const L = R.LOADS[r.load];
      let text = r.holds
        ? "The " + L.name + " cart crossed. "
        : "The " + L.name + " cart went through bay " + (r.bay + 1) + " (" + S.bays[r.bay].card.name + "). Heavier loads cannot cross a broken bridge. ";
      text += (call === r.holds) ? "You called it." : "You called it the other way.";
      $("loadResult").textContent = text; $("loadResult").hidden = false;
      $("loadNext").textContent = r.done ? "See the debrief" : "Next load";
      $("loadNext").hidden = false; $("loadNext").focus({ preventScroll: true });
      renderPlan(); announce(text);
    };
    if (scene) scene.runLoad(r.load, r.holds ? -1 : r.bay, finish); else finish();
  }
  $("predictHold").addEventListener("click", function () { predict(true); });
  $("predictFail").addEventListener("click", function () { predict(false); });
  $("loadNext").addEventListener("click", function () {
    if (S.failedBay >= 0 || S.load >= R.LOADS.length) debrief(); else showLoad();
  });

  /* ---------- debrief ---------- */
  function debrief() {
    const v = R.verdict(S), x = R.crossings(S);
    $("verdictHead").textContent = v.head;
    $("verdictBody").textContent = v.body;
    const hits = S.predictions.filter(function (p) { return p.call === p.actual; }).length;
    $("calib").textContent = "You called " + hits + " of " + S.predictions.length + " loads correctly. " +
      (hits === S.predictions.length
        ? "Your read of the structure matched the structure."
        : "Where a call missed, check whether the surface was standing in for what was underneath.");

    const list = $("crossings"); list.textContent = "";
    const line = function (strong, rest) { const li = el("li"); li.appendChild(el("b", "", strong)); li.appendChild(document.createTextNode(rest)); list.appendChild(li); };
    line("Maya", x.ell.stoppedAt >= 0
      ? " stopped at bay " + (x.ell.stoppedAt + 1) + ". Dense 1860s prose with no language support gated her before the thinking started. That is a barrier, not a workout."
      : (x.ell.supported ? " crossed on foot. Language support took down the wall and left the historical thinking intact." : " crossed on foot. No language barrier was placed on her route."));
    line("Jordan", x.dys.stoppedAt >= 0
      ? " stopped at bay " + (x.dys.stoppedAt + 1) + ". The handwritten journal demanded motor mechanics that add no conceptual work. Exclusionary friction is a different kind, not a higher dose."
      : (x.dys.supported ? " crossed on foot. Speech-to-text cleared the transcription mechanics and every conceptual demand stayed." : " crossed on foot. Nothing on the route demanded handwriting endurance."));
    line("Sam", x.sam.bypassed
      ? " took the shortcut. With polished work available and no process evidence asked for, a strong student could produce the best-looking artifact and do the least building."
      : (x.sam.shortcutExisted ? " crossed on foot. The process evidence you asked for meant the thinking had to show up somewhere visible." : " crossed on foot. There was no shortcut to take."));

    const body = $("bayTable").tBodies[0]; body.textContent = "";
    S.bays.forEach(function (b, i) {
      const tr = el("tr"); if (S.failedBay === i) tr.className = "broke";
      tr.appendChild(el("th", "", String(i + 1))).scope = "row";
      tr.appendChild(el("td", "", b.card.name));
      R.LOADS.forEach(function (L) {
        const ok = R.capacity(S, i) >= L.demand;
        tr.appendChild(el("td", ok ? "ok" : "no", ok ? "Could carry" : "Too weak"));
      });
      body.appendChild(tr);
    });
    $("thesis").textContent = S.bays.some(function (b) { return b.polish > 0; })
      ? "From the road, polish told you little. What was underneath decided each crossing. In a classroom, the view from underneath is process evidence: journals, revision logs, oral defenses. Generative AI can produce the artifact on demand. It does not produce the trace of a student's thinking."
      : "Nothing on this bridge was surface alone, so the road view and the underside told the same story. Try a run where a free shortcut is hard to turn down.";
    $("planUnder").checked = true; $("plan").classList.add("show-under");
    if (scene) setView("under");
    step("stepDebrief");
    announce("Debrief. " + v.head + ". " + v.body);
  }

  /* ---------- wiring ---------- */
  $("startBtn").addEventListener("click", start);
  $("replayBtn").addEventListener("click", start);
  $("viewRoad").addEventListener("click", function () { setView("road"); });
  $("viewUnder").addEventListener("click", function () { setView("under"); });
  $("viewSide").addEventListener("click", function () { setView("side"); });
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target, typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT");
    if (typing) return;
    if (e.key === "x" || e.key === "X") { setView(currentView === "under" ? "road" : "under"); return; }
    if (!$("stepChoose").hidden && e.key >= "1" && e.key <= "3") pick(parseInt(e.key, 10) - 1);
    else if (!$("stepLoad").hidden && !$("predictRow").hidden) {
      if (e.key === "1") predict(true); else if (e.key === "2") predict(false);
    }
  });
  renderPlan();
})();
