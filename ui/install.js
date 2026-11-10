// 삼국지 꼬마 장수 - 앱으로 설치하기 (ui)
// 처음 화면 맨 위의 "📲 앱으로 설치" 버튼은 앱으로 연 게 아니면 늘 보인다.
// - 브라우저가 설치 창을 준비해 주면(안드로이드 크롬, PC 크롬·엣지) 누를 때 바로 설치 창을 띄운다.
// - 아니면 그 기기에 맞는 방법을 알려 준다: 아이폰(공유 → 홈 화면에 추가), 카카오톡·네이버 같은 앱 안 브라우저
//   (설치가 안 돼서 크롬·사파리로 열라고), 안드로이드(메뉴 ⋮ → 앱 설치), PC(주소창의 설치 아이콘).
// 설치 파일(APK)을 내려받는 방식이 아니라, 웹사이트를 홈 화면에 앱으로 설치하는 방식(PWA)이다.

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* 안 돼도 웹으로는 된다 */ }); });
}

const installUi = { prompt: null };
// 안드로이드 설치 파일 (android/ 를 GitHub Actions 가 빌드해서 Releases 에 올린다. 크롬이 없는 폰용)
const INSTALL_APK = 'https://github.com/tiottu/3kingdom/releases/latest/download/kkomajangsu.apk';
const installUa = () => navigator.userAgent || '';
// 홈 화면 앱으로 열었거나, 안드로이드 앱(KkomaJangsuApp) 안이면 설치 버튼이 필요 없다
const isAppMode = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true || /KkomaJangsuApp/.test(installUa());
const isIos = () => /iphone|ipad|ipod/i.test(installUa()) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = () => /android/i.test(installUa());
// 카카오톡, 네이버, 인스타그램, 페이스북, 라인, 밴드 안에서 링크를 열면 설치가 안 된다
const isInAppBrowser = () => /KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\/|BAND\/|DaumApps|everytimeApp/i.test(installUa());

// 지금 기기에서 설치하는 방법 [제목, 설명]
function installGuide() {
  if (isInAppBrowser()) {
    return ['📲 크롬이나 사파리로 열어 주세요',
      '카카오톡·네이버 같은 앱 안에서는 설치가 안 돼요. 오른쪽 위나 아래의 메뉴(⋮ 또는 ···)에서 "다른 브라우저로 열기"를 누른 뒤, 다시 "📲 앱으로 설치"를 눌러요.'];
  }
  if (isIos()) {
    return ['📲 아이폰에 설치하기',
      '사파리 아래쪽의 공유 버튼(네모에 위 화살표)을 누르고 "홈 화면에 추가"를 누르면, 홈 화면에 꼬마 장수 앱이 생겨요!'];
  }
  if (isAndroid()) {
    return ['📲 안드로이드에 설치하기',
      '브라우저 오른쪽 위 메뉴(⋮)에서 "앱 설치" 또는 "홈 화면에 추가"를 누르면, 홈 화면에 꼬마 장수 앱이 생겨요! (삼성 인터넷은 아래 메뉴 ≡ → "현재 페이지 추가" → "홈 화면")'];
  }
  return ['📲 컴퓨터에 설치하기',
    '크롬이나 엣지 주소창 오른쪽의 설치 아이콘(모니터에 ↓ 또는 ⊕)을 누르거나, 메뉴(⋮ 또는 ···) → "앱" → "이 사이트를 앱으로 설치"를 눌러요. 회사 컴퓨터는 설치가 막혀 있을 수 있어요. 핸드폰에서는 이 주소로 들어가 같은 버튼을 눌러요.'];
}

function drawInstallBtn() {
  $('installBtn').style.display = isAppMode() ? 'none' : '';
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
  const [title, text] = installGuide();
  const buttons = [['알겠어요', 'blue', () => {}]];
  // 안드로이드는 크롬이 없어도 되는 설치 파일도 준다
  if (isAndroid()) {
    buttons.unshift(['📦 설치 파일(APK) 받기', 'green', () => { location.href = INSTALL_APK; }]);
    return showResult({ title, buttons,
      text: text + ' 크롬이 없으면 "설치 파일 받기"를 눌러요. 받은 파일을 열고 "출처를 알 수 없는 앱" 설치를 허용하면 돼요.' });
  }
  showResult({ title, text, buttons });
};

drawInstallBtn();
