// 삼국지 꼬마 장수 - 앱으로 설치하기 (ui)
// 안드로이드 크롬·삼성 인터넷: 브라우저가 설치를 허락하면 처음 화면에 "📲 앱으로 설치" 버튼이 나온다.
// 아이폰(사파리)은 버튼으로 설치할 수 없어서, 누르면 "공유 → 홈 화면에 추가" 방법을 알려 준다.
// 이미 앱으로 열었으면 버튼을 숨긴다.

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* 안 돼도 웹으로는 된다 */ }); });
}

const installUi = { prompt: null };
const isAppMode = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function drawInstallBtn() {
  const b = $('installBtn');
  b.style.display = !isAppMode() && (installUi.prompt || isIos()) ? '' : 'none';
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // 브라우저 기본 안내 대신 우리 버튼으로
  installUi.prompt = e;
  drawInstallBtn();
});
window.addEventListener('appinstalled', () => { installUi.prompt = null; drawInstallBtn(); });

$('installBtn').onclick = async () => {
  Sound.play('click');
  if (installUi.prompt) {
    const p = installUi.prompt;
    try {
      await p.prompt();
      await p.userChoice;
      installUi.prompt = null; // 설치 창은 한 번만 쓸 수 있다
      drawInstallBtn();
      return;
    } catch (e) { /* 설치 창을 못 띄우면 아래 안내로 */ }
  }
  if (!isIos()) {
    showResult({
      title: '📲 앱으로 설치하기',
      text: '브라우저 오른쪽 위 메뉴(⋮)에서 "앱 설치" 또는 "홈 화면에 추가"를 누르면, 홈 화면에 꼬마 장수 앱이 생겨요!',
      buttons: [['알겠어요', 'blue', () => {}]]
    });
    return;
  }
  showResult({
    title: '📲 아이폰에 설치하기',
    text: '사파리 아래쪽의 공유 버튼(네모에 위 화살표)을 누르고 "홈 화면에 추가"를 누르면, 홈 화면에 꼬마 장수 앱이 생겨요!',
    buttons: [['알겠어요', 'blue', () => {}]]
  });
};

drawInstallBtn();
