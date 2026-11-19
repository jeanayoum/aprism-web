/* ==========================================================================
 * v7 배지, 칩, 탭 만드는 함수 (모양은 assets/css/components-v7.css 한 곳)
 * 화면 JS는 배지, 칩, 탭 HTML을 직접 쓰지 않고 이 함수를 부른다. 글자에 HTML을 넣어도 됨(<b> 등)
 *
 *   ds.badge('crit', '위험')                          판정. crit, warn 은 삼각형이 저절로 붙음
 *   ds.badge('neutral', '정상', { icon: 'big' })        정상은 회색 + 큰 점
 *   ds.badge('info', '수행중', { icon: 'dot' })         작은 점
 *   ds.badge('crit', '위험', { iconOnly: true })        아이콘만 (글자는 읽어 주기만)
 *   ds.badge('info', '수행중', { icon: 'dot', plain: true })  면 없는 배지 (운영 상태, 건수)
 *   ds.badge('neutral', '01', { num: true })            로봇 번호
 *   ds.wp(7)  ds.wp(4, { tone: 'crit' })  ds.wp(3, { current: true })  ds.wp('', { skip: true })  ds.wp(2, { map: true })   WP 번호 원
 *   ds.floor('B4')                                      층 (지금 층 꼬리표 값 그대로)
 *   ds.badgeRow(ds.badge('warn', '주의', { icon: 'dot' }), '09:58')   표 칸 안 배지 + 글자
 *   ds.chip('위험 2', { on: false, attrs: 'data-f="crit"' })
 *   ds.tabsLine([{ label: '조치 필요 알림', count: '12건', sel: true, attrs: '...' }, ...])
 *   ds.tabsChip([{ label: '안전감지', sel: true }, ...])
 *   ds.seg([{ label: '카드', sel: true }, { label: '표' }], { vertical: false })
 *
 * 공통 옵션: cls (덧붙일 클래스), attrs (덧붙일 속성 문자열)
 * ========================================================================== */
(function () {
  var TONE_ICON = { crit: 'tri', warn: 'tri' };
  function ic(kind, tone) {
    if (!kind) return '';
    return '<i class="ds-ic is-' + kind + (kind === 'tri' && tone === 'warn' ? ' is-warn-ic' : '') + '" aria-hidden="true"></i>';
  }
  function cls() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function sp(a) { return a ? ' ' + a : ''; }

  function badge(tone, text, o) {
    o = o || {}; tone = tone || 'neutral';
    var kind = o.icon === undefined ? (TONE_ICON[tone] || null) : o.icon;
    var c = cls('ds-badge', 'is-' + tone, o.plain && 'is-plain', o.iconOnly && 'is-icon', o.num && 'is-num', o.cls);
    var body = o.iconOnly ? ic(kind || 'tri', tone) + '<span class="ds-sr">' + text + '</span>' : ic(kind, tone) + text;
    return '<span class="' + c + '"' + sp(o.attrs) + '>' + body + '</span>';
  }
  function badgeRow(badgeHtml, text, o) {
    o = o || {};
    return '<span class="' + cls('ds-badge-row', o.cls) + '"' + sp(o.attrs) + '>' + badgeHtml + (text ? '<span>' + text + '</span>' : '') + '</span>';
  }
  function wp(n, o) {
    o = o || {};
    var c = cls('ds-wp', o.tone && 'is-' + o.tone, o.current && 'is-current', o.skip && 'is-skip', o.map && 'is-map', o.cls);
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
  window.ds = {
    badge: badge, badgeRow: badgeRow, wp: wp, floor: floor, chip: chip,
    tabsLine: function (items, o) { return tabs('ds-tab-line', items, o); },
    tabsChip: function (items, o) { return tabs('ds-tab-chip', items, o); },
    seg: function (items, o) { return tabs('ds-seg', items, o); },
  };
})();
