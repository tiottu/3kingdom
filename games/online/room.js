// 삼국지 꼬마 장수 - 둘이 하기(각자 핸드폰): 별명 들어가기, 방 만들기/들어가기, 한 번 더

// 둘이 하기에서만 나오는 서버 오류 문구 (같이 쓰는 문구는 core/server.js)
Object.assign(ERRORS, {
  NO_ROOM: '그런 방이 없어요. 방 번호를 다시 확인해 주세요.',
  ROOM_FULL: '이미 두 명이 들어간 방이에요.',
  ALREADY: '이번 판에는 이미 장수를 냈어요.'
});

// ---------- 처음 화면: 계정 표시와 버튼 ----------
function drawAccount() {
  $('accountChip').textContent = account ? `👤 ${account.nick}` : '👤 손님 · 별명 만들기';
}
$('accountChip').onclick = () => { Sound.play('click'); openOnline(); };
$('btnOnline').onclick = () => { Sound.play('click'); openOnline(); };

drawAccount();
refreshAccount().then(drawAccount);

// ---------- 둘이 하기(각자 핸드폰): 들어가기와 방 ----------
function openOnline() {
  $('noServer').style.display = serverReady() ? 'none' : '';
  $('loginBox').style.display = serverReady() && !account ? '' : 'none';
  $('roomBox').style.display = serverReady() && account ? '' : 'none';
  $('whoami').innerHTML = account
    ? `👤 <b>${account.nick}</b> 으로 들어와 있어요 · 모은 장수 ${save.unlocked.length}명`
    : '';
  $('loginMsg').textContent = '';
  $('roomMsg').textContent = '';
  show('online');
}

$('loginBtn').onclick = async () => {
  const nick = $('nickInput').value.trim();
  const pin = $('pinInput').value.trim();
  if (nick.length < 2 || nick.length > 10) { $('loginMsg').textContent = ERRORS.BAD_NICK; return; }
  if (!/^[0-9]{4}$/.test(pin)) { $('loginMsg').textContent = ERRORS.BAD_PIN; return; }
  Sound.play('click');
  $('loginBtn').disabled = true;
  $('loginMsg').textContent = '들어가는 중…';
  try {
    const d = await login(nick, pin);
    $('pinInput').value = '';
    drawAccount();
    openOnline();
    $('roomMsg').textContent = d.is_new ? `🎉 새 별명 "${d.nickname}" 을 만들었어요! 별명과 비밀 숫자를 꼭 기억해요.` : `😊 어서 와요, ${d.nickname}!`;
  } catch (e) {
    $('loginMsg').textContent = errText(e);
  }
  $('loginBtn').disabled = false;
};

$('logoutBtn').onclick = () => {
  if (!confirm('다른 별명으로 바꿀까요? 지금 별명의 도감은 서버에 저장돼 있어요.')) return;
  Sound.play('click');
  logout();
  drawAccount();
  openOnline();
};

$('roomCreate').onclick = async () => {
  Sound.play('click');
  $('roomMsg').textContent = '방을 만드는 중…';
  try {
    const d = await rpc('samguk_room_create', { p_token: account.token });
    enterRoom(d.code);
  } catch (e) { $('roomMsg').textContent = errText(e); }
};

$('roomJoin').onclick = async () => {
  const code = $('codeInput').value.trim();
  if (!/^[0-9]{4}$/.test(code)) { $('roomMsg').textContent = '방 번호는 숫자 4개예요.'; return; }
  Sound.play('click');
  $('roomMsg').textContent = '방에 들어가는 중…';
  try {
    await rpc('samguk_room_join', { p_token: account.token, p_code: code });
    enterRoom(code);
  } catch (e) { $('roomMsg').textContent = errText(e); }
};

// ---------- 방 상태 ----------
const room = { code: null, info: null, match: 0, shownMatch: 0, submitted: false, poll: null, polling: false };

// 장수 고르기·대결 화면(games/battle/team.js)을 빌려 쓸 때의 설정
const ROOM_TEAM = {
  title: '친구와 장수 대결',
  goText: (n) => `✅ 이 ${n}명으로 준비 완료!`,
  afterDraw: () => drawRoomInfo(),
  onBack: () => {
    if (!confirm('방에서 나갈까요? 같은 방 번호로 다시 들어올 수 있어요.')) return;
    leaveRoom();
  },
  onGo: async (lineup) => {
    $('teamMsg').textContent = '장수를 내는 중…';
    await pushNow(); // 서버가 "내가 모은 장수"인지 확인하므로 도감을 먼저 올린다
    await rpc('samguk_room_submit', { p_token: account.token, p_code: room.code, p_lineup: lineup });
    room.submitted = true;
    $('teamMsg').textContent = '';
    drawRoomInfo();
    pollRoom();
  },
  resultButtons: () => [['🔁 한 번 더 (같은 방)', 'orange', rematch], ['🏠 방에서 나가기', 'gray', leaveRoom]]
};
const openRoomTeam = () => openTeamCustom('online', ROOM_TEAM);

function enterRoom(code) {
  room.code = code;
  room.info = null;
  room.match = 0;
  room.shownMatch = 0;
  room.submitted = false;
  openRoomTeam();
  stopPoll();
  room.poll = setInterval(pollRoom, 1500);
  pollRoom();
}
function stopPoll() { clearInterval(room.poll); room.poll = null; }
function leaveRoom() { stopPoll(); room.code = null; show('home'); }

async function pollRoom() {
  if (room.polling || !room.code) return;
  room.polling = true;
  try {
    const code = room.code;
    const r = await rpc('samguk_room_get', { p_token: account.token, p_code: code });
    if (room.code !== code) { room.polling = false; return; } // 그사이 방을 나갔으면 그만
    room.info = r;
    room.match = r.match;
    room.submitted = !!r.mine;
    drawRoomInfo();
    // 두 사람이 모두 냈으면 대결 시작 (판마다 한 번)
    if (r.mine && r.opp && room.shownMatch !== r.match && !team.running) {
      room.shownMatch = r.match;
      runClash(r.mine, r.opp, r.opp_nick || '친구');
    }
  } catch (e) {
    $('teamMsg').textContent = errText(e);
  }
  room.polling = false;
}

function drawRoomInfo() {
  if (team.mode !== 'online') return;
  const r = room.info;
  let t = `🔢 방 번호 <b class="room-code">${room.code}</b>`;
  if (!r || !r.opp_nick) t += ' · 이 번호를 친구에게 알려 주세요. 친구를 기다리는 중… ⏳';
  else t += ` · 상대: <b>${r.opp_nick}</b> ${r.opp_ready ? '✅ 준비 완료!' : '🤔 장수 고르는 중'}`;
  $('teamInfo').innerHTML = t;
  const waiting = room.submitted;
  $('teamWait').style.display = waiting ? '' : 'none';
  $('teamPicker').style.display = waiting ? 'none' : '';
  if (waiting) $('teamWait').innerHTML = '✅ 내 장수를 냈어요!<br>' + (r && r.opp_ready ? '대결이 곧 시작돼요!' : '상대가 장수를 고를 때까지 기다려요… ⏳');
}

async function rematch() {
  try {
    await rpc('samguk_room_rematch', { p_token: account.token, p_code: room.code, p_match: room.match });
  } catch (e) { /* 상대가 먼저 눌렀으면 괜찮다 */ }
  room.submitted = false;
  openRoomTeam();
  pollRoom();
}
