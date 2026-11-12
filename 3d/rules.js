/* Load-Bearing 3D — rules.
   Pure game logic with no DOM and no Three.js, so the 3D scene and the
   text-only plan view run from the same state, and the rules can be tested alone.

   Structural model: the bridge has six bays, one per lesson. A bay carries
   what is built under it plus half of what is built under each neighbour
   (the cliff counts as a neighbour worth ABUTMENT). Polish adds a little
   surface stiffness, enough for the lightest load and nothing more.
   So where a weak lesson sits matters, not only how many there are. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LBRules = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const BAYS = 6;
  const HOURS = 12;
  const ABUTMENT = 2;
  const BRACE = 2;            // an access brace carries like a two-member bay

  const LOADS = [
    { name: "Recall", demand: 1,
      desc: "A straight quiz on the amendments and the timeline. The lightest cart on the road." },
    { name: "Application", demand: 3,
      desc: "A primary document nobody has seen before: a sharecropping contract. Same concepts, new surface." },
    { name: "Transfer", demand: 4.5,
      desc: "A new question with no shared surface: judge a later reform, and say for whom it worked." }
  ];

  const STUDENTS = { ell: "Maya", dys: "Jordan" };

  /* kind: str (members) | clad (polish only) | acc (repairs a barrier)
           nuance (depends on what is already built) | trap (repairs, and removes members)
     pe: leaves process evidence */
  const DECK = [
    { id: "journal", kind: "str", name: "Handwritten first-claims journal", time: 2, members: 3, crack: "dys",
      desc: "Before any source or tool, students hand-write what they already believe about Reconstruction and why.",
      fb: "Three members under this bay. The not-knowing is written down before anything can paper over it. Handwriting mechanics are now a wall for Jordan, who has dysgraphia, unless support is already in place." },
    { id: "annotate", kind: "str", name: "Annotate two primary sources", time: 2, members: 3, crack: "ell",
      desc: "A Freedmen's Bureau field report and a Black Codes excerpt, annotated line by line.",
      fb: "Three members. The argument now rests on period evidence. The sources are dense 1860s prose, so the reading level gates Maya at the language, not the history, unless support is already in place." },
    { id: "retrieval", kind: "str", name: "Retrieval warm-up: brain dump", time: 1, members: 2,
      desc: "Five minutes, no notes: everything you remember about last lesson's Reconstruction amendments.",
      fb: "Two members for one hour. Unglamorous, and it strengthens what the load test pulls on: retrieval under pressure." },
    { id: "conceptmap", kind: "str", name: "Concept-map the causes first", time: 1, members: 2,
      desc: "Students diagram how emancipation, land, labor, and law connect before reading anyone else's synthesis.",
      fb: "Two members. The schema is assembled by the student, so later readings have something to attach to." },
    { id: "seminar", kind: "str", name: "Socratic seminar with objection rounds", time: 3, members: 3,
      desc: "Every claim must survive two live peer objections. Roles are scaffolded and rotated.",
      fb: "Three members, and expensive ones. Claims meet unpredictable human resistance. This is the rhetorical span of the bridge." },
    { id: "peerreply", kind: "str", name: "Written replies to two objections", time: 2, members: 2,
      desc: "Each author responds in writing to two peer objections before revising.",
      fb: "Two members. The claim has to be reformulated against real resistance, on the record." },
    { id: "revise", kind: "str", name: "Revise the thesis against counter-evidence", time: 2, members: 3, pe: true,
      desc: "Students find the strongest source against their thesis and revise, logging what changed and why.",
      fb: "Three members, and the revision log is process evidence. A thesis that has survived counter-evidence carries load differently than one that was only stated." },
    { id: "oraldefense", kind: "str", name: "Oral defense of three choices", time: 2, members: 3, pe: true,
      desc: "Each student defends three decisions they made, to a panel, with notes allowed.",
      fb: "Three members and a named author standing behind the words. Notes and rehearsal keep the barrier low while the accountability stays real. This is also process evidence." },
    { id: "workedex", kind: "str", name: "Worked example, then fade", time: 1, members: 2,
      desc: "Walk through one exemplar analysis together, then remove the scaffold for the next document.",
      fb: "Two members. The scaffold is temporary by design, and the fade is where the schema work happens." },
    { id: "frictionlog", kind: "str", name: "Friction log", time: 1, members: 1, pe: true,
      desc: "Students log what confused them, what they tried, and how their thinking changed.",
      fb: "One modest member, and a trace of thinking that someone can look at later. This is process evidence." },

    { id: "aidraft", kind: "clad", name: "AI drafts the full essay", time: 0, polish: 5,
      desc: "Every student gets a clean, fluent, fully cited draft to work from.",
      fb: "The deck gleams. Walk underneath this bay before you decide what it will carry." },
    { id: "aisummary", kind: "clad", name: "Paste an AI summary of Reconstruction", time: 0, polish: 3,
      desc: "A tidy overview replaces the reading and frees two hours.",
      fb: "A smooth surface. The summary is probably accurate. Students have seen it; whether they built anything is a question for the underside." },
    { id: "studyguide", kind: "clad", name: "Copy the study-guide answers", time: 0, polish: 2,
      desc: "The answers exist. Students transcribe them into their notes.",
      fb: "The hands moved. Look underneath to see whether anything else did." },

    { id: "aipolish", kind: "nuance", name: "AI grammar-polish on their own drafts", time: 1, polish: 2,
      desc: "Students run their own finished drafts through AI for surface-level grammar and clarity.",
      fbGood: "Shine on top of real structure. The thinking happened first and the tool touched the surface, so rereading their own argument adds one member here.",
      fbBad: "There is little under this shine yet. Polishing a draft the student did not think through is cladding with extra steps. Same tool, different placement, different result." },

    { id: "s2t", kind: "acc", name: "Speech-to-text drafting", time: 1, repairs: "dys",
      desc: "Jordan, and anyone else, can dictate drafts instead of hand-writing them.",
      fb: "A brace. Transcription mechanics added no conceptual work, so removing them removes nothing that matters. Handwriting is no longer a wall on this bridge." },
    { id: "glossary", kind: "acc", name: "Bilingual glossary and translated excerpts", time: 1, repairs: "ell",
      desc: "Key 1860s vocabulary glossed, with the two primary sources available in parallel translation.",
      fb: "A brace. The language wall is down, and the sourcing, corroboration, and judgment are as demanding as before." },
    { id: "audio", kind: "acc", name: "Audio versions of the sources", time: 1, repairs: "ell",
      desc: "Both primary sources recorded and listenable at any speed.",
      fb: "A brace. Another route through the language wall that leaves the conceptual work intact." },

    { id: "aireads", kind: "trap", name: "AI reads the sources for everyone", time: 0, repairs: "ell", polish: 1,
      desc: "A friendly summary of both documents for the whole class, so nobody is stuck on the 1860s prose.",
      fb: "Maya's barrier is gone, and so are two members from the bay where the sources were read. The barrier and the thinking were removed together." }
  ];

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function newState(seed) {
    return {
      seed: seed, rand: rng(seed), slot: 0, time: HOURS,
      bays: [], used: {}, repaired: {}, hasPE: false, cladUsed: false,
      hand: null, load: 0, loadsHeld: 0, failedBay: -1, predictions: []
    };
  }

  function openBarriers(s) {
    const out = [];
    s.bays.forEach(function (b, i) { if (b.crack) out.push({ key: b.crack, bay: i }); });
    return out;
  }

  function totalMembers(s) {
    return s.bays.reduce(function (n, b) { return n + b.members; }, 0);
  }

  function pickFrom(s, list) {
    return list.splice(Math.floor(s.rand() * list.length), 1)[0];
  }

  /* Three cards for the current lesson: one that builds, one that shines,
     and a third that answers an open barrier when there is one.
     Every dealt card is affordable. Order is shuffled. */
  function deal(s) {
    const free = DECK.filter(function (c) { return !s.used[c.id] && c.time <= s.time; });
    const open = openBarriers(s).map(function (o) { return o.key; });
    const str = free.filter(function (c) { return c.kind === "str"; });
    // polishing "their own drafts" only makes sense once there are drafts
    const shine = free.filter(function (c) { return c.kind === "clad" || (c.kind === "nuance" && s.slot >= 2); });
    const fix = free.filter(function (c) {
      return (c.kind === "acc" || c.kind === "trap") && open.indexOf(c.repairs) !== -1;
    });
    const early = free.filter(function (c) { return c.kind === "acc" && !s.repaired[c.repairs]; });
    const hand = [];
    if (str.length) hand.push(pickFrom(s, str));
    if (shine.length) hand.push(pickFrom(s, shine));
    if (fix.length) hand.push(pickFrom(s, fix));
    else if (early.length && s.rand() < 0.35) hand.push(pickFrom(s, early));
    while (hand.length < 3) {
      const rest = str.concat(shine);
      if (!rest.length) break;
      const c = pickFrom(s, rest);
      let i = str.indexOf(c); if (i !== -1) str.splice(i, 1);
      i = shine.indexOf(c); if (i !== -1) shine.splice(i, 1);
      hand.push(c);
    }
    while (hand.length < 3) {
      hand.push({ id: "idle" + s.slot + "-" + hand.length, kind: "idle", name: "Unstructured work day", time: 0,
        desc: "No plan for this lesson. Students work on whatever is open.",
        fb: "A loose plank. Nothing was built here and nothing was polished." });
    }
    for (let i = hand.length - 1; i > 0; i--) {
      const j = Math.floor(s.rand() * (i + 1));
      const t = hand[i]; hand[i] = hand[j]; hand[j] = t;
    }
    s.hand = hand;
    return hand;
  }

  /* Apply the chosen card to the current bay. Returns what changed. */
  function choose(s, index) {
    const card = s.hand[index];
    const bay = { card: card, kind: card.kind, members: 0, polish: 0, crack: null, brace: false };
    const changed = [s.slot];
    let feedback = card.fb;
    s.used[card.id] = true;
    s.time -= card.time;
    if (card.pe) s.hasPE = true;

    if (card.kind === "str") {
      bay.members = card.members;
      if (card.crack && !s.repaired[card.crack]) bay.crack = card.crack;
    } else if (card.kind === "clad") {
      bay.polish = card.polish; s.cladUsed = true;
    } else if (card.kind === "nuance") {
      const good = totalMembers(s) >= 4;
      bay.polish = card.polish; bay.members = good ? 1 : 0;
      if (!good) s.cladUsed = true;
      feedback = good ? card.fbGood : card.fbBad;
    } else if (card.kind === "acc" || card.kind === "trap") {
      s.repaired[card.repairs] = true;
      s.bays.forEach(function (b, i) {
        if (b.crack === card.repairs) {
          b.crack = null; changed.push(i);
          if (card.kind === "trap") b.members = Math.max(0, b.members - 2);
        }
      });
      if (card.kind === "acc") { bay.brace = true; bay.members = BRACE; }
      else { bay.polish = card.polish; s.cladUsed = true; }
    }
    s.bays.push(bay);
    s.slot += 1;
    s.hand = null;
    return { card: card, feedback: feedback, changed: changed };
  }

  function surface(b) { return Math.min(1, b.polish * 0.25); }

  function capacity(s, i) {
    const m = function (j) { return j < 0 || j >= BAYS ? ABUTMENT : (s.bays[j] ? s.bays[j].members : 0); };
    const b = s.bays[i] || { polish: 0 };
    return m(i) + 0.5 * (m(i - 1) + m(i + 1)) + surface(b);
  }

  function wouldHold(s, k) {
    for (let i = 0; i < BAYS; i++) if (capacity(s, i) < LOADS[k].demand) return { holds: false, bay: i };
    return { holds: true, bay: -1 };
  }

  /* Run the next load. The player's call is recorded first. */
  function runLoad(s, call) {
    const k = s.load;
    const r = wouldHold(s, k);
    s.predictions.push({ call: call, actual: r.holds });
    if (r.holds) s.loadsHeld += 1; else s.failedBay = r.bay;
    s.load += 1;
    return { load: k, holds: r.holds, bay: r.bay, done: !r.holds || s.load >= LOADS.length };
  }

  function samBypassed(s) { return s.cladUsed && !s.hasPE; }

  function crossings(s) {
    const open = {};
    openBarriers(s).forEach(function (o) { open[o.key] = o.bay; });
    return {
      ell: { name: "Maya", stoppedAt: ("ell" in open) ? open.ell : -1, supported: !!s.repaired.ell },
      dys: { name: "Jordan", stoppedAt: ("dys" in open) ? open.dys : -1, supported: !!s.repaired.dys },
      sam: { name: "Sam", bypassed: samBypassed(s), shortcutExisted: s.cladUsed }
    };
  }

  function verdict(s) {
    const barriers = openBarriers(s).length;
    const sam = samBypassed(s);
    if (s.loadsHeld === 3 && !barriers && !sam) return {
      head: "Load-bearing, for everyone",
      body: "All three loads held, every student crossed on foot, and what is under the deck matches what shows on top." };
    if (s.loadsHeld === 3) return {
      head: "Holds the load, but not for everyone",
      body: "The bridge is real and the loads held. Look at who got across." };
    if (s.loadsHeld === 2) return {
      head: "Application held. Transfer went through the deck.",
      body: "Transfer is the load that needs structure under every bay. One thin lesson is enough to drop it, and its neighbours cannot carry it alone." };
    if (s.loadsHeld === 1) return {
      head: "Recall held, and nothing else",
      body: "Surface approaches do pass light quizzes. The failure shows only when the weight is new, which is when it matters." };
    return {
      head: "The deck never held",
      body: "At least one bay had neither structure nor surface. Even the recall cart went through." };
  }

  /* True when some set of six choices carries all three loads with every
     student across. The page only starts runs that can be won. */
  function solvable(seed) {
    for (let n = 0; n < 729; n++) {
      const s = newState(seed);
      let m = n;
      for (let i = 0; i < BAYS; i++) { deal(s); choose(s, m % 3); m = Math.floor(m / 3); }
      if (wouldHold(s, 2).holds && !openBarriers(s).length && !samBypassed(s)) return true;
    }
    return false;
  }

  return {
    BAYS: BAYS, solvable: solvable, HOURS: HOURS, LOADS: LOADS, DECK: DECK, STUDENTS: STUDENTS,
    newState: newState, deal: deal, choose: choose, capacity: capacity,
    wouldHold: wouldHold, runLoad: runLoad, openBarriers: openBarriers,
    totalMembers: totalMembers, crossings: crossings, verdict: verdict
  };
});
