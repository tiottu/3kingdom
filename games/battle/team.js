// 삼국지 꼬마 장수 - 장수 대결 화면: 장수 5명 고르기, 컴퓨터 대결, 한 판씩 보여 주기
// 다른 게임(땅따먹기 공격·수비, 둘이 하기)은 openTeamCustom 으로 이 화면을 빌려 쓴다. 이 파일은 그 게임들의 함수를 부르지 않는다.

// ---------- 상태 ----------
const team = {
  mode: 'cpu', // cpu, 또는 빌려 쓰는 게임이 정한 이름 (online, map, defense ...)
  lineup: [],
  filter: '전체',
  cpuLevel: 2,
  custom: null, // 빌려 쓰는 게임의 설정 (openTeamCustom 참고). 컴퓨터 대결이면 null
  running: false
};
const myName = () => (account ? account.nick : '나');

$('btnCpu').onclick = () => { Sound.play('click'); openTeam('cpu'); };

// 도감의 자세히 보기 창에 병종과 상성을 한 줄 더한다
dexUi.info.push(troopLine);

// ---------- 장수 고르기 (최대 5명, 고른 순서대로 1번~5번) ----------
// 컴퓨터 대결
function openTeam(mode) {
  team.mode = mode;
  if (mode === 'cpu') team.custom = null;
  team.lineup = team.lineup.filter((id) => save.unlocked.includes(id)).slice(0, TEAM_MAX);
  $('teamMsg').textContent = '';
  drawTeam();
  show('team');
}

// 다른 게임이 이 화면을 빌려 쓸 때. opts (모두 골라 쓰기, goText·onGo·onBack 은 꼭):
//   title, info(HTML), max(고를 수), blocked({장수: 성 이름}), blockedTip, allowEmpty(0명도 됨),
//   goText(n) 버튼 글, onGo(lineup) 버튼을 누르면 (async, 던진 오류는 errText 로 보여 줌), onBack() 뒤로,
//   afterDraw() 화면을 그린 뒤 (예: 기다리는 중 표시),
//   onResult(res) 대결이 끝나면 (있으면 결과 창 대신 이것만), resultButtons() 기본 결과 창의 버튼 [[글, 색, 할 일], ...]
function openTeamCustom(mode, opts, lineup) {
  if (lineup) team.lineup = lineup.slice();
  team.mode = mode;
  team.custom = opts;
  team.lineup = team.lineup.filter((id) => save.unlocked.includes(id)).slice(0, TEAM_MAX);
  $('teamMsg').textContent = '';
  drawTeam();
  show('team');
}
const isCustom = () => !!team.custom;

function drawTeam() {
  const custom = team.custom;
  $('teamTitle').textContent = custom ? custom.title : '컴퓨터와 장수 대결';
  $('teamInfo').innerHTML = custom ? custom.info || '' : '';
  $('teamWait').style.display = 'none';
  $('teamPicker').style.display = '';
  $('teamLevels').innerHTML = '';
  if (team.mode === 'cpu') {
    for (const k of [1, 2, 3]) {
      const c = document.createElement('button');
      c.className = 'level-chip' + (team.cpuLevel === k ? ' on' : '');
      c.textContent = `컴퓨터 ${LEVELS[k].name}`;
      c.onclick = () => { Sound.play('click'); team.cpuLevel = k; drawTeam(); };
      $('teamLevels').appendChild(c);
    }
  }
  // 고른 장수 자리 (보통 5개, 성 수비는 성 등급만큼)
  const max = (custom && custom.max) || TEAM_MAX;
  const blocked = (custom && custom.blocked) || {};
  team.lineup = team.lineup.filter((id) => !blocked[id]).slice(0, max);
  $('teamSlots').innerHTML = '';
  $('teamSlots').style.gridTemplateColumns = `repeat(${max}, 1fr)`;
  for (let i = 0; i < max; i++) {
    const id = team.lineup[i];
    const s = document.createElement('button');
    s.className = 'slot' + (id ? ' filled' : '');
    s.innerHTML = id
      ? `${drawGeneral(id)}<b>${i + 1}. ${GENERALS[id].name}</b><small>${TROOPS[troopOf(id)].icon} 힘 ${basePower(id)}</small>`
      : `<span class="slot-num">${i + 1}</span><small>빈 자리</small>`;
    if (id) s.onclick = () => { Sound.play('click'); team.lineup.splice(i, 1); drawTeam(); };
    $('teamSlots').appendChild(s);
  }
  drawFilter($('teamFilter'), team.filter, (f) => { team.filter = f; drawTeam(); });
  // 내가 모은 장수 (힘이 센 순서)
  const ids = save.unlocked.filter((id) => team.filter === '전체' || groupOf(id) === team.filter)
    .sort((a, b) => basePower(b) - basePower(a));
  $('teamGrid').innerHTML = '';
  for (const id of ids) {
    const n = team.lineup.indexOf(id);
    const c = document.createElement('button');
    c.className = 'card' + (n >= 0 ? ' chosen' : '') + (blocked[id] ? ' taken' : '');
    c.innerHTML = (n >= 0 ? `<span class="badge">${n + 1}</span>` : '') + drawGeneral(id) +
      `<b>${GENERALS[id].name}</b><small>${TROOPS[troopOf(id)].icon} ${TROOPS[troopOf(id)].name} · 힘 ${basePower(id)}</small>` +
      (blocked[id] ? `<small class="busy">🛡️ ${blocked[id]} 수비 중</small>` : '');
    c.onclick = () => {
      Sound.play('click');
      if (blocked[id]) { $('teamMsg').textContent = `${josa(GENERALS[id].name, '은', '는')} 지금 ${blocked[id]} 성을 지키고 있어요. ${custom.blockedTip || '한 장수는 한 성만 지킬 수 있어요.'}`; return; }
      if (n >= 0) team.lineup.splice(n, 1);
      else if (team.lineup.length < max) team.lineup.push(id);
      else { $('teamMsg').textContent = `장수는 ${max}명까지예요. 위의 자리를 눌러 빼고 골라요.`; return; }
      $('teamMsg').textContent = '';
      drawTeam();
    };
    $('teamGrid').appendChild(c);
  }
  $('teamGo').disabled = !team.lineup.length && !(custom && custom.allowEmpty);
  const n = team.lineup.length;
  $('teamGo').textContent = custom ? custom.goText(n) : `⚔️ 이 ${n}명으로 대결!`;
  if (custom && custom.afterDraw) custom.afterDraw();
}

$('teamBack').onclick = () => {
  Sound.play('click');
  if (isCustom()) { team.custom.onBack(); return; }
  show('home');
};

$('teamGo').onclick = async () => {
  if (!team.lineup.length && !(isCustom() && team.custom.allowEmpty)) return;
  Sound.play('click');
  if (isCustom()) {
    $('teamGo').disabled = true;
    try { await team.custom.onGo(team.lineup.slice()); } catch (e) { $('teamMsg').textContent = errText(e); }
    $('teamGo').disabled = false;
    return;
  }
  runClash(team.lineup.slice(), cpuLineup(team.cpuLevel), '컴퓨터');
};

// 컴퓨터 장수: 쉬움은 약한 장수 중에서, 어려움은 센 장수 중에서
function cpuLineup(level) {
  const all = Object.keys(GENERALS).sort((a, b) => basePower(a) - basePower(b));
  const pool = level === 1 ? all.slice(0, 50) : level === 2 ? all.slice(25, 85) : all.slice(60);
  return shuffle(pool).slice(0, TEAM_MAX);
}

// ---------- 대결 보여 주기 ----------
const MAX_ENERGY = 54; // 막대 길이 기준 (가장 센 장수 36 × 1.5)

// 한 장수의 모습과 에너지: 싸우기 전(e) → 상성 반영(p) → 남은 에너지(after)
function sideHtml(id, e, p, after, cls) {
  const t = TROOPS[troopOf(id)];
  const bar = (v, c) => `<span class="ebar"><i style="width:${Math.min(100, v / MAX_ENERGY * 100)}%;background:${c}"></i></span>`;
  return `<div class="side ${cls}${after === 0 ? ' out' : ''}">${drawGeneral(id)}<b>${gname(id)}</b>` +
    `<small>${t.icon} ${t.name}</small>` +
    `<small>⚡ ${e}${p !== e ? ` → 💥${p}` : ''}</small>${bar(p, '#f4c430')}` +
    `<small class="after">${after > 0 ? `남은 ⚡ ${after}` : '물러났어요'}</small>${bar(after, '#3fa34d')}</div>`;
}

// 위쪽 줄: 양쪽 장수 순서, 물러난 장수는 흐리게
function drawQueue(A, B, i, j) {
  const row = (L, k, cls) => `<div class="queue ${cls}">` + L.map((id, n) =>
    `<span class="q${n < k ? ' out' : n === k ? ' now' : ''}">${drawGeneral(id)}<small>${TROOPS[troopOf(id)].icon}</small></span>`).join('') + '</div>';
  $('clashQueue').innerHTML = row(A, i, 'mine') + row(B, j, 'theirs');
}

async function runClash(A, B, oppName, wall = 0) {
  team.running = true;
  const res = fight(A, B, wall);
  $('clashNames').innerHTML = `<span class="me">${myName()}</span> <b>VS</b> <span class="you">${oppName}</span>`;
  $('clashScore').textContent = `남은 장수 ${A.length} : ${B.length}`;
  $('clashRounds').innerHTML = '';
  let i = 0, j = 0;
  drawQueue(A, B, i, j);
  show('clash');
  for (let n = 0; n < res.duels.length; n++) {
    await wait(n ? 1500 : 600);
    const d = res.duels[n];
    const ia = TROOPS[troopOf(d.a)].icon, ib = TROOPS[troopOf(d.b)].icon;
    const edge = d.edge > 0 ? `${ia} > ${ib} 상성 유리! 힘 +50%`
      : d.edge < 0 ? `${ib} > ${ia} 상대가 상성 유리` : '상성은 같아요';
    const verdict = d.win > 0 ? `⭕ ${gname(d.a)} 승리!<br>남은 힘으로 다음 상대와 싸워요`
      : d.win < 0 ? `❌ ${gname(d.b)} 승리` : '🤝 똑같아서 둘 다 물러났어요';
    if (d.win >= 0) j++;
    if (d.win <= 0) i++;
    const row = document.createElement('div');
    row.className = 'round ' + (d.win > 0 ? 'won' : d.win < 0 ? 'lost' : 'draw');
    row.innerHTML = sideHtml(d.a, d.ea, d.pa, d.win > 0 ? d.left : 0, 'left') +
      `<div class="mid"><b>${n + 1}번째 싸움</b><small>${edge}</small><span>${verdict}</span></div>` +
      sideHtml(d.b, d.eb, d.pb, d.win < 0 ? d.left : 0, 'right');
    $('clashRounds').appendChild(row);
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    Sound.play(d.win > 0 ? 'correct' : d.win < 0 ? 'wrong' : 'click');
    drawQueue(A, B, i, j);
    $('clashScore').textContent = `남은 장수 ${A.length - i} : ${B.length - j}`;
  }
  await wait(1000);
  clashResult(res, oppName);
}

// 내 쪽에서 가장 많이 이긴 장수
function bestOf(res) {
  const wins = {};
  res.duels.forEach((d) => { if (d.win > 0) wins[d.a] = (wins[d.a] || 0) + 1; });
  return Object.keys(wins).sort((x, y) => wins[y] - wins[x])[0] || (res.duels[0] && res.duels[0].a);
}

function clashResult(res, oppName) {
  const custom = team.custom;
  if (custom && custom.onResult) { team.running = false; custom.onResult(res); return; }
  const mvp = bestOf(res);
  const mvpText = mvp ? ` 오늘의 장수는 ${gname(mvp)}!` : '';
  let title, text;
  if (res.winner > 0) {
    Sound.play('win');
    const gift = unlockWinFriend();
    writeSave();
    title = `🎉 이겼어요! 남은 장수 ${res.la}명`;
    text = `${oppName}: "항복할게요~ 다음엔 꼭 이길 거예요!"` + mvpText +
      (gift ? ` 🎊 이긴 기념으로 새 친구 ${josa(GENERALS[gift].name, '이', '가')} 왔어요!` : '');
  } else if (res.winner < 0) {
    Sound.play('lose');
    title = `조금만 더 힘내요! (상대 남은 장수 ${res.lb}명)`;
    text = `${oppName}의 승리예요. 상성을 생각해서 순서를 바꿔 보면 이길 수 있어요 💪`;
  } else {
    Sound.play('click');
    title = '🤝 비겼어요!';
    text = '마지막 장수끼리 힘이 똑같아서 둘 다 물러났어요. 정말 막상막하!';
  }
  const buttons = custom && custom.resultButtons ? custom.resultButtons()
    : [['🔁 다시 하기', 'orange', () => openTeam('cpu')], ['🏠 처음으로', 'gray', () => show('home')]];
  team.running = false;
  showResult({ pic: mvp ? drawGeneral(mvp) : '', title, text, buttons, delay: 300 });
}
