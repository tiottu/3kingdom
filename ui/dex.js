// 삼국지 꼬마 장수 - 장수 도감 (ui)

// how: 못 만난 장수 창에 "만나는 방법"을 더하는 함수들 (id => 글, 없으면 '')
// info: 자세히 보기 창의 능력 설명 위에 한 줄씩 더하는 함수들 (id => HTML)
// 게임들이 자기 파일에서 dexUi.how.push(...) / dexUi.info.push(...) 로 더한다. 도감은 게임 파일의 이름을 직접 쓰지 않는다.
const dexUi = { filter: '전체', how: [], info: [] };

$('btnDex').onclick = () => { Sound.play('click'); drawDex(); show('dex'); };

// ---------- 도감 ----------
function drawDex() {
  // 모든 장수를 보여 주고, 모은 장수는 색깔로, 아직 못 만난 장수는 흑백으로
  const ids = Object.keys(GENERALS).filter((id) => dexUi.filter === '전체' || groupOf(id) === dexUi.filter);
  const got = ids.filter((id) => save.unlocked.includes(id)).length;
  $('dexCount').textContent = `모은 장수 ${got} / ${ids.length}`;
  drawFilter($('dexFilter'), dexUi.filter, (f) => { dexUi.filter = f; drawDex(); });
  $('dexGrid').innerHTML = '';
  for (const id of ids) {
    const open = save.unlocked.includes(id);
    const g = GENERALS[id];
    const how = STAR_UNLOCK[id] ? `⭐ 별 ${STAR_UNLOCK[id]}개를 모으면 만나요`
      : WIN_UNLOCK.includes(id) ? '🏆 대결에서 이기면 차례로 만나요' : '🗺️ 혼자 하기에서 이기면 만나요';
    const c = document.createElement('button');
    c.className = 'card' + (open ? ' owned' : ' locked');
    c.innerHTML = drawGeneral(id) + `<b>${g.name}</b><small>${open ? '✅ ' + g.nation : '🔒 아직 못 만났어요'}</small>`;
    c.onclick = () => {
      Sound.play('click');
      $('dexPic').innerHTML = drawGeneral(id);
      $('dexPic').classList.toggle('mono', !open);
      $('dexName').textContent = g.name;
      $('dexNation').textContent = `${g.nation} · 기술 "${g.skill}"` + (open ? ' · ✅ 모은 장수' : '');
      const more = dexUi.how.map((f) => f(id)).filter(Boolean).map((t) => ', ' + t).join('');
      $('dexHow').textContent = open ? '' : `🔒 아직 못 만났어요. ${how}` + more;
      $('dexIntro').textContent = g.intro;
      const perks = STAT_INFO.filter((s, k) => hasPerk(id, k));
      $('dexStats').innerHTML = statBars(id, true) + '<div class="perk-list">' +
        dexUi.info.map((f) => `<div>${f(id)}</div>`).join('') +
        (perks.length ? perks.map((s) => `<div>${s.icon} <b>${s.perk}</b> - ${s.desc}</div>`).join('') : '<div>특기는 없지만 마음만은 최고예요!</div>') +
        '</div>';
      $('dexInfo').classList.add('show');
    };
    $('dexGrid').appendChild(c);
  }
}
$('dexClose').onclick = () => { Sound.play('click'); $('dexInfo').classList.remove('show'); };
