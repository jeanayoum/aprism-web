// 페이지 안에서 실행: 칩과 버튼의 위치, 크기, 여백, 종류를 모은다. ds-check-screens.cjs가 쓴다.
module.exports = function inPage() {
  const vw = innerWidth, vh = innerHeight; const out = [];
  const has = (el, sel) => { try { return el.matches(sel); } catch (e) { return false; } };
  const CHIP = /(^|[-_ ])(chip|badge|tag|pill)([-_ ]|$)|verdict|sev-chip|floor-tag|sfx-fl|sfx-go|dc6-q|-count$/;
  const kindOf = (el, h, iconOnly) => {
    if (has(el, '.badge-dot')) return null;
    if (has(el, '.badge:not(.badge-mode):not(.badge-marker), .tag-running, .verdict-chip, .ac-count-badge, .ac-chip-done, .floor-tag, .ma-check-tag, .sfx-fl')) return ['칩', 'Status'];
    if (has(el, '.ah-filter .btn, .ac-check')) return ['칩', 'Filter'];
    if (has(el, '.dc6-q')) return ['칩', 'Selection'];
    if (has(el, '.tb')) return ['탭', '칩 모양 탭'];
    if (has(el, '.account-chip, .theme-chip, .signal-chip, .sfx-go')) return ['버튼', '칩 모양을 없앤 버튼'];
    if (has(el, '.switch, .field-box, .ma-check')) return ['입력', '버튼 규격 밖(입력 요소)'];
    if (has(el, '.sb-tab, .ac-tab, .map-floor, .map-dim, .rp-toc button, [class*="toc"] button') || el.closest('.seg, .view-toggle, [role="tablist"], .map-floors')) return ['탭', '탭과 전환(탭 규격에서 따로)'];
    let t = '버튼';
    if (has(el, '.btn-accent, .mp-cta, .rqx')) t = '강조 버튼 Accent';
    else if (has(el, '.btn-primary, .dc6-btn.is-pri')) t = '주요 버튼 Primary';
    else if (has(el, '.btn-secondary, .dc6-btn')) t = '보조 버튼 Secondary';
    else if (has(el, '.btn-danger')) t = '위험 버튼 Danger';
    else if (has(el, '.btn-ghost')) t = '글자 버튼 Ghost';
    else if (iconOnly) t = '아이콘 버튼';
    else if (has(el, '.btn')) t = '버튼';
    else t = '그 밖의 버튼';
    return ['버튼', t];
  };
  const step = (k, h) => {
    const S = k === '칩' || k === '탭' ? { 22: 'Small 22', 26: 'Medium 26', 32: 'Large 32' } : k === '버튼' ? { 22: 'XSmall 22', 26: 'Small 26', 32: 'Medium 32', 40: 'Large 40' } : {};
    return S[Math.round(h)] || '';
  };
  const seen = new Set();
  for (const el of document.body.querySelectorAll('*')) {
    if (el.closest('svg') || el.closest('.rsim') || el.closest('#pv-panel')) continue;
    const cls = (el.getAttribute('class') || '');
    const tag = el.tagName.toLowerCase();
    const isBtn = tag === 'button' || el.getAttribute('role') === 'button' || /(^| )(btn|icon-button)( |$)/.test(cls) || (tag === 'a' && /btn|sfx-go|lk|rp-link/.test(cls));
    const isChip = CHIP.test(cls);
    if (!isBtn && !isChip) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.left < 0 || r.top < 0 || r.right > vw || r.bottom > vh || r.height > 50) continue;
    if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (!hit || !(hit === el || el.contains(hit) || hit.contains(el))) continue;
    if ([...seen].some(p => p.contains(el) && p !== el && p.getBoundingClientRect().height <= 50)) continue;
    const text = (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 24);
    const iconOnly = !text && !!el.querySelector('.i, svg, img');
    const k = kindOf(el, r.height, iconOnly); if (!k) continue;
    seen.add(el);
    const cs = getComputedStyle(el); const px = v => Math.round(parseFloat(v) * 10) / 10;
    out.push({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
      k: k[0], t: k[1], st: step(k[0], r.height), text,
      p: [px(cs.paddingTop), px(cs.paddingRight), px(cs.paddingBottom), px(cs.paddingLeft)], gap: cs.columnGap === 'normal' ? 0 : px(cs.columnGap),
      fs: px(cs.fontSize), fw: cs.fontWeight, lh: cs.lineHeight === 'normal' ? '보통' : px(cs.lineHeight), rad: px(cs.borderTopLeftRadius) });
  }
  return out;
};
