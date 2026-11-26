(function() {
  function ic(kind, tone) {
    if (!kind) return '';
    return '<i class="ds-ic is-' + kind + (kind === 'tri' && tone === 'warn' ? ' is-warn-ic' : '') + '" aria-hidden="true"></i>';
  }
  function cls() {
    return Array.prototype.filter.call(arguments, Boolean).join(' ');
  }
  function sp(a) {
    return a ? ' ' + a : '';
  }
  function badge(tone, text, o) {
    o = o || {};
    tone = tone || 'neutral';
    var k = o.icon === undefined ? '' : o.icon === null ? 'ds-i-none' : 'ds-i-' + o.icon;
    var c = cls('ds-badge', 'is-' + tone, o.plain && 'is-plain', o.iconOnly && 'is-icon', o.num && 'is-num', k, o.cls);
    var body = o.iconOnly ? '<span class="ds-sr">' + text + '</span>' : text;
    return '<span class="' + c + '"' + sp(o.attrs) + '>' + body + '</span>';
  }
  var STATUS = {
    run: 'info play',
    inspect: 'info play',
    return: 'info play',
    alert: 'info play',
    avail: 'safe ok',
    done: 'neutral check',
    wait: 'neutral clock',
    idle: 'neutral clock',
    work: 'info play',
    lost: 'crit power',
    off: 'crit power',
    estop: 'crit',
    low: 'warn',
    no: 'crit',
    pause: 'neutral dot',
    online: 'safe dot'
  };
  function statusCls(key, o) {
    if (o && o.face && {
      wait: 1,
      work: 1,
      done: 1
    }[key]) {
      return cls('ds-badge', 'is-progress', 'is-' + key, 'ds-i-progress');
    }
    var v = (STATUS[key] || 'neutral dot').split(' ');
    return cls('ds-badge', !(o && o.face) && 'is-plain', 'is-' + v[0], v[1] && 'ds-i-' + v[1]);
  }
  function act(text, o) {
    o = o || {};
    var lead = o.result ? '<span class="ds-act-ic" aria-hidden="true"><span class="i" style="--i:var(--ic-check)"></span></span>' : '<span class="ds-act-box' + (o.boxCls ? ' ' + o.boxCls : '') + '"><span class="i" style="--i:var(--ic-check)" aria-hidden="true"></span></span>';
    var body = '<span class="' + cls('ds-act-text', o.textCls) + '">' + text + (o.sub ? '<small>' + o.sub + '</small>' : '') + '</span>' + (o.ai ? badge('neutral', 'AI 추천', {
      icon: 'delta',
      cls: 'ma-check-tag'
    }) : '');
    return o.result ? '<div class="' + cls('ds-act', 'is-result', o.cls) + '" role="listitem"' + sp(o.attrs) + '>' + lead + body + '</div>' : '<button type="button" class="' + cls('ds-act', o.cls) + '" role="checkbox" aria-checked="' + (o.on ? 'true' : 'false') + '"' + sp(o.attrs) + '>' + lead + body + '</button>';
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
    return '<div class="' + c + '" role="tablist"' + (o.label ? ' aria-label="' + o.label + '"' : '') + sp(o.attrs) + '>' + items.map(function(t) {
      return '<button type="button" class="' + cls('ds-tab', t.cls) + '" role="tab" aria-selected="' + (t.sel ? 'true' : 'false') + '" tabindex="' + (t.sel ? '0' : '-1') + '"' + sp(t.attrs) + '>' + (t.before || '') + '<span>' + t.label + '</span>' + (t.count != null ? '<span class="ds-tab-count">' + t.count + '</span>' : '') + (t.after || '') + '</button>';
    }).join('') + '</div>';
  }
  var BAT_CRIT = 20, BAT_WARN = 40;
  function batteryCls(level, charging) {
    return "battery ds-battery" + (level <= BAT_CRIT ? " is-critical" : level <= BAT_WARN ? " is-warning" : "") + (charging ? " is-charging" : "");
  }
  function battery(level, o) {
    o = o || {};
    var v = Math.max(0, Math.min(100, Math.round(level)));
    return '<span class="' + batteryCls(v, o.charging) + '"' + (o.text === false ? ' role="img" aria-label="배터리 ' + v + '%"' : "") + '><span class="battery-body"><span class="battery-fill" style="width:' + v + '%"></span>' + (o.charging ? '<span class="i battery-bolt" style="--i:var(--ic-bolt)" aria-hidden="true"></span>' : "") + '</span><span class="battery-tip"></span>' + (o.text === false ? "" : '<span class="ds-battery-v">' + v + "%</span>") + "</span>";
  }
  function scrollThumb(list) {
    if (!list || list.hasAttribute("data-ds-thumb") || !document.body.classList.contains("ver-7")) {
      return;
    }
    var host = list.parentElement;
    if (!host) {
      return;
    }
    list.setAttribute("data-ds-thumb", "");
    if (getComputedStyle(host).position === "static") {
      host.style.position = "relative";
    }
    var t = document.createElement("span");
    t.className = "ds-scroll-thumb";
    t.setAttribute("aria-hidden", "true");
    t.hidden = true;
    host.appendChild(t);
    var th = 0;
    function update() {
      var h = list.clientHeight, sh = list.scrollHeight;
      if (sh <= h + 1 || !h) {
        t.hidden = true;
        return;
      }
      t.hidden = false;
      th = Math.max(24, Math.round(h * h / sh));
      t.style.height = th + "px";
      t.style.top = Math.round(list.offsetTop + (h - th) * list.scrollTop / (sh - h)) + "px";
      t.style.left = Math.round(list.offsetLeft + list.offsetWidth - 8) + "px";
    }
    list.addEventListener("scroll", update, {
      passive: true
    });
    if (window.ResizeObserver) {
      new ResizeObserver(update).observe(list);
    }
    new MutationObserver(update).observe(list, {
      childList: true,
      subtree: true
    });
    host.addEventListener("mouseenter", function() {
      host.classList.add("is-ds-scroll-on");
    });
    host.addEventListener("mouseleave", function() {
      host.classList.remove("is-ds-scroll-on");
    });
    t.addEventListener("pointerdown", function(e) {
      e.preventDefault();
      var y0 = e.clientY, s0 = list.scrollTop;
      t.classList.add("is-drag");
      t.setPointerCapture(e.pointerId);
      function move(ev) {
        var h = list.clientHeight, sh = list.scrollHeight;
        list.scrollTop = s0 + (ev.clientY - y0) * (sh - h) / Math.max(1, h - th);
      }
      function up() {
        t.classList.remove("is-drag");
        t.removeEventListener("pointermove", move);
        t.removeEventListener("pointerup", up);
        t.removeEventListener("pointercancel", up);
      }
      t.addEventListener("pointermove", move);
      t.addEventListener("pointerup", up);
      t.addEventListener("pointercancel", up);
    });
    update();
  }
  function scrollAll() {
    Array.prototype.forEach.call(document.querySelectorAll(".ds-scroll"), scrollThumb);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scrollAll);
  } else {
    scrollAll();
  }
  var scrollQueued = false;
  if (window.MutationObserver) {
    new MutationObserver(function() {
      if (scrollQueued) {
        return;
      }
      scrollQueued = true;
      requestAnimationFrame(function() {
        scrollQueued = false;
        scrollAll();
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  function chipMenus() {
    Array.prototype.forEach.call(document.querySelectorAll(".field-select.is-chip:not([data-chip-on])"), function(sel) {
      sel.setAttribute("data-chip-on", "");
      var val = sel.querySelector("[data-select-value]"), btn = sel.querySelector(".ds-chip.is-menu"), first = sel.querySelector(".field-option");
      if (!val || !btn) {
        return;
      }
      var fix = function() {
        var opt = sel.querySelector('.field-option[aria-selected="true"]') || first;
        var label = opt ? opt.getAttribute("data-chip") || opt.textContent.trim() : val.textContent.trim();
        if (val.textContent.trim() !== label) {
          val.textContent = label;
        }
        if (!sel.hasAttribute("data-chip-plain")) {
          btn.classList.toggle("is-on", !!opt && opt !== first);
        }
      };
      fix();
      new MutationObserver(fix).observe(sel, {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true,
        attributeFilter: [ "aria-selected" ]
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", chipMenus);
  } else {
    chipMenus();
  }
  window.ds = {
    scrollThumb: scrollThumb,
    battery: battery,
    batteryCls: batteryCls,
    BAT_CRIT: BAT_CRIT,
    BAT_WARN: BAT_WARN,
    badge: badge,
    badgeRow: badgeRow,
    statusCls: statusCls,
    act: act,
    deltaHead: deltaHead,
    wp: wp,
    floor: floor,
    chip: chip,
    tabsLine: function(items, o) {
      return tabs('ds-tab-line', items, o);
    },
    tabsChip: function(items, o) {
      return tabs('ds-tab-chip', items, o);
    },
    seg: function(items, o) {
      return tabs('ds-seg', items, o);
    }
  };
})();
