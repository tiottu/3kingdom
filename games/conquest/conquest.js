// 삼국지 꼬마 장수 - 땅따먹기 진행: 공격, 수비 장수, 컴퓨터 나라 차례, 첫 화면
// 중국 지도에서 성을 차지하면 그 지역 장수가 내 도감에 들어온다
// 혼자 하기(컴퓨터 나라와, 한 턴에 3번 공격) / 친구들과(각자 핸드폰, 하루 3번 공격)
// 싸움은 장수 5명 상성 대결(games/battle/rules.js 의 fight). 주인 없는 성은 그 지역 장수가, 주인 있는 성은 수비 장수가 지킨다.

const CITY = {};
CITIES.forEach((c) => { CITY[c.id] = c; });
const NEAR = {};
ROADS.forEach(([a, b]) => { (NEAR[a] = NEAR[a] || []).push(b); (NEAR[b] = NEAR[b] || []).push(a); });

// 땅따먹기에서만 나오는 서버 오류 문구 (같이 쓰는 문구는 core/server.js)
Object.assign(ERRORS, {
  NO_MAP: '그런 지도가 없어요. 지도 번호를 다시 확인해 주세요.',
  MAP_FULL: '이 지도에는 이미 4명이 있어요.',
  NO_BASE: '지도에 빈 성이 없어서 들어갈 수 없어요.',
  NOT_MINE: '내 성에서만 출발할 수 있어요. 지도를 다시 볼까요?',
  NOT_NEAR: '길로 이어진 성만 공격할 수 있어요.',
  NO_MOVES: '오늘 공격 3번을 다 했어요. 내일 또 해요! 🌙',
  TOO_MANY: '이 성은 그보다 적은 장수만 지킬 수 있어요.',
  BUSY: '다른 성을 지키고 있는 장수가 있어요. 한 장수는 한 성만 지킬 수 있어요.',
  DEFENDING: '성을 지키는 장수는 공격에 나갈 수 없어요. 먼저 그 성의 수비에서 빼 주세요.'
});

// 도감의 "못 만난 장수" 창에 만나는 방법을 더한다
dexUi.how.push((id) => {
  const city = CITIES.find((x) => x.gens.includes(id));
  return city ? `또는 🗺️ 땅따먹기에서 ${city.name} 성을 차지하면 만나요` : '';
});

const FACTIONS = {
  shu: { name: '촉나라', lord: 'liubei', capital: 'chengdu', color: '#3fa34d' },
  wei: { name: '위나라', lord: 'caocao', capital: 'xuchang', color: '#3b7dd8' },
  wu: { name: '오나라', lord: 'sunquan', capital: 'jianye', color: '#e74c3c' }
};
const PLAYER_COLORS = ['#3b7dd8', '#e67e22', '#8e44ad', '#16a085'];
const NEUTRAL_COLOR = '#b3b9c2';
const MOVES = 3; // 혼자: 한 턴에, 친구들과: 하루에
const CQ_LV = {
  1: { name: '쉬움', moves: 1, calm: 6, smart: false },
  2: { name: '보통', moves: 1, calm: 3, smart: true },
  3: { name: '어려움', moves: 2, calm: 1, smart: true }
};

// 이 장수를 이기는 병종
const counterOf = (id) => Object.keys(TROOPS).find((k) => TROOPS[k].beats === troopOf(id));
const bestFive = (ids) => ids.slice().sort((a, b) => basePower(b) - basePower(a)).slice(0, TEAM_MAX);
const cityTeam = (id) => CITY[id].gens.slice(0, TEAM_MAX);

const mapUi = { mode: null, sel: null, target: null, poll: null, soloLevel: 1 };
let solo = null; // { me, level, turn, used, owners, defense, log }
let net = null;  // 서버에서 받은 지도

// 성을 차지하면 그 성의 장수가 도감에 들어온다
function gainCity(id) {
  const fresh = CITY[id].gens.filter((g) => !save.unlocked.includes(g));
  save.unlocked.push(...fresh);
  writeSave();
  return fresh;
}

// ---------- 혼자 하기 저장 ----------
const soloKey = () => 'samguk-conquest:' + (account ? account.nick : '손님');
function soloSave() { try { localStorage.setItem(soloKey(), JSON.stringify(solo)); } catch (e) { /* 계속 */ } }
function soloLoad() { try { return JSON.parse(localStorage.getItem(soloKey())); } catch (e) { return null; } }
function soloClear() { try { localStorage.removeItem(soloKey()); } catch (e) { /* 계속 */ } }
function soloLog(t) { solo.log.unshift(t); solo.log = solo.log.slice(0, 8); }

// ---------- 공격 ----------
function startAttack() {
  Sound.play('click');
  const from = mapUi.sel, to = mapUi.target;
  const M = model();
  const o = M.owners[to] || null;
  const G = CITY_GRADES[CITY[to].grade];
  const wallText = `${G.name}이라 지키는 장수 ${G.slots}명, 성벽 덕분에 에너지 +${G.wall}%`;
  const info = o === null
    ? `🛡️ ${CITY[to].name}: ${wallText}. 이 순서로 나와요<br>` +
      garrison(to, cityTeam(to)).map((g, i) => `<b>${i + 1}. ${gname(g)}${TROOPS[troopOf(g)].icon}</b> (${TROOPS[counterOf(g)].icon}${TROOPS[counterOf(g)].name}이 강해요)`).join(' · ') +
      '<br>💡 상대 1번을 이기는 병종을 내 1번에 넣으면 유리해요!'
    : `🛡️ <b>${M.name(o)}</b>의 성: ${wallText}. 누가 지키는지는 비밀!`;
  // 내 성을 지키는 장수는 공격에 못 나간다 (먼저 그 성 수비에서 빼야 한다)
  const busy = busyGenerals(myDefs(), M.owners, M.me, null);
  openTeamCustom('map', {
    title: `⚔️ ${CITY[to].name} 성 공격`,
    info: info + (Object.keys(busy).length ? '<br>🛡️ 성을 지키는 장수는 공격에 나갈 수 없어요. 내보내려면 그 성의 수비에서 먼저 빼 주세요.' : ''),
    blocked: busy,
    blockedTip: '공격에 내보내려면 먼저 그 성의 수비에서 빼 주세요.',
    goText: (n) => `⚔️ 이 ${n}명으로 공격!`,
    onBack: backToMap,
    onGo: (lineup) => doAttack(from, to, lineup),
    onResult: () => {}
  }, team.lineup.length ? team.lineup : bestFive(save.unlocked.filter((g) => !busy[g])));
}

// 혼자 하기에서 그 성을 지키는 장수
function soloDefense(owner, cityId) {
  if (!owner) return garrison(cityId, cityTeam(cityId));
  if (owner === solo.me) return cityDefense(myDefs(), solo.owners, solo.me, cityId);
  return garrison(cityId, cityTeam(cityId)); // 컴퓨터 나라의 성은 그 지역 장수가 지킨다
}
const armyOf = (k) => CITIES.filter((c) => solo.owners[c.id] === k).flatMap((c) => c.gens);

async function doAttack(from, to, lineup) {
  if (mapUi.mode === 'solo') {
    const o = solo.owners[to] || null;
    const def = soloDefense(o, to);
    solo.used++;
    soloSave();
    team.custom.onResult = (res) => finishAttack(to, res.winner > 0);
    runClash(lineup, def, o ? FACTIONS[o].name : CITY[to].name + ' 성', wallOf(to));
    return;
  }
  $('teamMsg').textContent = '공격하러 가는 중…';
  await pushNow(); // 서버가 "내가 모은 장수"인지 확인하므로 먼저 올린다
  const r = await rpc('samguk_map_attack', { p_token: account.token, p_code: net.code, p_from: from, p_to: to, p_lineup: lineup });
  $('teamMsg').textContent = '';
  team.custom.onResult = () => finishAttack(to, r.win);
  runClash(lineup, r.def_lineup, r.def_name, wallOf(to));
}

async function finishAttack(to, win) {
  let fresh = [];
  if (win) {
    if (mapUi.mode === 'solo') solo.owners[to] = solo.me;
    fresh = gainCity(to);
    mapUi.sel = to;
    Sound.play('win');
  } else Sound.play('lose');
  mapUi.target = null;
  if (mapUi.mode === 'solo') {
    soloLog(win ? `🎉 ${CITY[to].name} 성을 차지했어요!` : `😢 ${CITY[to].name} 성을 차지하지 못했어요.`);
    soloSave();
  } else {
    try { await netLoad(net.code); } catch (e) { /* 다음에 다시 */ }
  }
  showResult({
    many: true,
    pic: (fresh.length ? fresh : CITY[to].gens).slice(0, 5).map((g) => drawGeneral(g)).join(''),
    title: win ? `🎉 ${CITY[to].name} 성을 차지했어요!` : '아쉬워요!',
    text: fresh.length
      ? `새 친구 ${josa(fresh.map((g) => GENERALS[g].name).join(', '), '이', '가')} 도감에 들어왔어요! 🤝`
      : win ? '이 성의 장수들은 이미 내 친구예요.' : '상성을 생각해서 순서를 바꿔 다시 도전해 봐요 💪',
    buttons: [['🗺️ 지도로', 'blue', backToMap]]
  });
}

function backToMap() {
  show('conquest');
  drawConquest();
  if (mapUi.mode === 'solo') checkSoloEnd();
}

// ---------- 수비 장수 ----------
// 성마다 따로 정한다. 한 장수는 한 성만 지킬 수 있다.
// 정하지 않은 성은 그 성의 지역 장수(다른 성을 지키는 장수는 빼고)와 수비병이 지킨다.
function myDefs() {
  const d = mapUi.mode === 'solo' ? solo.defense : net.defense;
  return d && !Array.isArray(d) ? d : {};
}
// 다른 성(내가 아직 가진 성)을 지키는 장수: { 장수: 성 이름 }
function busyGenerals(defs, owners, me, except) {
  const busy = {};
  for (const [c, l] of Object.entries(defs)) {
    if (c === except || owners[c] !== me) continue;
    l.forEach((g) => { busy[g] = CITY[c].name; });
  }
  return busy;
}
function cityDefense(defs, owners, me, cityId) {
  if ((defs[cityId] || []).length) return garrison(cityId, defs[cityId]);
  const busy = busyGenerals(defs, owners, me, cityId);
  return garrison(cityId, cityTeam(cityId).filter((g) => !busy[g]));
}
const myCityDefense = (cityId) => { const M = model(); return cityDefense(myDefs(), M.owners, M.me, cityId); };

function openDefense(cityId) {
  const M = model();
  const G = CITY_GRADES[CITY[cityId].grade];
  const defs = myDefs();
  const blocked = busyGenerals(defs, M.owners, M.me, cityId);
  const now = (defs[cityId] || []).length ? defs[cityId]
    : cityTeam(cityId).filter((g) => !blocked[g] && save.unlocked.includes(g));
  openTeamCustom('defense', {
    title: `🛡️ ${CITY[cityId].name} 수비 장수`,
    max: G.slots,
    blocked,
    info: `${G.name}이라 <b>${G.slots}명</b>까지 지킬 수 있어요 (성벽 에너지 +${G.wall}%). 고른 순서대로 지켜요. 상대에게는 비밀이에요!<br>` +
      '한 장수는 한 성만 지킬 수 있어요. 다른 성을 지키는 장수는 고를 수 없어요. 모자란 자리는 수비병이 채워요.',
    allowEmpty: true,
    goText: (n) => (n ? `🛡️ 이 ${n}명으로 ${CITY[cityId].name} 지키기` : '🛡️ 수비 장수 모두 빼기 (지역 장수·수비병이 지켜요)'),
    onBack: backToMap,
    onResult: () => {},
    onGo: async (lineup) => {
      if (mapUi.mode === 'solo') {
        solo.defense = Object.assign({}, myDefs(), { [cityId]: lineup });
        soloSave();
      } else {
        await pushNow();
        await rpc('samguk_map_defense', { p_token: account.token, p_code: net.code, p_city: cityId, p_lineup: lineup });
        net.defense = Object.assign({}, myDefs(), { [cityId]: lineup });
      }
      mapUi.sel = cityId;
      backToMap();
    }
  }, now);
}

$('cqDefense').onclick = () => {
  Sound.play('click');
  if (mapUi.sel && model().owners[mapUi.sel] === model().me) { openDefense(mapUi.sel); return; }
  mapUi.target = null;
  drawConquest();
  $('cqPanel').insertAdjacentHTML('afterbegin', '<p class="msg">🛡️ 수비 장수를 정할 <b>내 성(★)</b>을 먼저 눌러 주세요. 성마다 따로 정해요.</p>');
};

// ---------- 혼자 하기: 컴퓨터 나라 차례 ----------
$('cqEnd').onclick = () => {
  Sound.play('click');
  const L = CQ_LV[solo.level];
  for (const k of Object.keys(FACTIONS)) {
    if (k === solo.me) continue;
    for (let i = 0; i < L.moves; i++) {
      const mv = cpuMove(k, L);
      if (!mv) break;
      const [from, to] = mv;
      const o = solo.owners[to] || null;
      const atk = L.smart ? bestFive(armyOf(k)) : shuffle(armyOf(k)).slice(0, TEAM_MAX);
      const res = fight(atk, soloDefense(o, to), wallOf(to));
      if (res.winner > 0) {
        solo.owners[to] = k;
        if (solo.defense && !Array.isArray(solo.defense)) delete solo.defense[to]; // 빼앗긴 성의 수비 장수는 풀려난다
        soloLog(o === solo.me ? `😮 ${FACTIONS[k].name}가 내 ${CITY[to].name} 성을 가져갔어요. 다시 찾아와요!`
          : `${FACTIONS[k].name}가 ${CITY[from].name}에서 ${CITY[to].name} 성을 차지했어요.`);
      } else if (o === solo.me) {
        soloLog(`🛡️ ${FACTIONS[k].name}가 내 ${CITY[to].name} 성에 왔지만 수비 장수들이 지켜 냈어요!`);
      }
    }
  }
  solo.turn++;
  solo.used = 0;
  soloLog(`⏭️ ${solo.turn}번째 턴! 공격을 ${MOVES}번 할 수 있어요.`);
  mapUi.sel = mapUi.target = null;
  soloSave();
  drawConquest();
  checkSoloEnd();
};

function cpuMove(k, L) {
  const cand = [];
  for (const c of CITIES) {
    if (solo.owners[c.id] !== k) continue;
    for (const n of NEAR[c.id]) {
      const o = solo.owners[n] || null;
      if (o === k) continue;
      if (o === solo.me && solo.turn < L.calm) continue; // 처음 몇 턴은 나를 공격하지 않는다
      cand.push([c.id, n, o]);
    }
  }
  if (!cand.length) return null;
  const free = cand.filter((x) => x[2] === null);
  const pool = free.length && Math.random() < 0.7 ? free : cand; // 주로 빈 성부터
  const m = pool[rand(0, pool.length - 1)];
  return [m[0], m[1]];
}

function checkSoloEnd() {
  const M = model();
  const mine = myCityCount(M);
  if (mine !== CITIES.length && mine !== 0) return;
  Sound.play(mine ? 'win' : 'lose');
  soloClear();
  showResult({
    pic: drawGeneral(FACTIONS[solo.me].lord),
    title: mine ? '🎉 천하통일!' : '모든 성을 잃었어요',
    text: mine ? `${solo.turn}번째 턴에 ${CITIES.length}개 성을 모두 차지했어요! 정말 멋진 장수예요!`
      : '괜찮아요! 모은 장수는 도감에 그대로 있어요. 다시 도전해요 💪',
    buttons: [['🗺️ 새로 시작', 'green', openMapHome], ['🏠 처음으로', 'gray', () => show('home')]]
  });
}

// ---------- 땅따먹기 첫 화면 ----------
$('btnMap').onclick = () => { Sound.play('click'); openMapHome(); };
$('cqExit').onclick = () => { Sound.play('click'); stopMapPoll(); openMapHome(); };

function openMapHome() {
  stopMapPoll();
  // 혼자 하기
  const old = soloLoad();
  $('soloContinue').innerHTML = '';
  if (old && old.owners) {
    const b = document.createElement('button');
    b.className = 'big-btn green';
    const n = CITIES.filter((c) => old.owners[c.id] === old.me).length;
    b.innerHTML = `▶ 이어서 하기<small>${FACTIONS[old.me].name} · ${old.turn}번째 턴 · 내 성 ${n}개</small>`;
    b.onclick = () => { Sound.play('click'); solo = old; if (Array.isArray(solo.defense)) solo.defense = {}; startMap('solo'); };
    $('soloContinue').appendChild(b);
  }
  $('soloCqLevels').innerHTML = '';
  for (const k of [1, 2, 3]) {
    const c = document.createElement('button');
    c.className = 'level-chip' + (mapUi.soloLevel === k ? ' on' : '');
    c.textContent = `컴퓨터 ${CQ_LV[k].name}`;
    c.onclick = () => { Sound.play('click'); mapUi.soloLevel = k; openMapHome(); };
    $('soloCqLevels').appendChild(c);
  }
  $('soloFactions').innerHTML = '';
  for (const [key, f] of Object.entries(FACTIONS)) {
    const c = document.createElement('button');
    c.className = 'card';
    c.style.borderColor = f.color;
    c.innerHTML = drawGeneral(f.lord) + `<b>${f.name}</b><small>${GENERALS[f.lord].name} · ${CITY[f.capital].name}에서 시작</small>`;
    c.onclick = () => {
      if (old && old.owners && !confirm('새로 시작하면 하던 판은 지워져요. 새로 할까요?')) return;
      Sound.play('click');
      newSolo(key);
    };
    $('soloFactions').appendChild(c);
  }
  drawNetBox();
  show('mapHome');
}

function newSolo(me) {
  solo = { me, level: mapUi.soloLevel, turn: 1, used: 0, owners: {}, defense: {}, log: [] };
  for (const [k, f] of Object.entries(FACTIONS)) solo.owners[f.capital] = k;
  const fresh = gainCity(FACTIONS[me].capital);
  soloLog(`🚩 ${FACTIONS[me].name}의 이야기가 ${CITY[FACTIONS[me].capital].name}에서 시작됐어요!` +
    (fresh.length ? ` 새 친구: ${fresh.map((g) => GENERALS[g].name).join(', ')}` : ''));
  soloSave();
  startMap('solo');
}

function startMap(mode) {
  mapUi.mode = mode;
  mapUi.sel = mapUi.target = null;
  show('conquest');
  drawConquest();
  // 핸드폰처럼 화면이 좁으면 지도를 내 성 쪽으로 옮겨 보여 준다
  const M = model();
  const home = CITIES.find((c) => M.owners[c.id] === M.me);
  const box = $('cqMap'), svg = box.querySelector('svg');
  if (home && svg) box.scrollLeft = Math.max(0, home.x / MAP_W * svg.clientWidth - box.clientWidth / 2);
  if (mode === 'net') {
    stopMapPoll();
    mapUi.poll = setInterval(async () => {
      if (!document.getElementById('conquest').classList.contains('active')) return;
      try { await netLoad(net.code); drawConquest(); } catch (e) { /* 다음에 다시 */ }
    }, 5000);
  }
}
function stopMapPoll() { clearInterval(mapUi.poll); mapUi.poll = null; }
