/**
 * UI 로직 — 폼 이벤트, 저장/불러오기, 드로어, 모달
 * (non-module, 전역 함수)
 */

const $noTime = document.getElementById('noTime');
const $timeInput = document.getElementById('timeInput');
const $timeBadge = document.getElementById('timeBadge');
const $btn = document.getElementById('calcBtn');
const $date = document.getElementById('birthdate');
const $dateError = document.getElementById('dateError');

// ── 시진 매핑 ──
const SIJIN = [
  { start:23, end:1,  label:'23:00 ~ 01:00', value:0  },
  { start:1,  end:3,  label:'01:00 ~ 03:00', value:1  },
  { start:3,  end:5,  label:'03:00 ~ 05:00', value:3  },
  { start:5,  end:7,  label:'05:00 ~ 07:00', value:5  },
  { start:7,  end:9,  label:'07:00 ~ 09:00', value:7  },
  { start:9,  end:11, label:'09:00 ~ 11:00', value:9  },
  { start:11, end:13, label:'11:00 ~ 13:00', value:11 },
  { start:13, end:15, label:'13:00 ~ 15:00', value:13 },
  { start:15, end:17, label:'15:00 ~ 17:00', value:15 },
  { start:17, end:19, label:'17:00 ~ 19:00', value:17 },
  { start:19, end:21, label:'19:00 ~ 21:00', value:19 },
  { start:21, end:23, label:'21:00 ~ 23:00', value:21 },
];

function matchSijin(h, m) {
  const t = h * 60 + m;
  for (const s of SIJIN) {
    if (s.start > s.end) {
      const tAdj = t < s.start * 60 ? t + 24 * 60 : t;
      if (tAdj >= s.start * 60 && tAdj < (s.end + 24) * 60) return s;
    } else {
      if (t >= s.start * 60 && t < s.end * 60) return s;
    }
  }
  return null;
}

// ── 날짜 자동 포맷 ──
$date.addEventListener('input', function() {
  let raw = this.value.replace(/[^0-9]/g, '');
  if (raw.length > 8) raw = raw.slice(0, 8);
  if (raw.length >= 5 && raw.length <= 6) {
    this.value = raw.slice(0, 4) + ' / ' + raw.slice(4);
  } else if (raw.length >= 7) {
    this.value = raw.slice(0, 4) + ' / ' + raw.slice(4, 6) + ' / ' + raw.slice(6);
  } else {
    this.value = raw;
  }
  validateDate();
  syncBtn();
});

// ── 날짜 파싱 ──
function parseDateValue() {
  const raw = $date.value.replace(/[^0-9]/g, '');
  if (raw.length !== 8) return null;
  const y = parseInt(raw.slice(0, 4));
  const m = parseInt(raw.slice(4, 6));
  const d = parseInt(raw.slice(6, 8));
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const test = new Date(y, m - 1, d);
  if (test.getFullYear() !== y || test.getMonth() !== m - 1 || test.getDate() !== d) return null;
  return { y, m, d, iso: `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}` };
}
// 전역 노출
window.parseDateValue = parseDateValue;

function validateDate() {
  const raw = $date.value.replace(/[^0-9]/g, '');
  if (raw.length < 8) {
    $dateError.classList.remove('show');
    $date.classList.remove('invalid');
    return;
  }
  const y = parseInt(raw.slice(0, 4));
  const m = parseInt(raw.slice(4, 6));
  const d = parseInt(raw.slice(6, 8));
  let invalid = false;
  if (y < 1900 || y > 2050) invalid = true;
  else if (m < 1 || m > 12) invalid = true;
  else if (d < 1 || d > 31) invalid = true;
  else {
    const test = new Date(y, m - 1, d);
    if (test.getFullYear() !== y || test.getMonth() !== m - 1 || test.getDate() !== d) invalid = true;
  }
  if (invalid) { $dateError.classList.add('show'); $date.classList.add('invalid'); }
  else { $dateError.classList.remove('show'); $date.classList.remove('invalid'); }
}

// ── 시간 자동 포맷 ──
$timeInput.addEventListener('input', function() {
  let raw = this.value.replace(/[^0-9]/g, '');
  if (raw.length > 4) raw = raw.slice(0, 4);
  this.value = raw.length >= 3 ? raw.slice(0, 2) + ':' + raw.slice(2) : raw;

  const $timeError = document.getElementById('timeError');
  if (raw.length === 4) {
    const hh = parseInt(raw.slice(0, 2));
    const mm = parseInt(raw.slice(2, 4));
    if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
      const matched = matchSijin(hh, mm);
      if (matched) {
        $timeBadge.textContent = matched.label;
        $timeBadge.classList.add('visible');
        this.dataset.sijinValue = matched.value;
      }
      $noTime.checked = false; $noTime.disabled = true;
      $noTime.parentElement.style.opacity = '0.35';
      $timeError.classList.remove('show'); $timeInput.classList.remove('invalid');
    } else {
      $timeBadge.textContent = ''; $timeBadge.classList.remove('visible');
      delete this.dataset.sijinValue;
      $timeError.classList.add('show'); $timeInput.classList.add('invalid');
    }
  } else {
    $timeBadge.textContent = ''; $timeBadge.classList.remove('visible');
    delete this.dataset.sijinValue;
    $timeError?.classList.remove('show'); $timeInput.classList.remove('invalid');
    $noTime.disabled = false; $noTime.parentElement.style.opacity = '1';
  }
  syncBtn();
});

// ── 시간 모름 ──
$noTime.addEventListener('change', function() {
  $timeInput.disabled = this.checked;
  $timeInput.style.opacity = this.checked ? '0.35' : '1';
  if (this.checked) {
    $timeInput.value = ''; $timeBadge.textContent = '';
    $timeBadge.classList.remove('visible'); delete $timeInput.dataset.sijinValue;
  }
  syncBtn();
});

function syncBtn() {
  $btn.classList.toggle('ready', parseDateValue() !== null);
}

// ── localStorage 저장/불러오기 ──
const STORAGE_KEY = 'saju_saved';
function getSaved() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function setSaved(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
window.getSaved = getSaved;

// ── 모달 ──
const $modal = document.getElementById('saveModal');
const $saveInput = document.getElementById('saveNameInput');
let _pendingSave = null;

function openModal(defaultName) {
  $saveInput.value = defaultName;
  $modal.classList.add('open');
  setTimeout(() => { $saveInput.focus(); $saveInput.select(); }, 150);
}
function closeModal() { $modal.classList.remove('open'); _pendingSave = null; }

document.getElementById('modalCancel').addEventListener('click', closeModal);
$modal.addEventListener('click', ev => { if (ev.target === $modal) closeModal(); });
$saveInput.addEventListener('keydown', ev => { if (ev.key === 'Enter') document.getElementById('modalConfirm').click(); if (ev.key === 'Escape') closeModal(); });
document.getElementById('modalConfirm').addEventListener('click', function() {
  if (!_pendingSave) return;
  const name = $saveInput.value.trim() || _pendingSave.defaultName;
  const entry = { ..._pendingSave.entry, name };
  const list = getSaved(); list.unshift(entry); setSaved(list);
  renderSavedList(); closeModal();
});

window.saveResult = function() {
  const parsed = parseDateValue(); if (!parsed) return;
  const {y,m,d,iso:dv} = parsed;
  const g = document.querySelector('input[name="gender"]:checked').value;
  const timeVal = $timeInput.value || '';
  const sijin = $timeInput.dataset.sijinValue;
  const rv = document.getElementById('region').value;
  const ilganText = window._lastIlgan || '';
  const defaultName = `${y}.${m}.${d}`;
  _pendingSave = {
    defaultName,
    entry: { id: Date.now(), date: dv, gender: g, time: timeVal, sijin: sijin !== undefined ? parseInt(sijin) : null, region: rv, ilgan: ilganText, createdAt: new Date().toISOString() },
  };
  openModal(defaultName);
};

window.deleteSaved = function(id, evt) {
  evt.stopPropagation();
  setSaved(getSaved().filter(x => x.id !== id));
  renderSavedList();
};

window.loadSaved = function(id) {
  const entry = getSaved().find(x => x.id === id); if (!entry) return;
  const dp = entry.date.replace(/-/g, '');
  $date.value = dp.slice(0, 4) + ' / ' + dp.slice(4, 6) + ' / ' + dp.slice(6, 8);
  document.querySelector(`input[name="gender"][value="${entry.gender}"]`).checked = true;
  if (entry.time) {
    $timeInput.value = entry.time; $timeInput.disabled = false; $timeInput.style.opacity = '1'; $noTime.checked = false;
    if (entry.sijin !== null) {
      $timeInput.dataset.sijinValue = entry.sijin;
      const matched = SIJIN.find(s => s.value === entry.sijin);
      if (matched) { $timeBadge.textContent = matched.label; $timeBadge.classList.add('visible'); }
    }
  } else {
    $timeInput.value = ''; $noTime.checked = true; $timeInput.disabled = true; $timeInput.style.opacity = '0.35';
    $timeBadge.textContent = ''; $timeBadge.classList.remove('visible'); delete $timeInput.dataset.sijinValue;
  }
  document.getElementById('region').value = entry.region || '';
  syncBtn(); calculate();
};

function escHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

function renderSavedList() {
  const list = getSaved();
  const $list = document.getElementById('savedList');
  const $empty = document.getElementById('savedEmpty');
  if (list.length === 0) { $list.innerHTML = ''; $empty.style.display = 'block'; return; }
  $empty.style.display = 'none';
  const CG_OH_MAP = {'甲':'목','乙':'목','丙':'화','丁':'화','戊':'토','己':'토','庚':'금','辛':'금','壬':'수','癸':'수'};
  $list.innerHTML = list.map(item => {
    const dateStr = item.date ? item.date.replace(/-/g, '.') : '';
    const timeStr = item.time ? ` ${item.time}` : '';
    const genderStr = item.gender === '남' ? '남' : '여';
    const ilgan = item.ilgan || '';
    const hanja = ilgan.length >= 2 ? ilgan[1] : '';
    const oh = CG_OH_MAP[hanja] || '';
    const elCls = oh ? 'el-' + oh : '';
    return `<div class="saved-card" onclick="loadSaved(${item.id})"><div class="saved-info"><span class="saved-name">${escHtml(item.name)}</span><span class="saved-detail">${dateStr}${timeStr} · ${genderStr}</span></div>${ilgan ? `<span class="saved-ilgan ${elCls}">${ilgan}</span>` : ''}<button class="saved-del" onclick="deleteSaved(${item.id}, event)" title="삭제">&times;</button></div>`;
  }).join('');
}
renderSavedList();

// ── 드로어 ──
function toggleDrawer() {
  const d = document.getElementById('drawerOverlay');
  d.classList.toggle('open');
  if (d.classList.contains('open')) renderDrawer();
}
function closeDrawer() { document.getElementById('drawerOverlay').classList.remove('open'); }
window.toggleDrawer = toggleDrawer;
window.closeDrawer = closeDrawer;

function renderDrawer() {
  const list = getSaved();
  const $d = document.getElementById('drawerList');
  if (list.length === 0) { $d.innerHTML = '<div class="drawer-empty">저장된 만세력이 없습니다</div>'; return; }
  const CG_OH_MAP = {'甲':'목','乙':'목','丙':'화','丁':'화','戊':'토','己':'토','庚':'금','辛':'금','壬':'수','癸':'수'};
  $d.innerHTML = list.map(item => {
    const dateStr = item.date ? item.date.replace(/-/g, '.') : '';
    const timeStr = item.time ? ` ${item.time}` : '';
    const genderStr = item.gender === '남' ? '남' : '여';
    const ilgan = item.ilgan || '';
    const hanja = ilgan.length >= 2 ? ilgan[1] : '';
    const oh = CG_OH_MAP[hanja] || '';
    const elCls = oh ? 'el-' + oh : '';
    return `<div class="drawer-card" onclick="loadSaved(${item.id}); closeDrawer();"><div class="drawer-card-info"><span class="drawer-card-name">${escHtml(item.name)}</span><span class="drawer-card-detail">${dateStr}${timeStr} · ${genderStr}</span></div>${ilgan ? `<span class="drawer-card-ilgan ${elCls}">${ilgan}</span>` : ''}</div>`;
  }).join('');
}
