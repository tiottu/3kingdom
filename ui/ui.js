// 삼국지 꼬마 장수 - 공통 화면 도우미 (ui): 화면 바꾸기, 나라 필터, 능력치 막대, 소리 버튼, 처음 화면

const $ = (id) => document.getElementById(id);

function show(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  window.scrollTo(0, 0);
}
function heartsText(n, max) {
  return '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, max - n));
}
function starText(n) {
  return '⭐'.repeat(n) + '☆'.repeat(3 - n);
}

// 나라별로 골라 보기
const FILTERS = ['전체', '촉나라', '위나라', '오나라', '그 밖'];
const groupOf = (id) => (['촉나라', '위나라', '오나라'].includes(GENERALS[id].nation) ? GENERALS[id].nation : '그 밖');
function drawFilter(el, current, onPick) {
  el.innerHTML = '';
  for (const f of FILTERS) {
    const c = document.createElement('button');
    c.className = 'level-chip' + (current === f ? ' on' : '');
    c.textContent = f;
    c.onclick = () => { Sound.play('click'); onPick(f); };
    el.appendChild(c);
  }
}

// 능력치가 PERK_AT 이상이면 특기가 생긴다
const hasPerk = (id, k) => STATS[id][k] >= PERK_AT;

// 능력치 막대
function statBars(id, big) {
  return '<div class="stats' + (big ? ' big' : '') + '">' + STATS[id].map((v, k) => {
    const s = STAT_INFO[k];
    return `<div class="stat"><span title="${s.name}">${s.icon}${big ? ' ' + s.name : ''}</span>` +
      `<span class="bar"><i style="width:${v}%;background:${s.color}"></i></span><b>${v}</b></div>`;
  }).join('') + '</div>';
}
function perkIcons(id) {
  return STAT_INFO.filter((s, k) => hasPerk(id, k)).map((s) => s.icon).join(' ') || '-';
}

// ---------- 결과 창 (모든 게임이 같이 쓴다) ----------
// pic: 그림 HTML, many: 그림 여러 개를 나란히, buttons: [[글, 색, 누르면 할 일], ...], delay: 몇 ms 뒤에 열지
// 버튼을 누르면 창을 닫고 그림 칸 모양도 원래대로 돌린 뒤 할 일을 한다.
function showResult({ pic = '', many = false, title = '', stars = '', text = '', buttons = [], delay = 0 }) {
  $('resultPic').className = 'result-pic' + (many ? ' many' : '');
  $('resultPic').innerHTML = pic;
  $('resultTitle').textContent = title;
  $('resultStars').textContent = stars;
  $('resultText').textContent = text;
  const btns = $('resultBtns');
  btns.innerHTML = '';
  for (const [label, cls, fn] of buttons) {
    const b = document.createElement('button');
    b.className = 'big-btn ' + cls;
    b.textContent = label;
    b.onclick = () => { Sound.play('click'); $('result').classList.remove('show'); $('resultPic').className = 'result-pic'; fn(); };
    btns.appendChild(b);
  }
  const open = () => $('result').classList.add('show');
  if (delay) setTimeout(open, delay); else open();
}

// ---------- 소리 버튼 ----------
Sound.on = save.sound;
function drawSoundBtn() { $('soundBtn').textContent = Sound.on ? '🔊' : '🔇'; }
drawSoundBtn();
$('soundBtn').onclick = () => {
  Sound.on = !Sound.on;
  save.sound = Sound.on;
  writeSave();
  drawSoundBtn();
  Sound.play('click');
};

// ---------- 처음 화면 ----------
$('homeFaces').innerHTML = ['liubei', 'guanyu', 'zhangfei', 'zhugeliang'].map((id) => drawGeneral(id)).join('');

document.querySelectorAll('[data-go]').forEach((b) => {
  b.onclick = () => { Sound.play('click'); show(b.dataset.go); };
});
