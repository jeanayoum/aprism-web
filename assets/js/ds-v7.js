/* ==========================================================================
 * v7 배지, 칩, 탭 만드는 함수 (모양은 assets/css/components-v7.css 한 곳)
 * 화면 JS는 배지, 칩, 탭 HTML을 직접 쓰지 않고 이 함수를 부른다. 글자에 HTML을 넣어도 됨(<b> 등)
 *
 *   ds.badge('crit', '위험')                          판정. crit, warn 은 삼각형이 저절로 붙음
 *   ds.badge('ok', '정상')                             판정 정상은 회색 + 큰 점이 저절로
 *   ds.badge('crit', '위험', { iconOnly: true })        아이콘만 (글자는 읽어 주기만)
 *   ds.badge('info', '수행중', { icon: 'play', plain: true })  태그 (면 없음). 아이콘: dot, big, play, ok, power, check, clock, delta, null(없음)
 *   ds.badge('neutral', 'AI 추천', { icon: 'delta' })   출처
 *   ds.badge('neutral', '01', { num: true })            로봇 번호
 *   ds.wp(7)  ds.wp(7, { small: true })  ds.wp(4, { tone: 'crit' })  ds.wp(3, { current: true })  ds.wp('', { skip: true })  ds.wp(2, { map: true })   WP 번호 원 (20, 작은 것 16)
 *   ds.floor('B4')                                      층 (지금 층 꼬리표 값 그대로)
 *   ds.badgeRow(ds.badge('warn', '주의', { plain: true }), '09:58')   표 칸 안 태그 + 글자
 *   ds.chip('위험 2', { on: false, attrs: 'data-f="crit"' })
 *   ds.tabsLine([{ label: '조치 필요 알림', count: '12건', sel: true, attrs: '...' }, ...])
 *   ds.tabsChip([{ label: '안전감지', sel: true }, ...])
 *   ds.seg([{ label: '카드', sel: true }, { label: '표' }], { vertical: false })
 *
 * 공통 옵션: cls (덧붙일 클래스), attrs (덧붙일 속성 문자열)
 * ========================================================================== */
(function () {
  // 칩 안 아이콘 (배지 아이콘은 아래 badge() 주석)
  function ic(kind, tone) {
    if (!kind) return '';
    return '<i class="ds-ic is-' + kind + (kind === 'tri' && tone === 'warn' ? ' is-warn-ic' : '') + '" aria-hidden="true"></i>';
  }
  function cls() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function sp(a) { return a ? ' ' + a : ''; }

  // 배지 아이콘은 배지 자신의 ::before (공통 CSS .ds-i-*). icon 을 안 주면 위험, 주의는 삼각형, 정상(ok)은 큰 점이 저절로, null 은 아이콘 없음
  function badge(tone, text, o) {
    o = o || {}; tone = tone || 'neutral';
    var k = o.icon === undefined ? '' : (o.icon === null ? 'ds-i-none' : 'ds-i-' + o.icon);
    var c = cls('ds-badge', 'is-' + tone, o.plain && 'is-plain', o.iconOnly && 'is-icon', o.num && 'is-num', k, o.cls);
    var body = o.iconOnly ? '<span class="ds-sr">' + text + '</span>' : text;
    return '<span class="' + c + '"' + sp(o.attrs) + '>' + body + '</span>';
  }
  /*
   * 운영 상태 태그 (11/19 B안: 점 → 상태 모양 아이콘). 예전 클래스(.badge-info 등) 옆에 붙일 클래스를 한 곳에서 정함
   *   ds.statusCls('run') → 'ds-badge is-plain is-info ds-i-play'   면 있는 배지는 ds.statusCls('wait', { face: true })
   *   정하지 않은 아이콘(일시정지, 통신 Online)은 작은 점 그대로. 긴급정지는 위험 삼각형
   */
  var STATUS = {
    run: 'info play', inspect: 'info play', 'return': 'info play', alert: 'info play',
    avail: 'safe ok', done: 'neutral check', wait: 'neutral clock', idle: 'neutral clock',
    work: 'info play', lost: 'crit power', off: 'crit power', estop: 'crit', low: 'warn', no: 'crit',
    pause: 'neutral dot', online: 'safe dot'
  };
  // o.face: 면 있는 배지로 (처리 상태처럼 사진, 표 위에서 묻히는 자리, 11/20)
  function statusCls(key, o) {
    // 조치 진행(응답 대기, 현장 조치 중, 조치 완료)의 면 있는 배지는 테 있는 꼴(.is-progress, 11/23 Figma 1882:9168)
    if (o && o.face && { wait: 1, work: 1, done: 1 }[key]) { return cls('ds-badge', 'is-progress', 'is-' + key, 'ds-i-progress'); }
    var v = (STATUS[key] || 'neutral dot').split(' ');
    return cls('ds-badge', !(o && o.face) && 'is-plain', 'is-' + v[0], v[1] && 'ds-i-' + v[1]);
  }
  /*
   * 조치 목록 한 줄 (DELTA 조치 제안, 11/20). 목록은 '<div class="ds-acts" role="group">' 로 감쌈
   *   ds.act('작업 중지 요청', { on: true, ai: true })          고르기: 체크 상자, 줄 전체가 체크(role=checkbox)
   *   ds.act('작업 중지 요청', { result: true, sub: '현장 작업자' })   결과: 체크 아이콘, 누르지 않음
   *   o.cls, o.attrs 덧붙임. o.sub 는 받는 사람 같은 보조 줄
   */
  function act(text, o) {
    o = o || {};
    var lead = o.result ? '<span class="ds-act-ic" aria-hidden="true"><span class="i" style="--i:var(--ic-check)"></span></span>'
      : '<span class="ds-act-box' + (o.boxCls ? ' ' + o.boxCls : '') + '"><span class="i" style="--i:var(--ic-check)" aria-hidden="true"></span></span>';
    var body = '<span class="' + cls('ds-act-text', o.textCls) + '">' + text + (o.sub ? '<small>' + o.sub + '</small>' : '') + '</span>' +
      (o.ai ? badge('neutral', 'AI 추천', { icon: 'delta', cls: 'ma-check-tag' }) : '');
    return o.result
      ? '<div class="' + cls('ds-act', 'is-result', o.cls) + '" role="listitem"' + sp(o.attrs) + '>' + lead + body + '</div>'
      : '<button type="button" class="' + cls('ds-act', o.cls) + '" role="checkbox" aria-checked="' + (o.on ? 'true' : 'false') + '"' + sp(o.attrs) + '>' + lead + body + '</button>';
  }
  function deltaHead(id) {
    return '<div class="ds-delta-head"><span class="ds-delta-mark"><span class="i" style="--i:var(--ic-delta)" aria-hidden="true"></span><span' + (id ? ' id="' + id + '"' : '') + '>DELTA 조치 제안</span></span></div>';
  }
  function badgeRow(badgeHtml, text, o) {
    o = o || {};
    return '<span class="' + cls('ds-badge-row', o.cls) + '"' + sp(o.attrs) + '>' + badgeHtml + (text ? '<span>' + text + '</span>' : '') + '</span>';
  }
  function wp(n, o) {
    o = o || {};
    var c = cls('ds-wp', o.small && 'is-s', o.tone && 'is-' + o.tone, o.current && 'is-current', o.skip && 'is-skip', o.map && 'is-map', o.cls);
    var tag = o.button ? 'button' : 'span';
    return '<' + tag + (o.button ? ' type="button"' : '') + ' class="' + c + '"' + sp(o.attrs) + '>' + (n == null ? '' : n) + '</' + tag + '>';
  }
  function floor(text, o) {
    o = o || {};
    return '<span class="' + cls('ds-floor', o.cls) + '"' + sp(o.attrs) + '>' + text + '</span>';
  }
  function chip(text, o) {
    o = o || {};
    var c = cls('ds-chip', o.check && 'is-check', o.cls);
    return '<button type="button" class="' + c + '" aria-pressed="' + (o.on ? 'true' : 'false') + '"' + (o.disabled ? ' disabled' : '') + sp(o.attrs) + '>' + (o.before || '') + ic(o.icon, o.tone) + text + '</button>';
  }
  function tabs(kind, items, o) {
    o = o || {};
    var c = cls(kind, o.vertical && 'is-vertical', o.cls);
    return '<div class="' + c + '" role="tablist"' + (o.label ? ' aria-label="' + o.label + '"' : '') + sp(o.attrs) + '>' + items.map(function (t) {
      return '<button type="button" class="' + cls('ds-tab', t.cls) + '" role="tab" aria-selected="' + (t.sel ? 'true' : 'false') + '" tabindex="' + (t.sel ? '0' : '-1') + '"' + sp(t.attrs) + '>' +
        (t.before || '') + '<span>' + t.label + '</span>' + (t.count != null ? '<span class="ds-tab-count">' + t.count + '</span>' : '') + (t.after || '') + '</button>';
    }).join('') + '</div>';
  }
  /*
   * [11/20] 배터리 표시(.ds-battery) 단계 한 곳: 20 이하 위험, 40 이하 주의, 그 위 보통(회색). 충전 중이면 번개
   *   batteryCls(잔량, 충전) → 클래스 글, battery(잔량, {charging, text}) → 표시 마크업(아이콘 + 숫자)
   */
  var BAT_CRIT = 20, BAT_WARN = 40;
  function batteryCls(level, charging) { return "battery ds-battery" + (level <= BAT_CRIT ? " is-critical" : level <= BAT_WARN ? " is-warning" : "") + (charging ? " is-charging" : ""); }
  function battery(level, o) {
    o = o || {}; var v = Math.max(0, Math.min(100, Math.round(level)));
    return '<span class="' + batteryCls(v, o.charging) + '"' + (o.text === false ? ' role="img" aria-label="배터리 ' + v + '%"' : "") + '><span class="battery-body"><span class="battery-fill" style="width:' + v + '%"></span>' + (o.charging ? '<span class="i battery-bolt" style="--i:var(--ic-bolt)" aria-hidden="true"></span>' : "") + '</span><span class="battery-tip"></span>' + (o.text === false ? "" : '<span class="ds-battery-v">' + v + "%</span>") + "</span>";
  }
  /*
   * [11/23] 떠 있는 스크롤 막대(.ds-scroll): 브라우저 막대는 공통 CSS 가 숨기고(줄 너비가 막대 유무로 바뀌지 않게),
   *   상자 안 오른쪽에 4 막대(.ds-scroll-thumb)를 띄움. 끌어서 넘김. 관제 알림 목록(.ah-list, ah-sort.js)과 같은 꼴
   *   .ds-scroll 이 붙은 상자는 열릴 때와 나중에 생길 때 저절로 붙음
   */
  function scrollThumb(list) {
    if (!list || list.hasAttribute("data-ds-thumb") || !document.body.classList.contains("ver-7")) { return; }
    var host = list.parentElement; if (!host) { return; }
    list.setAttribute("data-ds-thumb", "");
    if (getComputedStyle(host).position === "static") { host.style.position = "relative"; }
    var t = document.createElement("span"); t.className = "ds-scroll-thumb"; t.setAttribute("aria-hidden", "true"); t.hidden = true; host.appendChild(t);
    var th = 0;
    function update() {
      var h = list.clientHeight, sh = list.scrollHeight;
      if (sh <= h + 1 || !h) { t.hidden = true; return; }
      t.hidden = false; th = Math.max(24, Math.round(h * h / sh));
      t.style.height = th + "px";
      t.style.top = Math.round(list.offsetTop + (h - th) * list.scrollTop / (sh - h)) + "px";
      t.style.left = Math.round(list.offsetLeft + list.offsetWidth - 8) + "px";   /* 상자 오른쪽 끝에서 4 안쪽, 막대 4 */
    }
    list.addEventListener("scroll", update, { passive: true });
    if (window.ResizeObserver) { new ResizeObserver(update).observe(list); }
    new MutationObserver(update).observe(list, { childList: true, subtree: true });
    host.addEventListener("mouseenter", function () { host.classList.add("is-ds-scroll-on"); });
    host.addEventListener("mouseleave", function () { host.classList.remove("is-ds-scroll-on"); });
    t.addEventListener("pointerdown", function (e) {
      e.preventDefault(); var y0 = e.clientY, s0 = list.scrollTop; t.classList.add("is-drag"); t.setPointerCapture(e.pointerId);
      function move(ev) { var h = list.clientHeight, sh = list.scrollHeight; list.scrollTop = s0 + (ev.clientY - y0) * (sh - h) / Math.max(1, h - th); }
      function up() { t.classList.remove("is-drag"); t.removeEventListener("pointermove", move); t.removeEventListener("pointerup", up); t.removeEventListener("pointercancel", up); }
      t.addEventListener("pointermove", move); t.addEventListener("pointerup", up); t.addEventListener("pointercancel", up);
    });
    update();
  }
  function scrollAll() { Array.prototype.forEach.call(document.querySelectorAll(".ds-scroll"), scrollThumb); }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", scrollAll); } else { scrollAll(); }
  var scrollQueued = false;
  if (window.MutationObserver) { new MutationObserver(function () { if (scrollQueued) { return; } scrollQueued = true; requestAnimationFrame(function () { scrollQueued = false; scrollAll(); }); }).observe(document.documentElement, { childList: true, subtree: true }); }
  window.ds = {
    scrollThumb: scrollThumb,
    battery: battery, batteryCls: batteryCls, BAT_CRIT: BAT_CRIT, BAT_WARN: BAT_WARN,
    badge: badge, badgeRow: badgeRow, statusCls: statusCls, act: act, deltaHead: deltaHead, wp: wp, floor: floor, chip: chip,
    tabsLine: function (items, o) { return tabs('ds-tab-line', items, o); },
    tabsChip: function (items, o) { return tabs('ds-tab-chip', items, o); },
    seg: function (items, o) { return tabs('ds-seg', items, o); },
  };
})();
