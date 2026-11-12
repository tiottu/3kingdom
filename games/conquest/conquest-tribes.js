// 삼국지 꼬마 장수 - 땅따먹기 오랑캐 (혼자 하기)
// 턴을 끝낼 때 가끔 지도 가장자리의 오랑캐(흉노, 선비, 오환, 부여, 강족, 남만, 산월)가 가까운 성을 쳐들어온다.
// 그 성의 수비 장수(정하지 않았으면 지역 장수와 수비병)와 상성 대결을 해서, 오랑캐가 이기면 성은 주인 없는 성이 된다.
// - 하루(한국 날짜)에 한 번쯤: 3번째 턴부터, 그날 아직 안 왔으면 턴을 끝낼 때마다 가끔 온다. 하루에 두 번은 오지 않는다.
// - 누구든 마지막 남은 성은 치지 않는다.
// - 친구들과(서버) 지도에는 아직 없다.

const RAID = {
  calm: 3,      // 이 턴부터 온다
  chance: 0.35, // 그날 아직 안 왔을 때, 턴을 끝낼 때마다 올 확률 (보통 몇 턴 안에 한 번 온다)
  near: 3       // 오랑캐마다 가장 가까운 성 몇 개를 노리는지
};
const raidToday = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10); // 한국 날짜
// 오랑캐마다 주로 쓰는 병종과 우두머리 장수 (있으면 맨 앞에 선다)
const TRIBE_INFO = {
  '흉노': { troop: 'horse' }, '선비': { troop: 'horse' }, '오환': { troop: 'horse', chief: 'tadun' }, '부여': { troop: 'horse' },
  '강족': { troop: 'spear' }, '남만': { troop: 'spear', chief: 'menghuo' }, '산월': { troop: 'bow' }
};

// 오랑캐 병사 (수비병처럼 도감에는 없다)
Object.assign(SOLDIERS, {
  raid_horse: { name: '오랑캐 기마병', troop: 'horse', power: 250, face: '#d9a27a', hat: 'band', hatColor: '#8a5a2b', armor: '#a0522d', beard: 'bushy' },
  raid_spear: { name: '오랑캐 창병', troop: 'spear', power: 250, face: '#d9a27a', hat: 'band', hatColor: '#6b8e23', armor: '#556b2f', beard: 'bushy' },
  raid_bow: { name: '오랑캐 궁수', troop: 'bow', power: 250, face: '#d9a27a', hat: 'band', hatColor: '#b8860b', armor: '#8b6914', beard: 'short' }
});

// 오랑캐마다 가장 가까운 성
const TRIBE_NEAR = {};
MAP_TRIBES.forEach((t) => {
  TRIBE_NEAR[t.name] = CITIES.map((c) => [c.id, Math.hypot(c.x - t.x, c.y - t.y)])
    .sort((a, b) => a[1] - b[1]).slice(0, RAID.near).map((x) => x[0]);
});

// 쳐들어오는 줄: 턴이 지날수록 늘어난다 (2명 → 3명 → 4명). 주로 쓰는 병종이 앞에, 다른 병종이 뒤에
function raidParty(tribe, turn) {
  const info = TRIBE_INFO[tribe] || { troop: 'horse' };
  const size = turn < 8 ? 2 : turn < 16 ? 3 : 4;
  const others = ['horse', 'spear', 'bow'].filter((k) => k !== info.troop);
  const order = [info.troop, ...others, info.troop];
  const line = info.chief && GENERALS[info.chief] ? [info.chief] : [];
  for (let i = 0; line.length < size; i++) line.push('raid_' + order[i % order.length]);
  return line;
}

// 턴을 끝낼 때 부른다. 쳐들어왔으면 { tribe, city, owner, win, turn } 을 돌려준다
function tribeRaid() {
  if (solo.turn < RAID.calm || solo.raidDay === raidToday() || Math.random() >= RAID.chance) return null;
  const count = (k) => CITIES.filter((c) => solo.owners[c.id] === k).length;
  const cand = [];
  for (const t of MAP_TRIBES) {
    for (const c of TRIBE_NEAR[t.name]) {
      const o = solo.owners[c];
      if (o && count(o) > 1) cand.push([t.name, c]); // 주인 있는 성만, 마지막 성은 빼고
    }
  }
  if (!cand.length) return null;
  solo.raidDay = raidToday();
  const [tribe, city] = cand[rand(0, cand.length - 1)];
  const owner = solo.owners[city];
  const res = fight(raidParty(tribe, solo.turn), soloDefense(owner, city), wallOf(city));
  const win = res.winner > 0;
  if (win) {
    delete solo.owners[city];
    if (solo.defense && !Array.isArray(solo.defense)) delete solo.defense[city]; // 빼앗긴 성의 수비 장수는 풀려난다
  }
  const who = owner === solo.me ? `내 ${CITY[city].name} 성` : `${FACTIONS[owner].name}의 ${CITY[city].name} 성`;
  soloLog(win ? `⛺🔥 ${josa(tribe, '이', '가')} ${who}을 쳐들어와 빼앗았어요! 이제 주인 없는 성이에요.`
    : `⛺ ${josa(tribe, '이', '가')} ${who}을 쳐들어왔지만 막아 냈어요!`);
  solo.raid = { tribe, city, owner, win, turn: solo.turn };
  return solo.raid;
}

// 내 성이 공격받았으면 알려 준다
function showRaidNews(r) {
  Sound.play(r.win ? 'lose' : 'win');
  showResult({
    many: true,
    pic: raidParty(r.tribe, r.turn).slice(0, 3).map((g) => drawGeneral(g)).join(''),
    title: r.win ? `🔥 ${josa(r.tribe, '이', '가')} ${CITY[r.city].name} 성을 빼앗았어요!` : `🛡️ ${CITY[r.city].name} 성을 지켜 냈어요!`,
    text: r.win
      ? `${CITY[r.city].name} 성은 이제 주인 없는 성이에요. 다시 공격해서 찾아와요! 💪 오랑캐 가까운 성에는 수비 장수를 튼튼하게 정해 두면 좋아요.`
      : `${josa(r.tribe, '이', '가')} 쳐들어왔지만 수비 장수들이 막아 냈어요. 정말 든든해요! 👏`,
    buttons: [['🗺️ 지도로', 'blue', () => { show('conquest'); drawConquest(); }]]
  });
}

// 지도에 이번 턴의 오랑캐 공격을 그린다 (conquest-map.js 의 drawConquest 가 부른다)
function raidMarks() {
  const r = mapUi.mode === 'solo' && solo && solo.raid;
  if (!r || r.turn !== solo.turn) return '';
  const t = MAP_TRIBES.find((x) => x.name === r.tribe), c = CITY[r.city];
  if (!t || !c) return '';
  return `<line x1="${t.x}" y1="${t.y - 6}" x2="${c.x}" y2="${c.y}" class="raid-line"/>` +
    `<text x="${c.x + 16}" y="${c.y - 14}" class="raid-mark">${r.win ? '🔥' : '🛡️'}</text>`;
}
