/**
 * 사주 해석 엔진 — 데이터 + 순수 계산 로직
 * DOM 의존 없음
 */
import { calculateSaju, getGapja, getSolarTermsByYear } from '../node_modules/@fullstackfamily/manseryeok/dist/index.mjs';

// ── 매핑 데이터 ──
export const CG_OH = {'甲':'목','乙':'목','丙':'화','丁':'화','戊':'토','己':'토','庚':'금','辛':'금','壬':'수','癸':'수'};
export const JJ_OH = {'子':'수','丑':'토','寅':'목','卯':'목','辰':'토','巳':'화','午':'화','未':'토','申':'금','酉':'금','戌':'토','亥':'수'};
const H2C = {'갑':'甲','을':'乙','병':'丙','정':'丁','무':'戊','기':'己','경':'庚','신':'辛','임':'壬','계':'癸'};
const H2J = {'자':'子','축':'丑','인':'寅','묘':'卯','진':'辰','사':'巳','오':'午','미':'未','신':'申','유':'酉','술':'戌','해':'亥'};
export const OH_HJ = {'목':'木','화':'火','토':'土','금':'金','수':'水'};
const OI = {'목':0,'화':1,'토':2,'금':3,'수':4};
export const JJG = {
  '子':['癸'],'丑':['癸','辛','己'],'寅':['戊','丙','甲'],'卯':['乙'],
  '辰':['乙','癸','戊'],'巳':['戊','庚','丙'],'午':['丙','己','丁'],'未':['丁','乙','己'],
  '申':['戊','壬','庚'],'酉':['辛'],'戌':['辛','丁','戊'],'亥':['戊','甲','壬'],
};
const UN = ['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
const US = {'甲':2,'乙':5,'丙':2,'丁':5,'戊':2,'己':5,'庚':8,'辛':11,'壬':8,'癸':11};
const JO = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const JI = {}; JO.forEach((j,i)=>JI[j]=i);

// 60갑자
const CG10 = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const JJ12 = JO;
const CG10K = ['갑','을','병','정','무','기','경','신','임','계'];
const JJ12K = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const G60 = [];
for (let i=0;i<60;i++) G60.push({ c:CG10[i%10], j:JJ12[i%12], ck:CG10K[i%10], jk:JJ12K[i%12] });
function g60idx(c,j){ return G60.findIndex(g=>g.c===c&&g.j===j); }

// ── 기본 계산 함수 ──
export { calculateSaju, getGapja };

export function elClass(oh) { return oh ? `el-${oh}` : ''; }

export function unsung(c,j) {
  if(!c||!j) return '';
  const s=US[c]; if(s===undefined) return '';
  const y=['甲','丙','戊','庚','壬'].includes(c);
  const o = y ? (JI[j]-s+12)%12 : (s-JI[j]+12)%12;
  return UN[o];
}

const SSN=[['비견','겁재'],['식신','상관'],['편재','정재'],['편관','정관'],['편인','정인']];
export function sipsung(i,t) {
  if(!i||!t) return '';
  const m=OI[CG_OH[i]], x=OI[CG_OH[t]||JJ_OH[t]];
  if(m===undefined||x===undefined) return '';
  const d=(x-m+5)%5;
  const mY=['乙','丁','己','辛','癸'].includes(i);
  const tY=['乙','丁','己','辛','癸','丑','卯','巳','未','酉','亥'].includes(t);
  return SSN[d][mY===tY?0:1];
}

export function parsePillar(hg,hj) {
  let c,j,ck,jk;
  if(hj?.length===2){c=hj[0];j=hj[1];}
  if(hg?.length===2){ck=hg[0];jk=hg[1];if(!c)c=H2C[ck];if(!j)j=H2J[jk];}
  return {c,j,ck,jk,co:CG_OH[c]||'',jo:JJ_OH[j]||''};
}

// ── 총운 ──
const ILGAN_NATURE = {
  '甲': { 음양:'양', 오행:'목', 상징:'큰 나무', 성향:'곧고 강직하며 리더십이 있습니다. 정의감이 강하고 자존심이 높으며, 새로운 것을 개척하는 선구자적 기질을 타고났습니다. 한번 뿌리를 내리면 쉽게 흔들리지 않는 뚝심이 있으나, 고집이 세고 융통성이 부족할 수 있습니다.' },
  '乙': { 음양:'음', 오행:'목', 상징:'풀과 꽃', 성향:'유연하고 적응력이 뛰어납니다. 부드럽고 섬세하며 예술적 감각이 있고, 겉으로는 유순해 보이지만 내면은 질기고 끈기가 있습니다. 사람 사이에서 갈등을 조율하는 중재 능력이 탁월합니다.' },
  '丙': { 음양:'양', 오행:'화', 상징:'태양', 성향:'밝고 열정적이며 주변을 환하게 밝힙니다. 활발하고 사교적이며 정이 많고 솔직합니다. 에너지가 넘쳐 여러 일을 동시에 벌이는 추진력이 있으나, 성급하고 감정 기복이 있을 수 있습니다.' },
  '丁': { 음양:'음', 오행:'화', 상징:'촛불', 성향:'은은하고 따뜻하며 지적입니다. 내면의 열정이 강하고 섬세한 관찰력을 지니며, 한 분야를 깊이 파고드는 집중력이 뛰어납니다. 속마음을 잘 드러내지 않아 내면에 스트레스가 쌓일 수 있습니다.' },
  '戊': { 음양:'양', 오행:'토', 상징:'큰 산', 성향:'듬직하고 신뢰감이 있으며 포용력이 큽니다. 중후하고 믿음직하며 중재자 역할을 잘 합니다. 어떤 풍파에도 흔들리지 않는 안정감이 있으나, 변화에 둔감하고 시작이 느릴 수 있습니다.' },
  '己': { 음양:'음', 오행:'토', 상징:'논밭', 성향:'온화하고 현실적이며 실속이 있습니다. 모성애가 강하고 다른 사람을 잘 보살피며, 겸손하고 인내심이 강합니다. 다만 의심이 많고 소심해질 수 있으며, 자기 희생이 과할 수 있습니다.' },
  '庚': { 음양:'양', 오행:'금', 상징:'바위와 쇠', 성향:'강인하고 결단력이 있으며 의리가 있습니다. 냉철하고 실행력이 뛰어나며, 승부욕이 강하고 직설적입니다. 위기 상황에서 더 강해지는 근성이 있으나, 거칠고 독선적일 수 있습니다.' },
  '辛': { 음양:'음', 오행:'금', 상징:'보석', 성향:'섬세하고 감수성이 풍부하며 완벽주의적입니다. 심미안이 뛰어나고 자기만의 기준이 확고합니다. 예리하고 깔끔하며 높은 품질의 결과물을 만들어내나, 예민하고 비판적일 수 있습니다.' },
  '壬': { 음양:'양', 오행:'수', 상징:'큰 바다', 성향:'지혜롭고 포용력이 크며 자유로운 영혼입니다. 창의적이고 진취적이며 큰 흐름을 읽는 직관력이 뛰어납니다. 낙천적이고 대범하나, 변덕스럽거나 방종할 수 있습니다.' },
  '癸': { 음양:'음', 오행:'수', 상징:'이슬과 빗물', 성향:'조용하고 직관력이 뛰어나며 영적 감수성이 있습니다. 인내심이 강하고 깊은 사고력으로 본질을 꿰뚫습니다. 은밀하게 일을 추진하는 능력이 있으나, 우울하거나 폐쇄적일 수 있습니다.' },
};

const WOLJI_SEASON = {
  '寅': { 계절:'봄(초춘)', 기운:'만물이 깨어나는 시기로, 새로운 시작과 성장의 에너지가 강합니다.' },
  '卯': { 계절:'봄(중춘)', 기운:'생명력이 가장 무성한 때로, 꽃이 피고 만물이 활짝 피어나는 에너지입니다.' },
  '辰': { 계절:'봄(늦봄)', 기운:'봄의 마무리로, 성장한 것을 정리하고 다음 단계를 준비하는 전환의 에너지입니다.' },
  '巳': { 계절:'여름(초하)', 기운:'열기가 시작되는 시기로, 내면의 열정이 본격적으로 드러나는 에너지입니다.' },
  '午': { 계절:'여름(한여름)', 기운:'양기가 극에 달한 시기로, 열정과 활력이 최고조에 이르는 에너지입니다.' },
  '未': { 계절:'여름(늦여름)', 기운:'풍요와 결실이 시작되는 때로, 그간의 노력이 열매를 맺기 시작하는 에너지입니다.' },
  '申': { 계절:'가을(초추)', 기운:'서늘한 바람이 불기 시작하며, 수확과 정리의 에너지가 작용합니다.' },
  '酉': { 계절:'가을(한가을)', 기운:'결실의 정점으로, 완성과 마무리에 집중하는 에너지입니다.' },
  '戌': { 계절:'가을(늦가을)', 기운:'만물이 쇠하기 시작하며, 지키고 수호하는 에너지가 강합니다.' },
  '亥': { 계절:'겨울(초동)', 기운:'만물이 저장되기 시작하며, 내면을 돌아보고 지혜를 축적하는 에너지입니다.' },
  '子': { 계절:'겨울(한겨울)', 기운:'가장 깊은 어둠 속에서 새로운 양기가 싹트는 시기로, 잠재력이 잉태되는 에너지입니다.' },
  '丑': { 계절:'겨울(늦겨울)', 기운:'겨울의 마무리로, 인내하며 봄을 기다리는 축적과 준비의 에너지입니다.' },
};

function getSeasonRelation(ilganOh, woljiOh) {
  if (ilganOh === woljiOh) return '비화(比和) 관계로, 자기 계절을 만나 기운이 왕성합니다. 본래 기질이 강하게 발현되며 자신감이 넘칩니다.';
  const diff = (OI[woljiOh] - OI[ilganOh] + 5) % 5;
  if (diff === 1) return '식상(食傷)의 계절로, 자기 표현과 재능 발휘에 유리합니다. 창의력이 발현되고 활동적인 시기입니다.';
  if (diff === 2) return '재성(財星)의 계절로, 재물과 현실적 성과를 거두기 좋습니다. 부지런히 움직이면 결실을 얻습니다.';
  if (diff === 3) return '관성(官星)의 계절로, 규율과 책임이 따르는 시기입니다. 사회적 인정을 받을 수 있으나 압박감도 있습니다.';
  if (diff === 4) return '인성(印星)의 계절로, 학습과 성장에 유리합니다. 귀인의 도움을 받기 쉽고 내적 성숙이 이루어집니다.';
  return '';
}

function getIljuReading(cgH, jjH) {
  if (!cgH || !jjH) return '';
  const cgOh = CG_OH[cgH]; const jjOh = JJ_OH[jjH];
  const HJ2HG_CG = {'甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계'};
  const HJ2HG_JJ = {'子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해'};
  const diff = (OI[jjOh] - OI[cgOh] + 5) % 5;
  const rel = ['비겁','식상','재성','관성','인성'][diff];
  let r = `${HJ2HG_CG[cgH]}${cgH}일간이 ${HJ2HG_JJ[jjH]}${jjH} 위에 앉아있는 일주입니다. `;
  const descs = {
    '비겁':'일지에 자신과 같은 기운이 있어 독립심과 자주성이 강합니다. 배우자궁에 비겁이 있으니 동반자와 대등한 관계를 추구하며, 혼자서도 잘 해나가는 자립심이 있습니다.',
    '식상':'일지에 식상이 있어 표현력과 재능이 풍부합니다. 배우자궁에 식상이 있으니 자유로운 관계를 원하며, 창작이나 말로 하는 일에 재능을 보입니다.',
    '재성':'일지에 재성이 있어 현실 감각과 관리 능력이 뛰어납니다. 배우자궁에 재성이 있으니 가정적이고 실속을 중시하며, 재물을 다루는 감각이 좋습니다.',
    '관성':'일지에 관성이 있어 책임감과 자기 통제력이 강합니다. 배우자궁에 관성이 있으니 격식을 중시하고 사회적 체면을 신경 쓰며, 절제력이 있습니다.',
    '인성':'일지에 인성이 있어 학습 능력과 내적 안정감이 있습니다. 배우자궁에 인성이 있으니 배우자나 가까운 사람에게서 정서적 지지를 받으며, 사색적이고 깊이가 있습니다.',
  };
  return r + (descs[rel]||'');
}

export function buildChongun(ps) {
  const ilgan = ps[1].c; const ilji = ps[1].j; const wolji = ps[2].j;
  if (!ilgan) return '일간 정보가 없어 총운을 산출할 수 없습니다.';
  const nature = ILGAN_NATURE[ilgan]; if (!nature) return '';
  const ilganOh = CG_OH[ilgan]; const woljiOh = wolji ? JJ_OH[wolji] : null;
  const season = wolji ? WOLJI_SEASON[wolji] : null;
  let h = '';
  h += `<div style="margin-bottom:14px;"><strong class="${elClass(ilganOh)}">${nature.상징}</strong>의 기운을 타고난 <strong>${nature.음양}${nature.오행}</strong> 일간입니다. ${nature.성향}</div>`;
  if (season) { h += `<div style="margin-bottom:14px;"><strong>${season.계절}</strong>에 태어났습니다. ${season.기운} ${woljiOh?getSeasonRelation(ilganOh,woljiOh):''}</div>`; }
  if (ilji) { h += `<div>${getIljuReading(ilgan, ilji)}</div>`; }
  return h;
}

// ── 오늘의 운세 (신살) ──
const CHEONUL = {'甲':['丑','未'],'戊':['丑','未'],'乙':['子','申'],'己':['子','申'],'丙':['亥','酉'],'丁':['亥','酉'],'庚':['午','寅'],'辛':['午','寅'],'壬':['巳','卯'],'癸':['巳','卯']};
const MUNCHANG = {'甲':'巳','乙':'午','丙':'申','丁':'酉','戊':'申','己':'酉','庚':'亥','辛':'子','壬':'寅','癸':'卯'};
const YEOKMA = {'寅':'申','午':'申','戌':'申','申':'寅','子':'寅','辰':'寅','巳':'亥','酉':'亥','丑':'亥','亥':'巳','卯':'巳','未':'巳'};
const DOHWA = {'寅':'卯','午':'卯','戌':'卯','申':'酉','子':'酉','辰':'酉','巳':'午','酉':'午','丑':'午','亥':'子','卯':'子','未':'子'};
const HWAGAE = {'寅':'戌','午':'戌','戌':'戌','申':'辰','子':'辰','辰':'辰','巳':'丑','酉':'丑','丑':'丑','亥':'未','卯':'未','未':'未'};
const GEOBSAL = {'寅':'亥','午':'亥','戌':'亥','申':'巳','子':'巳','辰':'巳','巳':'寅','酉':'寅','丑':'寅','亥':'申','卯':'申','未':'申'};
const JAESAL = {'寅':'子','午':'子','戌':'子','申':'午','子':'午','辰':'午','巳':'卯','酉':'卯','丑':'卯','亥':'酉','卯':'酉','未':'酉'};

const SINSAL_DESC = {
  '천을귀인': { good: true, desc: '귀인의 도움이 있는 날입니다. 어려운 일이 있어도 누군가의 도움으로 풀려나갈 수 있으며, 새로운 인연이 좋은 기회로 이어질 수 있습니다.' },
  '문창귀인': { good: true, desc: '학업과 시험에 유리한 날입니다. 문서 작업, 공부, 자격증, 계약서 등 글과 관련된 일이 잘 풀립니다.' },
  '역마살':   { good: null, desc: '이동과 변화의 기운이 강한 날입니다. 출장, 여행, 이사 등 움직임이 생기거나 새로운 소식이 들어올 수 있습니다.' },
  '도화살':   { good: null, desc: '매력이 빛나는 날입니다. 이성 관계나 대인 관계에서 호감을 얻기 쉬우며, 사교 활동에 유리합니다. 다만 감정에 휘둘리지 않도록 주의하세요.' },
  '화개살':   { good: true, desc: '예술적 영감과 영적 감수성이 높아지는 날입니다. 창작, 명상, 독서 등 혼자만의 시간이 유익하며, 깊은 통찰을 얻을 수 있습니다.' },
  '겁살':     { good: false, desc: '예상치 못한 변수가 생길 수 있는 날입니다. 금전 거래나 중요한 결정은 신중하게 하고, 충동적인 행동은 자제하는 것이 좋습니다.' },
  '재살':     { good: false, desc: '작은 실수나 사고에 주의해야 하는 날입니다. 서두르지 말고 차분하게 행동하며, 건강과 안전에 유의하세요.' },
};

const SS_READING = {
  '비견':'나와 같은 기운이 작용하는 날입니다. 동료나 친구와의 교류가 활발하고, 경쟁 의식이 강해집니다. 자기 주장이 강해지니 협력에 신경 쓰세요.',
  '겁재':'경쟁과 도전의 기운이 있는 날입니다. 재물 지출이 생길 수 있으니 충동 소비에 주의하고, 승부욕을 긍정적 방향으로 활용하세요.',
  '식신':'여유와 즐거움이 있는 날입니다. 먹을 복이 있고 취미 활동이 잘 풀리며, 창의적 아이디어가 떠오릅니다. 편안한 마음으로 하루를 보내세요.',
  '상관':'표현력이 강해지는 날입니다. 말과 글에 힘이 실리지만, 날카로운 언행으로 갈등이 생길 수 있으니 한 템포 쉬고 말하세요.',
  '편재':'활동적 재물운이 있는 날입니다. 사업이나 투자에 움직임이 생기고, 사교 활동을 통해 기회가 올 수 있습니다.',
  '정재':'안정적인 재물운의 날입니다. 꼼꼼하게 관리하면 작은 이익이 쌓이고, 성실한 노력이 인정받습니다.',
  '편관':'긴장감과 압박이 있는 날입니다. 예상치 못한 업무나 책임이 생길 수 있으나, 잘 대처하면 인정과 성장으로 이어집니다.',
  '정관':'질서와 규율의 기운이 작용하는 날입니다. 공식적인 자리나 업무에서 좋은 성과를 낼 수 있으며, 예의와 격식을 갖추면 좋은 일이 생깁니다.',
  '편인':'직감과 영감이 강해지는 날입니다. 학습이나 연구에 몰입하기 좋고, 평소와 다른 시각에서 문제를 바라보면 해답을 얻습니다.',
  '정인':'안정과 지원의 기운이 있는 날입니다. 학업이나 자기계발에 유리하고, 어른이나 윗사람의 도움을 받을 수 있습니다.',
};

const US_READING = {
  '장생':'새로운 시작의 에너지가 있습니다. 계획을 세우고 첫 발을 내딛기 좋은 날입니다.',
  '목욕':'변화와 불안정의 기운입니다. 감정 기복에 주의하고, 중요한 결정은 내일로 미루는 것이 좋습니다.',
  '관대':'자신감이 올라가고 사회 활동이 활발한 날입니다. 적극적으로 나서면 좋은 결과를 얻습니다.',
  '건록':'에너지가 충만한 날입니다. 실력이 잘 발휘되고 성과가 나타나기 좋은 시기입니다.',
  '제왕':'기운이 최고조에 달하는 날입니다. 리더십을 발휘하기 좋으나, 과욕은 금물입니다.',
  '쇠':'기운이 서서히 빠지는 날입니다. 무리하지 말고 체력 안배에 신경 쓰세요.',
  '병':'컨디션이 저하될 수 있습니다. 휴식을 우선하고 건강 관리에 유의하세요.',
  '사':'정체와 막힘의 기운입니다. 억지로 밀어붙이지 말고 때를 기다리는 것이 현명합니다.',
  '묘':'조용히 내면을 돌아보기 좋은 날입니다. 과거를 정리하고 새 방향을 모색하세요.',
  '절':'단절과 전환의 기운입니다. 낡은 것을 버리고 새 출발을 준비하기 좋습니다.',
  '태':'잉태의 기운으로 새로운 가능성이 싹틉니다. 아이디어를 메모해 두세요.',
  '양':'성장을 준비하는 기운입니다. 아직 드러나지 않지만 좋은 흐름이 만들어지고 있습니다.',
};

export function buildTodayFortune(ps) {
  const ilgan = ps[1].c; const ilji = ps[1].j;
  if (!ilgan) return '일간 정보가 없어 운세를 산출할 수 없습니다.';
  const now = new Date();
  const tg = getGapja(now.getFullYear(), now.getMonth()+1, now.getDate());
  const tCg = tg.dayPillarHanja[0]; const tJj = tg.dayPillarHanja[1];
  const tSS = sipsung(ilgan, tCg); const tUS = unsung(ilgan, tJj);
  const tOh = CG_OH[tCg];

  const sinsal = [];
  if (CHEONUL[ilgan]?.includes(tJj)) sinsal.push('천을귀인');
  if (MUNCHANG[ilgan]===tJj) sinsal.push('문창귀인');
  if (ilji && YEOKMA[ilji]===tJj) sinsal.push('역마살');
  if (ilji && DOHWA[ilji]===tJj) sinsal.push('도화살');
  if (ilji && HWAGAE[ilji]===tJj) sinsal.push('화개살');
  if (ilji && GEOBSAL[ilji]===tJj) sinsal.push('겁살');
  if (ilji && JAESAL[ilji]===tJj) sinsal.push('재살');

  let h = '';
  h += `<div style="margin-bottom:14px;">오늘은 <strong class="${elClass(tOh)}">${tg.dayPillar}(${tg.dayPillarHanja})</strong>일입니다. 나의 일간 기준 <strong>${tSS}</strong>의 날이며, 12운성은 <strong>${tUS}</strong>입니다.</div>`;
  h += `<div style="margin-bottom:14px;">${SS_READING[tSS]||''}</div>`;
  h += `<div style="margin-bottom:${sinsal.length?14:0}px;">12운성 <strong>${tUS}</strong> — ${US_READING[tUS]||''}</div>`;
  if (sinsal.length) {
    h += `<div style="border-top:1px solid #f0f0f0;padding-top:12px;">`;
    sinsal.forEach(name => {
      const info = SINSAL_DESC[name];
      const color = info.good===true?'#2d8a4e':info.good===false?'#d94040':'#b8892a';
      h += `<div style="margin-bottom:10px;"><span style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:600;color:${color};border:1px solid ${color}33;margin-right:6px;">${name}</span><span style="font-size:0.78rem;color:#888;">${info.desc}</span></div>`;
    });
    h += `</div>`;
  }
  return h;
}

// ── 대운 · 연운 · 월운 ──
export function calcDaeun(saju, gender, bY, bM, bD) {
  const yCg = saju.yearPillarHanja[0];
  const mCg = saju.monthPillarHanja[0]; const mJj = saju.monthPillarHanja[1];
  const yang = ['甲','丙','戊','庚','壬'].includes(yCg);
  const fwd = (yang && gender==='남') || (!yang && gender==='여');
  const mIdx = g60idx(mCg, mJj);
  const bDate = new Date(bY, bM-1, bD);
  let daeunsu = 5;
  try {
    let terms = [...getSolarTermsByYear(bY)];
    try{terms=terms.concat(getSolarTermsByYear(bY+1));}catch(e){}
    try{terms=getSolarTermsByYear(bY-1).concat(terms);}catch(e){}
    const jeolgi = terms.filter(t=>t.type==='jeolgi').sort((a,b)=>a.datetime-b.datetime);
    if(fwd){const n=jeolgi.find(t=>t.datetime>bDate);if(n)daeunsu=Math.round((n.datetime-bDate)/(1000*60*60*24)/3);}
    else{const p=[...jeolgi].reverse().find(t=>t.datetime<=bDate);if(p)daeunsu=Math.round((bDate-p.datetime)/(1000*60*60*24)/3);}
  }catch(e){}
  if(daeunsu<1)daeunsu=1; if(daeunsu>10)daeunsu=10;
  const result=[];
  for(let i=1;i<=10;i++){const off=fwd?i:-i;const idx=((mIdx+off)%60+60)%60;result.push({age:daeunsu+(i-1)*10,...G60[idx]});}
  return {daeuns:result,daeunsu};
}

export function calcYeonun() {
  const cY = new Date().getFullYear(); const r=[];
  for(let y=cY+2;y>=cY-7;y--){try{const g=getGapja(y,7,1);r.push({year:y,c:g.yearPillarHanja[0],j:g.yearPillarHanja[1],ck:g.yearPillar[0],jk:g.yearPillar[1]});}catch(e){}}
  return r;
}

export function calcWolun() {
  const cY=new Date().getFullYear(); const r=[];
  for(let m=12;m>=1;m--){try{const g=getGapja(cY,m,15);r.push({month:m,c:g.monthPillarHanja[0],j:g.monthPillarHanja[1],ck:g.monthPillar[0],jk:g.monthPillar[1]});}catch(e){}}
  return r;
}
