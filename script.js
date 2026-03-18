/* ============================================================
   SOCIAL ANXIETY LAB — BRAVE FEELINGS LAB
   script.js — Production Logic
   ============================================================ */

'use strict';

// ============================================================
// STATE
// ============================================================
const DEFAULT_STATE = {
  current: 1,
  name: '',
  sealSealed: false,
  bodyParts: {},
  triggers: [],
  safeSentence: '',
  rungs: ['','','','',''],
  rungOne: '',
  selfNote: '',
  trustedAdult: '',
  committed: false,
  scenarioChoices: {},
  breathingComplete: false,
  quizAnswers: {},
  sortAnswers: {},
  thoughtRewrite: '',
  groundingInputs: {},
  favCards: [],
  allStatsRevealed: false,
  learnedRevealed: []
};

let S = JSON.parse(JSON.stringify(DEFAULT_STATE));

const STORAGE_KEY = 'sal_brave_feelings_v1';

// ============================================================
// PHASE MAP & LABELS
// ============================================================
const PHASES = {
  1:'Welcome', 2:'Welcome', 3:'Welcome',
  4:'Phase 1 · Understanding', 5:'Phase 1 · Understanding',
  6:'Phase 1 · Understanding', 7:'Phase 1 · Understanding',
  8:'Phase 1 · Understanding', 9:'Phase 1 · Understanding',
  10:'Phase 2 · Thought Traps', 11:'Phase 2 · Thought Traps',
  12:'Phase 2 · Thought Traps', 13:'Phase 2 · Thought Traps',
  14:'Phase 2 · Thought Traps',
  15:'Phase 3 · Calm Toolkit', 16:'Phase 3 · Calm Toolkit',
  17:'Phase 3 · Calm Toolkit', 18:'Phase 3 · Calm Toolkit',
  19:'Phase 3 · Calm Toolkit',
  20:'Phase 4 · Brave Steps', 21:'Phase 4 · Brave Steps',
  22:'Phase 4 · Brave Steps', 23:'Phase 4 · Brave Steps',
  24:'Phase 4 · Brave Steps', 25:'Phase 4 · Brave Steps',
  26:'Phase 4 · Brave Steps',
  27:'Phase 5 · Relationships', 28:'Phase 5 · Relationships',
  29:'Phase 5 · Relationships', 30:'Phase 5 · Relationships',
  31:'Phase 6 · Completion', 32:'Phase 6 · Completion',
  33:'Phase 6 · Completion', 34:'Phase 6 · Complete'
};

const NEXT_LABELS = {
  1: "Let's Begin →",
  3: "I Make This Promise →",
  34: "Done ✓"
};

// Gate screens require specific completion before advancing
// key = screenNum, value = function that returns true if complete
const GATES = {
  2:  () => S.name.trim().length >= 2,
  3:  () => S.sealSealed,
  7:  () => Object.keys(S.bodyParts).length >= 1,
  9:  () => S.triggers.length >= 1,
  16: () => S.breathingComplete,
  18: () => S.safeSentence.trim().length >= 3,
  25: () => S.rungs[0].trim().length >= 3,
  26: () => S.committed,
  29: () => S.trustedAdult.trim().length >= 2,
  30: () => S.selfNote.trim().length >= 10
};

const GATE_HINTS = {
  2:  'Please enter your name to continue.',
  3:  'Tap the seal to make your promise.',
  7:  'Tap at least one area on the body map.',
  9:  'Select at least one trigger.',
  16: 'Complete at least one breathing round to continue.',
  18: 'Choose or write your safe sentence.',
  25: 'Fill in Rung 1 — your smallest brave step.',
  26: 'Tap the checkbox to make your commitment.',
  29: 'Enter the name of one trusted adult.',
  30: 'Write at least a few words to your future self.'
};

// ============================================================
// TRIGGER LABELS
// ============================================================
const TRIGGER_LABELS = {
  'raising-hand':    'Raising my hand',
  'meeting-someone': 'Meeting new people',
  'being-called-on': 'Being called on',
  'eating-around-others': 'Eating around others',
  'performing':      'Performing or presenting',
  'phone-calls':     'Making phone calls',
  'left-out':        'Feeling left out',
  'answering-door':  'Answering the door',
  'making-mistakes': 'Making mistakes publicly'
};

// ============================================================
// SCENARIO DATA
// ============================================================
const SCENARIO_DATA = {
  21: {
    brave: { badge:'Brave Move', cls:'badge-brave', text:'You raised your hand. Whether the answer was right or not, you tried — and that rewires your brain. Here\'s what most kids don\'t know: everyone else moved on within 30 seconds. Nobody remembers.', speech:'That moment of choosing to try despite the fear? That is courage. And it gets easier every single time you do it.' },
    small: { badge:'Small Brave Step', cls:'badge-small', text:'Writing it down means you engaged instead of shutting down. You didn\'t avoid — you adapted. That\'s real progress and a legitimate brave step.', speech:'This is a wise place to start. Next time you might take it one step further. But this step matters too.' },
    avoid: { badge:'Avoidance Path', cls:'badge-avoid', text:'The relief felt real — but it was borrowed. The fear of raising your hand is now a fraction larger than before. That\'s how avoidance builds quietly over time.', speech:'This is the most honest answer, and I respect that. Now that you see the pattern clearly, you have the power to change it.' }
  },
  22: {
    brave: { badge:'Brave Move', cls:'badge-brave', text:'"Hi" back and maybe their name. That\'s how nearly every friendship in history has started — one small exchange that felt terrifying in the moment.', speech:'The other kid probably felt relieved too. Connection always starts with someone going first.' },
    small: { badge:'Small Brave Step', cls:'badge-small', text:'A smile and a nod is real human communication. It says "I see you and I\'m open." That\'s meaningful — and it\'s a genuine brave step.', speech:'A small signal is still a signal. You kept the door open. That\'s not nothing — that\'s something.' },
    avoid: { badge:'Avoidance Path', cls:'badge-avoid', text:'It felt safer. But the other child may have walked away feeling rejected — not knowing the anxiety that made you look away. Avoidance has ripples beyond just us.', speech:'The hardest habit to change. But you\'ve seen it clearly now — and awareness is step one.' }
  },
  23: {
    brave: { badge:'Brave Move', cls:'badge-brave', text:'"Can I play?" — three of the most terrifying words in childhood, and they work far more often than anxiety predicts. Most kids say yes.', speech:'I know that took everything you had. That is exactly what brave looks like — not comfortable, but doing it anyway.' },
    small: { badge:'Small Brave Step', cls:'badge-small', text:'One-on-one is almost always easier than a group. Finding one person is smart, strategic bravery — not avoidance.', speech:'This is wise bravery. You didn\'t freeze. You found a workable path in. That counts.' },
    avoid: { badge:'Avoidance Path', cls:'badge-avoid', text:'Being alone hurt. And yet it felt safer than risking rejection. That trade-off is at the heart of social anxiety.', speech:'You felt what you felt. The goal isn\'t to pretend it doesn\'t hurt — it\'s to know that next time you have tools.' }
  },
  24: {
    brave: { badge:'Brave Move', cls:'badge-brave', text:'You kept going. That\'s mistake recovery — arguably the most important social skill there is, and almost nobody teaches it. Most people around you were already thinking about something else entirely.', speech:'That chin-up moment is what I\'m most proud of. That\'s the skill that will carry you through life.' },
    small: { badge:'Small Brave Step', cls:'badge-small', text:'"Oops" and moving on is healthy, mature, and actually signals confidence — even when you don\'t feel confident inside. It says "I can handle this."', speech:'That is one of the best possible responses anyone can give. Acknowledge it lightly and keep moving. Well done.' },
    avoid: { badge:'Avoidance Path', cls:'badge-avoid', text:'The urge to disappear is real and completely understandable. But every child who has ever answered wrong in class — every single one — survived it. So will you.', speech:'It hurts in the moment. But the moment always passes. And next time, you\'ll have a plan.' }
  }
};

// ============================================================
// PERSISTENCE — LOCALSTORAGE
// ============================================================
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  } catch(e) {
    console.warn('localStorage save failed:', e);
  }
  if (typeof showSaveIndicator === 'function') showSaveIndicator();
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      S = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
      return true;
    }
  } catch(e) {
    console.warn('localStorage load failed:', e);
  }
  return false;
}

function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
  S = JSON.parse(JSON.stringify(DEFAULT_STATE));
}

// ============================================================
// NAVIGATION
// ============================================================
function goNext() {
  if (S.current === 34) return;
  captureCurrentScreen();
  if (!checkGate(S.current)) return;
  navigateTo(S.current + 1);
}

function goBack() {
  if (S.current <= 1) return;
  captureCurrentScreen();
  navigateTo(S.current - 1);
}

function navigateTo(n) {
  const old = document.getElementById('s' + S.current);
  if (old) old.classList.remove('active');
  S.current = n;
  saveState();
  const screen = document.getElementById('s' + n);
  if (screen) {
    screen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  updateChrome();
  onScreenEnter(n);
  showPhaseToast(n);
  updatePageCounter();
}

function checkGate(n) {
  if (!GATES[n]) return true;
  if (GATES[n]()) return true;
  showGateHint(n);
  return false;
}

function showGateHint(n) {
  const hint = document.getElementById('gate-hint');
  if (!hint) return;
  hint.textContent = GATE_HINTS[n] || 'Please complete this step first.';
  hint.style.opacity = '1';
  setTimeout(() => { hint.style.opacity = '0'; }, 3000);
}

// ============================================================
// CHROME UPDATE
// ============================================================
function updateChrome() {
  const n = S.current;
  const pct = Math.round((n / 34) * 100);

  // Legacy progress bar (hidden via CSS but keep for safety)
  const pb = document.getElementById('progress-bar');
  if (pb) pb.style.width = pct + '%';

  // New header progress bar
  const hpb = document.getElementById('header-progress-bar');
  if (hpb) hpb.style.width = pct + '%';

  // New page counter
  const pn = document.getElementById('page-num');
  if (pn) pn.textContent = n;

  const back = document.getElementById('btn-back');
  if (back) back.style.display = n > 1 ? 'block' : 'none';

  const next = document.getElementById('btn-next');
  if (next) next.textContent = NEXT_LABELS[n] || 'Continue →';

  updateNextState(n);
}

function updateNextState(n) {
  const next = document.getElementById('btn-next');
  const hint = document.getElementById('gate-hint');
  if (!next) return;
  if (GATES[n] && !GATES[n]()) {
    next.disabled = true;
    if (hint) {
      hint.textContent = GATE_HINTS[n] || '';
      hint.style.opacity = '1';
    }
  } else {
    next.disabled = false;
    if (hint) {
      hint.textContent = '';
      hint.style.opacity = '0';
    }
  }
}

// ============================================================
// SCREEN ENTRY LOGIC
// ============================================================
function onScreenEnter(n) {
  switch(n) {
    case 2:  restoreName(); break;
    case 3:  restorePromise(); break;
    case 7:  restoreBodyMap(); break;
    case 8:  buildFingerprint(); break;
    case 9:  restoreTriggers(); break;
    case 14: buildThoughtRewrite(); break;
    case 16: restoreBreathing(); break;
    case 18: restoreSafeSentence(); break;
    case 25: restoreLadder(); break;
    case 26: buildFirstStep(); break;
    case 29: restoreTrustedAdult(); break;
    case 30: restoreSelfNote(); break;
    case 31: buildCheckin(); break;
    case 32: buildLearnedSummary(); break;
    case 33: buildRoadmap(); break;
    case 34: buildCertificate(); break;
    case 35: buildParentSummary(); break;
  }
}

// ============================================================
// CAPTURE SCREEN DATA
// ============================================================
function captureCurrentScreen() {
  const n = S.current;
  switch(n) {
    case 2:  captureNameScreen(); break;
    case 14: captureThoughtRewrite(); break;
    case 25: captureLadder(); break;
    case 29: S.trustedAdult = (document.getElementById('trusted-adult') || {}).value || S.trustedAdult; break;
    case 30: S.selfNote = (document.getElementById('self-note') || {}).value || S.selfNote; break;
  }
  saveState();
}

// ============================================================
// SCREEN 2 — NAME
// ============================================================
function captureNameScreen() {
  const v = (document.getElementById('name-input') || {}).value || '';
  if (v.trim()) S.name = v.trim();
}

function restoreName() {
  const inp = document.getElementById('name-input');
  if (inp && S.name) {
    inp.value = S.name;
    updateGreeting();
  }
}

function updateGreeting() {
  const val = (document.getElementById('name-input') || {}).value.trim();
  S.name = val;
  const g = document.getElementById('name-greeting');
  if (g) g.textContent = val ? 'Nice to meet you, ' + val + '! 👋' : '';
  updateNextState(2);
  saveState();
}

// ============================================================
// SCREEN 3 — PROMISE
// ============================================================
function restorePromise() {
  if (S.sealSealed) {
    const seal = document.getElementById('promise-seal');
    const inst = document.getElementById('seal-instruction');
    if (seal) seal.classList.add('sealed');
    if (inst) { inst.textContent = '✓ Promise made! You\'re ready to begin.'; inst.style.color = 'var(--teal)'; }
  }
}

function sealPromise() {
  const seal = document.getElementById('promise-seal');
  const inst = document.getElementById('seal-instruction');
  if (!seal) return;
  seal.classList.add('sealed');
  S.sealSealed = true;
  if (inst) { inst.textContent = '✓ Promise made! You\'re ready to begin.'; inst.style.color = 'var(--teal)'; }
  updateNextState(3);
  saveState();
}

// ============================================================
// SCREEN 5 — STAT CARDS
// ============================================================
function revealStat(el) {
  el.classList.toggle('revealed');
  saveState();
}

// ============================================================
// SCREEN 7 — BODY MAP
// ============================================================
const HOTSPOT_DATA = {
  'Head':    'Racing thoughts, feeling dizzy, can\'t concentrate',
  'Throat':  'Tight feeling, hard to speak, voice feels shaky',
  'Chest':   'Heart beating fast, tight chest, hard to breathe',
  'Stomach': 'Butterflies, nausea, stomach feels knotted',
  'Hands':   'Sweaty, shaky, fidgety — need to do something',
  'Legs':    'Shaky, frozen, strong urge to run away'
};

function restoreBodyMap() {
  const parts = Object.keys(S.bodyParts);
  if (!parts.length) return;
  document.querySelectorAll('.hotspot').forEach(hs => {
    if (S.bodyParts[hs.dataset.part]) hs.classList.add('active');
  });
  updateBodyList();
}

function toggleHotspot(el, name, desc) {
  el.classList.toggle('active');
  if (el.classList.contains('active')) S.bodyParts[name] = desc;
  else delete S.bodyParts[name];
  updateBodyList();
  updateNextState(7);
  saveState();
}

function updateBodyList() {
  const list = document.getElementById('body-list');
  const countEl = document.getElementById('body-count');
  const parts = Object.keys(S.bodyParts);
  if (!list) return;
  if (!parts.length) {
    list.innerHTML = '<li style="color:var(--text-light);font-style:italic">Tap the body to begin...</li>';
    if (countEl) countEl.textContent = '';
    return;
  }
  list.innerHTML = parts.map(p => '<li>' + p + '</li>').join('');
  if (countEl) countEl.textContent = parts.length + ' area' + (parts.length > 1 ? 's' : '') + ' identified';
}

// ============================================================
// SCREEN 8 — FINGERPRINT
// ============================================================
function buildFingerprint() {
  const nameEl = document.getElementById('fp-name');
  if (nameEl) nameEl.textContent = (S.name || 'Your') + '\'s Anxiety Pattern';

  const zones = document.getElementById('fp-zones');
  if (!zones) return;
  zones.innerHTML = '';
  const allZones = ['Body signals','Nervous energy','Racing thoughts','Social worry','Avoidance urge','Performance fear','Anticipatory dread'];
  const active = Math.min(allZones.length, Object.keys(S.bodyParts).length + 1 + (S.triggers.length > 2 ? 2 : S.triggers.length));
  allZones.forEach((z, i) => {
    const d = document.createElement('div');
    d.className = 'fzone' + (i < active ? ' active' : '');
    d.textContent = z;
    zones.appendChild(d);
  });
}

// ============================================================
// SCREEN 9 — TRIGGERS
// ============================================================
function restoreTriggers() {
  document.querySelectorAll('.trigger-card').forEach(card => {
    if (S.triggers.includes(card.dataset.trigger)) card.classList.add('selected');
  });
  updateTriggerCount();
}

function toggleTrigger(el, id) {
  el.classList.toggle('selected');
  const idx = S.triggers.indexOf(id);
  if (idx > -1) S.triggers.splice(idx, 1);
  else S.triggers.push(id);
  updateTriggerCount();
  updateNextState(9);
  saveState();
}

function updateTriggerCount() {
  const el = document.getElementById('trigger-count');
  if (el) el.textContent = S.triggers.length + ' selected';
}

// ============================================================
// SCREEN 12 — SORT
// ============================================================
const SORT_ANSWERS = {
  'sort-1': { correct:'cat', msg:'Catastrophe — "forever" is Worry Brain. People forget within minutes, not years.' },
  'sort-2': { correct:'con', msg:'Real concern — nervousness before speaking in public is completely normal and valid.' },
  'sort-3': { correct:'cat', msg:'Catastrophe — this is Worry Brain\'s most dramatic story. Evidence consistently says otherwise.' }
};

function sortItem(id, choice) {
  const item = document.getElementById(id);
  if (!item || item.classList.contains('answered-cat') || item.classList.contains('answered-con')) return;
  S.sortAnswers[id] = choice;
  const data = SORT_ANSWERS[id];
  const isRight = choice === data.correct;
  item.classList.add(choice === 'cat' ? 'answered-cat' : 'answered-con');
  const result = document.getElementById(id + '-result');
  if (result) {
    result.textContent = (isRight ? '✓ ' : '→ ') + data.msg;
    result.style.color = isRight ? 'var(--teal)' : 'var(--coral)';
  }
  item.querySelectorAll('.sort-btn').forEach(b => b.disabled = true);
  saveState();
}

// ============================================================
// SCREEN 14 — THOUGHT REWRITE
// ============================================================
function buildThoughtRewrite() {
  const thoughtEl = document.getElementById('anxious-thought');
  if (!thoughtEl) return;
  const triggerThoughts = {
    'raising-hand':    '"Everyone will notice if my answer is wrong and judge me for it."',
    'meeting-someone': '"They won\'t like me or find me interesting enough to talk to."',
    'being-called-on': '"My mind will go blank and everyone will think I\'m not smart."',
    'performing':      '"I\'ll mess up and everyone will remember it forever."',
    'left-out':        '"There must be something wrong with me that makes people not want to include me."',
    'making-mistakes': '"If I make a mistake in front of others I won\'t be able to handle the embarrassment."'
  };
  const firstTrigger = S.triggers[0];
  if (firstTrigger && triggerThoughts[firstTrigger]) {
    thoughtEl.textContent = triggerThoughts[firstTrigger];
  }
  const textarea = document.getElementById('thought-rewrite-input');
  if (textarea && S.thoughtRewrite) textarea.value = S.thoughtRewrite;
}

function captureThoughtRewrite() {
  const ta = document.getElementById('thought-rewrite-input');
  if (ta) S.thoughtRewrite = ta.value;
}

// ============================================================
// SCREEN 16 — BREATHING
// ============================================================
let breathInterval = null;
let breathPhaseIdx = 0;
let breathCount = 4;
let breathRound = 0;
const BREATH_PHASES = ['Breathe In','Hold','Breathe Out','Hold'];
const BREATH_CLASSES = ['inhale','hold','exhale','hold'];

function restoreBreathing() {
  if (S.breathingComplete) {
    const circle = document.getElementById('breath-circle');
    const phaseEl = document.getElementById('breath-phase');
    const countEl = document.getElementById('breath-count');
    const btn = document.getElementById('breath-btn');
    const rounds = document.getElementById('round-num');
    if (circle) circle.className = 'breath-circle';
    if (phaseEl) phaseEl.textContent = 'Done! ✓';
    if (countEl) countEl.textContent = '😌';
    if (rounds) rounds.textContent = '3';
    if (btn) { btn.textContent = 'Do It Again'; btn.style.display = 'block'; btn.onclick = resetBreathing; }
  }
}

function resetBreathing() {
  breathPhaseIdx = 0; breathRound = 0;
  clearInterval(breathInterval); breathInterval = null;
  const rounds = document.getElementById('round-num');
  const btn = document.getElementById('breath-btn');
  if (rounds) rounds.textContent = '0';
  if (btn) btn.style.display = 'none';
  runBreathPhase();
}

function startBreathing() {
  if (breathInterval) return;
  document.getElementById('breath-btn').style.display = 'none';
  breathRound = 0; breathPhaseIdx = 0;
  runBreathPhase();
}

function runBreathPhase() {
  const circle = document.getElementById('breath-circle');
  const countEl = document.getElementById('breath-count');
  const phaseEl = document.getElementById('breath-phase');
  const roundEl = document.getElementById('round-num');
  if (!circle) return;

  circle.className = 'breath-circle ' + BREATH_CLASSES[breathPhaseIdx];
  if (phaseEl) phaseEl.textContent = BREATH_PHASES[breathPhaseIdx];

  let count = 4;
  if (countEl) countEl.textContent = count;

  breathInterval = setInterval(() => {
    count--;
    if (countEl) countEl.textContent = count;
    if (count <= 0) {
      clearInterval(breathInterval);
      breathInterval = null;
      breathPhaseIdx = (breathPhaseIdx + 1) % 4;
      if (breathPhaseIdx === 0) {
        breathRound++;
        if (roundEl) roundEl.textContent = breathRound;
        if (breathRound >= 3) {
          if (circle) circle.className = 'breath-circle';
          if (phaseEl) phaseEl.textContent = 'Done! ✓';
          if (countEl) countEl.textContent = '😌';
          S.breathingComplete = true;
          updateNextState(16);
          saveState();
          const btn = document.getElementById('breath-btn');
          if (btn) { btn.textContent = 'Do It Again'; btn.style.display = 'block'; btn.onclick = resetBreathing; }
          return;
        }
      }
      runBreathPhase();
    }
  }, 1000);
}

// ============================================================
// SCREEN 18 — SAFE SENTENCE
// ============================================================
function restoreSafeSentence() {
  if (!S.safeSentence) return;
  let matched = false;
  document.querySelectorAll('.safe-option').forEach(opt => {
    if (opt.dataset.sentence === S.safeSentence) { opt.classList.add('selected'); matched = true; }
  });
  if (!matched) {
    const custom = document.getElementById('safe-custom');
    if (custom) custom.value = S.safeSentence;
  }
}

function selectSafe(el, text) {
  document.querySelectorAll('.safe-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  S.safeSentence = text;
  const custom = document.getElementById('safe-custom');
  if (custom) custom.value = '';
  updateNextState(18);
  saveState();
}

function customSafe(el) {
  document.querySelectorAll('.safe-option').forEach(o => o.classList.remove('selected'));
  S.safeSentence = el.value.trim();
  updateNextState(18);
  saveState();
}

// ============================================================
// SCREEN 19 — QUIZ
// ============================================================
function answerQuiz(qid, el, result) {
  const q = document.getElementById(qid);
  if (!q || q.classList.contains('answered')) return;
  q.classList.add('answered');
  el.classList.add(result);
  S.quizAnswers[qid] = result;
  const fb = q.querySelector('.quiz-feedback');
  if (fb) {
    fb.style.background = result === 'correct' ? 'var(--teal-pale)' : 'var(--coral-pale)';
    fb.style.color      = result === 'correct' ? 'var(--teal)' : 'var(--coral)';
  }
  saveState();
}

// ============================================================
// SCREENS 21–24 — SCENARIOS
// ============================================================
function chooseScenario(num, type, btn) {
  const choices = document.getElementById('choices-' + num);
  if (!choices) return;
  choices.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });
  btn.classList.add('selected-' + type);
  S.scenarioChoices[num] = type;
  saveState();

  const data = SCENARIO_DATA[num][type];
  const outcome = document.getElementById('outcome-' + num);
  const badge   = document.getElementById('badge-' + num);
  const textEl  = document.getElementById('outcome-text-' + num);
  if (badge)  { badge.className = 'outcome-badge ' + data.cls; badge.textContent = data.badge; }
  if (textEl) textEl.textContent = data.text;
  if (outcome) outcome.classList.add('visible');

  setTimeout(() => {
    const reflect = document.getElementById('reflect-' + num);
    if (reflect) reflect.classList.add('visible');
    const benneBox = document.getElementById('benne-' + num);
    const speech   = document.getElementById('benne-speech-' + num);
    if (speech) speech.textContent = data.speech;
    if (benneBox) benneBox.style.display = 'flex';
  }, 600);
}

// ============================================================
// SCREEN 25 — BRAVE LADDER
// ============================================================
function restoreLadder() {
  S.rungs.forEach((val, i) => {
    const inp = document.getElementById('rung' + (i+1));
    if (inp && val) inp.value = val;
  });
}

function captureLadder() {
  S.rungs = S.rungs.map((_, i) => {
    const inp = document.getElementById('rung' + (i+1));
    return inp ? inp.value.trim() : '';
  });
  S.rungOne = S.rungs[0];
  updateNextState(25);
}

function onRungInput() {
  captureLadder();
  saveState();
}

// ============================================================
// SCREEN 26 — FIRST STEP
// ============================================================
function buildFirstStep() {
  captureLadder();
  const display = document.getElementById('first-step-display');
  if (display) display.textContent = S.rungs[0] || 'Go back and fill in Rung 1 of your Brave Ladder!';
  const box = document.getElementById('commit-box');
  if (box) box.classList.toggle('checked', S.committed);
}

function toggleCommit() {
  S.committed = !S.committed;
  const box = document.getElementById('commit-box');
  if (box) box.classList.toggle('checked', S.committed);
  updateNextState(26);
  saveState();
}

// ============================================================
// SCREEN 28 — CONVERSATION CARDS
// ============================================================
function toggleFav(el, idx) {
  el.classList.toggle('favorited');
  const fi = S.favCards.indexOf(idx);
  if (fi > -1) S.favCards.splice(fi, 1);
  else S.favCards.push(idx);
  saveState();
}

// ============================================================
// SCREEN 30 — NOTE PROMPTS
// ============================================================
function addPrompt(text) {
  const area = document.getElementById('self-note');
  if (!area) return;
  if (area.value && !area.value.endsWith('\n')) area.value += '\n';
  area.value += text + ' ';
  area.focus();
  S.selfNote = area.value;
  updateNextState(30);
  saveState();
}

function onNoteInput() {
  S.selfNote = (document.getElementById('self-note') || {}).value || '';
  updateNextState(30);
  saveState();
}

function restoreSelfNote() {
  const area = document.getElementById('self-note');
  if (area && S.selfNote) area.value = S.selfNote;
}

function restoreTrustedAdult() {
  const inp = document.getElementById('trusted-adult');
  if (inp && S.trustedAdult) inp.value = S.trustedAdult;
}

// ============================================================
// SCREEN 31 — CHECK-IN (DEEP PERSONALIZATION)
// ============================================================
function buildCheckin() {
  const beforeList = document.getElementById('before-list');
  if (!beforeList) return;
  if (S.triggers.length) {
    beforeList.innerHTML = S.triggers.slice(0, 5).map(t =>
      '<div class="compare-item" style="color:var(--coral)">😰 ' + (TRIGGER_LABELS[t] || t) + '</div>'
    ).join('');
  } else {
    beforeList.innerHTML = '<div class="compare-item" style="color:var(--text-light)">Your triggers</div>';
  }

  // Personalized headline
  const headline = document.getElementById('checkin-headline');
  if (headline && S.name) headline.textContent = S.name + ', look how far you\'ve come. ✨';
}

// ============================================================
// SCREEN 32 — LEARNED (PERSONALIZED)
// ============================================================
function buildLearnedSummary() {
  // Restore revealed states
  S.learnedRevealed.forEach(idx => {
    const items = document.querySelectorAll('.learned-item');
    if (items[idx]) items[idx].classList.add('revealed');
  });

  // Personalize detail text with their data
  const detail0 = document.getElementById('learned-detail-0');
  if (detail0 && S.triggers.length) {
    detail0.textContent = 'For you specifically, triggers like "' + (TRIGGER_LABELS[S.triggers[0]] || S.triggers[0]) + '" activate the alarm. Knowing this means you can prepare instead of react.';
  }
  const detail2 = document.getElementById('learned-detail-2');
  if (detail2 && S.safeSentence) {
    detail2.textContent = 'Your personal anchor is: "' + S.safeSentence + '" — say it whenever the alarm fires.';
  }
  const detail3 = document.getElementById('learned-detail-3');
  if (detail3 && S.rungOne) {
    detail3.textContent = 'Your Rung 1 — "' + S.rungOne + '" — is your first real-world practice target. Every time you try it, your brain updates its threat model.';
  }
}

function revealLearned(el, idx) {
  el.classList.toggle('revealed');
  const i = S.learnedRevealed.indexOf(idx);
  if (i > -1) S.learnedRevealed.splice(i, 1);
  else S.learnedRevealed.push(idx);
  saveState();
}

// ============================================================
// SCREEN 33 — ROADMAP (PERSONALIZED)
// ============================================================
function buildRoadmap() {
  const speech = document.getElementById('roadmap-speech');
  if (speech) {
    const n = S.name || 'You';
    const sc = Object.keys(S.scenarioChoices).length;
    speech.textContent = n + ', you completed all 34 screens — including ' + sc + ' scenario lab' + (sc !== 1 ? 's' : '') + ' where you made real choices under pressure. That took genuine commitment.';
  }
}

// ============================================================
// SCREEN 34 — CERTIFICATE (DEEP PERSONALIZATION)
// ============================================================
function buildCertificate() {
  const nameEl = document.getElementById('cert-name');
  if (nameEl) nameEl.textContent = S.name || 'Brave Kid';

  const sentenceEl = document.getElementById('cert-sentence');
  if (sentenceEl) sentenceEl.textContent = '"' + (S.safeSentence || 'I am brave even when I am scared.') + '"';

  // Embed a snippet of their self-note
  const noteEl = document.getElementById('cert-note-text');
  if (noteEl) {
    if (S.selfNote && S.selfNote.trim().length > 10) {
      const snippet = S.selfNote.trim().substring(0, 80) + (S.selfNote.length > 80 ? '...' : '');
      noteEl.textContent = snippet;
    } else {
      noteEl.style.display = 'none';
    }
  }

  const dateEl = document.getElementById('cert-date');
  if (dateEl) dateEl.textContent = 'Completed ' + new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  const finalSpeech = document.getElementById('final-speech');
  if (finalSpeech) {
    const n = S.name || 'You';
    const t = S.trustedAdult ? ' Remember — ' + S.trustedAdult + ' is in your corner too.' : '';
    finalSpeech.textContent = n + ', you came into this program with anxiety and no tools. You\'re leaving with knowledge, a calm toolkit, a brave ladder, and a plan.' + t + ' Keep going — one brave step at a time.';
  }
}

// ============================================================
// RESUME BANNER
// ============================================================
function showResumeBanner(savedScreen) {
  const banner = document.getElementById('resume-banner');
  const msg = document.getElementById('resume-msg');
  if (!banner) return;
  if (msg) msg.textContent = 'You were on Screen ' + savedScreen + ' of 35. Pick up where you left off?';
  banner.classList.add('active');
}

function resumeSession() {
  const banner = document.getElementById('resume-banner');
  if (banner) banner.classList.remove('active');
  navigateTo(S.current);
}

function restartSession() {
  const banner = document.getElementById('resume-banner');
  if (banner) banner.classList.remove('active');
  clearState();
  navigateTo(1);
}

// ============================================================
// PASSWORD GATE
// ============================================================
const PROGRAM_PASSWORD = 'Proverb29Verse25$';
const PW_KEY = 'sal_pw_unlocked_v1';

function checkPassword() {
  const input = document.getElementById('pw-input');
  const error = document.getElementById('pw-error');
  if (!input) return;
  if (input.value.trim() === PROGRAM_PASSWORD) {
    try { localStorage.setItem(PW_KEY, '1'); } catch(e) {}
    const gate = document.getElementById('pw-gate');
    if (gate) gate.classList.remove('active');
    launchProgram();
  } else {
    if (error) {
      error.textContent = 'Incorrect password. Please try again.';
      error.style.opacity = '1';
    }
    input.value = '';
    input.focus();
  }
}

function handlePwKey(e) {
  if (e.key === 'Enter') checkPassword();
  const error = document.getElementById('pw-error');
  if (error) error.style.opacity = '0';
}

// ============================================================
// INIT
// ============================================================
function launchProgram() {
  const hadSaved = loadState();
  updateChrome();
  const startScreen = document.getElementById('s1');
  if (startScreen) startScreen.classList.add('active');
  if (hadSaved && S.current > 1) {
    showResumeBanner(S.current);
  }
}

function init() {
  let unlocked = false;
  try { unlocked = localStorage.getItem(PW_KEY) === '1'; } catch(e) {}
  const gate = document.getElementById('pw-gate');
  if (unlocked) {
    if (gate) gate.classList.remove('active');
    launchProgram();
  } else {
    if (gate) gate.classList.add('active');
    const input = document.getElementById('pw-input');
    if (input) setTimeout(() => input.focus(), 100);
  }
}

document.addEventListener('DOMContentLoaded', init);

// ============================================================
// EARLY HELPER FUNCTIONS (must be defined before first use)
// ============================================================

// (moved to early helpers section)
// (moved to early helpers section)

function showSaveIndicator() {
  const el = document.getElementById('save-indicator');
  if (!el) return;
  el.classList.add('visible');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => el.classList.remove('visible'), 2000);
}

// (moved to early helpers section)

function showPhaseToast(screenNum) {
  const data = PHASE_TOASTS[screenNum];
  if (!data) return;
  const el = document.getElementById('phase-toast');
  if (!el) return;
  el.innerHTML = data.emoji + ' ' + data.text;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3500);
}

// (moved to early helpers section)


// ============================================================
// PROGRAM MENU — Confidence Spark Style
// ============================================================

const PHASE_RANGES = [
  { id: 0, start: 1,  end: 3  },
  { id: 1, start: 4,  end: 9  },
  { id: 2, start: 10, end: 14 },
  { id: 3, start: 15, end: 19 },
  { id: 4, start: 20, end: 26 },
  { id: 5, start: 27, end: 30 },
  { id: 6, start: 31, end: 34 }
];

function toggleMenu() {
  const menu = document.getElementById('program-menu');
  const overlay = document.getElementById('menu-overlay');
  const isOpen = menu.classList.contains('open');
  if (isOpen) { closeMenu(); } else { openMenu(); }
}

function openMenu() {
  document.getElementById('program-menu').classList.add('open');
  document.getElementById('menu-overlay').classList.add('open');
  updateMenuState();
}

function closeMenu() {
  document.getElementById('program-menu').classList.remove('open');
  document.getElementById('menu-overlay').classList.remove('open');
}

function updateMenuState() {
  const n = S.current;

  // Update goto select
  const sel = document.getElementById('menu-goto-select');
  if (sel) sel.value = n;

  // Update menu items
  document.querySelectorAll('.menu-item').forEach(item => {
    const screenNum = parseInt(item.dataset.screen);
    item.classList.remove('active','visited');
    if (screenNum === n) item.classList.add('active');
    else if (screenNum < n) item.classList.add('visited');
  });

  // Update phase status badges
  PHASE_RANGES.forEach(phase => {
    const el = document.getElementById('mps-' + phase.id);
    if (!el) return;
    el.className = 'menu-phase-status';
    if (n > phase.end) {
      el.textContent = 'COMPLETE';
      el.classList.add('complete');
    } else if (n >= phase.start) {
      el.textContent = 'IN PROGRESS';
      el.classList.add('in-progress');
    } else {
      el.textContent = 'NOT STARTED';
    }
  });
}

function menuGoTo() {
  const sel = document.getElementById('menu-goto-select');
  if (!sel) return;
  const target = parseInt(sel.value);
  if (target >= 1 && target <= 34) {
    closeMenu();
    navigateTo(target);
  }
}

function menuNav(n) {
  closeMenu();
  navigateTo(n);
}


// ============================================================
// REFINEMENT PASS — ALL PRIORITIES
// ============================================================

// ---- P3: Improved gate hint messages (warmer language) ----
Object.assign(GATE_HINTS, {
  2:  'Just need your name — even a nickname works! 😊',
  3:  'Tap the seal when you\'re ready to make your promise.',
  7:  'Tap any area on the body where you feel anxiety.',
  9:  'Tap at least one situation that feels familiar to you.',
  16: 'Complete all 3 breathing rounds — you\'re almost there!',
  18: 'Choose or write your safe sentence to keep going.',
  25: 'Fill in your first brave step — the smallest one counts.',
  26: 'Tap the checkbox to commit — you\'re so close!',
  29: 'Name one trusted adult in your life — just one is enough.',
  30: 'Write just a few words to your future self to continue.'
});

// (moved to early helpers section)

// (moved to early helpers section)

// ---- P6: Phase transition toasts ----
const PHASE_TOASTS = {
  4:  { emoji: '🧠', text: 'Phase 1 unlocked — let\'s understand what\'s happening.' },
  10: { emoji: '🔍', text: 'Phase 2 unlocked — time to investigate those anxious thoughts.' },
  15: { emoji: '🌬️', text: 'Phase 3 unlocked — your calm toolkit is ready.' },
  20: { emoji: '⭐', text: 'Phase 4 unlocked — now we practice brave steps.' },
  27: { emoji: '🤝', text: 'Phase 5 unlocked — let\'s talk about connection.' },
  31: { emoji: '🎉', text: 'Final phase — look how far you\'ve come!' }
};

let toastTimer = null;
// (moved to early helpers section)

// navigateTo already includes toast and counter calls above

// ---- P7: Parent Summary Screen (S35) builder ----
function buildParentSummary() {
  // Triggers
  const triggersEl = document.getElementById('ps-triggers');
  if (triggersEl) {
    if (S.triggers.length) {
      triggersEl.innerHTML = S.triggers.map(t =>
        '<span class="summary-tag summary-tag-coral">' + (TRIGGER_LABELS[t] || t) + '</span>'
      ).join('');
    } else {
      triggersEl.textContent = 'No triggers selected.';
    }
  }

  // Body parts
  const bodyEl = document.getElementById('ps-body');
  if (bodyEl) {
    const parts = Object.keys(S.bodyParts);
    if (parts.length) {
      bodyEl.innerHTML = parts.map(p =>
        '<span class="summary-tag">' + p + '</span>'
      ).join('');
    } else {
      bodyEl.textContent = 'No areas selected.';
    }
  }

  // Safe sentence
  const sentenceEl = document.getElementById('ps-sentence');
  if (sentenceEl) {
    sentenceEl.textContent = S.safeSentence
      ? '"' + S.safeSentence + '"'
      : 'Not yet selected.';
  }

  // Brave ladder rung 1
  const rungEl = document.getElementById('ps-rung');
  if (rungEl) {
    rungEl.textContent = S.rungs[0]
      ? '"' + S.rungs[0] + '"'
      : 'Not yet filled in.';
  }

  // Trusted adult
  const adultEl = document.getElementById('ps-adult');
  if (adultEl) {
    adultEl.textContent = S.trustedAdult || 'Not yet named.';
  }
}

// ---- P8: Certificate strength statement ----
function getCertStrength() {
  const braveChoices = Object.values(S.scenarioChoices).filter(v => v === 'brave').length;
  const smallChoices = Object.values(S.scenarioChoices).filter(v => v === 'small').length;
  if (braveChoices >= 3) return 'Shows courage under pressure';
  if (smallChoices >= 2) return 'Thinks carefully before acting';
  if (S.triggers.length >= 5) return 'Deeply self-aware';
  if (S.committed) return 'Ready to take brave steps';
  return 'Completed a challenging journey';
}

// S35 already handled inside onScreenEnter above

// Strength badge now built directly inside buildCertificate above

// ---- Update page counter to show /35 (handled in updateChrome) ----
// updateChrome already updates page-num; just patch page-counter text
function updatePageCounter() {
  const pc = document.getElementById('page-counter');
  if (pc) pc.textContent = 'Page ' + S.current + ' of 35';
}

// ---- Add S35 to menu phase ranges ----
PHASE_RANGES[6].end = 35;

// Gate hint opacity is now handled inside updateNextState directly (patched below)
