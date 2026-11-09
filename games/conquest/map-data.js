// 삼국지 꼬마 장수 - 땅따먹기 지도 데이터: 성, 길, 지형 (서버 SQL 도 이 파일에서 만든다)

// x, y 는 지도(가로 1000, 세로 800) 위의 자리. 실제 위치를 보기 좋게 조금 옮겼어요.
const CITIES = [
  // ----- 북쪽 -----
  { id: 'ji', name: '계', x: 762, y: 68, desc: '북쪽 끝의 큰 성이에요. 공손찬의 흰 말 부대가 있었어요.', gens: ['gongsunzan', 'zhangfei'] },
  { id: 'yanmen', name: '안문', x: 630, y: 92, desc: '북쪽 국경의 관문이에요. 장료가 태어난 곳이에요.', gens: ['zhangliao'] },
  { id: 'jinyang', name: '진양', x: 590, y: 156, desc: '힘센 여포가 자란 북쪽 땅이에요.', gens: ['lvbu', 'gaoshun'] },
  { id: 'pingyuan', name: '평원', x: 762, y: 190, desc: '유비가 처음으로 다스린 작은 고을이에요.', gens: ['zhaoyun', 'jianyong'] },
  { id: 'ye', name: '업', x: 650, y: 215, desc: '원소가 다스린 넓고 부자인 땅이에요.', gens: ['yuanshao', 'zhanghe', 'zhangjiao', 'zhangbao2', 'zhenji', 'shenpei'] },
  { id: 'beihai', name: '북해', x: 858, y: 209, desc: '바다와 가까운 동쪽 땅이에요.', gens: ['sunqian', 'kongrong'] },
  { id: 'donglai', name: '동래', x: 928, y: 188, desc: '바다로 쭉 나온 땅 끝이에요. 활의 명수 태사자의 고향이에요.', gens: ['taishici'] },
  { id: 'hedong', name: '하동', x: 515, y: 250, desc: '큰 강 황하가 꺾이는 곳이에요. 서황의 고향이에요.', gens: ['xuhuang'] },
  { id: 'puyang', name: '복양', x: 716, y: 256, desc: '조조와 여포가 크게 겨룬 곳이에요.', gens: ['chengyu', 'yujin', 'chengong'] },
  { id: 'langya', name: '낭야', x: 875, y: 272, desc: '제갈량과 형 제갈근이 태어난 곳이에요.', gens: ['zhugejin', 'xusheng'] },
  // ----- 가운데 -----
  { id: 'chenliu', name: '진류', x: 680, y: 296, desc: '조조가 처음 군사를 모은 곳이에요.', gens: ['dianwei', 'yuejin', 'simazhao'] },
  { id: 'luoyang', name: '낙양', x: 586, y: 302, desc: '한나라의 옛 수도예요. 큰 궁궐이 있었어요.', gens: ['caopi', 'caozhi', 'wangyun', 'diaochan', 'huaxiong', 'caorui'] },
  { id: 'xiaopei', name: '소패', x: 784, y: 297, desc: '유비가 잠시 머물렀던 작은 성이에요.', gens: ['xiahouyuan'] },
  { id: 'xiapi', name: '하비', x: 840, y: 322, desc: '물로 둘러싸인 튼튼한 성이에요.', gens: ['mizhu', 'lusu', 'zhangzhao', 'taoqian'] },
  { id: 'qiao', name: '초', x: 725, y: 340, desc: '조조와 허저, 의사 화타의 고향이에요.', gens: ['xuchu', 'caohong', 'huatuo'] },
  { id: 'xuchang', name: '허창', x: 645, y: 340, desc: '조조가 황제를 모셔 온 위나라의 중심이에요.', gens: ['caocao', 'xunyu', 'xunyou', 'guojia', 'xiahoudun', 'chenqun'] },
  { id: 'wan', name: '완', x: 600, y: 372, desc: '남쪽 형주로 가는 길목이에요.', gens: ['jiaxu', 'dengai'] },
  { id: 'runan', name: '여남', x: 700, y: 395, desc: '여몽의 고향이에요. 넓은 들판이 있어요.', gens: ['lvmeng'] },
  { id: 'shouchun', name: '수춘', x: 760, y: 385, desc: '원술이 스스로 황제라고 뽐낸 곳이에요.', gens: ['yuanshu', 'simashi'] },
  // ----- 서쪽 -----
  { id: 'wuwei', name: '무위', x: 154, y: 156, desc: '말을 잘 타는 서량 사람들의 땅이에요.', gens: ['mateng', 'machao'] },
  { id: 'jincheng', name: '금성', x: 215, y: 240, desc: '서쪽 끝 황하 강가의 성이에요.', gens: ['hansui'] },
  { id: 'anding', name: '안정', x: 330, y: 235, desc: '서쪽 고원에 있는 성이에요.', gens: ['madai'] },
  { id: 'tianshui', name: '천수', x: 291, y: 302, desc: '강유가 태어난 서쪽 땅이에요.', gens: ['jiangwei'] },
  { id: 'chencang', name: '진창', x: 372, y: 300, desc: '작은 성이지만 아주 튼튼해서 제갈량도 애를 먹었어요.', gens: ['caozhen', 'haozhao'] },
  { id: 'changan', name: '장안', x: 432, y: 315, desc: '서쪽의 큰 수도예요. 동탁이 머물렀어요.', gens: ['dongzhuo', 'simayi', 'caiwenji'] },
  { id: 'hanzhong', name: '한중', x: 348, y: 368, desc: '촉으로 가는 길목, 산에 둘러싸인 땅이에요.', gens: ['zhanglu', 'weiyan', 'zhonghui'] },
  { id: 'shangyong', name: '상용', x: 480, y: 400, desc: '깊은 산골짜기에 숨은 성이에요.', gens: ['masu', 'mengda', 'liufeng'] },
  { id: 'baxi', name: '파서', x: 315, y: 445, desc: '장비가 다스린 적이 있는 산골 땅이에요. 왕평의 고향이에요.', gens: ['wangping', 'huangquan'] },
  { id: 'chengdu', name: '성도', x: 220, y: 473, desc: '촉나라의 수도예요. 땅이 기름지고 살기 좋아요.', gens: ['liubei', 'liuzhang', 'fazheng', 'liushan'] },
  { id: 'jiangzhou', name: '강주', x: 326, y: 530, desc: '큰 강가 산 위에 있는 성이에요.', gens: ['yanyan', 'dengzhi'] },
  { id: 'jianwei', name: '건위', x: 205, y: 560, desc: '큰 불상이 있는 강가 땅이에요. 이엄이 다스렸어요.', gens: ['liyan'] },
  { id: 'yongan', name: '영안', x: 452, y: 468, desc: '백제성이라고도 해요. 유비가 제갈량에게 나라를 부탁한 곳이에요.', gens: ['zhugeliang', 'guanxing', 'zhangbao'] },
  { id: 'yongchang', name: '영창', x: 140, y: 640, desc: '남쪽 끝 높은 산 너머의 땅이에요. 축융의 나라예요.', gens: ['zhurong'] },
  { id: 'nanzhong', name: '남중', x: 207, y: 690, desc: '코끼리가 사는 남쪽 나라, 맹획의 땅이에요.', gens: ['menghuo'] },
  // ----- 형주와 남쪽 -----
  { id: 'xiangyang', name: '양양', x: 545, y: 452, desc: '유표가 다스린 형주의 중심이에요. 똑똑한 사람이 많았어요.', gens: ['liubiao', 'pangtong', 'huangyueying', 'maliang'] },
  { id: 'jiangling', name: '강릉', x: 565, y: 512, desc: '큰 강가의 성이에요. 관우가 지켰어요.', gens: ['guanyu', 'guanping', 'liaohua'] },
  { id: 'jiangxia', name: '강하', x: 672, y: 478, desc: '큰 강이 만나는 곳이에요.', gens: ['ganning', 'handang', 'wenpin'] },
  { id: 'wuling', name: '무릉', x: 518, y: 578, desc: '복숭아꽃이 피는 산골 마을이 많은 땅이에요.', gens: ['zhoucang'] },
  { id: 'changsha', name: '장사', x: 612, y: 583, desc: '할아버지 장수 황충이 있던 남쪽 성이에요.', gens: ['huangzhong'] },
  { id: 'lingling', name: '영릉', x: 540, y: 660, desc: '황개와 장완의 고향이에요.', gens: ['huanggai', 'jiangwan'] },
  { id: 'guiyang', name: '계양', x: 612, y: 686, desc: '남쪽 산속의 조용한 성이에요.', gens: ['feiyi'] },
  { id: 'nanhai', name: '남해', x: 690, y: 755, desc: '남쪽 바닷가의 성이에요. 지금의 광저우예요.', gens: ['lukang', 'shixie'] },
  // ----- 동쪽 (오나라 땅) -----
  { id: 'chaisang', name: '시상', x: 750, y: 530, desc: '적벽대전 때 오나라 군대가 모인 곳이에요.', gens: ['zhoutai'] },
  { id: 'yuzhang', name: '예장', x: 720, y: 600, desc: '큰 호수 옆의 넓은 땅이에요.', gens: ['chengpu'] },
  { id: 'lujiang', name: '여강', x: 790, y: 490, desc: '주유와 대교, 소교의 고향이에요.', gens: ['zhouyu', 'daqiao', 'xiaoqiao', 'chenwu'] },
  { id: 'jianye', name: '건업', x: 872, y: 412, desc: '오나라의 수도예요. 지금의 난징이에요.', gens: ['sunquan', 'sunshangxiang', 'zhugeke', 'sundeng'] },
  { id: 'danyang', name: '단양', x: 870, y: 480, desc: '용감한 군사가 많기로 이름난 땅이에요.', gens: ['dingfeng', 'quancong'] },
  { id: 'wu', name: '오', x: 946, y: 447, desc: '손씨 집안의 고향이에요. 물길이 많아요.', gens: ['sunjian', 'sunce', 'luxun', 'zhuhuan', 'guyong'] },
  { id: 'kuaiji', name: '회계', x: 940, y: 520, desc: '동쪽 바닷가의 남쪽 땅이에요.', gens: ['lingtong', 'wanglang', 'dongxi', 'yufan'] },
  { id: 'jianan', name: '건안', x: 845, y: 640, desc: '동남쪽 산과 바다 사이의 땅이에요.', gens: ['kanze'] },
  // ----- 더 많은 성 20개 -----
  { id: 'hejian', name: '하간', x: 700, y: 148, desc: '북쪽 넓은 들판의 땅이에요. 원소의 군사들이 많았어요.', gens: ['caozhang', 'tianfeng', 'jushou'] },
  { id: 'nanpi', name: '남피', x: 812, y: 135, desc: '원소 집안이 하북을 다스린 바닷가 성이에요.', gens: ['xuyou', 'wenchou', 'yanliang', 'yuanshang'] },
  { id: 'liucheng', name: '유성', x: 920, y: 50, desc: '북쪽 초원으로 가는 길목, 오환 사람들의 땅이에요.', gens: ['tadun'] },
  { id: 'xuantu', name: '현도', x: 1075, y: 40, desc: '요동 북쪽 산속의 성이에요.', gens: ['gongsunkang'] },
  { id: 'taishan', name: '태산', x: 812, y: 238, desc: '아주 높고 유명한 산 태산이 있는 땅이에요.', gens: ['zangba'] },
  { id: 'guangling', name: '광릉', x: 918, y: 372, desc: '큰 강 하구의 바닷가 성이에요. 지금의 양저우예요.', gens: ['lvfan'] },
  { id: 'hefei', name: '합비', x: 812, y: 428, desc: '위나라와 오나라가 여러 번 다툰 튼튼한 성이에요.', gens: ['lidian'] },
  { id: 'hongnong', name: '홍농', x: 510, y: 320, desc: '장안과 낙양 사이 산길의 성이에요.', gens: ['caochun'] },
  { id: 'xinye', name: '신야', x: 630, y: 415, desc: '유비가 머물며 서서와 제갈량을 만난 작은 성이에요.', gens: ['xushu', 'yiji'] },
  { id: 'dangyang', name: '당양', x: 505, y: 478, desc: '장판교가 있는 곳이에요. 장비가 다리 위에서 크게 외쳤어요.', gens: ['chendao'] },
  { id: 'chibi', name: '적벽', x: 640, y: 525, desc: '적벽대전이 벌어진 큰 강가예요.', gens: ['panzhang'] },
  { id: 'poyang', name: '파양', x: 795, y: 578, desc: '아주 큰 호수 옆의 땅이에요. 오나라 수군이 연습했어요.', gens: ['jiangqin', 'zhuran'] },
  { id: 'cangwu', name: '창오', x: 585, y: 745, desc: '남쪽 강가의 성이에요. 더 남쪽 교주로 가는 길목이에요.', gens: ['buzhi'] },
  { id: 'xiping', name: '서평', x: 125, y: 255, desc: '서쪽 끝 높은 고원의 성이에요.', gens: ['guohuai'] },
  { id: 'qishan', name: '기산', x: 295, y: 352, desc: '제갈량이 위나라로 나아갈 때 지나간 산이에요.', gens: ['wangshuang'] },
  { id: 'yinping', name: '음평', x: 205, y: 365, desc: '아주 험한 산길이에요. 등애가 이 길을 넘어갔어요.', gens: ['xiahouba'] },
  { id: 'jiange', name: '검각', x: 255, y: 410, desc: '촉으로 들어가는 아주 험한 관문이에요. 지키기 쉽고 뚫기 어려워요.', gens: ['zhangyi'] },
  { id: 'mianzhu', name: '면죽', x: 170, y: 425, desc: '성도 북쪽을 지키는 성이에요.', gens: ['zhugezhan', 'wuyi'] },
  { id: 'zangke', name: '장가', x: 300, y: 625, desc: '남쪽 산과 골짜기가 많은 땅이에요.', gens: ['machong'] },
  { id: 'yuexi', name: '월수', x: 150, y: 562, desc: '남서쪽 산속, 여러 부족이 함께 사는 땅이에요.', gens: ['zhangni'] },
  { id: 'fancheng', name: '번성', x: 566, y: 396, desc: '양양 바로 건너편 강가의 성이에요. 관우가 물을 불려 공격했지만 조인이 끝까지 지켰어요(번성 전투).', gens: ['caoren', 'manchong', 'pangde'] },
  // ----- 요동과 한반도 -----
  { id: 'liaodong', name: '요동', x: 1000, y: 84, desc: '중국과 한반도 사이의 땅이에요. 공손씨 집안이 다스렸어요.', gens: ['gongsundu', 'guanqiujian'] },
  { id: 'gungnae', name: '국내성', x: 1122, y: 60, desc: '압록강 가에 있는 고구려의 수도예요.', gens: ['dongcheon', 'milwoo', 'ijuha'] },
  { id: 'pyongyang', name: '평양성', x: 1098, y: 125, desc: '대동강 가의 큰 성이에요. 나중에 고구려의 수도가 되었어요.', gens: ['gogukcheon', 'eulpaso', 'ijisu'] },
  { id: 'wirye', name: '위례성', x: 1128, y: 180, desc: '한강 가에 있는 백제의 수도예요. 지금의 서울이에요.', gens: ['goi', 'chogo', 'kimminyoung'] },
  { id: 'seorabeol', name: '서라벌', x: 1172, y: 222, desc: '신라의 수도예요. 지금의 경주예요.', gens: ['naehae', 'seokuro', 'ijonggyun'] }
];

// 성 등급: 큰 성일수록 지키는 장수가 많고 성벽이 튼튼하다 (지키는 장수의 처음 에너지 +wall%)
const CITY_GRADES = {
  1: { name: '작은 성', slots: 2, wall: 10 },
  2: { name: '보통 성', slots: 3, wall: 25 },
  3: { name: '큰 성', slots: 5, wall: 40 }
};
const BIG_CITIES = ['luoyang', 'changan', 'xuchang', 'chengdu', 'jianye', 'ye', 'xiangyang', 'gungnae'];
const MID_CITIES = ['ji', 'jinyang', 'wan', 'hanzhong', 'jiangling', 'shouchun', 'xiapi', 'wu', 'chenliu', 'puyang',
  'changsha', 'lujiang', 'jiangxia', 'beihai', 'tianshui', 'wuwei', 'yongan', 'chaisang', 'xiaopei', 'qiao',
  'liaodong', 'pyongyang', 'wirye', 'seorabeol', 'hefei', 'nanpi', 'jiange', 'fancheng'];
CITIES.forEach((c) => { c.grade = BIG_CITIES.includes(c.id) ? 3 : MID_CITIES.includes(c.id) ? 2 : 1; });

// 지역 장수가 모자라면 수비병이 빈자리를 채운다 (도감에는 없는, 성을 지키는 병사들)
const SOLDIERS = {
  sol_spear: { name: '창병대', troop: 'spear', power: 210, face: '#f2d0a9', hat: 'helmet', hatColor: '#795548', armor: '#8d6e63', beard: 'none' },
  sol_bow: { name: '궁병대', troop: 'bow', power: 210, face: '#f2d0a9', hat: 'helmet', hatColor: '#4e6e58', armor: '#6d8b74', beard: 'none' },
  sol_horse: { name: '기병대', troop: 'horse', power: 210, face: '#f2d0a9', hat: 'helmet', hatColor: '#4b5d7a', armor: '#7f8fa6', beard: 'none' }
};
const SOLDIER_ORDER = ['sol_spear', 'sol_bow', 'sol_horse'];

// 그 성을 지키는 줄: 앞에서부터 등급만큼(slots) 쓰고, 모자라면 수비병으로 채운다
function garrison(cityId, base) {
  const slots = CITY_GRADES[CITIES.find((c) => c.id === cityId).grade].slots;
  const line = base.slice(0, slots);
  for (let k = 0; line.length < slots; k++) line.push(SOLDIER_ORDER[k % SOLDIER_ORDER.length]);
  return line;
}
const wallOf = (cityId) => CITY_GRADES[CITIES.find((c) => c.id === cityId).grade].wall;

// 성과 성을 잇는 길
const ROADS = [
  ['ji', 'yanmen'], ['ji', 'ye'], ['ji', 'pingyuan'], ['ji', 'beihai'],
  ['yanmen', 'jinyang'],
  ['jinyang', 'ye'], ['jinyang', 'hedong'],
  ['pingyuan', 'ye'], ['pingyuan', 'beihai'], ['pingyuan', 'puyang'],
  ['beihai', 'donglai'], ['beihai', 'langya'], ['beihai', 'puyang'],
  ['ye', 'puyang'],
  ['hedong', 'luoyang'], ['hedong', 'changan'],
  ['puyang', 'chenliu'], ['puyang', 'xiaopei'],
  ['langya', 'xiapi'], ['langya', 'xiaopei'],
  ['chenliu', 'luoyang'], ['chenliu', 'xuchang'], ['chenliu', 'qiao'],
  ['luoyang', 'changan'], ['luoyang', 'xuchang'], ['luoyang', 'wan'],
  ['xiaopei', 'xiapi'], ['xiaopei', 'qiao'],
  ['xiapi', 'shouchun'], ['xiapi', 'jianye'],
  ['qiao', 'xuchang'], ['qiao', 'shouchun'],
  ['xuchang', 'wan'], ['xuchang', 'runan'],
  ['wan', 'runan'], ['wan', 'fancheng'], ['fancheng', 'xiangyang'], ['fancheng', 'xinye'], ['fancheng', 'shangyong'],
  ['runan', 'shouchun'], ['runan', 'jiangxia'],
  ['shouchun', 'lujiang'], ['shouchun', 'jianye'],
  ['wuwei', 'jincheng'],
  ['jincheng', 'anding'], ['jincheng', 'tianshui'],
  ['anding', 'tianshui'], ['anding', 'changan'],
  ['tianshui', 'chencang'], ['tianshui', 'hanzhong'],
  ['chencang', 'changan'], ['chencang', 'hanzhong'],
  ['changan', 'hanzhong'],
  ['hanzhong', 'shangyong'], ['hanzhong', 'baxi'],
  ['shangyong', 'xiangyang'], ['shangyong', 'yongan'],
  ['baxi', 'chengdu'], ['baxi', 'jiangzhou'],
  ['chengdu', 'jiangzhou'], ['chengdu', 'jianwei'],
  ['jianwei', 'jiangzhou'], ['jianwei', 'nanzhong'], ['jianwei', 'yongchang'],
  ['yongchang', 'nanzhong'],
  ['jiangzhou', 'yongan'], ['jiangzhou', 'nanzhong'],
  ['yongan', 'jiangling'],
  ['xiangyang', 'jiangling'], ['xiangyang', 'jiangxia'],
  ['jiangling', 'jiangxia'], ['jiangling', 'wuling'], ['jiangling', 'changsha'],
  ['wuling', 'changsha'], ['wuling', 'lingling'],
  ['changsha', 'jiangxia'], ['changsha', 'chaisang'], ['changsha', 'lingling'], ['changsha', 'guiyang'], ['changsha', 'yuzhang'],
  ['lingling', 'guiyang'],
  ['guiyang', 'nanhai'],
  ['nanhai', 'yuzhang'],
  ['jiangxia', 'chaisang'], ['jiangxia', 'lujiang'],
  ['chaisang', 'lujiang'], ['chaisang', 'yuzhang'],
  ['yuzhang', 'jianan'],
  ['lujiang', 'jianye'], ['lujiang', 'danyang'],
  ['jianye', 'danyang'], ['jianye', 'wu'],
  ['danyang', 'wu'], ['danyang', 'kuaiji'],
  ['wu', 'kuaiji'],
  ['kuaiji', 'jianan'],
  ['ji', 'liaodong'], ['liaodong', 'gungnae'], ['liaodong', 'pyongyang'],
  ['gungnae', 'pyongyang'], ['pyongyang', 'wirye'], ['wirye', 'seorabeol'],
  ['hejian', 'ji'], ['hejian', 'yanmen'], ['hejian', 'ye'], ['hejian', 'pingyuan'], ['hejian', 'nanpi'],
  ['nanpi', 'ji'], ['nanpi', 'pingyuan'], ['nanpi', 'beihai'],
  ['liucheng', 'ji'], ['liucheng', 'liaodong'], ['xuantu', 'liaodong'], ['xuantu', 'gungnae'],
  ['taishan', 'pingyuan'], ['taishan', 'beihai'], ['taishan', 'langya'], ['taishan', 'xiaopei'], ['taishan', 'puyang'],
  ['guangling', 'xiapi'], ['guangling', 'jianye'],
  ['hefei', 'shouchun'], ['hefei', 'lujiang'], ['hefei', 'jianye'],
  ['hongnong', 'changan'], ['hongnong', 'luoyang'], ['hongnong', 'hedong'], ['hongnong', 'shangyong'],
  ['xinye', 'wan'], ['xinye', 'xiangyang'], ['xinye', 'runan'], ['xinye', 'jiangxia'],
  ['dangyang', 'xiangyang'], ['dangyang', 'jiangling'], ['dangyang', 'yongan'], ['dangyang', 'shangyong'],
  ['chibi', 'jiangxia'], ['chibi', 'jiangling'], ['chibi', 'changsha'],
  ['poyang', 'chaisang'], ['poyang', 'yuzhang'], ['poyang', 'jianan'],
  ['cangwu', 'guiyang'], ['cangwu', 'lingling'], ['cangwu', 'nanhai'],
  ['xiping', 'wuwei'], ['xiping', 'jincheng'],
  ['qishan', 'tianshui'], ['qishan', 'hanzhong'],
  ['yinping', 'tianshui'], ['yinping', 'mianzhu'], ['yinping', 'jiange'],
  ['jiange', 'hanzhong'], ['jiange', 'baxi'], ['jiange', 'mianzhu'],
  ['mianzhu', 'chengdu'],
  ['zangke', 'jiangzhou'], ['zangke', 'nanzhong'], ['zangke', 'jianwei'],
  ['yuexi', 'jianwei'], ['yuexi', 'yongchang'],
  ['donglai', 'wirye'] // 뱃길
];
// 바다를 건너는 길 (지도에 파란 점선으로)
const SEA_ROUTES = [['donglai', 'wirye']];

// 땅 모양과 큰 강 (그림용으로 단순하게)
const MAP_W = 1240, MAP_H = 800;
const MAP_LAND = 'M90,140 L230,80 L400,120 L520,70 L660,40 L760,20 L850,40 L880,90 L830,130 L812,170 L900,165 L960,200 L905,250 L880,290 L905,345 L975,395 L990,470 L975,560 L930,660 L840,730 L720,790 L560,785 L420,750 L290,770 L160,760 L100,640 L130,540 L100,430 L70,320 L60,220 Z';
// 요동과 한반도 땅
const MAP_LAND2 = 'M850,40 L1000,15 L1100,10 L1168,28 L1172,75 L1145,102 L1175,140 L1203,190 L1200,240 L1168,264 L1112,262 L1086,220 L1080,170 L1062,138 L1040,114 L1000,124 L940,112 L880,90 Z';
// 나라 바깥 땅: 바다는 동쪽과 동남쪽뿐이고, 북쪽은 사막, 서쪽과 남쪽은 높은 산이다
const MAP_SEA = 'M880,90 L960,118 L1060,135 L1172,80 L1240,50 L1240,800 L600,800 L720,790 L840,730 L930,660 L975,560 L990,470 L975,395 L905,345 L880,290 L905,250 L960,200 L900,165 L812,170 L830,130 Z';
const MAP_DESERT = 'M0,0 L880,0 L860,45 L760,20 L660,40 L520,70 L400,120 L230,80 L90,140 L0,215 Z';
const MAP_MOUNTAINS_OUT = [[891,12],[1227,12],[23,208],[23,292],[23,376],[79,432],[79,516],[79,600],[23,656],[107,684],[23,740],[107,768],[191,768],[331,768],[415,768],[499,796],[583,796]];
// 산: 길이 지나지 않는 험한 땅에 그린다 (그림일 뿐, 길이나 성과는 상관없다)
const MAP_MOUNTAINS = [[715,50],[579,80],[205,110],[273,110],[511,110],[375,140],[443,140],[103,170],[307,170],[545,170],[647,170],[239,200],[409,200],[477,200],[579,230],[443,260],[171,290],[103,350],[137,410],[409,410],[749,440],[375,470],[137,500],[477,530],[681,530],[375,560],[851,560],[443,590],[341,620],[681,620],[919,620],[409,650],[477,650],[783,650],[273,680],[647,680],[341,710],[443,710],[749,710],[817,710],[511,740]];
// 이웃 부족들의 거점: 표시만 한다 (성이 아니라 차지할 수 없다)
const MAP_TRIBES = [
  { name: '흉노', x: 452, y: 182 }, { name: '선비', x: 545, y: 98 }, { name: '오환', x: 848, y: 72 },
  { name: '부여', x: 1015, y: 40 }, { name: '강족', x: 108, y: 330 }, { name: '남만', x: 272, y: 738 }, { name: '산월', x: 902, y: 595 }
];
const MAP_LABELS = [
  { name: '고구려', x: 1168, y: 38 }, { name: '백제', x: 1120, y: 252 }, { name: '신라', x: 1192, y: 168 }, { name: '황해', x: 1012, y: 262 }, { name: '고비 사막', x: 470, y: 50 }, { name: '티베트 고원', x: 42, y: 520, v: 1 }
];
const MAP_RIVERS = [
  { name: '황하', x: 440, y: 120, d: 'M120,250 C220,170 300,120 420,110 C520,100 540,190 520,260 C510,300 560,290 620,282 C690,272 740,240 790,200 L840,175' },
  { name: '장강', x: 420, y: 548, d: 'M110,600 C180,520 250,470 330,500 C400,520 440,470 500,480 C560,490 600,520 660,500 C720,485 760,500 800,470 C850,440 900,430 975,425' }
];
