// 삼국지 꼬마 장수 - 땅따먹기 친구들과(각자 핸드폰): 지도 만들기/들어가기, 서버에서 지도 받기

// ---------- 친구들과 (각자 핸드폰) ----------
async function netLoad(code) {
  const r = await rpc('samguk_map_get', { p_token: account.token, p_code: code });
  net = r;
}

async function drawNetBox() {
  const box = $('netBox');
  if (!serverReady()) { box.innerHTML = '<p>서버가 준비되면 친구들과 할 수 있어요.</p>'; return; }
  if (!account) {
    box.innerHTML = '<button class="big-btn orange" id="netLogin">👤 별명으로 들어가기</button>';
    $('netLogin').onclick = () => { Sound.play('click'); openOnline(); };
    return;
  }
  box.innerHTML = `<p>👤 <b>${account.nick}</b> · 하루에 공격 ${MOVES}번, 2~4명이 한 지도에서 겨뤄요.</p>` +
    '<div id="netList" class="net-list"></div>' +
    '<button class="big-btn orange" id="netCreate">🗺️ 새 지도 만들기<small>지도 번호가 나오면 친구에게 알려 줘요</small></button>' +
    '<div class="join-row"><input class="text-in" id="netCode" maxlength="4" inputmode="numeric" placeholder="친구의 지도 번호 4개" autocomplete="off">' +
    '<button class="big-btn blue" id="netJoin">들어가기</button></div><p class="msg" id="netMsg"></p>';
  $('netCreate').onclick = async () => {
    Sound.play('click');
    $('netMsg').textContent = '지도를 만드는 중…';
    try { const d = await rpc('samguk_map_create', { p_token: account.token }); await enterNet(d); }
    catch (e) { $('netMsg').textContent = errText(e); }
  };
  $('netJoin').onclick = async () => {
    const code = $('netCode').value.trim();
    if (!/^[0-9]{4}$/.test(code)) { $('netMsg').textContent = '지도 번호는 숫자 4개예요.'; return; }
    Sound.play('click');
    $('netMsg').textContent = '지도에 들어가는 중…';
    try { const d = await rpc('samguk_map_join', { p_token: account.token, p_code: code }); await enterNet(d); }
    catch (e) { $('netMsg').textContent = errText(e); }
  };
  try {
    const list = await rpc('samguk_map_list', { p_token: account.token });
    $('netList').innerHTML = '';
    for (const m of list.maps || []) {
      const b = document.createElement('button');
      b.className = 'big-btn green';
      b.innerHTML = `▶ 지도 ${m.code}<small>${m.players}명 · 내 성 ${m.mine}개</small>`;
      b.onclick = async () => {
        Sound.play('click');
        try { const d = await rpc('samguk_map_join', { p_token: account.token, p_code: m.code }); await enterNet(d); }
        catch (e) { $('netMsg').textContent = errText(e); }
      };
      $('netList').appendChild(b);
    }
  } catch (e) { /* 목록은 없어도 된다 */ }
}

// 지도에 들어가면 내 거점의 장수가 친구가 된다
async function enterNet(d) {
  if (d.base && (d.gained || []).length) gainCity(d.base);
  await netLoad(d.code);
  startMap('net');
  if ((d.gained || []).length) {
    const names = d.gained.filter((g) => GENERALS[g]).map((g) => GENERALS[g].name).join(', ');
    $('cqLog').insertAdjacentHTML('afterbegin', `<div>🚩 내 거점은 <b>${CITY[d.base].name}</b>! 새 친구: ${names}</div>`);
  }
}
