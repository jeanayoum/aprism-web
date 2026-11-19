// 로컬 미리보기 전용: 칩과 버튼 수정안 켜기/끄기, 마우스를 올리면 종류와 크기 정보
(() => {
  const LS = k => { try { return localStorage.getItem('pvds-' + k); } catch (e) { return null; } };
  const SS = (k, v) => { try { localStorage.setItem('pvds-' + k, v); } catch (e) {} };
  let sizesOn = LS('sizes') !== '0', infoOn = LS('info') !== '0';

  const link = document.createElement('style'); link.id = 'pv-sizes'; try { const x = new XMLHttpRequest(); x.open('GET', '/__pv/sizes.css?t=' + Date.now(), false); x.send(); link.textContent = x.responseText; } catch (e) {} // 바로 적용되게 글자로 넣음
  const base = document.createElement('style');
  base.textContent = '.map-canvas canvas,.map-scene,.edge-light{visibility:hidden!important} .rsim{display:none!important}' +
    '#pv-panel{position:fixed;left:12px;bottom:12px;z-index:2147483646;display:flex;gap:6px;background:#15181c;padding:6px;border-radius:6px;font:500 13px/1.2 "SUIT",system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.3)}' +
    '#pv-panel button{all:unset;cursor:pointer;color:#c9ced4;padding:6px 10px;border-radius:4px}#pv-panel button[aria-pressed="true"]{background:#fff;color:#15181c}' +
    '#pv-box{position:fixed;z-index:2147483645;pointer-events:none;outline:2px solid #e8590c;background:rgba(232,89,12,.08);display:none}' +
    '#pv-tip{position:fixed;z-index:2147483647;pointer-events:none;background:#15181c;color:#fff;font:400 13px/1.5 "SUIT",system-ui,sans-serif;padding:10px 12px;border-radius:4px;max-width:340px;box-shadow:0 4px 16px rgba(0,0,0,.3);display:none}' +
    '#pv-tip b{display:block;font-size:14px}#pv-tip span{display:block;color:#c9ced4}';
  document.head.appendChild(base);
  const apply = () => { if (sizesOn) document.head.appendChild(link); else link.remove(); };
  apply();

  const panel = document.createElement('div'); panel.id = 'pv-panel';
  panel.innerHTML = '<button type="button" data-k="sizes">TO-BE</button><button type="button" data-k="info">정보 보기</button><button type="button" data-k="diff">달라진 곳</button>';
  let diffOn = LS('diff') === '1';
  const sync = () => { panel.querySelector('[data-k=sizes]').setAttribute('aria-pressed', sizesOn); panel.querySelector('[data-k=info]').setAttribute('aria-pressed', infoOn); panel.querySelector('[data-k=diff]').setAttribute('aria-pressed', diffOn); };
  panel.onclick = e => { const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k === 'sizes') { sizesOn = !sizesOn; SS('sizes', sizesOn ? '1' : '0'); apply(); if (diffOn) runDiff(); }
    else if (b.dataset.k === 'info') { infoOn = !infoOn; SS('info', infoOn ? '1' : '0'); if (!infoOn) hide(); }
    else { diffOn = !diffOn; SS('diff', diffOn ? '1' : '0'); diffOn ? runDiff() : clearDiff(); }
    sync(); };
  const box = document.createElement('div'); box.id = 'pv-box';
  const tip = document.createElement('div'); tip.id = 'pv-tip';
  const add = () => { document.body.append(panel, box, tip); sync(); };
  if (document.body) add(); else addEventListener('DOMContentLoaded', add);

  const has = (el, sel) => { try { return el.matches(sel); } catch (e) { return false; } };
  const CHIP = /(^|[-_ ])(chip|badge|tag|pill)([-_ ]|$)|verdict|sev-chip|floor-tag|sfx-fl|sfx-go|dc6-q|-count$/;
  const isTarget = el => {
    if (!(el instanceof Element) || el.closest('#pv-panel')) return false;
    const cls = el.getAttribute('class') || ''; const tag = el.tagName.toLowerCase();
    if (has(el, '.badge-dot')) return false;
    return tag === 'button' || el.getAttribute('role') === 'button' || /(^| )(btn|icon-button)( |$)/.test(cls) || (tag === 'a' && /btn|sfx-go|lk|rp-link/.test(cls)) || CHIP.test(cls);
  };
  const kindOf = (el, iconOnly) => {
    if (has(el, '.badge:not(.badge-mode):not(.badge-marker), .tag-running, .verdict-chip, .ac-count-badge, .ac-chip-done, .floor-tag, .ma-check-tag, .sfx-fl')) return ['칩', 'Status'];
    if (has(el, '.ah-filter .btn, .ac-check')) return ['칩', 'Filter'];
    if (has(el, '.dc6-q')) return ['칩', 'Selection'];
    if (has(el, '.tb')) return ['탭', '칩 모양 탭'];
    if (has(el, '.account-chip, .theme-chip, .signal-chip, .sfx-go')) return ['버튼', '칩 모양을 없앤 버튼'];
    if (has(el, '.switch, .field-box, .ma-check')) return ['입력', '버튼 규격 밖(입력 요소)'];
    if (has(el, '.sb-tab, .ac-tab, .map-floor, .map-dim') || el.closest('.seg, .view-toggle, [role="tablist"], .map-floors')) return ['탭', '탭과 전환'];
    if (has(el, '.btn-accent, .mp-cta, .rqx')) return ['버튼', '강조 버튼 Accent'];
    if (has(el, '.btn-primary, .dc6-btn.is-pri')) return ['버튼', '주요 버튼 Primary'];
    if (has(el, '.btn-secondary, .dc6-btn')) return ['버튼', '보조 버튼 Secondary'];
    if (has(el, '.btn-danger')) return ['버튼', '위험 버튼 Danger'];
    if (has(el, '.btn-ghost')) return ['버튼', '글자 버튼 Ghost'];
    if (iconOnly) return ['버튼', '아이콘 버튼'];
    return ['버튼', has(el, '.btn') ? '버튼' : '그 밖의 버튼'];
  };
  const step = (k, h) => (k === '칩' || k === '탭' ? { 22: 'Small 22', 26: 'Medium 26', 32: 'Large 32' } : k === '버튼' ? { 22: 'XSmall 22', 24: '아이콘 작게 24', 26: 'Small 26', 32: 'Medium 32', 36: '아이콘 기본 36', 40: 'Large 40' } : {})[Math.round(h)] || '';
  const f = v => String(Math.round(parseFloat(v) * 10) / 10);
  const hide = () => { box.style.display = 'none'; tip.style.display = 'none'; };

  addEventListener('mousemove', ev => {
    if (!infoOn) return;
    let el = ev.target; while (el && el !== document.body && !isTarget(el)) el = el.parentElement;
    if (!el || el === document.body) return hide();
    const r = el.getBoundingClientRect(); if (r.height > 60) return hide();
    const cs = getComputedStyle(el);
    const text = (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 24);
    const k = kindOf(el, !text && !!el.querySelector('.i, svg, img'));
    const p = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(f);
    const pad = p[0] === p[2] && p[1] === p[3] ? `위아래 ${p[0]}, 좌우 ${p[1]}` : `위 ${p[0]}, 오른쪽 ${p[1]}, 아래 ${p[2]}, 왼쪽 ${p[3]}`;
    const gap = cs.columnGap !== 'normal' && parseFloat(cs.columnGap) ? `, 갭 ${f(cs.columnGap)}` : '';
    const st = step(k[0], r.height);
    tip.innerHTML = `<b>${k[0] === k[1].split(' ')[0] ? k[1] : k[0] + ', ' + k[1]}${st ? ' ' + st : ''}</b>${text ? '<span>“' + text + '”</span>' : ''}` +
      `<span>너비 ${f(r.width)} × 높이 ${f(r.height)}</span><span>패딩 ${pad}${gap}</span>` +
      `<span>글자 ${f(cs.fontSize)}, 굵기 ${cs.fontWeight}, 줄 높이 ${cs.lineHeight === 'normal' ? '보통' : f(cs.lineHeight)}, 모서리 ${f(cs.borderTopLeftRadius)}</span>`;
    Object.assign(box.style, { display: 'block', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    tip.style.display = 'block'; const tr = tip.getBoundingClientRect();
    tip.style.left = Math.min(ev.clientX + 14, innerWidth - tr.width - 8) + 'px';
    tip.style.top = Math.min(ev.clientY + 16, innerHeight - tr.height - 8) + 'px';
  }, true);
  addEventListener('scroll', hide, true);

  // ---------- 달라진 곳: 수정안을 끈 값과 켠 값을 비교해 바뀐 칩과 버튼에 표시 ----------
  const layer = document.createElement('div'); layer.id = 'pv-diff';
  const css2 = document.createElement('style');
  css2.textContent = '#pv-diff{position:fixed;inset:0;pointer-events:none;z-index:2147483644}' +
    '#pv-diff i{position:fixed;display:block;outline:2px solid #7048e8;background:rgba(112,72,232,.07)}' +
    '#pv-diff em{position:fixed;font:600 11px/1.3 "SUIT",system-ui,sans-serif;font-style:normal;color:#fff;background:#7048e8;padding:1px 4px;border-radius:3px;white-space:nowrap}' +
    '#pv-panel .pv-n{margin-left:4px;opacity:.7}';
  document.head.appendChild(css2);
  let changed = [];
  const look = el => { const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return { 너비: Math.round(r.width), 높이: Math.round(r.height), 위아래: f(cs.paddingTop), 좌우: f(cs.paddingLeft) === f(cs.paddingRight) ? f(cs.paddingLeft) : f(cs.paddingLeft) + '/' + f(cs.paddingRight),
      갭: cs.columnGap === 'normal' ? '0' : f(cs.columnGap), 글자: f(cs.fontSize), 굵기: cs.fontWeight, 모서리: f(cs.borderTopLeftRadius), 면: cs.backgroundColor, 테: cs.borderTopWidth === '0px' ? '없음' : cs.borderTopColor }; };
  const targets = () => [...document.body.querySelectorAll('*')].filter(el => !el.closest('#pv-panel, #pv-diff, svg, .rsim') && isTarget(el) && (() => { const r = el.getBoundingClientRect(); return r.width > 3 && r.height > 3 && r.height <= 60; })());
  function runDiff() {
    const had = !!link.parentNode;
    link.remove(); void document.body.offsetHeight;
    const els = targets(); const A = new Map(els.map(el => [el, look(el)]));
    document.head.appendChild(link); void document.body.offsetHeight;
    changed = [];
    for (const el of els) { const a = A.get(el), b = look(el); const d = [];
      for (const k of ['높이', '너비', '위아래', '좌우', '갭', '글자', '굵기', '모서리']) if (a[k] !== b[k] && !(k === '너비' && Math.abs(a[k] - b[k]) <= 1)) d.push(`${k} ${a[k]}→${b[k]}`);
      if (a.면 !== b.면) d.push('면 색'); if (a.테 !== b.테) d.push('테');
      if (d.length) changed.push({ el, d }); }
    if (!had) link.remove();
    drawDiff();
  }
  function drawDiff() {
    if (!diffOn) return; if (!layer.parentNode) document.body.appendChild(layer);
    layer.innerHTML = changed.map(c => { const r = c.el.getBoundingClientRect(); if (!r.width) return '';
      const short = c.d.filter(x => !/^너비/.test(x)).slice(0, 2).join(', ') || c.d[0];
      return `<i style="left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px"></i><em style="left:${r.left}px;top:${Math.max(0, r.top - 15)}px">${short}</em>`; }).join('');
    const btn = panel.querySelector('[data-k=diff]'); btn.innerHTML = '달라진 곳<span class="pv-n">' + changed.length + '</span>';
  }
  function clearDiff() { layer.remove(); panel.querySelector('[data-k=diff]').textContent = '달라진 곳'; }
  addEventListener('scroll', () => diffOn && drawDiff(), true);
  addEventListener('resize', () => diffOn && drawDiff());
  addEventListener('load', () => setTimeout(() => { if (diffOn) runDiff(); }, 1500));
  // 정보 보기 말풍선에 바뀐 점 덧붙임
  addEventListener('mousemove', ev => {
    if (!infoOn || !changed.length || tip.style.display === 'none') return;
    let el = ev.target; while (el && el !== document.body && !isTarget(el)) el = el.parentElement;
    const c = changed.find(x => x.el === el); if (!c || tip.querySelector('.pv-chg')) return;
    tip.insertAdjacentHTML('beforeend', '<span class="pv-chg" style="color:#b8a6ff">바뀐 점: ' + c.d.join(', ') + '</span>');
  });
})();
