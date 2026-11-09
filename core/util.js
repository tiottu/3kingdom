// 삼국지 꼬마 장수 - 작은 도우미 (core): 섞기, 주사위, 조사(이/가), 기다리기

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
// 받침이 있으면 앞 글자, 없으면 뒤 글자 (이/가, 은/는, 과/와)
function josa(word, withBatchim, without) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const has = code >= 0 && code <= 11171 && code % 28 !== 0;
  return word + (has ? withBatchim : without);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
