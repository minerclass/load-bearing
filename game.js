/* =====================================================
   LOAD-BEARING — game engine
   Structural thinking vs. surface polish, made visible.
   Framework: Miner, pedagogical friction (noetic friction,
   desirable difficulties, artifact-of-learning vs. learning).
===================================================== */
"use strict";

/* ---------- shared framework constants ---------- */
const PRODUCTIVE_CHALLENGE = [55, 80];   // % band: below = bypass, above = overload
const BARRIER_ACCESSIBLE_MAX = 20;       // % above this = drifting exclusionary

const CONFERENCE = new URLSearchParams(location.search).get("conference") === "1";
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

const TOTAL_SLOTS = CONFERENCE ? 3 : 6;
const TOTAL_TIME = CONFERENCE ? 6 : 12;

/* ---------- the activity deck ----------
   kind: str (adds members) | clad (adds polish, no members)
         acc (repairs a crack) | nuance (context-dependent) | trap (repairs + removes)
   pe: process evidence (the classroom X-ray) */
const DECK = [
  { id:"journal",   kind:"str", name:"Handwritten first-claims journal", time:2, members:3, cracks:["dys"],
    desc:"Before any source or tool: students hand-write what they already believe about Reconstruction and why.",
    fb:"Three members under the deck. The “not knowing” gets written down before anything can paper over it. But watch Jordan’s chip — handwriting mechanics just became a wall for a student with dysgraphia. A crack has opened." },
  { id:"annotate",  kind:"str", name:"Annotate two primary sources", time:2, members:3, cracks:["ell"],
    desc:"A Freedmen’s Bureau field report and a Black Codes excerpt, annotated line by line.",
    fb:"Three members. The argument now rests on period evidence, not vibes. But the sources are dense 1860s prose — Maya’s chip shows a crack. The reading level is gating a strong reasoner at the language, not the history." },
  { id:"retrieval", kind:"str", name:"Retrieval warm-up: brain dump", time:1, members:2,
    desc:"Five minutes, no notes: everything you remember about last lesson’s Reconstruction amendments.",
    fb:"Two members, one hour. Cheap, unglamorous, and it strengthens exactly what the load test will pull on: retrieval under pressure." },
  { id:"conceptmap",kind:"str", name:"Concept-map the causes first", time:1, members:2,
    desc:"Students diagram how emancipation, land, labor, and law connect — before reading anyone else’s synthesis.",
    fb:"Two members. Generation before solution: the schema gets assembled by the student, so later readings have something to attach to." },
  { id:"seminar",   kind:"str", name:"Socratic seminar with objection rounds", time:3, members:3,
    desc:"Every claim must survive two live peer objections. Roles scaffolded and rotated.",
    fb:"Three members — expensive ones. Claims are meeting unpredictable human resistance, which no agreeable chatbot can simulate. This is the rhetorical span of the bridge." },
  { id:"peerreply", kind:"str", name:"Written replies to two objections", time:2, members:2,
    desc:"Each author must respond in writing to two peer objections before revising.",
    fb:"Two members. Slow-motion rhetorical friction: the claim has to be reformulated against real resistance, on the record." },
  { id:"revise",    kind:"str", name:"Revise the thesis against counter-evidence", time:2, members:3, pe:true,
    desc:"Students find the strongest source AGAINST their thesis and revise — logging what changed and why.",
    fb:"Three members, and the revision log is process evidence — X-ray film for later. A thesis that has survived counter-evidence carries load differently than one that was merely stated." },
  { id:"oraldefense",kind:"str", name:"Oral defense of three choices", time:2, members:3, pe:true,
    desc:"Signed thesis; each student defends three decisions they made, to a panel, with notes allowed.",
    fb:"Three members and a named author standing behind the words — existential friction. Notes and rehearsal keep the barrier low while the accountability stays real. This is also process evidence." },
  { id:"workedex",  kind:"str", name:"Worked example, then fade", time:1, members:2,
    desc:"Walk through one exemplar analysis together, then remove the scaffold for the next document.",
    fb:"Two members. The scaffold is temporary by design — the fade is where the schema work happens." },
  { id:"frictionlog",kind:"str", name:"Friction log", time:1, members:1, pe:true,
    desc:"Students log what confused them, what they tried, and how their thinking changed.",
    fb:"One modest member — but this card is mostly X-ray film: it makes the invisible struggle assessable. When the principal looks later, there will be a trace of thinking, not just an artifact." },

  { id:"aidraft",   kind:"clad", name:"AI drafts the full essay", time:0, polish:5,
    desc:"Every student gets a clean, fluent, fully cited draft. Zero hours. Looks finished because it is — visually.",
    fb:"The deck gleams. Nothing was added underneath — no members, no schema, no retrieval strength. From the road this bridge now looks MORE finished than a real one. Hold the X-ray." },
  { id:"aisummary", kind:"clad", name:"Paste an AI summary of Reconstruction", time:0, polish:3,
    desc:"A tidy overview replaces the reading. Saves two hours.",
    fb:"Polish, not structure. The summary is probably even accurate — and the students’ relationship to it is the same as to a bridge poster: they’ve seen it, not built it." },
  { id:"studyguide",kind:"clad", name:"Copy the study-guide answers", time:0, polish:2,
    desc:"The answers exist. They get transcribed.",
    fb:"Transcription is not retrieval. The hands moved; the schema didn’t. Two panels of cladding, zero members." },

  { id:"aipolish",  kind:"nuance", name:"AI grammar-polish on their own drafts", time:1, polish:2,
    desc:"Students run THEIR OWN finished drafts through AI for surface-level grammar and clarity.",
    fbGood:"Harmless shine — because it landed on top of real structure. The thinking happened first; the tool touched the surface. AI-after-thinking is a different species from AI-instead-of-thinking.",
    fbBad:"There’s nothing under this shine yet. Polishing a draft the student didn’t substantially think through is just cladding with extra steps. Same tool, different placement, opposite meaning." },

  { id:"s2t",       kind:"acc", name:"Speech-to-text drafting", time:1, repairs:"dys",
    desc:"Jordan (and anyone else) can dictate drafts instead of hand-writing them.",
    fb:"A brace, not a beam — and that’s the point. Transcription mechanics added zero conceptual work, so removing them removes nothing that matters. Jordan’s crack is repaired; the thinking demands are untouched." },
  { id:"glossary",  kind:"acc", name:"Bilingual glossary + translated excerpts", time:1, repairs:"ell",
    desc:"Key 1860s vocabulary glossed; the two primary sources available with parallel translation.",
    fb:"Maya’s crack is repaired. The language wall came down; the historical thinking — sourcing, corroboration, judgment — is exactly as demanding as before. That is what calibrated access looks like." },
  { id:"audio",     kind:"acc", name:"Audio versions of the sources", time:1, repairs:"ell",
    desc:"Both primary sources recorded, listenable at any speed.",
    fb:"Another route through the language wall that leaves the conceptual climb intact. Access scaffolds change who can reach the struggle — not whether there is one." },

  { id:"aireads",   kind:"trap", name:"AI reads the sources for everyone", time:0, repairs:"ell", members:-2,
    desc:"Nobody reads the documents; a friendly summary replaces them for the whole class.",
    fb:"Maya’s crack is gone — and so are two members. Over-scaffolding removes the barrier AND the thinking with it. The calibrated version of this card was a glossary, not a ghost-reader." }
];

/* ---------- state ---------- */
let S = {};
function reset() {
  S = {
    slot: 0,
    time: TOTAL_TIME,
    used: new Set(),
    chosen: [],            // per slot: {card, kindEffective}
    members: 0,
    polish: 0,
    cladPolish: 0,         // polish from clad-kind effects only (Sam's temptation)
    cracks: {},            // key -> slot index where it opened
    repaired: {},          // key -> true
    hasPE: false,
    structuralCount: 0,
    picked: false,
    inspected: false,
    load: 0,               // next load to run (0..2)
    loadsHeld: 0,
    loadFailed: false,
    xray: false
  };
}

/* ---------- dom ---------- */
const $ = (id) => document.getElementById(id);
const announce = (m) => { $("announcer").textContent = m; };

function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  window.scrollTo(0, 0);
}

/* ---------- derived scores ---------- */
function unrepairedCracks() {
  return Object.keys(S.cracks).filter(k => !S.repaired[k]);
}
function challengePct() { return Math.min(95, Math.max(0, S.members) * 5); }
function barrierPct()   { return unrepairedCracks().length * 15; }
function samBypassed()  { return S.cladPolish > 0 && !S.hasPE; }
function integrityScore() {
  const base = Math.max(0, S.members) * 5
    + (unrepairedCracks().length === 0 ? 10 : 0)
    + (S.hasPE ? 5 : 0);
  return Math.min(92, base);
}
function loadHolds(loadIdx) { // 0 recall, 1 application, 2 transfer
  if (loadIdx === 0) return S.members >= 3 || S.polish >= 4;
  if (loadIdx === 1) return S.members >= 8;
  return S.members >= 12;
}

/* ---------- HUD ---------- */
function renderHUD() {
  $("slotLabel").textContent = "Lesson " + Math.min(S.slot + 1, TOTAL_SLOTS) + " of " + TOTAL_SLOTS;
  $("budgetVal").textContent = S.time;
  $("budgetLabel").classList.toggle("low", S.time <= 2);
  $("structNum").textContent = Math.max(0, S.members);
  $("structBar").style.width = (Math.max(0, S.members) / 18 * 100) + "%";
  $("structBarWrap").setAttribute("aria-valuenow", Math.max(0, S.members));
  $("polishNum").textContent = S.polish;
  $("polishBar").style.width = Math.min(100, S.polish / 10 * 100) + "%";
  $("polishBarWrap").setAttribute("aria-valuenow", S.polish);
  renderProfiles();
}
function cracked(k) { return (k in S.cracks) && !S.repaired[k]; } // slot 0 is falsy — use "in"
function renderProfiles() {
  const ell = $("prof-ell"), dys = $("prof-dys"), sam = $("prof-sam");
  ell.className = "prof " + (cracked("ell") ? "crack" : "ok");
  dys.className = "prof " + (cracked("dys") ? "crack" : "ok");
  sam.className = "prof " + (samBypassed() ? "bypass" : "ok");
  ell.textContent = "Maya" + (cracked("ell") ? " ⚠" : "");
  dys.textContent = "Jordan" + (cracked("dys") ? " ⚠" : "");
  sam.textContent = "Sam" + (samBypassed() ? " → shortcut" : "");
}

/* ---------- bridge rendering ---------- */
/* Draws onto any canvas. mode: "artifact" | "xray"
   opts: { loadX (px 0..1 fraction), brokenAtFrac, weightDropY } */
function drawBridge(cv, mode, opts) {
  opts = opts || {};
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  const sx = W / 740, sy = H / 330;
  ctx.clearRect(0, 0, W, H);

  const deckY = 150 * sy, chordY = 235 * sy;
  const gx0 = 90 * sx, gx1 = 650 * sx;
  const segW = (gx1 - gx0) / TOTAL_SLOTS;

  // cliffs
  ctx.fillStyle = "#132a38";
  ctx.beginPath(); ctx.moveTo(0, deckY - 8 * sy); ctx.lineTo(gx0, deckY - 8 * sy);
  ctx.lineTo(gx0 - 18 * sx, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W, deckY - 8 * sy); ctx.lineTo(gx1, deckY - 8 * sy);
  ctx.lineTo(gx1 + 18 * sx, H); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(242,234,217,.55)";
  ctx.font = (11 * sy) + "px Consolas, monospace";
  ctx.fillText("PRIOR", 18 * sx, deckY - 16 * sy);
  ctx.fillText("KNOWLEDGE", 18 * sx, deckY - 4 * sy);
  const tw = ctx.measureText("TRANSFER").width;
  ctx.fillText("TRANSFER", W - tw - 14 * sx, deckY - 4 * sy);

  // segments
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const x0 = gx0 + i * segW, x1 = x0 + segW;
    const pick = S.chosen[i];
    const broken = opts.brokenAtFrac !== undefined &&
      opts.brokenAtFrac >= (i / TOTAL_SLOTS) && opts.brokenAtFrac < ((i + 1) / TOTAL_SLOTS);

    if (!pick) { // unbuilt gap
      ctx.strokeStyle = "rgba(242,234,217,.25)";
      ctx.setLineDash([6 * sx, 6 * sx]);
      ctx.lineWidth = 2 * sy;
      ctx.beginPath(); ctx.moveTo(x0 + 3, deckY); ctx.lineTo(x1 - 3, deckY); ctx.stroke();
      ctx.setLineDash([]);
      continue;
    }

    // under-deck detail (xray always; artifact hides behind skirt below)
    const m = pick.membersDrawn || 0;
    if (mode === "xray") {
      if (pick.kindEffective === "str") {
        ctx.strokeStyle = "#d9a13a"; ctx.lineWidth = 3 * sy; ctx.lineCap = "round";
        // zigzag truss: m diagonals + lower chord
        ctx.beginPath(); ctx.moveTo(x0 + 4, chordY); ctx.lineTo(x1 - 4, chordY); ctx.stroke();
        for (let j = 0; j < m; j++) {
          const fx = x0 + segW * (j + 0.5) / m;
          ctx.beginPath(); ctx.moveTo(x0 + segW * j / m + 3, deckY);
          ctx.lineTo(fx, chordY); ctx.lineTo(x0 + segW * (j + 1) / m - 3, deckY); ctx.stroke();
        }
      } else if (pick.kindEffective === "clad") {
        ctx.strokeStyle = "rgba(212,104,93,.85)"; ctx.lineWidth = 1.6 * sy;
        ctx.setLineDash([5 * sx, 5 * sx]);
        ctx.strokeRect(x0 + 5, deckY + 6 * sy, segW - 10, (chordY - deckY) - 12 * sy);
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(212,104,93,.9)";
        ctx.font = (10 * sy) + "px Consolas, monospace";
        const hw = ctx.measureText("HOLLOW").width;
        ctx.fillText("HOLLOW", x0 + (segW - hw) / 2, (deckY + chordY) / 2 + 4 * sy);
      } else { // acc / nuance-good / trap: brace
        ctx.strokeStyle = pick.card.kind === "trap" ? "rgba(207,105,95,.8)" : "#4fb7ad";
        ctx.lineWidth = 3 * sy;
        ctx.beginPath();
        ctx.arc(x0 + segW / 2, deckY, segW * 0.32, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }
      // crack marks at origin segments
      Object.keys(S.cracks).forEach(k => {
        if (S.cracks[k] === i && !S.repaired[k]) {
          ctx.strokeStyle = "#d4685d"; ctx.lineWidth = 2.4 * sy;
          ctx.beginPath();
          let cx0 = x0 + segW * 0.5, cy0 = deckY + 2;
          ctx.moveTo(cx0, cy0);
          for (let z = 1; z <= 4; z++) ctx.lineTo(cx0 + (z % 2 ? 7 : -7) * sx, cy0 + z * 12 * sy);
          ctx.stroke();
        }
      });
    }

    // the deck plank itself
    if (!broken) {
      ctx.strokeStyle = pick.kindEffective === "clad" ? "#f5ecd8" :
                        pick.kindEffective === "str" ? "#d9a13a" : "#7fc9c0";
      ctx.lineWidth = 5 * sy; ctx.lineCap = "round";
      let flex = 0;
      if (opts.loadX !== undefined && !REDUCED) {
        const cx = (x0 + x1) / 2 / W;
        const d = Math.abs(opts.loadX - cx);
        flex = Math.max(0, 6 * sy * (1 - d * 8)) * (pick.kindEffective === "str" ? 0.6 : 1.4);
      }
      ctx.beginPath(); ctx.moveTo(x0 + 2, deckY);
      ctx.quadraticCurveTo((x0 + x1) / 2, deckY + flex, x1 - 2, deckY);
      ctx.stroke();
    } else { // sheared plank
      ctx.strokeStyle = "#d4685d"; ctx.lineWidth = 5 * sy; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x0 + 2, deckY); ctx.lineTo(x0 + segW * 0.4, deckY + 26 * sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1 - 2, deckY); ctx.lineTo(x1 - segW * 0.4, deckY + 30 * sy); ctx.stroke();
    }
  }

  // artifact skirt: plating that hides the truss zone
  if (mode === "artifact") {
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      if (!S.chosen[i]) continue;
      const x0 = gx0 + i * segW, x1 = x0 + segW;
      const grad = ctx.createLinearGradient(0, deckY, 0, chordY);
      grad.addColorStop(0, "rgba(245,236,216,.30)");
      grad.addColorStop(1, "rgba(245,236,216,.08)");
      ctx.fillStyle = grad;
      ctx.fillRect(x0 + 2, deckY + 3 * sy, (x1 - x0) - 4, (chordY - deckY) - 6 * sy);
      ctx.strokeStyle = "rgba(245,236,216,.28)"; ctx.lineWidth = 1;
      for (let px = x0 + 12 * sx; px < x1 - 6; px += 14 * sx) {
        ctx.beginPath(); ctx.moveTo(px, deckY + 5 * sy); ctx.lineTo(px, chordY - 5 * sy); ctx.stroke();
      }
    }
    // shine streaks scale with polish
    if (S.polish > 0) {
      ctx.strokeStyle = "rgba(255,255,255," + Math.min(0.55, 0.12 + S.polish * 0.045) + ")";
      ctx.lineWidth = 2 * sy;
      for (let s = 0; s < Math.min(5, Math.ceil(S.polish / 2)); s++) {
        const px = gx0 + (gx1 - gx0) * (0.12 + s * 0.19);
        ctx.beginPath(); ctx.moveTo(px, deckY - 3 * sy); ctx.lineTo(px + 26 * sx, deckY - 10 * sy); ctx.stroke();
      }
    }
  }

  // rolling weight
  if (opts.loadX !== undefined) {
    const wx = opts.loadX * W;
    const wy = (opts.weightDropY !== undefined ? opts.weightDropY : deckY - 14 * sy);
    ctx.fillStyle = "#f2ead9";
    ctx.fillRect(wx - 13 * sx, wy - 12 * sy, 26 * sx, 16 * sy);
    ctx.fillStyle = "#0d1b24";
    ctx.font = "bold " + (10 * sy) + "px Consolas, monospace";
    ctx.fillText("L" + (S.load + 1), wx - 7 * sx, wy);
    ctx.beginPath(); ctx.arc(wx - 7 * sx, wy + 7 * sy, 3.4 * sy, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(wx + 7 * sx, wy + 7 * sy, 3.4 * sy, 0, 7); ctx.fill();
  }
}

function repaint() {
  drawBridge($("bridge"), S.xray ? "xray" : "artifact");
  $("viewTag").textContent = S.xray ? "X-RAY VIEW — members, hollows, cracks" : "ARTIFACT VIEW";
  $("viewTag").classList.toggle("xr", S.xray);
}

/* ---------- dealing ---------- */
function shuffle(a) { const c = [...a]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; }

const CONF_HANDS = [ // conference mode: fixed contrast hands
  ["annotate", "aidraft", "glossary"],
  ["seminar", "aisummary", "s2t"],
  ["oraldefense", "studyguide", "aipolish"]
];

function dealHand() {
  if (CONFERENCE) return CONF_HANDS[S.slot].map(id => DECK.find(c => c.id === id));
  const pool = DECK.filter(c => !S.used.has(c.id));
  const strs = shuffle(pool.filter(c => c.kind === "str"));
  const temps = shuffle(pool.filter(c => c.kind === "clad" || c.kind === "nuance" || c.kind === "trap"));
  const rest = shuffle(pool.filter(c => c !== strs[0] && c !== temps[0]));
  const hand = [];
  if (strs[0]) hand.push(strs[0]);
  if (temps[0]) hand.push(temps[0]);
  while (hand.length < 3 && rest.length) { const c = rest.shift(); if (!hand.includes(c)) hand.push(c); }
  // guarantee something affordable
  if (!hand.some(c => c.time <= S.time)) hand[hand.length - 1] = DECK.find(c => c.id === "aidraft");
  return shuffle(hand);
}

/* ---------- play flow ---------- */
let currentHand = [];

function renderSlot() {
  S.picked = false;
  renderHUD(); repaint();
  $("feedback").style.display = "none";
  $("continueBtn").style.display = "none";
  $("promptLine").textContent = "Choose the work for lesson " + (S.slot + 1) + " — press 1–3 or click.";
  currentHand = dealHand();
  const wrap = $("cards"); wrap.innerHTML = "";
  currentHand.forEach((card, i) => {
    const b = document.createElement("button");
    b.className = "card";
    b.disabled = card.time > S.time;
    const cost = card.time === 0 ? "free" : card.time + " hr" + (card.time > 1 ? "s" : "");
    b.innerHTML = '<span class="khead"><span class="num">' + (i + 1) + '</span><span class="cost">' +
      (b.disabled ? "no time left" : cost) + '</span></span>' +
      '<span class="kname">' + card.name + '</span>' +
      '<p class="kdesc">' + card.desc + '</p>';
    b.addEventListener("click", () => pick(i));
    wrap.appendChild(b);
  });
}

function pick(i) {
  if (S.picked) return;
  const card = currentHand[i];
  if (!card || card.time > S.time) return;
  S.picked = true;
  S.used.add(card.id);
  S.time -= card.time;

  let kindEffective = card.kind;
  let fbKind = "", fbLabel = "", fbText = card.fb || "";

  if (card.kind === "str") {
    S.members += card.members;
    S.structuralCount++;
    if (card.pe) S.hasPE = true;
    (card.cracks || []).forEach(k => { if (!S.repaired[k]) S.cracks[k] = S.slot; else S.cracks[k] = S.cracks[k] !== undefined ? S.cracks[k] : S.slot; });
    fbKind = "str"; fbLabel = "Structure added · +" + card.members + " members";
  } else if (card.kind === "clad") {
    S.polish += card.polish; S.cladPolish += card.polish;
    fbKind = "clad"; fbLabel = "Cladding · +" + card.polish + " polish, 0 members";
  } else if (card.kind === "nuance") {
    S.polish += card.polish;
    if (S.structuralCount >= 3) {
      kindEffective = "acc"; fbKind = "acc"; fbLabel = "Surface tool on real structure"; fbText = card.fbGood;
    } else {
      kindEffective = "clad"; S.cladPolish += card.polish;
      fbKind = "warn"; fbLabel = "Cladding — nothing underneath yet"; fbText = card.fbBad;
    }
  } else if (card.kind === "acc") {
    S.repaired[card.repairs] = true;
    kindEffective = "acc";
    fbKind = "acc"; fbLabel = "Barrier repaired · access scaffold";
  } else if (card.kind === "trap") {
    S.repaired[card.repairs] = true;
    S.members = Math.max(0, S.members + card.members);
    kindEffective = "acc";
    fbKind = "warn"; fbLabel = "Barrier repaired — and 2 members removed";
  }

  S.chosen[S.slot] = { card, kindEffective, membersDrawn: card.kind === "str" ? card.members : 0 };

  // mark picked card
  [...$("cards").children].forEach((b, bi) => { b.disabled = true; if (bi === i) b.classList.add("picked"); });

  renderHUD(); repaint();
  $("fbKind").className = "fbkind " + fbKind;
  $("fbKind").textContent = fbLabel;
  $("fbText").textContent = fbText;
  $("feedback").style.display = "block";
  $("continueBtn").style.display = "inline-flex";
  $("continueBtn").focus();
  announce(fbLabel + ". " + fbText);
}

function nextSlot() {
  S.slot++;
  const inspectAfter = CONFERENCE ? 2 : 3;
  if (S.slot === inspectAfter && !S.inspected) { S.inspected = true; showInspection(); return; }
  if (S.slot < TOTAL_SLOTS) renderSlot();
  else startLoadTest();
}

/* ---------- inspection ---------- */
function showInspection() {
  let quote, note;
  if (S.polish > 0) {
    quote = "“I peeked at the drafts on my way past — this unit looks complete and polished. Spotless work. Whatever you’re doing, keep doing it.”";
    note = "The principal saw the artifact view — the only view a walkthrough ever gets. The praise is real; whether it’s earned is a different question. Hold the X-ray when you get back.";
  } else if (S.members >= 7) {
    quote = "“Honestly? Students seemed to be struggling in there today. A few looked genuinely stuck. Are you sure this approach is working?”";
    note = "Mid-unit, productive struggle looks like trouble — desirable difficulties are slow by design, and the artifact view has nothing to show yet. This is the moment teachers get talked out of friction.";
  } else {
    quote = "“Hard to tell where this one’s heading. Keep me posted.”";
    note = "Not much structure, not much shine. The unit hasn’t committed to being anything yet.";
  }
  $("inspectQuote").textContent = quote;
  $("inspectNote").textContent = note;
  show("inspection");
  announce("Mid-unit walkthrough. " + quote);
}

/* ---------- load test ---------- */
const LOAD_NAMES = ["Recall", "Application", "Transfer"];
const LOAD_DESCS = [
  "A straight quiz on the amendments and the timeline — the lightest cart on the road.",
  "A primary document nobody has seen before: a sharecropping contract. Same concepts, new surface.",
  "The heavy haul: compare Reconstruction-era voter suppression to a later case, and defend the comparison."
];

function startLoadTest() {
  show("loadtest");
  S.load = 0; S.loadsHeld = 0; S.loadFailed = false;
  for (let i = 0; i < 3; i++) { const c = $("load-" + i); c.className = "loadchip"; }
  $("load-0").classList.add("now");
  $("loadSub").textContent = "Three tasks cross the bridge, each heavier than the last. " + LOAD_DESCS[0];
  $("loadFeedback").style.display = "none";
  $("loadBtn").style.display = "inline-flex";
  $("loadBtn").textContent = "Run Load 1: Recall →";
  $("loadBtn").onclick = runLoad; // reset — a prior run leaves this pointed at debrief
  drawBridge($("bridge2"), "artifact");
  announce("Assessment day. Three loads will cross the bridge.");
}

function firstWeakFrac() {
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const p = S.chosen[i];
    if (!p || p.kindEffective === "clad") return (i + 0.5) / TOTAL_SLOTS;
  }
  return 0.5;
}

function runLoad() {
  const holds = loadHolds(S.load);
  $("loadBtn").style.display = "none";
  const cv = $("bridge2");
  const finish = () => {
    const chip = $("load-" + S.load);
    chip.className = "loadchip " + (holds ? "held" : "failed");
    $("loadFbKind").className = "fbkind " + (holds ? "str" : "warn");
    if (holds) {
      S.loadsHeld++;
      $("loadFbKind").textContent = "Load " + (S.load + 1) + " · " + LOAD_NAMES[S.load] + " — HELD";
      $("loadFbText").textContent = S.load === 0 && S.members < 3
        ? "It held — on polish. Recall is the one load cramming can carry. The heavier carts are coming."
        : "The members flexed and carried it. Struggle that happened during the unit is strength the deck can spend now.";
    } else {
      S.loadFailed = true;
      $("loadFbKind").textContent = "Load " + (S.load + 1) + " · " + LOAD_NAMES[S.load] + " — FAILED";
      $("loadFbText").textContent = S.load === 0
        ? "Nothing under the deck and not even enough shine to fake a quiz. The gorge wins."
        : (S.polish > 0
          ? "The cladding sheared exactly where the X-ray said it would. The artifact view never lied, exactly — it just wasn’t load-bearing."
          : "Not enough members for this weight. The structure was real — there just wasn’t enough of it for " + LOAD_NAMES[S.load].toLowerCase() + ".");
      for (let i = S.load + 1; i < 3; i++) $("load-" + i).classList.add("failed");
    }
    $("loadFeedback").style.display = "block";
    announce("Load " + (S.load + 1) + " " + (holds ? "held." : "failed."));
    S.load++;
    if (!holds || S.load >= 3) {
      $("loadBtn").textContent = "See the debrief →";
      $("loadBtn").onclick = debrief;
    } else {
      $("loadBtn").textContent = "Run Load " + (S.load + 1) + ": " + LOAD_NAMES[S.load] + " →";
      $("load-" + S.load).classList.add("now");
      $("loadSub").textContent = LOAD_DESCS[S.load];
    }
    $("loadBtn").style.display = "inline-flex";
    $("loadBtn").focus();
  };

  if (REDUCED) {
    drawBridge(cv, "xray", holds ? {} : { brokenAtFrac: firstWeakFrac() });
    finish(); return;
  }
  // animate the crossing
  const t0 = performance.now(), dur = 2400;
  const failFrac = holds ? 2 : firstWeakFrac();
  function frame(t) {
    const p = Math.min(1, (t - t0) / dur);
    const x = 0.08 + p * 0.84;
    if (!holds && x >= failFrac) {
      // drop
      const d0 = performance.now();
      function drop(t2) {
        const dp = Math.min(1, (t2 - d0) / 600);
        drawBridge(cv, "xray", { loadX: failFrac, brokenAtFrac: failFrac, weightDropY: (150 + dp * dp * 160) * (cv.height / 330) });
        if (dp < 1) requestAnimationFrame(drop); else finish();
      }
      requestAnimationFrame(drop); return;
    }
    drawBridge(cv, "artifact", { loadX: x });
    if (p < 1) requestAnimationFrame(frame); else finish();
  }
  requestAnimationFrame(frame);
}

/* ---------- debrief ---------- */
function debrief() {
  show("debrief");
  const cracks = unrepairedCracks();
  const sam = samBypassed();
  const integ = integrityScore();
  const chall = challengePct();
  const barr = barrierPct();

  drawBridge($("finalArtifact"), "artifact");
  drawBridge($("finalXray"), "xray");

  $("statIntegrity").textContent = integ;
  $("statPolish").textContent = S.polish;
  $("statLoads").textContent = S.loadsHeld + " / 3";
  $("statChallenge").textContent = chall + "%";
  $("statChallenge").style.color =
    (chall >= PRODUCTIVE_CHALLENGE[0] && chall <= PRODUCTIVE_CHALLENGE[1]) ? "var(--teal)" :
    (chall < PRODUCTIVE_CHALLENGE[0] ? "var(--coral)" : "#e0a23c");

  let head, sub;
  if (S.loadsHeld === 3 && cracks.length === 0 && !sam) {
    head = "Load-Bearing Certified";
    sub = "All three loads held, every student crossed on their own feet, and the X-ray matches the artifact. This is what calibrated friction builds: challenge in the " + PRODUCTIVE_CHALLENGE[0] + "–" + PRODUCTIVE_CHALLENGE[1] + "% band, barriers near zero, and structure the transfer task could stand on.";
  } else if (S.loadsHeld === 3) {
    head = "Holds the load — but not for everyone";
    sub = "The bridge is real and the loads held. But look at who actually got across: " +
      (cracks.length ? "an unrepaired barrier gated a student who could have done the thinking. " : "") +
      (sam ? "And Sam never touched the deck — with shortcuts available and no process evidence demanded, the strongest student learned the least." : "");
  } else if (S.loadsHeld === 2) {
    head = "Application held. Transfer cracked.";
    sub = "Recall and application crossed; the heavy haul went through the deck. Transfer is the load that only dense structure carries — more generation, more revision-against-counter-evidence, fewer panels of shine.";
  } else if (S.loadsHeld === 1) {
    head = "Cramming held Recall — and nothing else";
    sub = "That’s the honest, uncomfortable part: surface approaches DO pass light quizzes. The failure only becomes visible when the weight is new — which is exactly when it matters.";
  } else {
    head = "The deck never held";
    sub = "Neither structure nor shine — the unit never committed to building anything. Even the recall cart went through.";
  }
  $("verdictHead").textContent = head;
  $("verdictSub").textContent = sub + (barr > BARRIER_ACCESSIBLE_MAX ? " Barrier reading: " + barr + "% — past the accessible threshold (" + BARRIER_ACCESSIBLE_MAX + "%)." : "");

  // crossings
  const list = $("crossings"); list.innerHTML = "";
  const rows = [];
  rows.push(!cracked("ell")
    ? { cls: "x-ok", html: "<b>Maya</b> crossed on foot" + (S.repaired.ell ? " — translation support took down the language wall and left the historical thinking intact." : " — no language barrier was ever placed on her route.") }
    : { cls: "x-stop", html: "<b>Maya</b> stopped at lesson " + (S.cracks.ell + 1) + " — dense 1860s prose with no translation support. The barrier gated her before the thinking ever started. A crack, not a workout." });
  rows.push(!cracked("dys")
    ? { cls: "x-ok", html: "<b>Jordan</b> crossed on foot" + (S.repaired.dys ? " — speech-to-text cleared the transcription mechanics; every conceptual demand stayed." : " — nothing on the route demanded handwriting endurance.") }
    : { cls: "x-stop", html: "<b>Jordan</b> stopped at lesson " + (S.cracks.dys + 1) + " — the handwritten journal demanded motor mechanics that add zero conceptual work. Exclusionary friction is a different kind, not a higher dose." });
  rows.push(sam
    ? { cls: "x-zip", html: "<b>Sam</b> arrived by zipline — gray flag. With polished shortcuts available and no process evidence demanded, the class’s strongest student produced the best-looking artifact and did the least construction. Unproductive success." }
    : { cls: "x-ok", html: "<b>Sam</b> crossed on foot — " + (S.cladPolish === 0 ? "no shortcut existed to take." : "the process-evidence requirement (defense, logs) made the shortcut pointless: the thinking had to show up somewhere visible.") });
  rows.forEach(r => { const li = document.createElement("li"); li.className = r.cls; li.innerHTML = r.html; list.appendChild(li); });

  $("thesisBox").textContent =
    "Polish predicted nothing. The X-ray predicted everything. In a classroom, the X-ray is process evidence — journals, revision logs, oral defenses — the trace of thinking rather than the artifact of it. Generative AI can manufacture the artifact on demand; it cannot manufacture the trace.";
  announce("Debrief. " + head);
}

/* ---------- x-ray ---------- */
function setXray(on) {
  if (S.xray === on) return;
  S.xray = on;
  $("xrayBtn").setAttribute("aria-pressed", String(on));
  repaint();
}

/* ---------- wiring ---------- */
function start() {
  reset();
  show("play");
  renderSlot();
  announce("Site plan open. Lesson 1 of " + TOTAL_SLOTS + ". Choose the work.");
}

$("startBtn").addEventListener("click", start);
$("replayBtn").addEventListener("click", start);
$("continueBtn").addEventListener("click", nextSlot);
$("inspectBtn").addEventListener("click", () => { show("play"); renderSlot(); });
$("loadBtn").onclick = runLoad; // property, not addEventListener — the handler is swapped to debrief() at test end

const xb = $("xrayBtn");
["mousedown", "touchstart"].forEach(ev => xb.addEventListener(ev, (e) => { e.preventDefault(); setXray(true); }));
["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(ev => xb.addEventListener(ev, () => setXray(false)));
xb.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setXray(!S.xray); } });

document.addEventListener("keydown", (e) => {
  if (e.key === "x" || e.key === "X") { if ($("play").classList.contains("active")) setXray(true); }
  if ($("title").classList.contains("active") && e.key === "Enter") { start(); return; }
  if ($("play").classList.contains("active")) {
    if (!S.picked && e.key >= "1" && e.key <= "3") pick(parseInt(e.key, 10) - 1);
    else if (S.picked && e.key === "Enter" && document.activeElement !== $("continueBtn")) nextSlot();
  }
});
document.addEventListener("keyup", (e) => { if (e.key === "x" || e.key === "X") setXray(false); });

reset();
drawBridge($("bridge"), "artifact");
if (CONFERENCE) {
  document.querySelector("#title .lede").textContent = "Conference mode: three lessons, one load test, ninety seconds. Two bridges can look identical — only the load knows.";
}
