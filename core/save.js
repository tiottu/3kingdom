// 삼국지 꼬마 장수 - 내 기록 저장과 장수 모으기 (core)

const SAVE_KEY = 'samguk-kids-v1';

// ---------- 저장 ----------
let save = { unlocked: START_GENERALS.slice(), stars: { 1: {}, 2: {}, 3: {} }, sound: true };
// 별명으로 들어와 있으면 그 별명의 기록 (online.js 의 saveKey)
try {
  const old = JSON.parse(localStorage.getItem(saveKey()));
  if (old && old.unlocked) save = Object.assign(save, old);
} catch (e) { /* 저장된 게 없으면 처음부터 */ }
function writeSave() {
  try { localStorage.setItem(saveKey(), JSON.stringify(save)); } catch (e) { /* 저장 못 해도 계속 */ }
  pushProgress(); // 별명으로 들어와 있으면 서버에도
}

// 모든 난이도에서 모은 별의 합
function totalStars() {
  let n = 0;
  for (const lv of Object.values(save.stars)) for (const v of Object.values(lv)) n += v;
  return n;
}
// 별이 충분히 모인 장수를 친구로 만들고, 새로 온 장수 id 를 돌려준다
function syncStarUnlocks() {
  const have = totalStars();
  const fresh = Object.keys(STAR_UNLOCK).filter((id) => !save.unlocked.includes(id) && have >= STAR_UNLOCK[id]);
  save.unlocked.push(...fresh);
  return fresh;
}
// 아직 못 만난 별 장수 중 가장 가까운 것
function nextStarFriend() {
  const left = Object.keys(STAR_UNLOCK).filter((id) => !save.unlocked.includes(id));
  left.sort((a, b) => STAR_UNLOCK[a] - STAR_UNLOCK[b]);
  return left[0];
}
if (syncStarUnlocks().length) writeSave();
// 대결에서 이기면(둘이 하기는 한 판 끝날 때마다) 다음 친구 한 명이 온다
function unlockWinFriend() {
  const id = WIN_UNLOCK.find((x) => !save.unlocked.includes(x));
  if (id) save.unlocked.push(id);
  return id;
}
