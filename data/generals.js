// 삼국지 꼬마 장수 - 장수 데이터 1: 처음 27명, 능력치, 특기, 별 친구

// 장수 그림 설정
// face: 얼굴색, hat: 모자 모양, hatColor: 모자색, armor: 옷색, beard: 수염 모양, item: 들고 있는 것
const GENERALS = {
  liubei: {
    name: '유비', nation: '촉나라', face: '#ffdcb8', hat: 'crown', hatColor: '#f4c430', armor: '#3fa34d', beard: 'short', item: '⚔️',
    skill: '인덕의 바람',
    intro: '마음씨가 따뜻해서 많은 사람이 따랐어요. 관우, 장비와 형제가 되었고 촉나라를 세웠어요.'
  },
  guanyu: {
    name: '관우', nation: '촉나라', face: '#e9806a', hat: 'helmet', hatColor: '#2e7d4f', armor: '#2e7d4f', beard: 'long', item: '🐉',
    skill: '청룡언월도',
    intro: '의리가 깊고 긴 수염이 멋져서 "아름다운 수염의 장군"이라고 불렸어요.'
  },
  zhangfei: {
    name: '장비', nation: '촉나라', face: '#e8b48c', hat: 'helmet', hatColor: '#444a5a', armor: '#5a5f73', beard: 'bushy', item: '📣',
    skill: '천둥 고함',
    intro: '목소리가 천둥처럼 커요! 장판교 다리 위에서 큰 소리 한 번으로 적을 돌려보냈어요.'
  },
  zhugeliang: {
    name: '제갈량', nation: '촉나라', face: '#ffe2c4', hat: 'scholar', hatColor: '#3b4a6b', armor: '#e9eef5', beard: 'goatee', item: '🪶',
    skill: '동남풍 부채',
    intro: '아주 똑똑한 꾀돌이 군사예요. 깃털 부채를 들고 다니며 멋진 작전을 짰어요.'
  },
  zhaoyun: {
    name: '조운', nation: '촉나라', face: '#ffdcb8', hat: 'helmet', hatColor: '#b8c4d6', armor: '#7f95b5', beard: 'none', item: '⚡',
    skill: '번개 창',
    intro: '용감하고 날쌘 장수예요. 아기 아두를 품에 안고 위험한 곳에서 구해 냈어요.'
  },
  zhangjiao: {
    name: '장각', nation: '황건적', face: '#f2d0a9', hat: 'band', hatColor: '#f5c518', armor: '#c9a227', beard: 'goatee', item: '📜',
    skill: '노란 바람',
    intro: '노란 두건을 두른 무리의 대장이에요. 삼국지 이야기는 장각의 무리가 일어나면서 시작돼요.'
  },
  dongzhuo: {
    name: '동탁', nation: '한나라', face: '#f0c09a', hat: 'tall', hatColor: '#6b3f7a', armor: '#7d4f8f', beard: 'bushy', item: '🍖',
    skill: '욕심 쿵쿵',
    intro: '욕심이 아주 많아서 모두를 힘들게 했어요. 지금은 친구들과 나눠 먹는 법을 배우는 중이에요.'
  },
  lvbu: {
    name: '여포', nation: '한나라', face: '#ffd6b0', hat: 'feather', hatColor: '#c0392b', armor: '#c0392b', beard: 'none', item: '🐎',
    skill: '방천화극',
    intro: '삼국지에서 가장 힘이 센 장수! 빨간 명마 "적토마"를 타고 다녔어요.'
  },
  yuanshao: {
    name: '원소', nation: '원소군', face: '#ffdcb8', hat: 'helmet', hatColor: '#d4a017', armor: '#b8860b', beard: 'short', item: '🚩',
    skill: '깃발 행진',
    intro: '훌륭한 집안에서 태어났고 군사가 아주 많았어요. 관도에서 조조와 크게 겨뤘어요.'
  },
  caocao: {
    name: '조조', nation: '위나라', face: '#ffdcb8', hat: 'crown', hatColor: '#2c4f8c', armor: '#2c4f8c', beard: 'short', item: '📖',
    skill: '꾀돌이 작전',
    intro: '꾀가 많고 시도 잘 짓는 위나라의 주인이에요. 인재를 아주 소중히 여겼어요.'
  },
  simayi: {
    name: '사마의', nation: '위나라', face: '#f7dcc0', hat: 'scholar', hatColor: '#1f2f4f', armor: '#34495e', beard: 'goatee', item: '🔭',
    skill: '참을성 작전',
    intro: '제갈량과 꾀를 겨룬 위나라의 군사예요. 꾹 참고 기다리는 게 특기예요.'
  },

  // ----- 별을 모으면 만나는 장수 -----
  sunquan: {
    name: '손권', nation: '오나라', face: '#ffdcb8', hat: 'crown', hatColor: '#c0392b', armor: '#c0392b', beard: 'short', beardColor: '#7d3c98', item: '👑',
    skill: '강동의 물결',
    intro: '오나라를 다스린 젊은 임금이에요. 보랏빛 수염으로 그려지고, 사람을 잘 믿고 맡겼어요.'
  },
  zhouyu: {
    name: '주유', nation: '오나라', face: '#ffe2c4', hat: 'helmet', hatColor: '#d35400', armor: '#e67e22', beard: 'none', item: '🎵',
    skill: '적벽의 불꽃',
    intro: '음악을 사랑한 멋쟁이 대도독이에요. 적벽대전에서 큰불 작전을 이끌었어요.'
  },
  huangzhong: {
    name: '황충', nation: '촉나라', face: '#f5d0ad', hat: 'helmet', hatColor: '#7f8c3a', armor: '#6b7a2f', beard: 'long', beardColor: '#e8e8e8', item: '🏹',
    skill: '백발백중 화살',
    intro: '나이가 많아도 활 솜씨는 최고! 정군산에서 큰 공을 세운 할아버지 장수예요.'
  },
  machao: {
    name: '마초', nation: '촉나라', face: '#ffe2c4', hat: 'helmet', hatColor: '#ecf0f1', armor: '#bdc3c7', beard: 'none', item: '🐴',
    skill: '은빛 돌격',
    intro: '반짝이는 은빛 갑옷을 입은 멋쟁이 장수예요. 말을 아주 잘 탔어요.'
  },
  xiahoudun: {
    name: '하후돈', nation: '위나라', face: '#f2c9a0', hat: 'helmet', hatColor: '#2c4f8c', armor: '#34495e', beard: 'short', patch: true, item: '🛡️',
    skill: '외눈 장군 돌진',
    intro: '조조의 든든한 사촌 장수예요. 한쪽 눈을 가린 모습이 트레이드마크예요.'
  },
  sunce: {
    name: '손책', nation: '오나라', face: '#ffdcb8', hat: 'helmet', hatColor: '#e74c3c', armor: '#c0392b', beard: 'none', item: '🔥',
    skill: '작은 패왕',
    intro: '손권의 형이에요. "작은 패왕"이라고 불릴 만큼 씩씩하게 강동 땅을 누볐어요.'
  },
  diaochan: {
    name: '초선', nation: '한나라', face: '#ffe6d0', hat: 'bun', hatColor: '#2d2d2d', armor: '#f78fb3', beard: 'none', item: '🌸',
    skill: '달빛 춤',
    intro: '아름답고 지혜로운 사람이에요. 꾀를 내어 욕심쟁이 동탁과 여포가 서로 다투게 만들었어요.'
  },
  zhangliao: {
    name: '장료', nation: '위나라', face: '#f2c9a0', hat: 'helmet', hatColor: '#5d6d7e', armor: '#566573', beard: 'goatee', item: '🌪️',
    skill: '합비의 회오리',
    intro: '합비에서 아주 적은 군사로 많은 군사를 막아 낸 용감한 장수예요.'
  },
  ganning: {
    name: '감녕', nation: '오나라', face: '#f0c09a', hat: 'band', hatColor: '#e67e22', armor: '#d35400', beard: 'goatee', item: '🔔',
    skill: '방울 소리',
    intro: '허리에 방울을 달고 다녔어요. 방울 소리만 들려도 "감녕이 왔다!" 하고 알았대요.'
  },
  lvmeng: {
    name: '여몽', nation: '오나라', face: '#f5d0ad', hat: 'helmet', hatColor: '#8e44ad', armor: '#6c3483', beard: 'short', item: '📚',
    skill: '열공 변신',
    intro: '처음엔 공부를 싫어했지만 열심히 공부해서 몰라보게 똑똑해졌어요. "괄목상대"의 주인공!'
  },
  xuchu: {
    name: '허저', nation: '위나라', face: '#eab58c', hat: 'helmet', hatColor: '#7b5d3f', armor: '#6e4b2a', beard: 'bushy', item: '🐯',
    skill: '호랑이 힘',
    intro: '호랑이처럼 힘이 센 조조의 경호 대장이에요. 소의 꼬리를 잡고 끌었다는 이야기도 있어요.'
  },
  menghuo: {
    name: '맹획', nation: '남만', face: '#c98f6b', hat: 'band', hatColor: '#27ae60', armor: '#1e8449', beard: 'bushy', item: '🐘',
    skill: '코끼리 행진',
    intro: '남쪽 나라의 대왕이에요. 제갈량에게 일곱 번 잡혔다 풀려난 뒤 진심으로 친구가 되었어요.'
  },
  jiangwei: {
    name: '강유', nation: '촉나라', face: '#ffe2c4', hat: 'helmet', hatColor: '#16a085', armor: '#138d75', beard: 'none', item: '🌟',
    skill: '스승의 꿈',
    intro: '제갈량의 제자예요. 스승의 꿈을 이어 가려고 끝까지 열심히 노력했어요.'
  },
  luxun: {
    name: '육손', nation: '오나라', face: '#ffe2c4', hat: 'scholar', hatColor: '#a93226', armor: '#f5e6d3', beard: 'none', item: '📝',
    skill: '차분한 작전',
    intro: '젊지만 차분하고 지혜로운 오나라의 군사예요. 이릉에서 멋진 작전을 펼쳤어요.'
  },
  dianwei: {
    name: '전위', nation: '위나라', face: '#d9a27a', hat: 'helmet', hatColor: '#4d5656', armor: '#424949', beard: 'bushy', item: '🪓',
    skill: '쌍철극',
    intro: '커다란 쌍철극을 든 힘센 장수예요. 조조를 끝까지 지킨 충성스러운 친구였어요.'
  },
  weiyan: {
    name: '위연', nation: '촉나라', face: '#e8b48c', hat: 'helmet', hatColor: '#922b21', armor: '#7b241c', beard: 'goatee', item: '🗺️',
    skill: '지름길 작전',
    intro: '용감하고 씩씩한 촉나라 장수예요. 빠른 지름길로 가는 작전을 좋아했어요.'
  }
};

// 능력치 (100점 만점): [힘(무력), 지혜(지력), 이끄는 힘(통솔), 인기(매력)]
const STATS = {
  liubei: [73, 74, 80, 99],
  guanyu: [97, 76, 95, 93],
  zhangfei: [98, 32, 85, 45],
  zhugeliang: [35, 100, 93, 96],
  zhaoyun: [96, 76, 90, 85],
  zhangjiao: [25, 82, 70, 92],
  dongzhuo: [85, 62, 80, 18],
  lvbu: [100, 28, 82, 25],
  yuanshao: [68, 70, 80, 86],
  caocao: [74, 95, 99, 92],
  simayi: [55, 98, 96, 70],
  sunquan: [62, 82, 85, 94],
  zhouyu: [70, 96, 96, 92],
  huangzhong: [95, 62, 85, 74],
  machao: [97, 44, 86, 80],
  xiahoudun: [91, 58, 86, 80],
  sunce: [94, 70, 92, 93],
  diaochan: [20, 82, 30, 98],
  zhangliao: [93, 79, 94, 78],
  ganning: [94, 64, 85, 62],
  lvmeng: [82, 90, 90, 74],
  xuchu: [96, 36, 68, 62],
  menghuo: [88, 42, 76, 80],
  jiangwei: [89, 92, 90, 78],
  luxun: [64, 96, 94, 85],
  dianwei: [97, 34, 60, 55],
  weiyan: [92, 66, 84, 42]
};

// 혼자 하기에서 모은 별(모든 난이도 합)이 이만큼 되면 친구가 되는 장수
const STAR_UNLOCK = {
  sunquan: 1, zhouyu: 2, huangzhong: 3, machao: 4, xiahoudun: 5, sunce: 6, diaochan: 7, zhangliao: 8,
  ganning: 9, lvmeng: 10, xuchu: 11, menghuo: 12, jiangwei: 13, luxun: 14, dianwei: 16, weiyan: 18
};

// 능력 이름과, 80 이상일 때 생기는 특기
const PERK_AT = 80;
const STAT_INFO = [
  { icon: '💪', name: '힘', color: '#e74c3c', perk: '필살기', desc: '맞히면 가끔 하트를 2개 깎아요' },
  { icon: '🧠', name: '지혜', color: '#3b7dd8', perk: '힌트', desc: '한 판에 2번, 틀린 보기 하나를 지워요' },
  { icon: '🚩', name: '이끄는 힘', color: '#e67e22', perk: '든든한 군사', desc: '하트를 1개 더 갖고 시작해요' },
  { icon: '💖', name: '인기', color: '#e84393', perk: '친구 응원', desc: '한 판에 1번, 틀려도 다시 풀 수 있어요' }
];

// 처음부터 고를 수 있는 장수
const START_GENERALS = ['liubei', 'guanyu', 'zhangfei', 'zhugeliang', 'zhaoyun'];
