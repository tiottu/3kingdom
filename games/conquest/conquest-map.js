// 삼국지 꼬마 장수 - 땅따먹기 지도 그리기와 아래 안내판

// ---------- 지도 모양(혼자/친구들 공통) ----------
function model() {
  if (mapUi.mode === 'solo') {
    return {
      owners: solo.owners, me: solo.me,
      color: (k) => (k ? FACTIONS[k].color : NEUTRAL_COLOR),
      name: (k) => (k ? FACTIONS[k].name + (k === solo.me ? ' (나)' : '') : '주인 없는 성'),
      left: MOVES - solo.used
    };
  }
  const P = {};
  net.players.forEach((p) => { P[p.id] = p; });
  return {
    owners: net.owners, me: net.me,
    color: (k) => (k && P[k] ? PLAYER_COLORS[P[k].color % PLAYER_COLORS.length] : NEUTRAL_COLOR),
    name: (k) => (k && P[k] ? P[k].nick + (k === net.me ? ' (나)' : '') : '주인 없는 성'),
    left: net.max - net.used
  };
}
const myCityCount = (M) => CITIES.filter((c) => M.owners[c.id] === M.me).length;

// 산 그림 (big 이면 나라 바깥의 높은 산이라 조금 크게)
function mountains(list, big) {
  return list.map(([x, y], i) => {
    x += (i * 7) % 9 - 4; y += (i * 5) % 7 - 3; const k = (i % 3 === 0 ? 1.25 : 1) * (big ? 1.2 : 1);
    return `<g class="mt" transform="translate(${x},${y}) scale(${k})"><path d="M-14,8 L-3,-10 L8,8 Z" class="mt1"/><path d="M-3,-10 L8,8 L2,8 Z" class="mt2"/><path d="M-7,-2 L-3,-10 L1,-2 L-1,0 L-3,-3 L-5,0 Z" class="mt3"/><path d="M0,8 L8,-3 L16,8 Z" class="mt1"/></g>`;
  }).join('');
}
function drawConquest() {
  const M = model();
  const sel = mapUi.sel;
  const near = sel ? NEAR[sel] : [];
  let s = `<svg viewBox="0 0 ${MAP_W} ${MAP_H}" class="cq-svg">` +
    `<defs><pattern id="sand" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r="1.3" fill="#c9a86a"/><circle cx="10" cy="11" r="1" fill="#c9a86a"/></pattern></defs>` +
    `<rect width="${MAP_W}" height="${MAP_H}" fill="#e3d3ad"/><path d="${MAP_SEA}" fill="#cfe9f7"/>` +
    `<path d="${MAP_DESERT}" fill="#eedcae"/><path d="${MAP_DESERT}" fill="url(#sand)"/>` + mountains(MAP_MOUNTAINS_OUT, 1) +
    [MAP_LAND, MAP_LAND2].map((d) => `<path d="${d}" fill="#f6e7bd" stroke="#d9c48f" stroke-width="3"/>`).join('');
  for (const r of MAP_RIVERS) {
    s += `<path d="${r.d}" fill="none" stroke="#7fc4ea" stroke-width="7" stroke-linecap="round"/><text x="${r.x}" y="${r.y}" class="river">${r.name}</text>`;
  }
  s += mountains(MAP_MOUNTAINS);
  for (const l of MAP_LABELS) s += `<text x="${l.x}" y="${l.y}" class="region${l.v ? ' v' : ''}">${l.name}</text>`;
  for (const b of MAP_TRIBES) s += `<text x="${b.x}" y="${b.y}" class="tribe">⛺${b.name}</text>`;
  for (const [a, b] of ROADS) {
    const A = CITY[a], B = CITY[b];
    const hot = sel && (a === sel || b === sel);
    const sea = SEA_ROUTES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    s += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="road${sea ? ' sea' : ''}${hot ? ' hot' : ''}"/>`;
    if (sea) s += `<text x="${(A.x + B.x) / 2}" y="${(A.y + B.y) / 2 - 8}" class="ship">⛵ 뱃길</text>`;
  }
  for (const c of CITIES) {
    const o = M.owners[c.id] || null;
    const cls = ['city'];
    if (o === M.me) cls.push('mine');
    if (c.id === sel) cls.push('sel');
    if (near.includes(c.id) && o !== M.me) cls.push('near');
    if (c.id === mapUi.target) cls.push('target');
    s += `<g class="${cls.join(' ')}" data-id="${c.id}" transform="translate(${c.x},${c.y})">` +
      (c.grade === 3 ? `<circle r="27" class="wall"/>` : '') +
      `<circle r="${[0, 15, 19, 22][c.grade]}" fill="${M.color(o)}"/><text class="cnum" y="6">${o === M.me ? '★' : CITY_GRADES[c.grade].slots}</text>` +
      `<text class="cname" y="${[0, 34, 38, 44][c.grade]}">${c.grade === 3 ? '🏯' : ''}${c.name}</text></g>`;
  }
  s += raidMarks(); // 이번 턴 오랑캐 공격 (conquest-tribes.js)
  $('cqMap').innerHTML = s + '</svg>';
  $('cqMap').querySelectorAll('.city').forEach((g) => { g.onclick = () => clickCity(g.dataset.id); });

  const mine = myCityCount(M);
  $('cqStatus').innerHTML = mapUi.mode === 'solo'
    ? `<b style="color:${FACTIONS[solo.me].color}">${FACTIONS[solo.me].name}</b> · ${solo.turn}번째 턴 · 내 성 <b>${mine}</b>/${CITIES.length} · 이번 턴 공격 <b>${M.left}</b>번 남음`
    : `🗺️ 지도 <b>${net.code}</b> · 내 성 <b>${mine}</b>/${CITIES.length} · 오늘 공격 <b>${M.left}</b>번 남음`;
  $('cqEnd').style.display = mapUi.mode === 'solo' ? '' : 'none';
  drawPanel();
  drawRank();
  drawLog();
}

function clickCity(id) {
  Sound.play('click');
  const M = model();
  if (M.owners[id] === M.me) { mapUi.sel = mapUi.sel === id ? null : id; mapUi.target = null; }
  else if (mapUi.sel && NEAR[mapUi.sel].includes(id)) mapUi.target = id;
  else { mapUi.sel = null; mapUi.target = id; }
  drawConquest();
}

function cityBox(id) {
  const M = model();
  const c = CITY[id], o = M.owners[id] || null;
  const G = CITY_GRADES[c.grade];
  return `<div class="cq-city"><b class="cq-cname">${c.name}</b> <span class="tag" style="color:${M.color(o)}">${M.name(o)}</span> ` +
    `<span class="tag grade g${c.grade}">${c.grade === 3 ? '🏯 ' : ''}${G.name} · 수비 ${G.slots}명 · 성벽 에너지 +${G.wall}%</span>` +
    `<p>${c.desc}</p><p class="cq-label">이 지역 장수 (차지하면 친구가 돼요)</p><div class="cq-gens">` +
    c.gens.map((g) => `<span class="cq-gen${save.unlocked.includes(g) ? '' : ' mono'}">${drawGeneral(g)}<small>${GENERALS[g].name}<br>${TROOPS[troopOf(g)].icon}</small></span>`).join('') +
    '</div></div>';
}

function drawPanel() {
  const M = model();
  const { sel, target } = mapUi;
  const p = $('cqPanel');
  if (target) {
    let h = cityBox(target);
    if (sel && NEAR[sel].includes(target) && M.owners[target] !== M.me) {
      h += M.left > 0
        ? `<button class="big-btn orange" id="cqAttack">⚔️ ${CITY[sel].name}에서 ${CITY[target].name} 공격하기</button>`
        : `<p class="cq-help">${mapUi.mode === 'solo' ? '이번 턴 공격을 다 했어요. "⏭️ 턴 끝내기"를 눌러요.' : '오늘 공격 3번을 다 했어요. 내일 또 해요! 🌙'}</p>`;
    } else {
      h += '<p class="cq-help">이 성을 차지하면 여기 장수들이 친구가 돼요! 먼저 이 성과 길로 이어진 <b>내 성(★)</b>을 누르세요.</p>';
    }
    p.innerHTML = h;
    if ($('cqAttack')) $('cqAttack').onclick = startAttack;
    return;
  }
  if (sel) {
    const line = myCityDefense(sel);
    const chosen = (myDefs()[sel] || []).length;
    p.innerHTML = cityBox(sel) +
      `<p class="cq-label">🛡️ 지금 이 성을 지키는 장수${chosen ? '' : ' (안 정해서 지역 장수와 수비병이 지켜요)'}</p>` +
      `<div class="cq-gens">${line.map((g) => `<span class="cq-gen">${drawGeneral(g)}<small>${gname(g)}<br>${TROOPS[troopOf(g)].icon}</small></span>`).join('')}</div>` +
      '<button class="big-btn blue" id="cqSetDef">🛡️ 이 성 수비 장수 정하기</button>' +
      '<p class="cq-help">반짝이는 옆 성을 누르면 공격할 수 있어요.</p>';
    $('cqSetDef').onclick = () => { Sound.play('click'); openDefense(sel); };
    return;
  }
  p.innerHTML = '<p class="cq-help">👆 <b>내 성(★)</b>을 누르고, 길로 이어진 옆 성을 눌러 공격해요.<br>' +
    '성을 차지하면 <b>그 지역에서 활동한 장수</b>가 내 도감에 들어와요! 동그라미 숫자는 그 성을 지키는 장수 수예요.<br>🏯 큰 성은 5명이 지키고 성벽이 튼튼해요(+40%). 보통 성은 3명(+25%), 작은 성은 2명(+10%)이에요.</p>';
}

function drawRank() {
  const M = model();
  const keys = mapUi.mode === 'solo' ? Object.keys(FACTIONS) : net.players.map((p) => p.id);
  const rows = keys.map((k) => ({ k, n: CITIES.filter((c) => M.owners[c.id] === k).length }))
    .sort((a, b) => b.n - a.n);
  $('cqRank').innerHTML = '🏆 ' + rows.map((r) => `<span style="color:${M.color(r.k)}"><b>${M.name(r.k)}</b> 성 ${r.n}개</span>`).join(' · ');
}

function drawLog() {
  const lines = mapUi.mode === 'solo' ? solo.log : (net.log || []).map(logText);
  $('cqLog').innerHTML = lines.map((t) => `<div>${t}</div>`).join('');
}
function logText(e) {
  const c = CITY[e.c] ? CITY[e.c].name : '';
  const who = josa(e.a, '이', '가');
  if (e.k === 'join') return `🚩 ${who} ${c} 성에서 시작했어요.`;
  if (e.w) return `⚔️ ${who} ${e.d ? e.d + '의 ' : ''}${c} 성을 차지했어요!`;
  return `🛡️ ${who} ${e.d ? e.d + '의 ' : ''}${c} 성을 공격했지만 ${e.d ? e.d + '의 수비 장수들이' : '성의 장수들이'} 지켜 냈어요.`;
}
