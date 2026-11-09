// 삼국지 꼬마 장수 - 별명 계정과 서버 연결 (core). Supabase 함수를 fetch 로 부른다

const ACCOUNT_KEY = 'samguk-account';

function serverConfig() {
  // 점검할 때만, 내 컴퓨터(localhost)에서 가짜 서버로 바꿀 수 있다
  if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    try {
      const o = JSON.parse(localStorage.getItem('samguk-server-override'));
      if (o && o.url) return o;
    } catch (e) { /* 없으면 그냥 */ }
    // 진짜 서버가 아직 없으면, 내 컴퓨터의 연습용 서버(.claude/serve.js)를 쓴다
    if (!SAMGUK_SERVER.url) return { url: location.origin, key: 'local-test' };
  }
  return SAMGUK_SERVER;
}
const SERVER = serverConfig();
const serverReady = () => !!(SERVER.url && SERVER.key);

let account = null; // { nick, token }
try { account = JSON.parse(localStorage.getItem(ACCOUNT_KEY)); } catch (e) { /* 손님 */ }
if (!account || !account.token) account = null;

// 계정마다 이 폰에도 따로 저장한다 (손님은 예전 그대로)
const saveKey = () => (account ? 'samguk-kids-v1:' + account.nick : 'samguk-kids-v1');

// 서버 오류 문구. 여기에는 여러 게임이 같이 쓰는 것만 둔다.
// 한 게임에서만 나오는 오류는 그 게임 파일 맨 위에서 Object.assign(ERRORS, { ... }) 로 더한다.
const ERRORS = {
  BAD_NICK: '별명은 2~10글자로 지어 주세요.',
  BAD_PIN: '비밀 숫자는 숫자 4개예요.',
  WRONG_PIN: '비밀 숫자가 달라요. 이미 다른 친구가 쓰는 별명일 수도 있어요.',
  LOCKED: '비밀 숫자를 여러 번 틀렸어요. 10분 뒤에 다시 해 주세요.',
  NO_USER: '계정을 찾지 못했어요. 별명으로 다시 들어가 주세요.',
  BAD_LINEUP: '장수는 1~5명, 내가 모은 장수로만 고를 수 있어요.',
  BAD_DATA: '저장할 내용이 이상해요.',
  FULL: '방이 너무 많아요. 잠시 뒤에 다시 해 주세요.',
  NO_FUNC: '서버 준비가 아직 안 됐어요. (어른에게: SQL 을 실행해 주세요)',
  NET: '인터넷 연결이 안 돼요. 와이파이를 확인해 주세요.'
};
const errText = (e) => ERRORS[e && e.message] || ERRORS.NET;

async function rpc(fn, args) {
  const headers = { apikey: SERVER.key, 'Content-Type': 'application/json' };
  if (SERVER.key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + SERVER.key; // 예전 방식 anon 키
  let r;
  try {
    r = await fetch(`${SERVER.url}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args) });
  } catch (e) { throw new Error('NET'); }
  if (!r.ok) throw new Error(r.status === 404 ? 'NO_FUNC' : 'NET');
  const d = await r.json();
  if (d && d.error) throw new Error(d.error);
  return d;
}

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}

// 두 기록을 합친다: 장수는 모두 모으고, 별은 더 많은 쪽
function mergeProgress(a, b) {
  a = a || {}; b = b || {};
  const unlocked = [...new Set([...(a.unlocked || []), ...(b.unlocked || [])])];
  const stars = { 1: {}, 2: {}, 3: {} };
  for (const src of [a.stars || {}, b.stars || {}]) {
    for (const [lv, st] of Object.entries(src)) {
      stars[lv] = stars[lv] || {};
      for (const [k, v] of Object.entries(st || {})) stars[lv][k] = Math.max(stars[lv][k] || 0, v);
    }
  }
  return { unlocked, stars };
}

// save(게임 기록)를 p 로 바꾼다
function applyProgress(p) {
  p = p || {};
  const known = (p.unlocked || []).filter((id) => GENERALS[id]);
  save.unlocked = [...new Set([...START_GENERALS, ...known])];
  save.stars = Object.assign({ 1: {}, 2: {}, 3: {} }, p.stars || {});
  syncStarUnlocks();
}

const progressOf = () => ({ unlocked: save.unlocked, stars: save.stars });
let pushTimer = null;
// 저장할 때마다 조금 기다렸다가 서버에도 올린다
function pushProgress() {
  if (!account || !serverReady()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    rpc('samguk_save', { p_token: account.token, p_progress: progressOf() }).catch(() => { /* 다음 저장 때 다시 */ });
  }, 500);
}
async function pushNow() {
  clearTimeout(pushTimer);
  if (!account || !serverReady()) return;
  await rpc('samguk_save', { p_token: account.token, p_progress: progressOf() });
}

async function login(nick, pin) {
  const d = await rpc('samguk_login', { p_nick: nick, p_pin: pin });
  const guest = progressOf();
  account = { nick: d.nickname, token: d.token };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  let merged = mergeProgress(d.progress, readLocal(saveKey()));
  // 새 별명이면, 이 폰에서 손님으로 모은 장수를 가져올지 묻는다
  const extra = guest.unlocked.length - START_GENERALS.length;
  if (d.is_new && extra > 0 && confirm(`이 폰에서 모은 장수 ${guest.unlocked.length}명을 "${d.nickname}" 도감으로 가져올까요?`)) {
    merged = mergeProgress(merged, guest);
  }
  applyProgress(merged);
  writeSave();
  await pushNow();
  return d;
}

function logout() {
  clearTimeout(pushTimer);
  account = null;
  localStorage.removeItem(ACCOUNT_KEY);
  applyProgress(readLocal(saveKey()));
}

// 게임을 열 때: 서버에 저장된 도감과 이 폰의 기록을 합친다
async function refreshAccount() {
  if (!account || !serverReady()) return;
  try {
    const d = await rpc('samguk_me', { p_token: account.token });
    applyProgress(mergeProgress(d.progress, progressOf()));
    writeSave();
  } catch (e) {
    if (e.message === 'NO_USER') logout();
  }
}
