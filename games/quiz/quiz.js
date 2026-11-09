// 삼국지 꼬마 장수 - 퀴즈 게임: 혼자 하기(이야기 6판)와 한 폰으로 둘이 퀴즈 대결

// ---------- 문제 만들기 ----------
const FRUITS = ['🍑', '🍎', '🍊', '🥟', '🍙'];

function makeOptions(answer, count, spread) {
  const set = new Set([answer]);
  let guard = 0;
  while (set.size < count && guard++ < 100) {
    const n = answer + rand(-spread, spread);
    if (n >= 0 && n !== answer) set.add(n);
  }
  return shuffle([...set]).map(String);
}

function mathQuestion(level) {
  if (level === 1) {
    const f = FRUITS[rand(0, FRUITS.length - 1)];
    if (Math.random() < 0.4) {
      const n = rand(2, 8);
      return { q: `<span class="emoji-row">${f.repeat(n)}</span>모두 몇 개일까요?`, a: String(n), opts: makeOptions(n, 3, 2), e: `${n}개예요!` };
    }
    const x = rand(1, 5), y = rand(1, 4);
    return {
      q: `<span class="emoji-row">${f.repeat(x)} ➕ ${f.repeat(y)}</span>${x} + ${y} = ?`,
      a: String(x + y), opts: makeOptions(x + y, 3, 2), e: `${x} 더하기 ${y}는 ${x + y}예요.`
    };
  }
  if (level === 2) {
    const kind = rand(0, 2);
    if (kind === 0) {
      const x = rand(10, 40), y = rand(3, 30);
      return { q: `병사 ${x}명에 ${y}명이 더 왔어요. 모두 몇 명일까요?`, a: String(x + y), opts: makeOptions(x + y, 4, 10), e: `${x} + ${y} = ${x + y}` };
    }
    if (kind === 1) {
      const x = rand(15, 50), y = rand(3, x - 5);
      return { q: `만두 ${x}개 중에 ${y}개를 먹었어요. 몇 개 남았을까요? 🥟`, a: String(x - y), opts: makeOptions(x - y, 4, 10), e: `${x} - ${y} = ${x - y}` };
    }
    const x = rand(6, 20), y = rand(5, 20);
    return { q: `${x} + ${y} = ?`, a: String(x + y), opts: makeOptions(x + y, 4, 6), e: `정답은 ${x + y}!` };
  }
  // 어려움
  const kind = rand(0, 2);
  if (kind === 0) {
    const x = rand(3, 9), y = rand(3, 9);
    return { q: `병사가 한 줄에 ${x}명씩 ${y}줄 서 있어요. 모두 몇 명일까요?`, a: String(x * y), opts: makeOptions(x * y, 4, 9), e: `${x} × ${y} = ${x * y}` };
  }
  if (kind === 1) {
    const x = rand(2, 9), y = rand(2, 9), z = rand(1, 20);
    return { q: `${x} × ${y} + ${z} = ?`, a: String(x * y + z), opts: makeOptions(x * y + z, 4, 8), e: `${x * y} + ${z} = ${x * y + z}` };
  }
  const y = rand(2, 9), ans = rand(2, 9);
  return { q: `화살 ${y * ans}개를 ${y}명이 똑같이 나눠요. 한 명이 몇 개씩 가질까요? 🏹`, a: String(ans), opts: makeOptions(ans, 4, 4), e: `${y * ans} ÷ ${y} = ${ans}` };
}

// 난이도마다 상식 문제 더미를 하나씩 둔다. 더미를 다 쓸 때까지 같은 문제가 다시 나오지 않고,
// 남은 더미는 이 폰에 저장해서 다음 판·다음 날에도 이어진다.
const QUIZ_DECK_KEY = 'samguk-quiz-deck';
let quizDecks = {};
try { quizDecks = JSON.parse(localStorage.getItem(QUIZ_DECK_KEY)) || {}; } catch (e) { quizDecks = {}; }
function nextTrivia(level) {
  const all = TRIVIA[level];
  let deck = (quizDecks[level] || []).filter((i) => Number.isInteger(i) && i >= 0 && i < all.length);
  if (!deck.length) deck = shuffle(all.map((x, i) => i));
  const t = all[deck.pop()];
  quizDecks[level] = deck;
  try { localStorage.setItem(QUIZ_DECK_KEY, JSON.stringify(quizDecks)); } catch (e) { /* 저장 못 해도 괜찮다 */ }
  return t;
}
function nextQuestion(player) {
  const lv = LEVELS[player.level];
  if (Math.random() < lv.mathRate) return mathQuestion(player.level);
  const t = nextTrivia(player.level);
  return { q: t.q, a: t.a, opts: shuffle([t.a, ...t.w]), e: t.e };
}

// ---------- 게임 상태 ----------
const state = {
  mode: 'solo',      // solo | duo
  level: 1,          // 혼자 하기 난이도
  stage: 0,          // 혼자 하기 판 번호
  picking: 0,        // 둘이 하기에서 몇 번째 사람이 고르는 중인지
  picks: [null, null],
  pickLevels: [1, 1],
  fighters: [],
  turn: 0,
  busy: false,
  battleId: 0,
  pickFilter: '전체',
  current: null
};

$('btnSolo').onclick = () => { Sound.play('click'); state.mode = 'solo'; drawSoloLevels(); show('level'); };
$('btnLocalDuo').onclick = () => {
  Sound.play('click');
  state.mode = 'duo';
  state.picking = 0;
  state.picks = [null, null];
  drawPick();
  show('pick');
};

// ---------- 혼자 하기: 난이도와 지도 ----------
function drawSoloLevels() {
  const colors = { 1: 'green', 2: 'orange', 3: 'blue' };
  $('soloLevels').innerHTML = '';
  for (const k of [1, 2, 3]) {
    const L = LEVELS[k];
    const b = document.createElement('button');
    b.className = 'big-btn ' + colors[k];
    b.innerHTML = `${L.name}<small>${L.hint} · 내 하트 ${L.hearts}개</small>`;
    b.onclick = () => { Sound.play('click'); state.level = k; drawMap(); show('map'); };
    $('soloLevels').appendChild(b);
  }
}

function drawMap() {
  $('mapLevel').textContent = LEVELS[state.level].name;
  const stars = save.stars[state.level] || {};
  const next = nextStarFriend();
  $('mapInfo').innerHTML = `⭐ 모은 별 <b>${totalStars()}</b>개` + (next
    ? ` · 별 ${STAR_UNLOCK[next]}개가 되면 새 친구가 와요!`
    : ' · 별 친구를 모두 만났어요! 🎉') +
    '<br><small>다른 난이도에서 모은 별도 함께 세요. 🏆 이길 때마다 새 친구도 1명씩 와요.</small>';
  $('stageList').innerHTML = '';
  STAGES.forEach((st, i) => {
    const open = i === 0 || stars[i - 1] > 0;
    const b = document.createElement('button');
    b.className = 'stage' + (open ? '' : ' locked');
    b.style.background = st.bg;
    const enemy = GENERALS[st.enemy];
    b.innerHTML = drawGeneral(st.enemy, !open) +
      `<span><b>${st.title}</b><br>${open ? '상대: ' + enemy.name : '🔒 앞의 판을 깨면 열려요'}</span>` +
      `<span class="stage-stars">${starText(stars[i] || 0)}</span>`;
    if (open) b.onclick = () => { Sound.play('click'); state.stage = i; drawPick(); show('pick'); };
    $('stageList').appendChild(b);
  });
}

// ---------- 장수 고르기 ----------
$('pickBack').onclick = () => {
  Sound.play('click');
  if (state.mode === 'solo') { drawMap(); show('map'); return; }
  if (state.picking === 1) { state.picking = 0; state.picks = [null, null]; drawPick(); return; }
  show('home');
};

function drawPick() {
  const duo = state.mode === 'duo';
  const p = state.picking;
  if (duo) {
    $('pickTitle').innerHTML = `<span style="color:${p === 0 ? '#3b7dd8' : '#e67e22'}">${p + 1}P</span> 장수와 문제 난이도를 골라요`;
    $('pickNote').textContent = '형제자매끼리 나이가 달라도 각자 맞는 난이도로 겨룰 수 있어요!';
    $('pickLevels').innerHTML = '';
    for (const k of [1, 2, 3]) {
      const c = document.createElement('button');
      c.className = 'level-chip' + (state.pickLevels[p] === k ? ' on' : '');
      c.textContent = `${LEVELS[k].name} (${LEVELS[k].hint})`;
      c.onclick = () => { Sound.play('click'); state.pickLevels[p] = k; drawPick(); };
      $('pickLevels').appendChild(c);
    }
  } else {
    const st = STAGES[state.stage];
    $('pickTitle').textContent = `${st.title} - 함께 나갈 장수를 골라요`;
    $('pickNote').textContent = st.story;
    $('pickLevels').innerHTML = '';
  }
  $('perkLegend').innerHTML = `능력이 ${PERK_AT} 이상이면 특기가 생겨요!<br>` +
    STAT_INFO.map((s) => `${s.icon} ${s.perk}: ${s.desc}`).join('<br>');
  drawFilter($('pickFilter'), state.pickFilter, (f) => { state.pickFilter = f; drawPick(); });
  $('pickGrid').innerHTML = '';
  for (const id of save.unlocked) {
    if (state.pickFilter !== '전체' && groupOf(id) !== state.pickFilter) continue;
    // 혼자 하기에서는 지금 상대와 같은 장수는 빼고 보여 준다
    if (!duo && id === STAGES[state.stage].enemy) continue;
    const g = GENERALS[id];
    const taken = duo && p === 1 && state.picks[0] === id;
    const c = document.createElement('button');
    c.className = 'card' + (taken ? ' taken' : '');
    c.innerHTML = drawGeneral(id) + `<b>${g.name}</b><small>${g.nation}</small>` + statBars(id) +
      `<small class="perk-line">특기 ${perkIcons(id)}</small>`;
    if (!taken) c.onclick = () => choose(id);
    $('pickGrid').appendChild(c);
  }
}

function choose(id) {
  Sound.play('click');
  if (state.mode === 'solo') {
    const st = STAGES[state.stage];
    const L = LEVELS[state.level];
    const extra = state.stage >= 3 ? 1 : 0; // 뒤쪽 판은 상대 하트가 1개 더
    startBattle([
      makeFighter(id, L.hearts, state.level),
      makeFighter(st.enemy, L.enemyHearts + extra, state.level)
    ]);
    return;
  }
  state.picks[state.picking] = id;
  if (state.picking === 0) { state.picking = 1; drawPick(); window.scrollTo(0, 0); return; }
  startDuo();
}

function startDuo() {
  const H = 4; // 둘이 하기는 공평하게 하트 4개씩
  startBattle(state.picks.map((id, i) => makeFighter(id, H, state.pickLevels[i])));
}

function makeFighter(id, hearts, level) {
  const h = hearts + (hasPerk(id, 2) ? 1 : 0);
  return {
    id, hearts: h, max: h, level, deck: [],
    crit: hasPerk(id, 0),
    hints: hasPerk(id, 1) ? 2 : 0,
    cheers: hasPerk(id, 3) ? 1 : 0
  };
}

// ---------- 대결 ----------
function startBattle(fighters) {
  state.battleId++;
  state.fighters = fighters;
  state.turn = 0;
  state.busy = false;
  const duo = state.mode === 'duo';
  $('stageTitle').textContent = duo ? '둘이 하기 대결' : STAGES[state.stage].title;
  $('arena').style.background = duo ? '#e8f4ff' : STAGES[state.stage].bg;
  fighters.forEach((f, i) => {
    const el = $('f' + i);
    el.className = 'fighter' + (i ? ' right' : '') + ' p' + i;
    $('pic' + i).innerHTML = drawGeneral(f.id);
    $('name' + i).textContent = GENERALS[f.id].name;
    $('who' + i).textContent = duo ? `${i + 1}P · ${LEVELS[f.level].name}` : (i === 0 ? '나' : '상대');
  });
  drawHearts();
  show('battle');
  nextTurn();
}

function drawHearts() {
  const duo = state.mode === 'duo';
  state.fighters.forEach((f, i) => {
    $('hearts' + i).textContent = heartsText(f.hearts, f.max);
    // 혼자 하기의 상대는 문제를 풀지 않으니 특기를 보여 주지 않는다
    const p = [];
    if (duo || i === 0) {
      if (f.crit) p.push('💪');
      if (f.hints) p.push('🧠×' + f.hints);
      if (f.cheers) p.push('💖×' + f.cheers);
    }
    $('perks' + i).textContent = p.join('  ');
  });
}

function useHint() {
  if (state.busy) return;
  const me = state.fighters[state.mode === 'duo' ? state.turn : 0];
  const wrongs = [...document.querySelectorAll('.answer')].filter((b) => !b.disabled && b.textContent !== state.current.a);
  if (!me.hints || wrongs.length < 2) return; // 보기는 적어도 2개 남긴다
  Sound.play('click');
  const b = wrongs[rand(0, wrongs.length - 1)];
  b.disabled = true;
  b.classList.add('gone');
  me.hints--;
  $('hintBtn').style.display = 'none';
  $('message').textContent = `🧠 ${GENERALS[me.id].name}의 지혜! 틀린 보기 하나를 지웠어요.`;
  drawHearts();
}
$('hintBtn').onclick = useHint;

function nextTurn() {
  const duo = state.mode === 'duo';
  const t = duo ? state.turn : 0; // 혼자 하기는 늘 내가 문제를 푼다
  const me = state.fighters[t];
  const g = GENERALS[me.id];
  $('f0').classList.toggle('active', t === 0);
  $('f1').classList.toggle('active', duo && t === 1);
  $('quizCard').className = 'quiz-card p' + t;
  $('turnLabel').textContent = duo ? `${t + 1}P ${g.name} 차례예요!` : `${g.name}의 차례! 맞히면 공격해요`;
  const q = nextQuestion(me);
  state.current = q;
  $('question').innerHTML = q.q;
  $('message').textContent = '';
  const box = $('answers');
  box.className = 'answers' + (q.opts.length === 3 ? ' three' : '');
  box.innerHTML = '';
  q.opts.forEach((o) => {
    const b = document.createElement('button');
    b.className = 'answer';
    b.textContent = o;
    b.onclick = () => answer(b, o);
    box.appendChild(b);
  });
  $('hintBtn').style.display = me.hints ? '' : 'none';
  $('hintBtn').textContent = `🧠 힌트 (${me.hints}번 남음)`;
  state.busy = false;
}

async function answer(btn, picked) {
  if (state.busy) return;
  state.busy = true;
  const battle = state.battleId;
  const q = state.current;
  const duo = state.mode === 'duo';
  const t = duo ? state.turn : 0;
  const other = 1 - t;
  const ok = picked === q.a;
  const meF = state.fighters[t];
  // 인기 특기: 한 번은 틀려도 다시 풀 수 있다
  if (!ok && meF.cheers > 0) {
    meF.cheers--;
    Sound.play('wrong');
    btn.disabled = true;
    btn.classList.add('wrong');
    $('message').innerHTML = `💖 친구들이 응원해요! "${GENERALS[meF.id].name}, 힘내!" 한 번 더 골라 봐요.`;
    drawHearts();
    state.busy = false;
    return;
  }
  $('hintBtn').style.display = 'none';
  document.querySelectorAll('.answer').forEach((b) => {
    b.disabled = true;
    if (b.textContent === q.a) b.classList.add('right');
  });
  if (!ok) btn.classList.add('wrong');

  const me = GENERALS[state.fighters[t].id];
  const you = GENERALS[state.fighters[other].id];
  if (ok) {
    Sound.play('correct');
    const dmg = meF.crit && Math.random() < 0.3 ? 2 : 1; // 힘 특기: 가끔 2칸
    $('message').innerHTML = `⭕ 정답! ${q.e}<br><b>${me.name}의 ${me.skill}!</b>` + (dmg > 1 ? ' 💥 필살기! 하트 2개!' : '');
    await wait(700);
    await attack(t, other, dmg);
  } else {
    Sound.play('wrong');
    if (duo) {
      $('message').innerHTML = `아쉬워요! 정답은 <b>${q.a}</b>. ${q.e}<br>차례가 넘어가요.`;
      await wait(1800);
    } else {
      $('message').innerHTML = `아쉬워요! 정답은 <b>${q.a}</b>. ${q.e}<br>${josa(you.name, '이', '가')} 살짝 밀었어요!`;
      await wait(1100);
      await attack(1, 0);
    }
  }
  if (battle !== state.battleId) return; // 중간에 그만했으면 멈춘다
  const loser = state.fighters.findIndex((f) => f.hearts <= 0);
  if (loser >= 0) { finish(loser); return; }
  await wait(ok ? 900 : 500);
  if (battle !== state.battleId) return;
  if (duo) state.turn = other;
  nextTurn();
}

async function attack(from, to, dmg = 1) {
  const pic = $('pic' + from);
  pic.classList.remove('lunge-right', 'lunge-left');
  void pic.offsetWidth;
  pic.classList.add(from === 0 ? 'lunge-right' : 'lunge-left');
  await wait(250);
  Sound.play('hit');
  const target = $('f' + to);
  const tp = $('pic' + to);
  tp.classList.remove('shake');
  void tp.offsetWidth;
  tp.classList.add('shake');
  const words = ['뿅!', '쿵!', '퐁!', '얍!'];
  const pop = document.createElement('div');
  pop.className = 'pop';
  pop.textContent = dmg > 1 ? '💥 필살기!' : '⭐ ' + words[rand(0, words.length - 1)];
  target.appendChild(pop);
  setTimeout(() => pop.remove(), 1000);
  state.fighters[to].hearts = Math.max(0, state.fighters[to].hearts - dmg);
  drawHearts();
  await wait(600);
}

// ---------- 결과 ----------
function finish(loser) {
  const winner = 1 - loser;
  const W = GENERALS[state.fighters[winner].id];
  const Lg = GENERALS[state.fighters[loser].id];
  $('f' + loser).classList.add('surrender');
  const r = { delay: 700, buttons: [] };
  const addBtn = (text, cls, fn) => r.buttons.push([text, cls, fn]);

  if (state.mode === 'duo') {
    Sound.play('win');
    r.pic = drawGeneral(state.fighters[winner].id);
    r.title = `🎉 ${winner + 1}P ${W.name} 승리!`;
    const gift = unlockWinFriend();
    writeSave();
    r.text = `${Lg.name}: "항복할게요~ 다음엔 꼭 이길 거예요!" ${loser + 1}P도 정말 잘했어요 👏` +
      (gift ? ` 🎊 대결 기념으로 새 친구 ${josa(GENERALS[gift].name, '이', '가')} 왔어요!` : '');
    addBtn('🔁 같은 장수로 다시 하기', 'orange', startDuo);
    addBtn('🧑‍🤝‍🧑 장수 다시 고르기', 'blue', () => { state.picking = 0; state.picks = [null, null]; drawPick(); show('pick'); });
    addBtn('🏠 처음으로', 'gray', () => show('home'));
  } else if (winner === 0) {
    Sound.play('win');
    const me = state.fighters[0];
    const stars = me.hearts === me.max ? 3 : me.hearts * 2 >= me.max ? 2 : 1;
    const lvStars = save.stars[state.level] || (save.stars[state.level] = {});
    lvStars[state.stage] = Math.max(lvStars[state.stage] || 0, stars);
    const enemyId = state.fighters[1].id;
    const isNew = !save.unlocked.includes(enemyId);
    if (isNew) save.unlocked.push(enemyId);
    const fresh = syncStarUnlocks();
    const gift = unlockWinFriend();
    if (gift) fresh.push(gift);
    writeSave();
    const last = state.stage === STAGES.length - 1;
    r.pic = drawGeneral(enemyId);
    r.title = last ? '🎉 삼국지 이야기를 모두 깼어요!' : '🎉 이겼어요!';
    r.stars = starText(stars);
    r.text = `${Lg.name}: "항복할게요~ 우리 친구 해요!" 🤝` +
      (isNew ? ` 이제 ${josa(Lg.name, '을', '를')} 장수로 고를 수 있고, 도감에도 들어갔어요.` : '') +
      (fresh.length ? ` 🎊 새 친구 ${fresh.map((id) => GENERALS[id].name).join(', ')}도 왔어요!` : '');
    if (!last) addBtn('▶ 다음 판', 'green', () => { state.stage++; drawPick(); show('pick'); });
    addBtn('🔁 이 판 다시 (별 모으기)', 'orange', () => { drawPick(); show('pick'); });
    addBtn('🗺️ 지도로', 'blue', () => { drawMap(); show('map'); });
  } else {
    Sound.play('lose');
    r.pic = drawGeneral(state.fighters[0].id);
    r.title = '조금만 더 힘내요!';
    r.text = `${W.name}: "후후, 이번엔 내가 이겼어요!" 괜찮아요, 다시 해 보면 할 수 있어요 💪`;
    addBtn('🔁 다시 도전', 'green', () => { drawPick(); show('pick'); });
    addBtn('🗺️ 지도로', 'blue', () => { drawMap(); show('map'); });
  }
  showResult(r);
}

$('quitBtn').onclick = () => {
  Sound.play('click');
  if (!confirm('대결을 그만할까요?')) return;
  state.busy = true;
  state.battleId++;
  if (state.mode === 'solo') { drawMap(); show('map'); } else show('home');
};
