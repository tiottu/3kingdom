// 삼국지 꼬마 장수 - 장수 그림과 효과음 (ui)

// 장수 얼굴을 SVG 로 그린다. locked 이면 물음표 그림자.
function drawGeneral(id, locked) {
  const g = GENERALS[id] || SOLDIERS[id]; // 수비병도 같은 방법으로 그린다
  if (locked) {
    return '<svg viewBox="0 0 100 100" class="avatar"><circle cx="50" cy="48" r="28" fill="#cfd5de"/>' +
      '<rect x="22" y="72" width="56" height="26" rx="13" fill="#cfd5de"/>' +
      '<text x="50" y="60" text-anchor="middle" font-size="32" font-weight="bold" fill="#fff">?</text></svg>';
  }
  const dark = '#3a2a20';
  let s = '<svg viewBox="0 0 100 100" class="avatar">';
  // 몸(옷)
  s += `<rect x="20" y="70" width="60" height="30" rx="14" fill="${g.armor}"/>`;
  s += `<path d="M40 70 L50 82 L60 70" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>`;
  // 여포의 꿩 깃털은 머리 뒤에
  if (g.hat === 'feather') {
    s += `<path d="M42 26 Q20 0 6 6" stroke="#8e44ad" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M58 26 Q80 0 94 6" stroke="#8e44ad" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  // 얼굴
  s += `<circle cx="50" cy="48" r="26" fill="${g.face}"/>`;
  // 볼
  s += '<circle cx="34" cy="54" r="4.5" fill="#ff8a8a" opacity=".5"/><circle cx="66" cy="54" r="4.5" fill="#ff8a8a" opacity=".5"/>';
  // 눈, 눈썹
  s += `<circle cx="40" cy="46" r="3.4" fill="${dark}"/><circle cx="60" cy="46" r="3.4" fill="${dark}"/>`;
  s += '<circle cx="41" cy="45" r="1.1" fill="#fff"/><circle cx="61" cy="45" r="1.1" fill="#fff"/>';
  const bushy = g.beard === 'bushy';
  s += `<path d="M34 ${bushy ? 38 : 39} L45 ${bushy ? 41 : 40}" stroke="${dark}" stroke-width="${bushy ? 3.5 : 2}" stroke-linecap="round"/>`;
  s += `<path d="M55 ${bushy ? 41 : 40} L66 ${bushy ? 38 : 39}" stroke="${dark}" stroke-width="${bushy ? 3.5 : 2}" stroke-linecap="round"/>`;
  // 한쪽 눈 안대 (하후돈)
  if (g.patch) {
    s += `<path d="M26 40 L74 52" stroke="${dark}" stroke-width="1.6"/><ellipse cx="60" cy="46" rx="6" ry="5" fill="${dark}"/>`;
  }
  // 수염 (beardColor 가 있으면 그 색: 황충은 흰 수염, 손권은 보랏빛 수염)
  const bc = g.beardColor || dark;
  if (g.beard === 'long') {
    s += `<path d="M38 58 Q50 66 62 58 L58 90 Q50 96 42 90 Z" fill="${bc}"/>`;
  } else if (g.beard === 'bushy') {
    s += `<path d="M28 52 Q30 74 50 76 Q70 74 72 52 Q66 62 50 62 Q34 62 28 52 Z" fill="${bc}"/>`;
  } else if (g.beard === 'goatee') {
    s += `<path d="M45 64 Q50 76 55 64 Z" fill="${bc}"/>`;
  } else if (g.beard === 'short') {
    s += `<path d="M40 57 Q50 54 60 57" stroke="${bc}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M46 66 Q50 71 54 66 Z" fill="${bc}"/>`;
  }
  // 웃는 입
  if (g.beard !== 'long') {
    s += `<path d="M44 ${g.beard === 'bushy' ? 64 : 59} Q50 ${g.beard === 'bushy' ? 69 : 64} 56 ${g.beard === 'bushy' ? 64 : 59}" stroke="#c0392b" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  } else {
    s += '<path d="M45 57 Q50 61 55 57" stroke="#c0392b" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  }
  // 모자
  const c = g.hatColor;
  if (g.hat === 'crown') {
    s += `<path d="M30 32 L32 16 L41 25 L50 12 L59 25 L68 16 L70 32 Z" fill="${c}" stroke="#00000022" stroke-width="1"/>`;
    s += '<circle cx="50" cy="26" r="3" fill="#e74c3c"/>';
  } else if (g.hat === 'helmet' || g.hat === 'feather') {
    s += `<path d="M23 40 Q24 14 50 14 Q76 14 77 40 Z" fill="${c}"/>`;
    s += `<rect x="22" y="36" width="56" height="6" rx="3" fill="#00000030"/>`;
    s += '<circle cx="50" cy="13" r="5" fill="#e74c3c"/>';
  } else if (g.hat === 'scholar') {
    s += `<path d="M30 34 L34 8 L66 8 L70 34 Z" fill="${c}"/>`;
    s += '<rect x="30" y="30" width="40" height="5" rx="2" fill="#00000030"/>';
  } else if (g.hat === 'band') {
    s += `<path d="M24 38 Q26 18 50 18 Q74 18 76 38 Z" fill="${dark}"/>`;
    s += `<rect x="23" y="32" width="54" height="9" rx="4" fill="${c}"/>`;
    s += `<path d="M76 36 L88 30 L86 44 Z" fill="${c}"/>`;
  } else if (g.hat === 'bun') {
    // 올림머리와 꽃 (초선)
    s += `<circle cx="50" cy="14" r="10" fill="${c}"/>`;
    s += `<path d="M24 46 Q22 18 50 20 Q78 18 76 46 Q70 30 50 30 Q30 30 24 46 Z" fill="${c}"/>`;
    s += '<circle cx="66" cy="22" r="5" fill="#ff7eb6"/><circle cx="66" cy="22" r="2" fill="#ffe066"/>';
    s += '<path d="M34 10 L60 4" stroke="#f4c430" stroke-width="2.5" stroke-linecap="round"/>';
  } else if (g.hat === 'tall') {
    s += `<rect x="34" y="6" width="32" height="28" rx="4" fill="${c}"/>`;
    s += `<rect x="26" y="30" width="48" height="7" rx="3" fill="${c}"/>`;
    s += '<circle cx="50" cy="20" r="4" fill="#f4c430"/>';
  }
  s += '</svg>';
  return s;
}

// 효과음 (파일 없이 브라우저에서 만든다)
const Sound = {
  ctx: null,
  on: true,
  play(kind) {
    if (!this.on) return;
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const tunes = {
        click: [[660, 0.06]],
        correct: [[660, 0.1], [880, 0.15]],
        wrong: [[300, 0.15], [220, 0.2]],
        hit: [[520, 0.05], [780, 0.08]],
        win: [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.3]],
        lose: [[392, 0.18], [330, 0.18], [262, 0.3]]
      };
      let t = this.ctx.currentTime;
      for (const [freq, len] of tunes[kind] || []) {
        const o = this.ctx.createOscillator();
        const v = this.ctx.createGain();
        o.type = kind === 'wrong' || kind === 'lose' ? 'triangle' : 'square';
        o.frequency.value = freq;
        v.gain.setValueAtTime(0.08, t);
        v.gain.exponentialRampToValueAtTime(0.001, t + len);
        o.connect(v).connect(this.ctx.destination);
        o.start(t);
        o.stop(t + len);
        t += len * 0.9;
      }
    } catch (e) { /* 소리가 안 나도 게임은 계속 */ }
  }
};
