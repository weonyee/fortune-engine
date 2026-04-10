/**
 * 메인 모듈 — 엔진 import + 렌더링 + calculate()
 */
import {
  calculateSaju, getGapja,
  CG_OH, JJ_OH, OH_HJ, JJG,
  elClass, unsung, sipsung, parsePillar,
  buildChongun, buildTodayFortune,
  calcDaeun, calcYeonun, calcWolun,
} from './engine.mjs';

// ── 사주 테이블 렌더 ──
function renderSajuTable(ps, il) {
  const t = document.getElementById('sajuTable');
  const hd = ['생시','생일','생월','생년'];
  const e = elClass;
  let h = '<thead><tr><th></th>';
  hd.forEach(x => h += `<th>${x}</th>`);
  h += '</tr></thead><tbody>';

  h += '<tr><td class="rl">천간</td>';
  ps.forEach(p => { h += p.c ? `<td class="cm"><span class="ch ${e(p.co)}">${p.ck}${p.c}</span><span class="ot ${e(p.co)}">+${p.co}</span></td>` : '<td class="cm empty-cell">—</td>'; });
  h += '</tr><tr><td class="rl">십성</td>';
  ps.forEach(p => h += `<td class="cs">${p.c ? sipsung(il, p.c) : ''}</td>`);
  h += '</tr><tr><td class="rl">지지</td>';
  ps.forEach(p => { h += p.j ? `<td class="cm"><span class="ch ${e(p.jo)}">${p.jk}${p.j}</span><span class="ot ${e(p.jo)}">+${p.jo}</span></td>` : '<td class="cm empty-cell">—</td>'; });
  h += '</tr><tr><td class="rl">십성</td>';
  ps.forEach(p => { const g = p.j && JJG[p.j]; h += g ? `<td class="cs">${sipsung(il, g[g.length-1])}</td>` : '<td class="cs"></td>'; });
  h += '</tr><tr><td class="rl">지장간</td>';
  ps.forEach(p => { const g = p.j && JJG[p.j]; h += g ? `<td class="cj">${g.map(s => `<span class="${e(CG_OH[s])}">${s}</span>`).join('')}</td>` : '<td class="cj"></td>'; });
  h += '</tr><tr><td class="rl">12운성</td>';
  ps.forEach(p => h += `<td class="cx">${unsung(il, p.j)}</td>`);
  h += '</tr></tbody>';
  t.innerHTML = h;
}

// ── 달력 렌더 ──
function renderCalendar($el) {
  const now = new Date();
  let viewY = now.getFullYear(), viewM = now.getMonth() + 1;
  function draw() {
    const days = new Date(viewY, viewM, 0).getDate();
    const firstDow = new Date(viewY, viewM - 1, 1).getDay();
    const todayStr = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    const dows = ['일','월','화','수','목','금','토'];
    let h = `<div class="cal-header"><div class="cal-title">${viewY}년 ${viewM}월 일진</div><div class="cal-nav"><button id="calPrev">&lsaquo;</button><button id="calNext">&rsaquo;</button></div></div>`;
    h += '<div class="cal-grid">';
    dows.forEach((d,i) => h += `<div class="${i===0?'cal-dow sun':i===6?'cal-dow sat':'cal-dow'}">${d}</div>`);
    for (let i = 0; i < firstDow; i++) h += '<div class="cal-cell"></div>';
    for (let d = 1; d <= days; d++) {
      const dow = (firstDow + d - 1) % 7;
      let cls = 'cal-cell';
      if (dow === 0) cls += ' sun'; if (dow === 6) cls += ' sat';
      if (`${viewY}-${viewM}-${d}` === todayStr) cls += ' today';
      let ganji = ''; try { ganji = getGapja(viewY, viewM, d).dayPillar; } catch(e) {}
      h += `<div class="${cls}"><div class="cal-day">${d}</div><div class="cal-ganji">${ganji}</div></div>`;
    }
    h += '</div>';
    $el.innerHTML = h;
    document.getElementById('calPrev').addEventListener('click', () => { viewM--; if (viewM < 1) { viewM = 12; viewY--; } draw(); });
    document.getElementById('calNext').addEventListener('click', () => { viewM++; if (viewM > 12) { viewM = 1; viewY++; } draw(); });
  }
  draw();
}

// ── 운 그리드 렌더 ──
function renderUnGrid($el, title, cols, ilgan, activeCheck) {
  const e = elClass;
  let h = `<div class="un-label">${title}</div><div class="un-scroll"><div class="un-grid">`;
  cols.forEach(col => {
    const isActive = activeCheck ? activeCheck(col) : false;
    const cgOh = CG_OH[col.c] || ''; const jjOh = JJ_OH[col.j] || '';
    const cgSS = sipsung(ilgan, col.c);
    const jjMain = col.j && JJG[col.j] ? JJG[col.j][JJG[col.j].length-1] : null;
    const jjSS = jjMain ? sipsung(ilgan, jjMain) : '';
    const us = unsung(ilgan, col.j);
    h += `<div class="un-col${isActive ? ' active' : ''}">`;
    h += `<div class="uc-top"><b>${col.label || ''}</b><br>${cgSS}</div>`;
    h += `<div class="uc-cg ${e(cgOh)}">${col.ck}${col.c}<sub>${col.c}</sub></div>`;
    h += `<div class="uc-jj ${e(jjOh)}">${col.jk}${col.j}<sub>${col.j}</sub></div>`;
    h += `<div class="uc-bot">${jjSS}<br>${us}</div></div>`;
  });
  h += '</div></div>';
  $el.innerHTML = h;
}

// ── 메인 calculate ──
window._lastIlgan = '';

window.calculate = function() {
  const parsed = window.parseDateValue();
  if (!parsed) { alert('생년월일을 정확히 입력해주세요.'); return; }
  const { y, m, d } = parsed;
  if (y < 1900 || y > 2050) { alert('1900~2050년 범위만 지원합니다.'); return; }
  const g = document.querySelector('input[name="gender"]:checked').value;
  const timeEl = document.getElementById('timeInput');
  const rv = document.getElementById('region').value;

  try {
    const opts = {};
    if (rv) { opts.longitude = parseFloat(rv); opts.applyTimeCorrection = true; }
    const hr = timeEl.dataset.sijinValue !== undefined ? parseInt(timeEl.dataset.sijinValue) : undefined;
    const s = calculateSaju(y, m, d, hr, 0, opts);
    const ps = [
      parsePillar(s.hourPillar, s.hourPillarHanja),
      parsePillar(s.dayPillar, s.dayPillarHanja),
      parsePillar(s.monthPillar, s.monthPillarHanja),
      parsePillar(s.yearPillar, s.yearPillarHanja),
    ];
    const il = ps[1].c;
    window._lastIlgan = ps[1].ck && il ? ps[1].ck + il : '';

    // 사주 테이블
    renderSajuTable(ps, il);

    // 기본 정보
    let info = '';
    info += `<div class="r"><span class="l">양력</span><span class="v">${y}년 ${m}월 ${d}일</span></div>`;
    info += `<div class="r"><span class="l">성별</span><span class="v">${g === '남' ? '남' : '여'}</span></div>`;
    if (s.isTimeCorrected && s.correctedTime) info += `<div class="r"><span class="l">보정시간</span><span class="v">${s.correctedTime.hour}시 ${s.correctedTime.minute}분</span></div>`;
    if (il) { const oh = CG_OH[il]; info += `<div class="divider"></div><div class="r"><span class="l">일간</span><span class="v"><strong class="${elClass(oh)}">${ps[1].ck}${il}</strong>&nbsp;&nbsp;${oh}(${OH_HJ[oh]})</span></div>`; }
    document.getElementById('infoBox').innerHTML = info;

    // 총운
    const $sum = document.getElementById('summaryBox');
    $sum.innerHTML = `<div class="summary-title">총운</div><div class="summary-text">${buildChongun(ps)}</div>`;
    $sum.classList.add('show');

    // 오늘의 운세
    const $today = document.getElementById('todayBox');
    $today.innerHTML = `<div class="summary-title">오늘의 운세</div><div class="summary-text">${buildTodayFortune(ps)}</div>`;
    $today.classList.add('show');

    // 대운 · 연운 · 월운
    if (il) {
      const now = new Date();
      const currentAge = now.getFullYear() - y;
      const { daeuns } = calcDaeun(s, g, y, m, d);
      renderUnGrid(document.getElementById('daeunBox'), '대운', daeuns.map(x => ({ ...x, label: `${x.age}세` })), il, col => currentAge >= col.age && currentAge < col.age + 10);
      const yeons = calcYeonun();
      renderUnGrid(document.getElementById('yeonunBox'), '연운', yeons.map(x => ({ ...x, label: `${x.year}` })), il, col => col.year === now.getFullYear());
      const wols = calcWolun();
      renderUnGrid(document.getElementById('wolunBox'), '월운', wols.map(x => ({ ...x, label: `${x.month}월` })), il, col => col.month === now.getMonth() + 1);
      document.getElementById('unWrap').classList.add('show');
    }

    // 달력
    const $cal = document.getElementById('calendarBox');
    renderCalendar($cal);
    $cal.classList.add('show');

    document.getElementById('resultWrap').classList.add('show');
    setTimeout(() => document.getElementById('resultWrap').scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  } catch (err) {
    alert('계산 오류: ' + err.message);
    console.error(err);
  }
};
