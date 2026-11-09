// 삼국지 꼬마 장수 - 장수 대결 규칙 (화면 없음). 서버 SQL(samguk_fight)과 결과가 같아야 한다
// .claude/engine.js 가 이 파일을 통째로 읽어 SQL 과 연습용 서버를 만든다. 여기에는 화면(document) 코드를 넣지 않는다.

// ---------- 병종과 상성: 기병 > 궁병 > 창병 > 기병 ----------
const TROOPS = {
  horse: { icon: '🐎', name: '기병', beats: 'bow' },
  bow: { icon: '🏹', name: '궁병', beats: 'spear' },
  spear: { icon: '🔱', name: '창병', beats: 'horse' }
};
const CAVALRY = new Set(['guanyu', 'zhaoyun', 'lvbu', 'machao', 'madai', 'mateng', 'zhangliao', 'xiahoudun',
  'sunce', 'pangde', 'gongsunzan', 'zhanghe', 'xuhuang', 'caoren', 'caohong', 'sunjian', 'dongzhuo', 'yuanshao',
  'weiyan', 'caozhen', 'guanxing', 'zhangbao', 'lingtong']);
const ARCHERS = new Set(['huangzhong', 'taishici', 'sunshangxiang', 'xiahouyuan']); // 활 솜씨로 이름난 장수
// 정해 둔 장수 말고는: 지혜가 힘보다 훨씬(31 이상) 높으면 궁병, 이끄는 힘이 80 이상이면 기병, 나머지는 창병
function troopOf(id) {
  if (SOLDIERS[id]) return SOLDIERS[id].troop;
  if (ARCHERS.has(id)) return 'bow';
  if (CAVALRY.has(id)) return 'horse';
  const s = STATS[id];
  return s[1] > s[0] + 30 ? 'bow' : s[2] >= 80 ? 'horse' : 'spear';
}
function troopLine(id) {
  const t = TROOPS[troopOf(id)];
  const weak = Object.values(TROOPS).find((x) => x.beats === troopOf(id));
  return `${t.icon} <b>${t.name}</b> - ${TROOPS[t.beats].icon}${TROOPS[t.beats].name}에게 강하고 ${weak.icon}${weak.name}에게 약해요`;
}

const TEAM_MAX = 5;
// 능력 4개를 더한 힘 = 처음 에너지 (수비병은 정해 둔 힘)
const basePower = (id) => (SOLDIERS[id] ? SOLDIERS[id].power : STATS[id].reduce((a, b) => a + b, 0));
const gname = (id) => (GENERALS[id] || SOLDIERS[id]).name;
// 땅따먹기에서 성을 지키는 장수는 성벽(wall %)만큼 처음 에너지가 늘어난다
const startEnergy = (id, wall = 0) => basePower(id) + Math.floor(basePower(id) * wall / 100);
// a 가 b 에게 상성이 좋으면 1, 나쁘면 -1, 같으면 0
function edgeOf(a, b) {
  const ta = troopOf(a), tb = troopOf(b);
  return TROOPS[ta].beats === tb ? 1 : TROOPS[tb].beats === ta ? -1 : 0;
}

// 1:1 연속 대결 (승자 연전)
// 1번끼리 먼저 싸우고, 이긴 장수는 남은 에너지로 상대의 다음 장수와 또 싸운다. 상대 장수를 모두 이기면 승리.
// 상성이 좋으면 그 싸움에서만 에너지 +50%. 남는 에너지 = 이긴 쪽 힘 - 진 쪽 힘 (원래 에너지보다 많아지지는 않음)
// wall: 땅따먹기에서 B(성을 지키는 쪽)의 성벽 보너스 %
// 모두 정수로 계산해서 서버(SQL)와 결과가 똑같다.
function fight(A, B, wall = 0) {
  const castle = wall;
  const duels = [];
  let i = 0, j = 0;
  let ea = A.length ? startEnergy(A[0]) : 0;
  let eb = B.length ? startEnergy(B[0], castle) : 0;
  while (i < A.length && j < B.length) {
    const a = A[i], b = B[j], edge = edgeOf(a, b);
    const pa = ea + (edge > 0 ? Math.floor(ea / 2) : 0);
    const pb = eb + (edge < 0 ? Math.floor(eb / 2) : 0);
    const d = { a, b, ea, eb, pa, pb, edge, win: 0, left: 0 };
    if (pa > pb) {
      d.win = 1; d.left = ea = Math.min(ea, pa - pb);
      j++; eb = j < B.length ? startEnergy(B[j], castle) : 0;
    } else if (pb > pa) {
      d.win = -1; d.left = eb = Math.min(eb, pb - pa);
      i++; ea = i < A.length ? startEnergy(A[i]) : 0;
    } else { // 똑같으면 둘 다 물러난다
      i++; j++;
      ea = i < A.length ? startEnergy(A[i]) : 0;
      eb = j < B.length ? startEnergy(B[j], castle) : 0;
    }
    duels.push(d);
  }
  const la = A.length - i, lb = B.length - j; // 남은 장수 수
  return { duels, la, lb, winner: la > 0 && lb === 0 ? 1 : lb > 0 && la === 0 ? -1 : 0 };
}
