(function() {
  (function statusMenus() {
    const menus = Array.from(document.querySelectorAll('[data-status-menu]'));
    const close = except => menus.forEach(m => {
      if (m === except) return;
      m.querySelector('[data-menu-trigger]').setAttribute('aria-expanded', 'false');
      m.querySelector('.dropdown-menu').hidden = true;
    });
    menus.forEach(m => {
      const t = m.querySelector('[data-menu-trigger]'), d = m.querySelector('.dropdown-menu');
      t.addEventListener('click', e => {
        e.stopPropagation();
        const open = t.getAttribute('aria-expanded') === 'true';
        close(m);
        t.setAttribute('aria-expanded', open ? 'false' : 'true');
        d.hidden = open;
      });
    });
    document.addEventListener('click', () => close());
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });
  })();
  const K = [ '안전감지', '누출감지', '온도감지', '계기인식', '이상음향', '부분방전' ];
  const MDF = {
    '안전감지': 'safety_%.jpg',
    '누출감지': 'leak_%.jpg',
    '온도감지': 'temp_%.jpg',
    '계기인식': 'gauge_%.jpg',
    '이상음향': 'sound_%.jpg',
    '부분방전': 'pd_%.png'
  };
  const MV = {
    '1|부분방전|warn': 'm1_pd_warn.png',
    '2|온도감지|warn': 'm2_temp_warn.jpg',
    '2|이상음향|ok': 'm2_sound_ok.jpg',
    '2|안전감지|ok': 'm2_safety_na.jpg'
  };
  const MD = (k, st, mi) => {
    const s3 = st === 'crit' ? 'crit' : st === 'warn' || st === 'done' ? 'warn' : 'ok';
    const i7 = s3 !== 'ok' && document.body.classList.contains('ver-7') && window.APRISM_ALERTS7 && window.APRISM_ALERTS7.img(k);
    if (i7) return [ '', `<img src="../assets/img/${i7}" alt="">` ];
    return [ '', `<img src="../assets/img/safety/${MV[mi + '|' + k + '|' + s3] || MDF[k].replace('%', s3)}" alt="">` ];
  };
  const LINKS = {
    0: [ [ '이상음향', '온도감지', '같은 펌프 P-2. 베어링 이상음이 발열로 이어질 수 있다', '높음' ], [ '온도감지', '누출감지', '같은 냉각수 계통. WP-05 펌프 온도가 오르면 WP-03 밸브 이음부 압력이 오른다', '높음' ], [ '부분방전', '온도감지', '같은 펌프 전원. WP-06 수배전반 방전이 WP-05 펌프 모터 발열로 이어질 수 있다', '보통' ] ],
    2: [ [ '온도감지', '누출감지', '같은 급수 계통. WP-B09 펌프 모터 과열이 분기부 압력 변동으로 이어질 수 있다', '보통' ] ]
  };
  const BASE = [ {
    mis: window.APRISM_MISSION ? APRISM_MISSION('m1') : '정기 순회 점검',
    fl: '지하 4층',
    ab: 'B4',
    robot: window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01',
    done: 7,
    total: 20,
    r: {
      '안전감지': [ 'crit', '안전벨트 미착용 1명', 'WP-07 고소 작업 발판', '10:16' ],
      '누출감지': [ 'warn', '누출 의심 1곳', 'WP-03 냉각수 배관 밸브', '10:11' ],
      '온도감지': [ 'warn', '최고 48.6 ℃', 'WP-05 냉각 펌프 P-2', '10:14' ],
      '계기인식': [ 'crit', '압력 0.86 MPa', 'WP-04 N₂ 배관 압력계', '10:12' ],
      '이상음향': [ 'warn', '이상 점수 20.4', 'WP-05 냉각 펌프 P-2', '10:13' ],
      '부분방전': [ 'warn', 'CH1 이상 점수 9.05', 'WP-06 수배전반 MCC-1', '10:15' ]
    }
  }, {
    mis: window.APRISM_MISSION ? APRISM_MISSION('m3') : '전기실 열화상 점검',
    fl: '지하 3층',
    ab: 'B3',
    robot: window.APRISM_ROBOT ? APRISM_ROBOT('r11') : 'Robot 11',
    done: 3,
    total: 20,
    r: {
      '안전감지': [ 'ok', '정상 범위', '측정 3곳' ],
      '누출감지': [ 'ok', '정상 범위', '측정 2곳' ],
      '온도감지': [ 'ok', '정상 범위', '측정 3곳' ],
      '계기인식': [ 'warn', '압력 0.84 MPa', 'WP-102 압력계 PG-A3', '10:01' ],
      '이상음향': [ 'ok', '정상 범위', '측정 2곳' ],
      '부분방전': [ 'warn', 'CH1 이상 점수 9.05', 'WP-103 수배전반', '09:58' ]
    }
  }, {
    mis: window.APRISM_MISSION ? APRISM_MISSION('m2') : '발전기실 설비 점검',
    fl: '지하 3층, 지하 4층',
    ab: 'B3',
    fls: [ [ 'B3', '지하 3층', 12 ], [ 'B4', '지하 4층', 20 ] ],
    robot: window.APRISM_ROBOT ? APRISM_ROBOT('r05') : 'Robot 05',
    done: 13,
    total: 20,
    na: {
      '안전감지': 'scope',
      '부분방전': 'sensor'
    },
    r: {
      '안전감지': null,
      '누출감지': [ 'crit', '누출 의심도 81%', 'WP-B04 급수 배관 분기부', '09:21' ],
      '온도감지': [ 'warn', '최고 41.8 ℃', 'WP-B09 급수 펌프 모터', '10:09' ],
      '계기인식': [ 'ok', '정상 범위', '측정 3곳' ],
      '이상음향': [ 'ok', '정상 범위', '측정 4곳' ],
      '부분방전': null
    }
  } ];
  const V6 = document.body.classList.contains('ver-6');
  if (V6) {
    const ok = n => [ 'ok', '정상 범위', '측정 ' + n + '곳' ];
    BASE[1].r = {
      '안전감지': ok(3),
      '누출감지': ok(2),
      '온도감지': ok(3),
      '계기인식': [ 'crit', '차압 312 Pa', 'WP-02 HEPA Filter 차압계', '09:44' ],
      '이상음향': ok(2),
      '부분방전': ok(2)
    };
    BASE[1].rs = {
      '계기인식': [ [ 'crit', '차압 312 Pa', 'WP-02 HEPA Filter 차압계', '09:44' ], [ 'warn', '압력 0.62 MPa', 'WP-04 N₂ 배관 압력계', '10:15' ] ]
    };
    BASE[2].na = {
      '안전감지': 'scope'
    };
    BASE[2].r = {
      '안전감지': null,
      '누출감지': ok(4),
      '온도감지': [ 'warn', '최고 68.4 ℃', 'WP-02 발전기 베어링', '09:20' ],
      '계기인식': [ 'warn', '압력 7.9 bar', 'WP-13 공기 압축기 C-1', '10:01' ],
      '이상음향': [ 'warn', '이상 점수 21.6', 'WP-12 냉각 펌프 P-2', '09:56' ],
      '부분방전': [ 'warn', '이상 점수 9.41', 'WP-06 수배전반', '09:36' ]
    };
    MV['2|이상음향|warn'] = 'm2_sound_warn.jpg';
    LINKS[2] = [ [ '부분방전', '온도감지', '같은 발전기 계통. WP-06 수배전반 방전과 WP-02 베어링 과열이 함께 나타날 수 있다', '보통' ] ];
    BASE.push({
      mis: window.APRISM_MISSION ? APRISM_MISSION('m6') : '야간 순회 점검',
      fl: '지하 4층',
      ab: 'B4',
      robot: window.APRISM_ROBOT ? APRISM_ROBOT('r04') : 'Robot 04',
      done: 20,
      total: 20,
      r: {
        '안전감지': ok(4),
        '누출감지': ok(5),
        '온도감지': ok(6),
        '계기인식': ok(4),
        '이상음향': ok(5),
        '부분방전': ok(3)
      }
    }, {
      mis: window.APRISM_MISSION ? APRISM_MISSION('m7') : '공조 설비 순회',
      fl: '지하 3층',
      ab: 'B3',
      robot: window.APRISM_ROBOT ? APRISM_ROBOT('r07') : 'Robot 07',
      done: 20,
      total: 20,
      r: {
        '안전감지': ok(3),
        '누출감지': ok(4),
        '온도감지': ok(6),
        '계기인식': ok(5),
        '이상음향': ok(6),
        '부분방전': ok(2)
      }
    }, {
      mis: window.APRISM_MISSION ? APRISM_MISSION('m8') : '유틸리티 순회',
      fl: '지하 4층',
      ab: 'B4',
      robot: window.APRISM_ROBOT ? APRISM_ROBOT('r09') : 'Robot 09',
      done: 20,
      total: 20,
      r: {
        '안전감지': ok(3),
        '누출감지': ok(6),
        '온도감지': ok(5),
        '계기인식': ok(6),
        '이상음향': ok(4),
        '부분방전': ok(3)
      }
    });
  }
  const S7 = window.APRISM_ALERTS7;
  const LAB7 = {};
  if (S7) {
    BASE.forEach(m => {
      delete m.rs;
      K.forEach(k => {
        const x = m.r[k];
        if (x && x[0] !== 'ok') m.r[k] = [ 'ok', '정상 범위', '측정 1곳' ];
      });
    });
    const got = {};
    S7.forSafety().forEach(s => {
      const mi = BASE.findIndex(m => m.mis === s.mission), m = BASE[mi];
      if (!m || !m.r[s.detect]) return;
      (got[mi + '|' + s.detect] = got[mi + '|' + s.detect] || []).push(s.cell);
      if ([ '누출감지', '온도감지', '이상음향', '부분방전' ].includes(s.detect)) LAB7[s.detect] = s.label;
      if (s.detect === '안전감지' && s.label === '안전모 미착용') MV[mi + '|안전감지|' + s.cell[0]] = '../alert/wp07-helmet.webp';
    });
    Object.keys(got).forEach(key => {
      const [mi, k] = key.split('|'), m = BASE[+mi], cs = got[key];
      m.r[k] = cs[0].slice();
      if (cs.length > 1) {
        m.rs = m.rs || {};
        m.rs[k] = cs;
      }
    });
  }
  const RQ_BTN = S7 ? '조치 요청' : '현장 조치 요청', RQ_DONE = S7 ? '요청됨' : '현장 조치 요청됨';
  const NEWR = [ 1, '온도감지', [ 'crit', '최고 71.2 ℃', 'WP-104 변압기 TR-1', '10:15' ] ];
  const RANK = {
    crit: 3,
    warn: 2,
    done: 1,
    ok: 0
  };
  const V7 = document.body.classList.contains('ver-7');
  const WORD = {
    crit: '위험',
    warn: '주의',
    done: '요청됨',
    ok: V7 ? '정상' : '정상 범위',
    plan: '예정'
  };
  const COLR = {
    crit: 'var(--status-critical-icon)',
    warn: 'var(--status-warning-icon)',
    done: 'var(--text-tertiary)',
    ok: 'var(--text-disabled)'
  };
  let M, scope, menu, fired, toasts, drawer, newSeen, lay = 'card', dt = null, bigD = false;
  let REQ = {}, reqT = {};
  const RQ_WORD = {
    wait: '현장 응답 대기',
    work: '현장 조치 중',
    done: '조치 완료'
  };
  const RQ_BADGE = {
    wait: '',
    work: 'badge-info',
    done: 'badge-normal'
  };
  const rqBadge = R => `<span class="badge badge-mode ${RQ_BADGE[R.st]} jrq${V7 && window.ds ? ' ' + window.ds.statusCls(R.st, {
    face: true
  }) : ''}"><span class="badge-dot"></span>${RQ_WORD[R.st]}</span>`;
  const rqLine = R => `${R.st === 'done' ? R.t3 : R.st === 'work' ? R.t2 : R.t} ${RQ_WORD[R.st]}`;
  function reqSide(sug, R, nextM) {
    const ord = [ 'wait', 'work', 'done' ], cur = ord.indexOf(R.st);
    const sub = {
      wait: cur > 0 ? `${R.who} 수신 확인` : `${R.who}에게 전송, 수신 확인 대기`,
      work: cur > 1 ? '관제사가 통화로 결과 확인' : cur === 1 ? '현장에서 조치 진행, 결과는 통화로 확인' : '현장에서 요청을 확인하면 시작',
      done: cur === 2 ? `재측정 ${nextM}, 다시 넘으면 다시 표시` : '관제사가 결과를 확인하면 기록'
    };
    const tm = {
      wait: R.t,
      work: cur > 0 ? R.t2 : '',
      done: cur > 1 ? R.t3 : ''
    };
    const steps = ord.map((s, n) => `<li class="${n < cur ? 'is-past' : n === cur ? 'is-now' : ''}"${n === cur ? ' aria-current="step"' : ''}><i aria-hidden="true"></i><div><b>${RQ_WORD[s]}</b><span>${sub[s]}</span></div><time>${tm[s]}</time></li>`).join('');
    return `<div class="dl is-light-scope is-dark-scope is-sent${V7 ? ' ds-delta-card' : ''}"><div class="hh${V7 ? ' ds-delta-head' : ''}"><span${V7 ? ' class="ds-delta-mark"' : ''}><span class="dlogo" aria-hidden="true"></span>DELTA 조치 제안</span></div><div class="ti ds-delta-lead">${sug[0]}</div>\n        ${V7 && window.ds ? `<div class="cks ds-acts" role="list">${sug[1].filter(([l]) => R.acts.includes(l)).map(([l, a2, to]) => window.ds.act(l, {
      result: true,
      ai: a2
    })).join('')}</div>` : `<div class="cks">${sug[1].map(([l, a2, to]) => `<label class="c1x"><input type="checkbox" disabled ${R.acts.includes(l) ? 'checked' : ''}><span><b>${l}</b><small>${to}</small></span>${a2 ? '<em class="ma-check-tag">AI 추천</em>' : ''}</label>`).join('')}</div>`}\n        ${R.memo ? `<span class="mm">메모</span><p class="fd rq-memo">${R.memo.replace(/[<>&]/g, c => ({
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;'
    }[c]))}</p>` : ''}</div>\n      <button type="button" class="btn btn-accent rqx" disabled><span class="i i-16" style="--i:var(--ic-check)" aria-hidden="true"></span>${R.t} ${S7 ? '요청됨' : '요청 전송됨'}</button>\n      <section class="rqp" aria-label="조치 진행"><div class="rqp-h"><b>조치 진행</b><span class="badge badge-mode ${RQ_BADGE[R.st]} rqp-b${V7 && window.ds ? ' ' + window.ds.statusCls(R.st, {
      face: true
    }) : ''}"><span class="badge-dot"></span>${RQ_WORD[R.st]}</span></div>\n        <ol class="rqp-st is-${R.st}">${steps}</ol>\n        ${R.st === 'work' ? '<button type="button" class="btn btn-secondary rqd" data-reqdone="1">조치 완료 확인</button>' : ''}</section>`;
  }
  let tst = null, tstTimer = null, tstUndo = null;
  function toast(msg, undo) {
    if (!tst) {
      tst = document.createElement('div');
      tst.className = 'toast sf-toast';
      tst.hidden = true;
      tst.setAttribute('role', 'status');
      tst.setAttribute('aria-live', 'polite');
      tst.innerHTML = '<span class="toast-msg t-label-2"></span><button type="button" class="btn btn-ghost is-xs toast-undo">되돌리기</button>';
      tst.querySelector('.toast-undo').addEventListener('click', () => {
        const f = tstUndo;
        hideToast();
        if (f) f();
      });
      document.body.appendChild(tst);
    }
    const box = document.getElementById('sfv'), r = box && box.getBoundingClientRect();
    if (r) tst.style.left = r.left + r.width / 2 + 'px';
    tst.querySelector('.toast-msg').textContent = msg;
    tstUndo = undo || null;
    tst.querySelector('.toast-undo').hidden = !undo;
    tst.hidden = false;
    clearTimeout(tstTimer);
    tstTimer = setTimeout(hideToast, undo ? 5000 : 4000);
  }
  function hideToast() {
    clearTimeout(tstTimer);
    tstUndo = null;
    if (tst) tst.hidden = true;
  }
  const reqName = key => {
    const [, k, w] = key.split('|');
    return `${w} ${k}`;
  };
  const HKEY = 'aprism-handled';
  const hRead = () => {
    try {
      return JSON.parse(sessionStorage.getItem(HKEY) || '[]') || [];
    } catch (e) {
      return [];
    }
  };
  const hWrite = l => {
    try {
      sessionStorage.setItem(HKEY, JSON.stringify(l));
    } catch (e) {}
  };
  const hMis = (a, b) => !!a && !!b && (a.includes(b) || b.includes(a));
  const hSame = (e, key) => {
    const [mi, k, w] = key.split('|');
    return e.k === k && e.wp === w && hMis(e.mis, M[+mi].mis);
  };
  const key7 = id => {
    const a = S7 && S7.list.find(x => x.id === id);
    if (!a) return null;
    const mi = M.findIndex(m => m.mis === a.mission);
    return mi >= 0 && M[mi].r[a.detect] ? mi + '|' + a.detect + '|' + a.wp : null;
  };
  function hPut(key) {
    if (!V7) return;
    const R = REQ[key], [mi, k, w] = key.split('|');
    if (S7) {
      const id = S7.req.find(M[+mi].mis, k, w);
      if (!id) return;
      if (R) S7.req.set(id, {
        t: R.t,
        how: R.acts,
        memo: R.memo,
        who: window.APRISM_NAME ? APRISM_NAME('op1') : '홍길동',
        to: R.who,
        st: R.st,
        t2: R.t2,
        t3: R.t3,
        src: R.src || 'sf'
      }); else S7.req.clear(id);
      return;
    }
    const l = hRead().filter(e => !hSame(e, key));
    if (R) l.push({
      mis: M[+mi].mis,
      k: k,
      wp: w,
      t: R.t,
      t2: R.t2,
      t3: R.t3,
      acts: R.acts,
      memo: R.memo,
      who: R.who,
      st: R.st,
      src: R.src || 'sf'
    });
    hWrite(l);
  }
  function hLoad() {
    if (!V7) return;
    if (S7) {
      const all = S7.req.all(), seen = {};
      const setT = (mi, k, w, t) => {
        const m = M[mi];
        if (m.rs && m.rs[k]) {
          const it = m.rs[k].find(y => wpOf(y) === w);
          if (it) it[4] = t;
          sync(m, mi);
        } else if (m.r[k]) m.r[k][4] = t;
      };
      Object.keys(all).forEach(id => {
        const key = key7(id);
        if (!key) return;
        const [mi0, k, w] = key.split('|'), mi = +mi0, e = all[id];
        if (!itemsOf(mi, k).find(y => wpOf(y) === w && y[0] !== 'ok')) return;
        const t = (e.t || '').slice(0, 5);
        seen[key] = 1;
        setT(mi, k, w, t);
        REQ[key] = {
          st: e.st || 'wait',
          t: t,
          t2: e.t2,
          t3: e.t3,
          acts: e.how || [],
          memo: e.memo || '',
          who: e.to || '현장 작업자',
          src: e.src
        };
        if (REQ[key].st === 'wait') {
          if (!reqT[key]) reqT[key] = setTimeout(() => reqStep(key, 'work'), 5000);
        } else if (reqT[key]) {
          clearTimeout(reqT[key]);
          delete reqT[key];
        }
      });
      Object.keys(REQ).forEach(key => {
        if (seen[key]) return;
        const [mi0, k, w] = key.split('|');
        clearTimeout(reqT[key]);
        delete reqT[key];
        delete REQ[key];
        setT(+mi0, k, w, undefined);
      });
      return;
    }
    hRead().forEach(e => M.forEach((m, mi) => {
      if (!hMis(e.mis, m.mis) || !m.r[e.k]) return;
      const it = itemsOf(mi, e.k).find(y => wpOf(y) === e.wp && y[0] !== 'ok');
      if (!it) return;
      if (m.rs && m.rs[e.k]) {
        const src = m.rs[e.k].find(y => wpOf(y) === e.wp);
        if (src) src[4] = e.t;
        sync(m, mi);
      } else m.r[e.k][4] = e.t;
      const key = mi + '|' + e.k + '|' + e.wp;
      REQ[key] = {
        st: e.st || 'wait',
        t: e.t,
        t2: e.t2,
        t3: e.t3,
        acts: e.acts || [],
        memo: e.memo || '',
        who: e.who || '현장 작업자',
        src: e.src
      };
      if (REQ[key].st === 'wait') reqT[key] = setTimeout(() => reqStep(key, 'work'), 5000);
    }));
  }
  function reqSend(mi, k, w, info) {
    const key = mi + '|' + k + '|' + w;
    REQ[key] = Object.assign({
      st: 'wait',
      t: '10:17'
    }, info);
    hPut(key);
    toast(`${reqName(key)} ${S7 ? '조치 요청됨' : '현장 조치 요청 전송됨'}`, () => reqUndo(key));
    clearTimeout(reqT[key]);
    reqT[key] = setTimeout(() => reqStep(key, 'work'), 5000);
  }
  function reqStep(key, st) {
    const R = REQ[key];
    if (!R) return;
    clearTimeout(reqT[key]);
    R.st = st;
    if (st === 'work') {
      R.t2 = '10:18';
      toast(`${reqName(key)} 현장 조치 시작됨`);
    }
    if (st === 'done') {
      R.t3 = '10:24';
      toast(`${reqName(key)} 조치 완료 기록됨`);
    }
    hPut(key);
    if (!dt || dt.mi + '|' + dt.k + '|' + dt.wp === key) render();
  }
  function reqUndo(key) {
    const [mi0, k, w] = key.split('|'), mi = +mi0, m = M[mi];
    clearTimeout(reqT[key]);
    delete REQ[key];
    hPut(key);
    if (m.rs && m.rs[k]) {
      const it = m.rs[k].find(y => wpOf(y) === w);
      if (it) it[4] = undefined;
      sync(m, mi);
    } else if (m.r[k]) m.r[k][4] = undefined;
    render();
  }
  document.addEventListener('aprism:requested', () => {
    if (!M) return;
    hLoad();
    render();
  });
  const COND = {
    '안전감지': null,
    '누출감지': [ 0, 100, 55, 70, '%' ],
    '온도감지': [ 18, 90, 40, 55, ' ℃' ],
    '계기인식': null,
    '이상음향': [ 0, 30, 19, 22.8, '' ],
    '부분방전': [ 0, 10, 8.6, 9.23, '' ]
  };
  if (V6) {
    COND['온도감지'] = [ 18, 90, 40, 70, ' ℃' ];
    COND['부분방전'] = [ 0, 12, 8.6, 9.6, '' ];
  }
  const SUG = {
    '안전감지': [ '작업자에게 즉시 착용을 안내하고 고소 작업을 멈춰야 함', [ [ '작업자 즉시 착용 안내', 1, '현장 작업자, 무전 2채널' ], [ '고소 작업 일시 중지', 1, '작업 감독자, 내선 2214' ], [ '안전관리팀 전달', 0, '안전관리팀, 업무 메신저' ] ] ],
    '누출감지': [ '구역 출입을 통제하고 설비팀에 밸브 확인을 요청해야 함', [ [ '구역 출입 통제', 1, '현장 작업자, 무전 2채널' ], [ '설비팀 밸브 확인 요청', 1, '설비팀, 내선 2310' ], [ '현장 확인', 0, '순회 근무자, 무전 1채널' ] ] ],
    '온도감지': [ '부하를 줄이고 점검을 요청해야 함', [ [ '부하 감소 요청', 1, '운전원, 내선 2201' ], [ '설비 점검 요청', 1, '설비팀, 내선 2310' ], [ '현장 확인', 0, '순회 근무자, 무전 1채널' ] ] ],
    '계기인식': [ '계측팀에 계기 교정을 요청해야 함', [ [ '계기 교정 요청', 1, '계측팀, 내선 2420' ], [ '운전원 수동 판독 요청', 0, '운전원, 내선 2201' ] ] ],
    '이상음향': [ '진동 정밀 측정을 요청해야 함', [ [ '진동 정밀 측정 요청', 1, '설비팀, 내선 2310' ], [ '설비 정지 검토 요청', 0, '운전원, 내선 2201' ] ] ],
    '부분방전': [ '절연 진단을 요청하고 전기팀에 알려야 함', [ [ '절연 진단 요청', 1, '전기팀, 내선 2405' ], [ '감시 강화', 1, '전기팀, 업무 메신저' ] ] ]
  };
  const SUG0 = {
    '계기인식': [ '현장 점검을 요청해야 함', [ [ '로봇 정지, 현장 점검 요청', 1, '설비팀, 내선 2310' ], [ '현장 무전 연락, 작업 중지 요청', 1, '현장 작업자, 무전 2채널' ], [ '재측정 후 판단', 0, '순회 근무자, 무전 1채널' ] ] ]
  };
  function detail() {
    const {mi: mi, k: k} = dt, m = M[mi], x0 = m.r[k], {sp: sp, now: now, rows: rows} = eData(mi);
    const cellOf = (k2, w) => {
      const r = rows.find(r2 => r2.n === k2);
      return r ? r.c[w] : undefined;
    };
    const hitWp = x0[0] !== 'ok' ? x0[2].split(' ')[0] : null;
    const wp = dt.w || hitWp || (sp.find(p => {
      const c = cellOf(k, p[0]);
      return c && c[0] === 'ok';
    }) || sp[0])[0];
    const its = itemsOf(mi, k).filter(it => it[0] !== 'ok'), hx = its.find(it => wpOf(it) === wp);
    const isHit = !!hx, here = cellOf(k, wp), spi = sp.find(p => p[0] === wp) || [ wp, '' ];
    const x = isHit ? hx : [ here && here[0] === 'plan' ? 'plan' : 'ok', here && here[1] ? here[1] : '정상 범위', wp, spi[1] ];
    const st = x[0];
    const allDone = k2 => V7 && (() => {
      const hs = itemsOf(mi, k2).filter(it => it[0] === 'crit' || it[0] === 'warn');
      return hs.length > 0 && hs.every(it => (REQ[mi + '|' + k2 + '|' + wpOf(it)] || {}).st === 'done');
    })();
    const tabs = K.map(k2 => {
      const y = m.r[k2];
      if (!y) return `<span class="tb na">${k2}</span>`;
      const s2 = y[0] === 'ok' || allDone(k2) ? '' : y[0];
      return `<button type="button" class="tb${V7 ? ' ds-tab' : ''} ${k2 === k ? 'on' : ''}" data-dk="${k2}">${k2}<i class="d ${s2}"></i></button>`;
    }).join('');
    const md = MD(k, st, mi), canBig = !md[1].includes('canvas'), heat = k !== '안전감지';
    const media = bigD && canBig ? `<div class="dmw ${heat ? 'two' : ''}"><div class="md ${md[0]}">${md[1]}<span class="dlab">원본</span></div>${heat ? `<div class="md hm ${md[0]}">${md[1].replace(/<span class="bx"[^>]*><\/span>/, '')}<span class="heat"></span><span class="dlab">히트맵</span></div>` : ''}<button type="button" class="bigb on" data-bigd="1">원본 크게 끄기</button></div>` : `<div class="dmw"><div class="md ${md[0]}">${md[1]}</div>${canBig ? `<button type="button" class="bigb" data-bigd="1">${heat ? '원본과 히트맵 크게' : '원본 크게'}</button>` : ''}</div>`;
    const cd = COND[k], num = parseFloat(SHORT[x[1]] || x[1]);
    const cond = !isHit ? `<span class="why1">기준: ${STD[k]}</span>` : cd && !isNaN(num) ? (() => {
      const [lo, hi, w2, c2, u] = cd, p = q => Math.max(0, Math.min(100, (q - lo) / (hi - lo) * 100)).toFixed(1);
      return `<span class="sm2 ${st}">${x[1].includes(String(num)) ? '' : num + u + ', '}${num >= c2 ? '위험 기준 ' + c2 + u + ' 초과' : '주의 기준 ' + w2 + u + ' 초과'}</span><div class="trk"><span class="f ${st}" style="width:${p(num)}%"></span><span class="m w" style="left:${p(w2)}%"><span>주의 ${w2}${u}</span></span><span class="m c" style="left:${p(c2)}%"><span>위험 ${c2}${u}</span></span></div><span class="why1">기준: ${STD[k]}</span>`;
    })() : `<span class="why1">기준: ${STD[k]}</span>`;
    const SG = V7 && window.APRISM_ALERTS7 && window.APRISM_ALERTS7.sug && window.APRISM_ALERTS7.sug(m.mis, k) || mi === 0 && SUG0[k] || SUG[k];
    const prevAct = (SG ? SG[1][0][0] : '현장 조치').replace(/ 요청$/, '') + ' 요청';
    const nowAct = !isHit ? st === 'plan' ? '' : '조치 없음' : st === 'done' ? (x[4] || '10:17') + ' ' + RQ_DONE : '';
    const D6 = V6 ? [ '10/31', '10/31', '11/01' ] : [ '10/22', '10/22', '10/23' ];
    const hist0 = !isHit ? [ [ '10/22 09:00', '정상 범위', 'ok', '조치 없음' ], [ '10/22 14:00', '정상 범위', 'ok', '조치 없음' ], [ '10/23 09:00', '정상 범위', 'ok', '조치 없음' ], [ '오늘 ' + (x[3] || ''), st === 'plan' ? '측정 전' : x[1], st, nowAct ] ] : [ [ '10/22 09:00', '정상 범위', 'ok', '조치 없음' ], [ '10/22 14:00', '정상 범위', 'ok', '조치 없음' ], [ '10/23 09:00', st === 'warn' ? '주의' : '정상 범위', st === 'warn' ? 'warn' : 'ok', st === 'warn' ? '09:14 ' + prevAct : '조치 없음' ], [ '오늘 ' + x[3], SHORT[x[1]] || x[1], st, nowAct ] ];
    const hist = hist0.map((h, n) => n < 3 ? [ h[0].replace(/^\d\d\/\d\d/, D6[n]) ].concat(h.slice(1)) : h);
    const again = '';
    const tSplit = t => {
      const i = t.lastIndexOf(' ');
      return i < 0 ? t : `<span class="hdt">${t.slice(0, i)}</span><span class="htm">${t.slice(i + 1)}</span>`;
    };
    const hiRow = ([t, val, s2, a], n) => `<div class="hi ${n === 3 ? 'now' : ''}"><span class="t">${V6 ? tSplit(t) : t}</span><span>${val}</span><span class="verdict-chip${V7 ? ' ds-badge' : ''} is-${s2}">${WORD[s2]}</span><span class="hia ${a && a !== '조치 없음' ? 'on' : ''}">${a}</span></div>`;
    const rep3 = hist.slice(0, 3).some(h => h[2] !== 'ok');
    const histHtml = !V6 || rep3 ? `${V6 ? '<p class="hsum is-rep"><b>반복</b> 지난 순회에서도 기준을 넘었음</p>' : ''}<div class="hist">${hist.map(hiRow).join('')}</div>` : `<p class="hsum"><b>${isHit ? '처음 넘음' : '계속 정상 범위'}</b></p><div class="hist">${hiRow(hist[3], 3)}</div>\n        <details class="hmore"><summary>지난 3회 모두 정상 범위<span class="i i-14" style="--i:var(--ic-chevron-down)" aria-hidden="true"></span></summary><div class="hist">${hist.slice(0, 3).map(hiRow).join('')}</div></details>`;
    const rel = K.filter(k2 => k2 !== k && m.r[k2] && (m.r[k2][0] === 'crit' || m.r[k2][0] === 'warn'));
    const sug = SG;
    const side = !isHit ? `<div class="donec"><b>${st === 'plan' ? '아직 측정 전' : '조치 필요 없음'}</b><span>${st === 'plan' ? '로봇이 도착하면 결과가 표시됨' : '정상 범위의 측정값'}</span></div>` : st === 'done' ? `<div class="donec"><b>${x[4] || '10:17'} ${RQ_DONE}</b><span>재측정에서 다시 넘으면 다시 표시</span></div>` : `<div class="dl${V6 ? ' is-light-scope is-dark-scope' : ''}${V7 ? ' ds-delta-card' : ''}"><div class="hh${V7 ? ' ds-delta-head' : ''}"><span${V7 ? ' class="ds-delta-mark"' : ''}><span class="dlogo" aria-hidden="true"></span>DELTA 조치 제안</span>${V7 ? "" : "<span>오탐 가능성 <b>낮음</b></span>"}</div><div class="ti ds-delta-lead">${sug[0]}</div>\n        <div class="cks${V7 ? ' ds-acts' : ''}">${sug[1].map(([l, a2, to]) => `<label class="c1x${V7 ? ' ds-act' : ''}"><input type="checkbox"${V7 ? ' class="ds-act-box"' : ''} ${a2 ? 'checked' : ''}><span${V7 ? ' class="ds-act-text"' : ''}><b>${l}</b>${V7 ? '' : `<small>${to}</small>`}</span>${a2 ? V6 ? V7 ? '<em class="ma-check-tag ds-badge is-neutral ds-i-delta">AI 추천</em>' : '<em class="ma-check-tag">AI 추천</em>' : '<em class="badge badge-mode badge-info t-caption">AI 추천</em>' : ''}</label>`).join('')}</div>\n        <label class="mm" for="sfMemo">메모 (선택)</label><textarea class="fd" id="sfMemo" rows="2" placeholder="현장에 전달할 내용"></textarea></div><button type="button" class="btn btn-accent rqx" data-req="1">${RQ_BTN}</button>`;
    const step = q => `<div class="sth"><b>${q}</b></div>`;
    const lks = (LINKS[dt.mi] || []).filter(l => l[0] === k || l[1] === k).map(l => {
      const k2 = l[0] === k ? l[1] : l[0], y = m.r[k2];
      return y && (y[0] === 'crit' || y[0] === 'warn') ? {
        k2: k2,
        y: y,
        w2: y[2].split(' ')[0],
        role: l[0] === k ? '영향 후보' : '원인 후보',
        why: l[2],
        p: l[3]
      } : null;
    }).filter(Boolean);
    const rest = rel.filter(k2 => !lks.some(l => l.k2 === k2));
    const lkRow = V6 ? l => `<button type="button" class="rlx lk" data-dk="${l.k2}" data-dw="${l.w2}" data-rel="1"><span class="rlt"><span class="rlw"><span class="verdict-chip${V7 ? ' ds-badge' : ''} is-${l.y[0]}">${WORD[l.y[0]]}</span><b>${l.k2}</b>${V7 ? `<span class="rmi" title="${m.mis}">같은 미션</span>` : `<span class="rwv"><span class="rwp">${l.w2}</span><span class="rv">${SHORT[l.y[1]] || l.y[1]}</span></span>`}</span><span class="rlr"><em class="rr r0">${l.role}</em><small class="lp">가능성 ${l.p}</small></span></span><span class="rwhy">${l.why}</span></button>` : l => `<button type="button" class="rlx lk" data-dk="${l.k2}" data-dw="${l.w2}" data-rel="1"><span class="rlt"><span class="verdict-chip${V7 ? ' ds-badge' : ''} is-${l.y[0]}">${WORD[l.y[0]]}</span><b>${l.k2}</b><span>${l.w2}</span><em class="rr r0">${l.role}</em><small class="lp">가능성 ${l.p}</small><span class="t">${SHORT[l.y[1]] || l.y[1]}</span></span><span class="rwhy">${l.why}</span></button>`;
    const restRow = k2 => {
      const y = m.r[k2], w2 = y[2].split(' ')[0];
      return `<button type="button" class="rlx" data-dk="${k2}" data-dw="${w2}" data-rel="1"><span class="verdict-chip${V7 ? ' ds-badge' : ''} is-${y[0]}">${WORD[y[0]]}</span><b>${k2}</b><span>${w2}</span><span class="t">${SHORT[y[1]] || y[1]}</span></button>`;
    };
    const relB = lks.length ? `<div class="rl b">${lks.map(lkRow).join('')}</div>` : '<span class="why1">연관 근거가 있는 감지 없음</span>';
    const relHead = `<div class="sth"><b>연관 감지</b><span class="qt" tabindex="0" role="button" aria-label="연관 감지 설명">?<span class="tip" role="tooltip">DELTA가 같은 계통 정보와 함께 움직이는 감지 짝으로 고른 연관 후보다. 확정된 원인이 아니라 판단을 돕는 참고용 가설이다. 시안의 계통 정보는 예시 값이다.</span></span></div>`;
    dt.wp = wp;
    dt.lk = lks.map(l => l.w2);
    const loc = `<p class="loc"><b>${wp}</b>${isHit ? '<span>' + x[2].split(' ').slice(1).join(' ') + '</span>' : ''}<span class="lm">${m.fl}, ${m.robot}${x[3] ? ' 측정 ' + x[3] : ''}</span></p>`;
    const MLAB = {
      '누출감지': '누출 의심도',
      '온도감지': '최고 온도',
      '이상음향': '이상 점수',
      '부분방전': '이상 점수'
    };
    const numU = (x[1] || '').match(/(-?\d+(?:\.\d+)?)\s*(℃|%|MPa|kPa|Pa|bar|명|곳|건)?/);
    const jvalT = !isHit ? '' : cd && !isNaN(num) ? `${num}${cd[4] === '%' ? '%' : cd[4]}` : k === '계기인식' && numU ? numU[1] + (numU[2] ? ' ' + numU[2] : '') : SHORT[x[1]] || x[1];
    let jwhat = !isHit ? st === 'plan' ? '측정 전' : '정상 범위' : LAB7[k] || MLAB[k] ? LAB7[k] || MLAB[k] : k === '계기인식' ? (x[1] || '').split(/\s*-?\d/)[0].trim() || '측정값' : (x[1] || '').replace(jvalT, '').trim() || '미착용 인원';
    const jtrk = isHit && cd && !isNaN(num) ? (() => {
      const [lo, hi, w2, c2, u] = cd, p = q => Math.max(0, Math.min(100, (q - lo) / (hi - lo) * 100)).toFixed(1);
      return `<div class="jtrk"><span class="f ${st}" style="width:${p(num)}%"></span><span class="jm w" style="left:${p(w2)}%"><span>주의 ${w2}${u}</span></span><span class="jm c" style="left:${p(c2)}%"><span>위험 ${c2}${u}</span></span></div>`;
    })() : '';
    const jdet = !V7 && isHit && x[1] && !x[1].includes(jvalT) && x[1] !== jwhat ? `<span class="jdt">${x[1]}</span>` : '';
    const stdK = k === '계기인식' && isHit && window.APRISM_VERDICT && window.APRISM_VERDICT.gaugeStd(jvalT) ? window.APRISM_VERDICT.gaugeStd(jvalT) : k === '계기인식' && numU && numU[2] === 'Pa' ? '250 Pa 미만' : k === '계기인식' && numU && numU[2] === 'bar' ? '6.0 ~ 7.5 bar' : STD[k];
    const vNum = cd && !isNaN(num) ? num : numU ? parseFloat(numU[1]) : NaN;
    const stdNs = (stdK.match(/-?\d+(?:\.\d+)?/g) || []).map(Number), isRange = /~/.test(stdK) && stdNs.length > 1;
    const limHi = cd ? cd[2] : stdNs.length ? stdNs[stdNs.length - 1] : NaN, limLo = isRange ? stdNs[0] : null;
    const vUnit = cd ? cd[4] === '%' ? '%' : cd[4] : numU && numU[2] ? ' ' + numU[2] : '';
    const decs = (String(jvalT).match(/\.(\d+)/) || [ '', '' ])[1].length;
    const verdict = !isHit ? '' : window.APRISM_VERDICT ? window.APRISM_VERDICT(k, jvalT) || '기준 초과' : k === '안전감지' ? '기준 위반' : isNaN(vNum) || isNaN(limHi) ? '기준 초과' : (limLo !== null && vNum < limLo ? `기준 미달 −${(limLo - vNum).toFixed(decs)}` : `기준 초과 +${Math.max(0, vNum - limHi).toFixed(decs)}`) + vUnit;
    const pastV = n => {
      if (k === '안전감지') return '0명';
      if (isNaN(vNum) || isNaN(limHi)) return '정상 범위';
      const below = isRange && vNum < limLo;
      const v = below ? limLo + (limHi - limLo) * [ 0.30, 0.15, 0.05 ][n] : isRange ? limHi - (limHi - limLo) * [ 0.30, 0.15, 0.05 ][n] : limHi * [ 0.86, 0.80, 0.90 ][n];
      return (n === 2 && st === 'warn' ? below ? limLo - (limLo - vNum) * 0.5 : limHi + (vNum - limHi) * 0.5 : v).toFixed(decs) + (cd && cd[4] === '%' ? '%' : '');
    };
    const histN = [ pastV(0), pastV(1), pastV(2), String(jvalT) ].map(parseFloat);
    const rising = isHit && histN.every(q => !isNaN(q)) && histN.slice(1).every((q, n) => q > histN[n]);
    const falling = isHit && histN.every(q => !isNaN(q)) && histN.slice(1).every((q, n) => q < histN[n]);
    const why6 = `<span class="why1">기준 ${stdK}${rising ? ' · 최근 3회 계속 오름' : falling ? ' · 최근 3회 계속 내림' : ''}</span>`;
    const jv = V6 && isHit ? `<div class="jmain"><h5>${jwhat}</h5><b class="jn ${st}">${jvalT}</b><span class="jvd ${st}">${verdict}</span>${jdet}</div>${jtrk}${!jtrk || rising || falling ? why6 : ''}` : `<div class="jmain"><h5>${jwhat}</h5>${isHit ? `<b class="jn ${st}">${jvalT}</b>${jdet}` : `<span class="why1">기준: ${stdK}</span>`}</div>${jtrk}${isHit && !jtrk ? `<span class="why1">기준: ${stdK}</span>` : ''}`;
    if (V6 && isHit) hist.forEach((h, n) => {
      if (n < 3 && h[2] !== 'plan') h[1] = pastV(n);
    });
    const tm = (x[3] || '').match(/(\d+):(\d+)/), mins = tm ? +tm[1] * 60 + +tm[2] : null;
    const nextM = st === 'plan' ? '이번 순회 중' : mins === null ? '—' : mins < 14 * 60 ? '오늘 14:00' : '내일 09:00';
    const RQ = V7 && isHit && st !== 'done' ? REQ[dt.mi + '|' + k + '|' + wp] : null;
    const spots = V7 && its.length > 1 ? `<div class="jsp" role="group" aria-label="기준을 넘은 지점 ${its.length}곳">${its.map(it => {
      const w2 = wpOf(it), on = w2 === wp, R2 = REQ[dt.mi + '|' + k + '|' + w2];
      return `<button type="button" class="jsp-b${on ? ' on' : ''}" data-dk="${k}" data-dw="${w2}" aria-pressed="${on}">${R2 ? rqBadge(R2) : `<span class="verdict-chip${V7 ? ' ds-badge' : ''} is-${it[0]}">${WORD[it[0]]}</span>`}<b>${w2}</b><span>${it[2].split(' ').slice(1).join(' ')}</span></button>`;
    }).join('')}</div>` : '';
    const actS = RQ ? RQ_WORD[RQ.st] : !isHit ? st === 'plan' ? '—' : '필요 없음' : st === 'done' || x[4] ? `${x[4] || '10:17'} 요청됨` : '요청 전';
    const jinfo = [ [ '발생위치', `${wp}${isHit ? ' ' + x[2].split(' ').slice(1).join(' ') : ''}`, '' ], [ isHit ? '발생시간' : '측정 시간', x[3] || '—', '' ], [ '조치 상태', actS, '' ], [ '다음 측정', nextM, '' ] ].map(([l, v, c], n) => {
      const m = n === 0 && V7 && window.ds && /^WP-(\d+)\s*(.*)$/.exec(v);
      const h = m ? `<span class="sf-wpv">${window.ds.wp(parseInt(m[1], 10), {
        small: true,
        cls: 'sf-wp',
        attrs: `role="img" aria-label="WP-${m[1]}"`
      })}<span>${m[2]}</span></span>` : v;
      return `<div><span>${l}</span><b class="${c}" title="${v}">${h}</b></div>`;
    }).join('');
    const judge = V6 ? `<div class="lvA s1 jx ${st}"><div class="jtop"><div class="jrow">${RQ ? rqBadge(RQ) : `<span class="verdict-chip${V7 ? ' ds-badge' : ''} is-${st}">${WORD[st]}</span>`}${V7 ? '' : `<span class="jk">${k}</span>`}${spots}</div>${jv}</div><div class="jinfo">${jinfo}</div></div>` : `<div class="lvA s1 ${st}">${step('이상 판정')}<div class="tt"><span class="verdict-chip${V7 ? ' ds-badge' : ''} is-${st}">${WORD[st]}</span><h5>${k}, ${isHit ? x[1] : st === 'plan' ? '측정 전' : '정상 범위 ' + x[1]}</h5></div>${loc}${cond}</div>`;
    const histV6 = `<div class="sth"><b>측정 이력</b>${V7 ? '' : `<span class="hfl ${rep3 ? 'is-rep' : ''}">${rep3 ? '반복' : isHit ? '처음 넘음' : '계속 정상 범위'}</span>`}</div><div class="hist">${hist.map((h, n) => n === 3 && RQ ? hiRow(h, n).replace(/<span class="verdict-chip [^"]*">[^<]*<\/span>/, rqBadge(RQ)).replace(/<span class="hia[^"]*">[^<]*<\/span>/, `<span class="hia on">${rqLine(RQ)}</span>`) : hiRow(h, n)).join('')}</div>`;
    return `<div class="dtop"><button type="button" class="btn btn-secondary bkx" data-dback="1"><span class="i i-16" style="--i:var(--ic-chevron-left)" aria-hidden="true"></span>돌아가기</button><div class="tbs${V7 ? ' ds-tab-chip is-fill' : ''}">${tabs}</div></div>\n      <div class="dB">\n        <div class="dBm">\n          ${judge}\n          <div class="dBr2${V6 && bigD && canBig ? ' is-big' : ''}">\n            <div class="lvA s2">${step('영상 확인')}${!isHit ? '<span class="why1">시안용 예시 이미지(같은 감지의 사진)</span>' : ''}${media}</div>\n            <div class="dBc"><div class="lvB">${V6 ? histV6 : step('재발 여부') + histHtml}${again}</div>\n              ${V7 || V6 && !lks.length ? '' : `<div class="lvB s4 ref">${relHead}${relB}</div>`}</div>\n          </div>\n        </div>\n        <div class="lvD">${V6 ? '' : step('조치 결정')}${RQ ? reqSide(sug, RQ, nextM) : side}</div>\n      </div>${dt.from ? `<div class="rtbar" role="group" aria-label="동시 발생에서 이동함"><span class="ri" aria-hidden="true">↩</span><button type="button" class="rtb" data-dret="1">${dt.from.k}로 돌아가기</button><button type="button" class="rtx" data-dretx="1" aria-label="돌아가기 닫기">✕</button></div>` : ''}`;
  }
  const STD = {
    '안전감지': '미착용 0명',
    '누출감지': '55% 미만',
    '온도감지': '40 ℃ 미만',
    '계기인식': '0.60 ~ 0.80 MPa',
    '이상음향': '19.0 미만',
    '부분방전': '8.60 미만'
  };
  const SHORT = {
    '안전벨트 미착용 1명': '1명',
    '안전모 미착용 1명': '1명',
    '누출 의심 1곳': '62%',
    '최고 48.6 ℃': '48.6',
    '압력 편차 1건': '0.79',
    '압력 0.86 MPa': '0.86',
    '이상 점수 20.4': '20.4',
    'CH1 이상 점수 9.05': '9.05',
    '압력 0.84 MPa': '0.84',
    '누출 의심도 81%': '81%',
    '최고 41.8 ℃': '41.8',
    '최고 71.2 ℃': '71.2'
  };
  const cellV = x => `<span class="tv ${x[0]}">${SHORT[x[1]] || x[1]}</span>`;
  function spotsOne(i) {
    const m = M[i], fl = {};
    K.forEach(k => {
      itemsOf(i, k).forEach(x => {
        if (x && x[0] !== 'ok') {
          const wp = x[2].split(' ')[0];
          (fl[wp] = fl[wp] || {
            t: x[3],
            ks: {}
          }).ks[k] = x;
        }
      });
    });
    const any = Object.keys(fl)[0] || 'WP-01', pre = any.slice(0, -2);
    const id = n => pre + String(n).padStart(2, '0');
    const meas = new Set(Object.keys(fl));
    let n = 1;
    while (meas.size < m.done) {
      if (!fl[id(n)]) meas.add(id(n));
      n++;
    }
    const plan = [];
    while (plan.length < m.total - m.done) {
      if (!meas.has(id(n))) plan.push(id(n));
      n++;
    }
    const list = [ ...meas ].sort().map(w => ({
      w: w,
      t: fl[w] ? fl[w].t : '',
      ks: fl[w] ? fl[w].ks : {},
      plan: false
    })).concat(plan.map(w => ({
      w: w,
      t: '',
      ks: {},
      plan: true
    })));
    return list;
  }
  const E_SP0 = [ [ 'WP-01', '09:31', window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01' ], [ 'WP-02', '09:52', window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01' ], [ 'WP-03', '10:11', window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01' ], [ 'WP-04', '10:12', window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01' ], [ 'WP-05', '10:14', window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01' ], [ 'WP-06', '10:15', window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01' ], [ 'WP-07', '10:16', window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01' ], [ 'WP-08', '10:20', window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01', 1 ], [ 'WP-09', '10:24', window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01', 1 ] ], E_NOW0 = 'WP-07', E_ROWS0 = [ {
    n: '안전감지',
    src: '영상',
    s: 'crit',
    rep: '1명',
    wp: 'WP-07',
    std: '미착용 0명',
    memo: 'WP-07 고소 작업 발판 안전벨트 미착용',
    c: {
      'WP-01': [ 'ok', '0명' ],
      'WP-04': [ 'ok', '0명' ],
      'WP-07': [ 'crit', '1명' ]
    }
  }, {
    n: '누출감지',
    src: '영상 + 열화상',
    s: 'warn',
    rep: '62%',
    wp: 'WP-03',
    std: '55% 미만',
    memo: '같은 냉각수 계통 WP-05 온도, 음향도 기준 초과',
    c: {
      'WP-03': [ 'warn', '62%' ],
      'WP-04': [ 'ok', '9%' ],
      'WP-05': [ 'ok', '12%' ],
      'WP-09': [ 'plan' ]
    }
  }, {
    n: '온도감지',
    src: '열화상',
    s: 'warn',
    rep: '48.6 ℃',
    wp: 'WP-05',
    std: '40 ℃ 미만',
    memo: '평소 36.2 ℃ 대비 +12.4 ℃',
    c: {
      'WP-01': [ 'ok', '29.8' ],
      'WP-02': [ 'ok', '31.4' ],
      'WP-03': [ 'ok', '30.2' ],
      'WP-04': [ 'ok', '32.1' ],
      'WP-05': [ 'warn', '48.6' ],
      'WP-06': [ 'ok', '33.0' ],
      'WP-08': [ 'plan' ]
    }
  }, {
    n: '계기인식',
    src: '영상',
    s: 'crit',
    rep: '0.86 MPa',
    wp: 'WP-04',
    std: '0.60 ~ 0.80',
    memo: 'N₂ 배관 압력 상한 초과, 최근 3회 잇달아 오름',
    c: {
      'WP-02': [ 'ok', '0.71' ],
      'WP-04': [ 'crit', '0.86' ],
      'WP-09': [ 'plan' ]
    }
  }, {
    n: '이상음향',
    src: '마이크',
    s: 'warn',
    rep: '20.4',
    wp: 'WP-05',
    std: '19.0 미만',
    memo: '저주파 대역 에너지 증가, 베어링 마모 패턴과 비슷',
    c: {
      'WP-01': [ 'ok', '8.2' ],
      'WP-05': [ 'warn', '20.4' ],
      'WP-06': [ 'ok', '7.6' ],
      'WP-08': [ 'plan' ]
    }
  }, {
    n: '부분방전',
    src: 'PD 센서',
    s: 'warn',
    rep: '9.05',
    wp: 'WP-06',
    std: '8.60 미만',
    memo: 'CH1만 주의, CH2와 CH3은 정상 범위',
    c: {
      'WP-06': [ 'warn', '9.05' ]
    }
  } ];
  const SRC = {
    '안전감지': '영상',
    '누출감지': '영상 + 열화상',
    '온도감지': '열화상',
    '계기인식': '영상',
    '이상음향': '마이크',
    '부분방전': 'PD 센서'
  };
  const OKV = {
    '안전감지': '0명',
    '누출감지': '9%',
    '온도감지': '31.0',
    '계기인식': '0.71',
    '이상음향': '7.9',
    '부분방전': '6.4'
  };
  const MEMO = {
    '1|온도감지': '10:15 새로 넘음, 직전 순회보다 +18.9 ℃',
    '1|계기인식': 'PG-A3 상한 초과, 계기 점검 필요',
    '1|부분방전': 'CH1만 주의, 같은 전기 계통 변압기 과열',
    '2|누출감지': '지하 3층 순회 끝, 13:00 전까지 다시 못 잼. CCTV 사각 구간',
    '2|온도감지': '지하 3층에서 측정, 평소보다 +6.3 ℃'
  };
  if (S7) S7.forSafety().forEach(s => {
    SHORT[s.cell[1]] = /%|명$/.test(s.value) ? s.value : s.value.split(' ')[0];
  });
  if (V6) {
    Object.assign(SHORT, {
      '이상 점수 21.6': '21.6',
      '차압 312 Pa': '312',
      '압력 0.62 MPa': '0.62',
      '최고 68.4 ℃': '68.4',
      '압력 7.9 bar': '7.9',
      '이상 점수 9.41': '9.41'
    });
    Object.assign(MEMO, {
      '1|계기인식': 'HEPA 필터 차압이 교체 기준을 넘음, 최근 3회 잇달아 오름. WP-04 N₂ 압력도 정상 범위 아래',
      '2|온도감지': '베어링 표면 68.4 ℃, 주변보다 31 ℃ 높음',
      '2|계기인식': '토출 압력이 정상 범위(8.2 ~ 8.8) 아래, 흡입 필터 막힘 가능성',
      '2|부분방전': 'PRPD 패턴이 코로나 방전 유형과 같음',
      '2|이상음향': '저주파 대역 에너지 증가, 베어링 마모 패턴과 비슷'
    });
  }
  function eData(i) {
    if (i === 0) {
      const m = M[0];
      const rows = E_ROWS0.map(r => {
        const x = m.r[r.n], c = Object.assign({}, r.c);
        if (m.rs && m.rs[r.n]) m.rs[r.n].forEach(it => {
          c[wpOf(it)] = [ it[0], SHORT[it[1]] || it[1] ];
        }); else if (x && x[0] !== 'ok' && c[wpOf(x)]) c[wpOf(x)] = [ x[0], c[wpOf(x)][1] ];
        return Object.assign({}, r, {
          s: x ? x[0] : r.s,
          c: c
        });
      });
      return {
        sp: E_SP0,
        now: E_NOW0,
        rows: rows
      };
    }
    const m = M[i], list = spotsOne(i);
    let tt = 9 * 60 + 50;
    const sp = list.map(p => {
      const t = p.t || String(Math.floor(tt / 60)).padStart(2, '0') + ':' + String(tt % 60).padStart(2, '0');
      tt += 4;
      return [ p.w, t, m.robot, p.plan ? 1 : 0 ];
    });
    sp.sort((x, y) => x[3] - y[3] || (x[1] < y[1] ? -1 : 1));
    if (V6) {
      const mn = t => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3)), hh = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
      const ms = sp.filter(x => !x[3]).sort((x, y) => x[0] < y[0] ? -1 : 1), hit = new Set(list.filter(p => p.t).map(p => p.w));
      const fi = ms.findIndex(x => hit.has(x[0]));
      let t = fi < 0 ? 9 * 60 + 50 : mn(ms[fi][1]) - 4 * fi;
      ms.forEach(x => {
        if (hit.has(x[0])) t = Math.max(t, mn(x[1])); else x[1] = hh(t);
        t += 4;
      });
      sp.filter(x => x[3]).forEach(x => {
        x[1] = hh(t);
        t += 4;
      });
      sp.sort((x, y) => x[3] - y[3] || (x[0] < y[0] ? -1 : 1));
    }
    const meas = sp.filter(x => !x[3]), now = m.done < m.total && meas.length ? meas[meas.length - 1][0] : '';
    const rows = K.map((k, ki) => {
      const x = m.r[k];
      if (!x) {
        const why = naOf(i, k);
        return {
          n: k,
          src: SRC[k],
          s: 'na',
          na: why,
          std: STD[k],
          memo: why === 'sensor' ? m.robot + '에 센서가 달려 있지 않음' : '이 미션에서 판정하지 않음',
          c: {}
        };
      }
      const c = {}, cnt = x[0] === 'ok' ? parseInt(x[2].replace(/\D/g, '')) || 3 : 3;
      let n = 0;
      const hits = itemsOf(i, k).filter(y => y && y[0] !== 'ok');
      sp.forEach(([w, , , pl], si) => {
        const hx = hits.find(y => y[2].startsWith(w + ' '));
        if (hx) {
          c[w] = [ hx[0], SHORT[hx[1]] || hx[1] ];
          n++;
          return;
        }
        if ((si + ki) % 2) return;
        if (pl) {
          c[w] = [ 'plan' ];
          return;
        }
        if (n < cnt) {
          c[w] = [ 'ok', OKV[k] ];
          n++;
        }
      });
      return {
        n: k,
        src: SRC[k],
        s: x[0],
        std: STD[k],
        memo: x[0] === 'ok' ? '모두 정상 범위' : MEMO[i + '|' + k] || '',
        c: c
      };
    }).filter(Boolean);
    return {
      sp: sp,
      now: now,
      rows: rows
    };
  }
  function tableOne(i) {
    const {sp: sp, now: now, rows: rows} = eData(i);
    const head = `<tr><th class="c-n">감지</th><th>판정</th><th>기준</th>${sp.map(([w, t, r, p]) => `<th class="c-wp ${w === now ? 'now' : ''} ${p ? 'plan' : ''}" data-col="${w}"><b>${w}</b><span>${p ? '예정 ' : ''}${t}</span><span class="rb">${r}</span></th>`).join('')}<th class="c-m dmh"><span class="dlogo"><i></i><i></i><i></i></span>DELTA 메모</th></tr>`;
    const body = rows.map(r => `<tr class="r-${r.s}"><td class="c-n"><span class="bar"></span><b>${r.n}</b><span class="src">${r.src}</span></td>\n      <td><span class="verdict-chip${V7 ? ' ds-badge' : ''} is-${r.s}">${r.s === 'na' ? NAW[r.na] : WORD[r.s]}</span></td><td class="c-std">${r.std}</td>\n      ${sp.map(([w]) => {
      const v = r.c[w], cls = `c-wp ${w === now ? 'now' : ''}`;
      if (!v) return `<td class="${cls}" data-col="${w}"><i class="nil"></i></td>`;
      if (v[0] === 'plan') return `<td class="${cls}" data-col="${w}"><span class="cv plan">예정</span></td>`;
      return `<td class="${cls}" data-col="${w}"><span class="cv ${v[0]}" data-dk="${r.n}" data-dm="${i}" data-dw="${w}"><i></i>${v[1]}</span></td>`;
    }).join('')}\n      <td class="c-m">${r.s === 'na' ? r.memo : '<span class="dmm"><span class="dlogo"><i></i><i></i><i></i></span><span>' + r.memo + '</span></span>'}</td></tr>`).join('');
    return `<div class="ewrap"><table class="mx">${head}${body}</table></div>`;
  }
  function tableAll() {
    const head = `<tr><th class="tn">미션, 층</th>${K.map(k => `<th class="tw"><b>${k}</b><span>${STD[k]}</span></th>`).join('')}</tr>`;
    const body = M.map((m, i) => {
      const w = worst(i);
      return `<tr class="${w}"><td class="tn"><span class="bar"></span><div class="tnw"><div class="tnt"><b class="fl2">${m.mis}</b><small>${flN(m)}</small><span class="trb"><i></i>${m.robot}${nowOf(i) ? ', ' + nowOf(i) + ' 지나 이동 중' : V6 ? '' : ', 순회 끝'}</span><small>측정 ${m.done}/${m.total}곳</small>${i === 1 && !newSeen ? '<em class="nwm">새로</em>' : ''}</div></div></td>\n        ${K.map(k => {
        const x = m.r[k];
        if (!x) return '<td class="tc"><span class="nat">' + NAW[naOf(i, k)] + '</span></td>';
        if (x[0] === 'ok') return `<td class="tc"><span class="cv ok" data-dk="${k}" data-dm="${i}"><i></i>정상 범위</span></td>`;
        return `<td class="tc"><span class="cv ${x[0]}" data-dk="${k}" data-dm="${i}"><i></i>${SHORT[x[1]] || x[1]}</span><small class="twp">${x[2].split(' ')[0]}${moreTxt(i, k)}, ${x[3]}</small></td>`;
      }).join('')}</tr>`;
    }).join('');
    return `<div class="mtbw"><table class="mtb">${head}${body}</table></div>`;
  }
  const LAYB = () => `<span class="lyseg${V7 ? ' ds-seg' : ''}"><button type="button" data-lay="card" class="${V7 ? 'ds-tab ' : ''}${lay === 'card' ? 'on' : ''}">카드</button><button type="button" data-lay="table" class="${V7 ? 'ds-tab ' : ''}${lay === 'table' ? 'on' : ''}">표</button></span>`;
  const isOpen = it => (it[0] === 'crit' || it[0] === 'warn') && !it[4];
  const wpOf = it => it[2].split(' ')[0];
  const flN = m => m.fls ? m.fls.map(f => f[1]).join(' → ') : m.fl;
  function itemsOf(i, k) {
    const m = M[i];
    if (m.rs && m.rs[k]) return m.rs[k].slice().sort((a, b) => RANK[b[0]] - RANK[a[0]] || (b[3] > a[3] ? 1 : -1));
    return m.r[k] ? [ m.r[k] ] : [];
  }
  function sync(m, i) {
    if (!m.rs) return;
    Object.keys(m.rs).forEach(k => {
      m.r[k] = itemsOf(i, k)[0].slice();
    });
  }
  const moreTxt = (i, k) => {
    const n = itemsOf(i, k).length - 1;
    return n > 0 ? ' 외 ' + n + '곳' : '';
  };
  const flOf = (m, w) => {
    if (!m.fls) return m.ab;
    const n = parseInt(w.slice(-2));
    return (m.fls.find(f => n <= f[2]) || m.fls[m.fls.length - 1])[0];
  };
  const {PLAN2: PLAN2, tour2: tour2, pos2: pos2, cut2: cut2} = window.APRISM_MINI;
  const PLANOF = {
    '3F': 'B4',
    '1F': 'B3',
    B4: 'B4',
    B3: 'B3'
  };
  let mapF = {}, mapT = null;
  const nowOf = i => {
    const m = M[i], ed = eData(i);
    if (m.done >= m.total) return '';
    if (!m.fls) return ed.now;
    const ms = ed.sp.filter(p => !p[3]).map(p => p[0]).sort();
    return ms[ms.length - 1] || '';
  };
  const robotTop = (m, u) => {
    const kind = robotKind(m), S = +u(30), h = (S / 2).toFixed(1);
    return `<ellipse class="${V7 ? 'ds-map-robot-sh' : 'rsh'}" cx="${u(1)}" cy="${u(1.5)}" rx="${u(13)}" ry="${u(8)}" filter="url(#m2bl)"/><image href="../assets/img/safety/robot-top-${kind}.png" x="-${h}" y="-${h}" width="${S}" height="${S}" transform="rotate(90)"/>`;
  };
  function svg2(i, ab, big, w, sel, lk) {
    const m = M[i], ed = eData(i), sp = ed.sp, rows = ed.rows, pf = PLANOF[ab] || 'B4', P = PLAN2[pf];
    const list = sp.filter(p => flOf(m, p[0]) === ab);
    if (m.fls) list.sort((p, q) => p[0] < q[0] ? -1 : 1);
    const L = V6 && window.APRISM_MINI && window.APRISM_MINI.routeL(m.mis, pf, list.length) || tour2(pf, list.length);
    const px = big ? 888 / 560 : 888 / (w || 220), u = v => (v * px).toFixed(1);
    const stOf = w => rows.reduce((a, r) => {
      const c = r.c[w];
      return c && RANK[c[0]] !== undefined && RANK[c[0]] > RANK[a] ? c[0] : a;
    }, 'ok');
    const ksOf = w => rows.filter(r => r.c[w] && r.c[w][0] !== 'plan').map(r => r.n).join(',');
    const now = nowOf(i), nowF = now ? flOf(m, now) : '';
    const idx = list.findIndex(p => p[0] === now), next = list.find(p => p[3]);
    let sR = null;
    if (ab === nowF && idx >= 0) sR = idx < list.length - 1 ? L.sAt[idx] + (L.sAt[idx + 1] - L.sAt[idx]) * .35 : L.sAt[idx];
    const allDone = list.length && list.every(p => !p[3]), noneDone = list.every(p => p[3]);
    const sCut = sR !== null ? sR : allDone ? L.len : noneDone ? 0 : L.sAt[list.filter(p => !p[3]).length - 1];
    let g = `<svg class="m2v" viewBox="-24 -24 888 1418" role="img" aria-label="${m.mis} ${ab} 평면, 지점 ${list.length}곳">`;
    g += '<rect class="bg" x="-24" y="-24" width="888" height="1418"/>';
    const rich = V6 && !big && (w || 220) >= 200;
    if (rich) {
      g += '<defs><filter id="m2sh" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".55"/></filter><filter id="m2bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>';
      g += V7 ? window.APRISM_MINI.road(L, u) : `<polyline class="road" points="${cut2(L, 0, L.len)}" stroke-width="${u(13)}"/>`;
    }
    if (rich && V7) {
      P.equipment.forEach((r, ei) => {
        if (r[2] >= 12 && r[3] >= 12) g += window.APRISM_MINI.eqRects(r, u, {
          cls: 'eqr',
          data: ` data-e="${ei}"`
        });
      });
      P.wall.forEach(r => {
        g += window.APRISM_MINI.wallRect(r);
      });
    } else P.equipment.forEach((r, ei) => {
      if (rich && (r[2] < 12 || r[3] < 12)) return;
      g += `<rect class="${big ? 'eqb' : 'eq'}${rich ? ' eqr' : ''}"${rich ? ` data-e="${ei}"` : ''} x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}"${rich ? ' rx="4"' : ''}/>`;
    });
    if (rich && !V7) P.wall.forEach(r => {
      g += `<rect class="wlr" x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}"/>`;
    });
    if (big) {
      P.stairs.forEach(r => {
        g += `<rect class="stz" x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" stroke-width=".6"/>`;
      });
      P.wall.forEach(r => {
        g += `<rect class="wl" x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}"/>`;
      });
    }
    const sw = big ? 1 : 1.15;
    if (rich && V7) {
      const ni = next ? list.indexOf(next) : -1, sNext = sR !== null && ni >= 0 ? Math.max(sCut, L.sAt[ni]) : sCut;
      g += window.APRISM_MINI.route(L, sCut, sNext, u, list.map((p, j) => pos2(L, L.sAt[j])));
    } else if (rich) {
      const ni = next ? list.indexOf(next) : -1, sNext = sR !== null && ni >= 0 ? Math.max(sCut, L.sAt[ni]) : sCut;
      g += `<polyline class="ra6c" points="${cut2(L, sNext, L.len)}" stroke-width="${u(3.4 + 1.6)}"/><polyline class="ra6" points="${cut2(L, sNext, L.len)}" stroke-width="${u(3.4)}"/>`;
      {
        const gapS = +u(34), marks = list.map((p, j) => pos2(L, L.sAt[j]));
        for (let sv = sNext + gapS * .6; sv < L.len - gapS * .3; sv += gapS) {
          const q = pos2(L, sv);
          if (marks.some(mq => Math.hypot(mq.x - q.x, mq.y - q.y) < +u(9))) continue;
          g += `<path class="dir" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)}) rotate(${(q.ang * 180 / Math.PI).toFixed(1)})" d="M${u(-2.2)} ${u(-2.6)} ${u(1)} 0 ${u(-2.2)} ${u(2.6)}" stroke-width="${u(1.3)}"/>`;
        }
      }
      g += `<polyline class="rp6" points="${cut2(L, 0, sCut)}" stroke-width="${u(2.6)}" stroke-dasharray="0 ${u(5.2)}"/>`;
      if (sNext > sCut) g += `<polyline class="rc6" points="${cut2(L, sCut, sNext)}" stroke-width="${u(3.4)}"/>`;
    } else {
      g += `<polyline class="ra" points="${cut2(L, sCut, L.len)}" stroke-width="${u(1.4 * sw)}" stroke-dasharray="${u(1.5)} ${u(4)}" vector-effect="none"/>`;
      g += `<polyline class="rd" points="${cut2(L, 0, sCut)}" stroke-width="${u(2.4 * sw)}"/>`;
    }
    if (sel && lk && lk.length) {
      const at2 = w2 => {
        const j = list.findIndex(p => p[0] === w2);
        return j < 0 ? null : pos2(L, L.sAt[j]);
      }, q0 = at2(sel);
      if (q0) lk.forEach(w2 => {
        const q1 = at2(w2);
        if (q1 && w2 !== sel) g += `<line x1="${q1.x.toFixed(1)}" y1="${q1.y.toFixed(1)}" x2="${q0.x.toFixed(1)}" y2="${q0.y.toFixed(1)}" class="lkl" stroke-width="${u(1.6)}" stroke-dasharray="${u(3)} ${u(2.5)}"/><circle class="lkc" cx="${q1.x.toFixed(1)}" cy="${q1.y.toFixed(1)}" r="${u(6)}" fill="none" stroke-width="${u(1.2)}"/>`;
      });
    }
    list.forEach((p, j) => {
      const w = p[0], q = pos2(L, L.sAt[j]), s2 = p[3] ? 'plan' : stOf(w), isNext = next && next[0] === w && ab === nowF;
      let mk;
      if (s2 === 'plan') mk = `<circle r="${u(isNext ? 3.4 : 2.6)}" class="mk-p ${isNext ? 'nx' : ''}" stroke-width="${u(isNext ? 1.6 : 1)}"/>`; else if (s2 === 'crit' || s2 === 'warn') mk = rich ? `<path d="M0 ${u(-4.4)} ${u(4.2)} ${u(2.8)} ${u(-4.2)} ${u(2.8)}Z" class="mk-${s2 === 'crit' ? 'c' : 'w'} mk-tri" stroke-width="${u(.9)}" stroke-linejoin="round"/>` : `<circle r="${u(3.6)}" class="mk-${s2 === 'crit' ? 'c' : 'w'}" stroke-width="${u(.8)}"/>`; else if (s2 === 'done') mk = `<circle r="${u(3)}" class="mk-d" fill="none" stroke-width="${u(1.4)}"/>`; else mk = `<circle r="${u(2.4)}" class="mk-o"/>`;
      const nm = sel === w ? `<circle class="mk-sel" r="${u(6.5)}" fill="none" stroke-width="${u(1.4)}"/><text class="wpn" x="${q.x > 420 ? -u(9) : u(9)}" text-anchor="${q.x > 420 ? 'end' : 'start'}" y="${u(-7)}" font-size="${u(12)}" font-weight="800" stroke-width="${u(3)}">${w}</text>` : big ? `<text class="wpn" x="${u(7)}" y="${u(-6)}" font-size="${u(11)}" stroke-width="${u(3)}">${w}</text>` : '';
      g += `<g class="wpm" data-w="${w}" data-ks="${ksOf(w)}" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)})"><title>${w}, ${s2 === 'plan' ? '예정' : WORD[s2]}</title><circle r="${u(9)}" fill="transparent"/><circle class="hlr" r="${u(8)}" fill="none" stroke-width="${u(2.4)}"/>${sel && sel !== w ? `<text class="wpn hlr" x="${q.x > 420 ? -u(10) : u(10)}" text-anchor="${q.x > 420 ? 'end' : 'start'}" y="${u(4)}" font-size="${u(12)}" font-weight="800" stroke-width="${u(3)}">${w}</text>` : ''}${mk}${nm}</g>`;
    });
    if (sR !== null) {
      const q = pos2(L, sR);
      g += rich ? `<g class="rbx" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)}) rotate(${(q.ang * 180 / Math.PI).toFixed(1)})"><title>${m.robot} 이동 중</title>${robotTop(m, u)}</g>` : `<g transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)}) rotate(${(q.ang * 180 / Math.PI).toFixed(1)}) scale(${(px * (big ? 1 : .62)).toFixed(3)})"><title>${m.robot} 이동 중</title><path class="rbt" d="M10 0-7.5 8.5-3.6 0-7.5-8.5Z" stroke-width="1.6" stroke-linejoin="round"/></g>`;
    }
    if (rich && sel && dt && dt.mi === i) {
      const j = list.findIndex(p => p[0] === sel);
      if (j >= 0) {
        const q = pos2(L, L.sAt[j]), src = (MD(dt.k, stOf(sel), i)[1].match(/src="([^"]+)"/) || [])[1];
        if (src) {
          const tw = +u(64), th = +u(46), gap = +u(12), r2 = +u(6), bd = +u(2);
          const right = q.x < 420, down = q.y < 260;
          const x0 = right ? q.x + gap : q.x - gap - tw, y0 = down ? q.y + gap * .4 : q.y - gap * .4 - th;
          const cx = right ? x0 : x0 + tw, cy = down ? y0 + r2 : y0 + th - r2;
          g += `<g class="thb" data-thumb="1" role="button" tabindex="0" aria-label="${sel} 영상 확인으로"><title>${sel} 영상 확인 보기</title>` + `<line class="thl" x1="${q.x.toFixed(1)}" y1="${q.y.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" stroke-width="${u(1.4)}"/>` + `<clipPath id="m2clip${i}"><rect x="${(x0 + bd).toFixed(1)}" y="${(y0 + bd).toFixed(1)}" width="${(tw - bd * 2).toFixed(1)}" height="${(th - bd * 2).toFixed(1)}" rx="${(r2 - bd).toFixed(1)}"/></clipPath>` + `<rect class="thf" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${tw}" height="${th}" rx="${r2}" filter="url(#m2sh)"/>` + `<image href="${src}" x="${(x0 + bd).toFixed(1)}" y="${(y0 + bd).toFixed(1)}" width="${(tw - bd * 2).toFixed(1)}" height="${(th - bd * 2).toFixed(1)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#m2clip${i})"/></g>`;
        }
      }
    }
    if (rich) {
      const nm = {};
      K.forEach(k => itemsOf(i, k).forEach(x => {
        if (x && x[2]) {
          const a = x[2].split(' ');
          if (a.length > 1) nm[a[0]] = a.slice(1).join(' ');
        }
      }));
      const marks = list.map((p, j) => ({
        w: p[0],
        q: pos2(L, L.sAt[j])
      }));
      let no = 0;
      P.equipment.forEach((r, ei) => {
        if (r[2] < 12 || r[3] < 12) return;
        no += 1;
        const cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2;
        const near = marks.filter(mk => nm[mk.w]).map(mk => ({
          w: mk.w,
          d: Math.max(0, Math.abs(mk.q.x - cx) - r[2] / 2) + Math.max(0, Math.abs(mk.q.y - cy) - r[3] / 2)
        })).sort((a, b) => a.d - b.d)[0];
        const name = near && near.d < 70 ? `${near.w} ${nm[near.w]}` : `설비 ${String(no).padStart(2, '0')}`;
        const above = r[1] > 60, ty = above ? r[1] - +u(5) : r[1] + r[3] + +u(13);
        g += `<text class="eql" data-e="${ei}" x="${cx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" font-size="${u(11)}" stroke-width="${u(3.2)}">${name}</text>`;
      });
    }
    g += '</svg>';
    return g;
  }
  function viewF(i) {
    const m = M[i], fls = m.fls ? m.fls.map(f => f[0]) : [ m.ab ], ed = eData(i), meas = ed.sp.filter(p => !p[3]).map(p => p[0]);
    const nw = nowOf(i), robotF = m.fls ? nw ? flOf(m, nw) : fls[0] : m.ab;
    return {
      fls: fls,
      robotF: robotF,
      cur: mapF[i] && fls.includes(mapF[i]) ? mapF[i] : robotF
    };
  }
  function floorBar(i, big) {
    const {fls: fls, robotF: robotF, cur: cur} = viewF(i);
    if (fls.length < 2 && !V7) return `<span class="m2f"><span>${fls[0]}</span></span>`;
    return `<span class="m2f${V7 ? ' ds-seg' : ''}" role="group" aria-label="층">${fls.map(f => `<button type="button" data-mf="${f}" data-mi="${i}" class="${V7 ? 'ds-tab ' : ''}${f === cur ? 'on' : ''}" aria-pressed="${f === cur}"${V7 && f === robotF ? ` aria-label="${f}, 로봇 있는 층"` : ''}>${f}${f === robotF ? V7 ? '<i class="ds-dot is-info" title="로봇 있는 층"></i>' : '<i title="로봇 있는 층"></i>' : ''}</button>`).join('')}</span>`;
  }
  const LEG = '<div class="mlg"><span class="mli"><i class="c"></i>위험</span> <span class="mli"><i class="w"></i>주의</span> <span class="mli"><i class="o"></i>정상 범위</span> <span class="mli"><i class="p"></i>예정</span> <span class="mli"><svg viewBox="-9 -9 20 18" width="11" height="10"><path class="rbt" d="M10 0-7.5 8.5-3.6 0-7.5-8.5Z" stroke="none"/></svg>로봇</span></div>';
  const robotKind = m => /Robot 05/.test(m.robot) ? 'wheel' : 'spot';
  const LEG6 = m => LEG.replace(/<svg[^]*?<\/svg>/, `<img class="mlg-rb" src="../assets/img/safety/robot-top-${robotKind(m)}.png" alt="" width="16" height="16">`);
  function sideHtml() {
    const allN = M.reduce((a, m, i) => a + hits(i), 0);
    const nOf = w => M.filter((m, i) => worst(i) === w).length, nc = nOf('crit'), nw0 = nOf('warn');
    const kv = (k, v) => `<span class="sf-kv"><span class="k">${k}</span><span class="v">${v}</span></span>`;
    const cnt = (w, n, t) => `<span class="sf-cnt ${w} ${n ? '' : 'zero'}" title="${t} 미션 ${n}개"><span class="l">${t}</span><b>${n}</b></span>`;
    const sumD = M.reduce((a, m) => a + m.done, 0), sumT = M.reduce((a, m) => a + m.total, 0);
    const top = `<button type="button" class="sf-mrow sf-all ${scope === 'all' ? 'on' : ''}" data-sc="all" aria-current="${scope === 'all'}"><span class="sf-mt1"><b>${V6 ? '전체 미션' : '미션 전체'}</b></span><span class="sf-mbody"><span class="sf-mmap sf-allsum" aria-hidden="true">${cnt('crit', nc, '위험')}${cnt('warn', nw0, '주의')}${cnt('ok', M.length - nc - nw0, '정상')}</span><span class="sf-meta">${kv('미션', M.length + '개')}${kv('측정', sumD + '/' + sumT + '곳')}${kv('요청 전', allN + '건')}</span></span></button>`;
    const rows = M.map((m, i) => {
      const w = worst(i), h = hits(i), nw = i === 1 && !newSeen, on = scope === i;
      const t1 = `<span class="sf-mt1"><i class="ixd ${w} ${nw ? 'blink' : ''}"></i><b>${m.mis}</b>${nw ? '<em class="nwm">새로</em>' : ''}</span>`;
      const meta = `<span class="sf-meta">${kv('층', flN(m))}${kv('측정', `${m.done}/${m.total}곳${m.done === m.total ? ', 순회 끝' : ''}`)}${kv('로봇', m.robot)}${kv('요청 전', h + '건')}</span>`;
      if (!on && V6) return '';
      if (!on) return `<button type="button" class="sf-mrow ${w}" data-sc="${i}">${t1}<span class="sf-mbody"><span class="sf-mmap">${svg2(i, viewF(i).robotF, false, 96)}</span>${meta}</span></button>`;
      const cur = dt && dt.wp ? flOf(m, dt.wp) : viewF(i).cur, sel = dt ? dt.wp : undefined, lk = dt ? dt.lk : undefined;
      const multi = !!(m.fls && m.fls.length > 1);
      return `<div class="sf-mon ${w}"><div class="sf-monh">${V6 ? `<div class="sf-mrow on">${t1}</div>` : `<button type="button" class="sf-mrow on" data-sc="${i}" aria-current="true">${t1}</button>`}</div>\n        <div class="sf-monb">${meta}<div class="m2"><div class="m2b">${multi ? floorBar(i) : ''}<span class="sp"></span><a class="m2go" href="${mainUrl(i, cur)}" title="관제 3D 지도에서 이 미션과 층을 연다" aria-label="관제에서 보기">관제<span class="i i-14" style="--i:var(--ic-chevron-right)" aria-hidden="true"></span></a></div><div class="m2rot">${svg2(i, cur, false, 316, sel, lk)}</div></div></div></div>`;
    }).join('');
    if (V6) {
      const sub = (...a) => `<span class="sfx-s">${a.filter(Boolean).join(', ')}</span>`;
      if (scope === 'all') {
        return `<div class="sfx"><div class="sfx-h"><b class="sfx-t">전체 미션</b>${sub('미션 ' + M.length + '개', '측정 ' + sumD + '/' + sumT + '곳', '요청 전 ' + allN + '건')}</div>\n          <div class="sfx-rows">${[ [ 'crit', 'error', '위험', nc ], [ 'warn', 'warning', '주의', nw0 ], [ 'ok', '', '정상', M.length - nc - nw0 ] ].map(([w, ic, t, n]) => `<div class="sfx-row ${w} ${n ? '' : 'zero'}"><span class="sfx-rl">${ic ? `<span class="i i-16" style="--i:var(--ic-${ic})" aria-hidden="true"></span>` : '<i class="sfx-dot" aria-hidden="true"></i>'}${t}</span><b>${n}<small>개 미션</small></b></div>`).join('')}</div></div>`;
      }
      const i = scope, m = M[i], h = hits(i);
      const cur = dt && dt.wp ? flOf(m, dt.wp) : viewF(i).cur, sel = dt ? dt.wp : undefined, lk = dt ? dt.lk : undefined;
      const fl = m.fls && m.fls.length > 1 || V7 ? floorBar(i) : `<span class="sfx-fl${V7 ? ' ds-floor' : ''}">${m.ab}</span>`;
      const kv3 = (k, v) => `<span class="sfx-kv"><span class="k">${k}</span><span class="v">${v}</span></span>`;
      return `<div class="sfx"><div class="sfx-h"><b class="sfx-t">${m.mis}</b></div>\n        <div class="sfx-map ds-map-panel"><div class="sfx-f">${fl}<a class="sfx-go" href="${mainUrl(i, cur)}" title="관제 3D 지도에서 이 미션과 층을 연다">관제에서 보기<span class="i i-14" style="--i:var(--ic-chevron-right)" aria-hidden="true"></span></a></div>\n        <div class="sfx-plan">${svg2(i, cur, false, 316, sel, lk)}</div>\n        <div class="sfx-info">${kv3('로봇', m.robot)}${kv3('측정', m.done + '/' + m.total + '곳')}${kv3('요청 전', h + '건')}</div></div>${LEG6(m)}</div>`;
    }
    return `${LEG}<div class="sf-mwrap"><div class="sf-mlist"><div class="sf-mwell">${top}${rows}</div></div><span class="sf-mthumb" aria-hidden="true"></span></div>`;
  }
  const gnbMain = document.querySelector(V6 ? '.gnb-item[href*="control-v6"]' : '.gnb-item[href^="./main-v5.html"]');
  const MAINV3 = V6 ? "./main-v6.html" : "./main-v5.html";
  function mainUrl(i, ab) {
    const m = M[i], q = new URLSearchParams({
      mission: m.mis,
      floor: PLANOF[ab] || ab
    });
    const nw = nowOf(i);
    if (nw) q.set("wp", nw);
    return MAINV3 + "?" + q.toString();
  }
  function pickF(i, f) {
    const {robotF: robotF} = viewF(i);
    mapF[i] = f;
    clearTimeout(mapT);
    if (f !== robotF) mapT = setTimeout(() => {
      delete mapF[i];
      if (!dt) render();
    }, 10000);
    render();
  }
  const NAW = {
    scope: '대상 아님',
    sensor: '센서 없음'
  };
  function naOf(i, k) {
    const m = M[i];
    return m.na && m.na[k] || 'scope';
  }
  const OKN = {
    '안전감지': '작업 구역 출입구',
    '누출감지': '배관 이음부',
    '온도감지': '펌프 모터',
    '계기인식': '압력계',
    '이상음향': '펌프 베어링',
    '부분방전': '수배전반'
  };
  function okLatest(i, k) {
    const ed = eData(i), r = ed.rows.find(r2 => r2.n === k);
    if (!r) return '';
    const hit = ed.sp.filter(p => !p[3] && r.c[p[0]] && r.c[p[0]][0] === 'ok').sort((p, q) => p[1] < q[1] ? -1 : 1).pop();
    return hit ? hit[0] + ' ' + OKN[k] + ', ' + hit[1] : '';
  }
  function cardNA(i, k) {
    const m = M[i], why = naOf(i, k), md = MD(k, 'ok', i);
    const judged = K.filter(k2 => m.r[k2]).map(k2 => k2.replace('감지', '').replace('인식', '')).join(', ');
    if (why === 'sensor') return `<div class="kd${V7 ? ' ds-card is-press' : ''} na" data-n="${k}"><div class="rw"><span class="nm">${k}</span><span class="verdict-chip${V7 ? ' ds-badge' : ''} is-na">센서 없음</span></div><div class="big">센서 없음</div><span class="sm">${m.robot}에 ${k === '부분방전' ? 'PD' : k} 센서가 달려 있지 않음</span><div class="md naempty"><span><b>송출할 센서 없음</b>센서를 단 로봇이 순회하면 표시</span></div></div>`;
    return `<div class="kd${V7 ? ' ds-card is-press' : ''} na" data-n="${k}"><div class="rw"><span class="nm">${k}</span><span class="verdict-chip${V7 ? ' ds-badge' : ''} is-na">대상 아님</span></div><div class="big">판정하지 않음</div><span class="sm">${m.mis}는 ${judged}만 판정</span><div class="md nadim ${md[0]}">${md[1].replace(/<span class="bx"[^>]*><\/span>/, '')}</div></div>`;
  }
  function cardM(i, k) {
    const m = M[i], x = m.r[k];
    if (!x) return cardNA(i, k);
    if (x[0] === 'ok') return cardC(k, [ 'ok', x[1], okLatest(i, k) || x[2] ], '', i);
    if (!m.rs || !m.rs[k]) return cardC(k, x, '', i);
    const its = itemsOf(i, k), dn = its.filter(it => it[4] && it !== its[0]);
    const extra = dn.length ? `<span class="req">${dn.map(wpOf).join(', ')} ${dn[0][4]} ${RQ_DONE}</span>` : '';
    const html = cardC(k, [ x[0], x[1], x[2], x[3], x[4] ], extra, i);
    const same = its.filter(it => it[0] === x[0]).length;
    return its.length > 1 ? html.replace(`<span class="nm">${k}</span>`, `<span class="nm">${k} ${its.length}개${V6 ? '·' + same : ''}</span>`) : html;
  }
  function init() {
    Object.values(reqT).forEach(clearTimeout);
    REQ = {};
    reqT = {};
    hideToast();
    M = JSON.parse(JSON.stringify(BASE));
    scope = 0;
    menu = false;
    fired = false;
    toasts = [];
    drawer = null;
    newSeen = true;
    M.forEach(sync);
    hLoad();
  }
  init();
  const scr = document.querySelector('.app'), sf = document.querySelector('[data-sf]'), v = document.getElementById('sfv'), bc = document.querySelector('[data-sf-crumb]'), side = document.querySelector('[data-sf-sb]');
  if (!sf || !v || !bc || !side) return;
  const hits = i => K.reduce((a, k) => a + itemsOf(i, k).filter(isOpen).length, 0);
  const worst = i => K.reduce((a, k) => {
    if (V7) {
      const s = itemsOf(i, k).filter(y => (REQ[i + '|' + k + '|' + wpOf(y)] || {}).st !== 'done').reduce((b, y) => RANK[y[0]] > RANK[b] ? y[0] : b, 'ok');
      return RANK[s] > RANK[a] ? s : a;
    }
    const x = M[i].r[k];
    return x && RANK[x[0]] > RANK[a] ? x[0] : a;
  }, 'ok');
  const worstAll = () => M.reduce((a, m, i) => RANK[worst(i)] > RANK[a] ? worst(i) : a, 'ok');
  const MLAB6 = {
    '누출감지': '누출 의심도',
    '온도감지': '최고 온도',
    '이상음향': '이상 점수',
    '부분방전': '이상 점수'
  };
  function res6(k, x) {
    if (!x || !x[1] || x[0] === 'ok' || x[0] === 'plan') return null;
    const cd = COND[k], num = parseFloat(SHORT[x[1]] || x[1]), numU = (x[1] || '').match(/(-?\d+(?:\.\d+)?)\s*(℃|%|MPa|kPa|Pa|bar|명|곳|건)?/);
    const val = cd && !isNaN(num) ? `${num}${cd[4] === '%' ? '%' : cd[4]}` : k === '계기인식' && numU ? numU[1] + (numU[2] ? ' ' + numU[2] : '') : SHORT[x[1]] || x[1];
    const lab = LAB7[k] || MLAB6[k] || (k === '계기인식' ? (x[1] || '').split(/\s*-?\d/)[0].trim() || '측정값' : (x[1] || '').replace(val, '').trim() || '미착용 인원');
    const det = !x[1].includes(val) && x[1] !== lab ? x[1] : '';
    return [ lab, val, det ];
  }
  const KD_SEEN = new Set;
  function cardC(k, x, extra, mi) {
    if (!x) return `<div class="kd${V7 ? ' ds-card is-press' : ''} ok" data-n="${k}"><div class="rw"><span class="nm">${k}</span></div><div class="big">재지 않음</div></div>`;
    const [s, sent, loc, t, rq] = x, md = MD(k, s, mi);
    if (s === 'ok') return `<div class="kd${V7 ? ' ds-card is-press' : ''} ok" data-n="${k}" tabindex="0" role="button"><div class="rw"><span class="nm">${k}</span><span class="verdict-chip${V7 ? ' ds-badge' : ''} is-ok">정상 범위</span></div><div class="big">정상 범위</div><span class="sm">${loc}</span>${extra || ''}<div class="md ${md[0]}">${md[1].replace(/<span class="bx"[^>]*><\/span>/, '')}</div><span class="more">자세히 보기 →</span></div>`;
    const todo = V6 && s === 'crit' && !rq, seenK = mi + '|' + k, fresh = todo && !KD_SEEN.has(seenK);
    if (todo) KD_SEEN.add(seenK);
    const R = V7 && s !== 'done' ? REQ[mi + '|' + k + '|' + wpOf(x)] : null;
    return `<div class="kd${V7 ? ' ds-card is-press' : ''} ${s} ${s === 'done' ? 'dim' : ''}${todo ? ' is-todo' : ''}${fresh ? ' is-new' : ''}" data-n="${k}" tabindex="0" role="button"><div class="rw"><span class="nm">${k}</span>${R ? rqBadge(R) : `<span class="verdict-chip${V7 ? ' ds-badge' : ''} is-${s}">${WORD[s]}</span>`}</div>\n      <div class="big">${(() => {
      const r6 = V6 && res6(k, x);
      return r6 ? `${r6[0]} ${r6[1]}${r6[2] ? `<span class="kdt">${r6[2]}</span>` : ''}` : sent;
    })()}</div><span class="sm">${loc}, ${t}</span>${R ? `<span class="req">${rqLine(R)}</span>` : rq ? `<span class="req">${rq} ${RQ_DONE}</span>` : ''}${extra || ''}<div class="md ${md[0]}">${md[1]}</div><span class="more">자세히 보기 →</span></div>`;
  }
  function head(title, done, total, n) {
    if (V7) return '';
    return `<div class="hd"><span class="lvh t-caption" title="6종 영상과 센서를 실시간으로 받는 중"><span class="lvd" aria-hidden="true"></span>라이브</span><span class="sp"></span>${LAYB()}</div>`;
  }
  function crumb() {
    const isAll = scope === 'all';
    const SEV = {
      crit: [ 'critical', 'error', '위험' ],
      warn: [ 'warning', 'warning', '주의' ]
    };
    const head = '<div class="scope-head t-caption" aria-hidden="true"><span>수행</span><span>미션</span><span>층</span><span>로봇</span></div>';
    const ord = M.map((m, i) => i).sort((x, y) => parseInt(M[x].robot.replace(/\D+/g, '')) - parseInt(M[y].robot.replace(/\D+/g, '')));
    const items = head + ord.map(i => [ M[i], i ]).map(([m, i]) => {
      const w = worst(i), on = String(scope) === String(i), sv = SEV[w], run = m.done < m.total ? 'run' : 'done';
      const fls = (m.fls ? m.fls.map(f => f[0]) : [ m.ab ]).map(f => `<span class="floor-tag num${V7 ? ' ds-floor' : ''}">${f}</span>`).join('');
      return `<button type="button" class="menu-item scope-item is-${run}" role="menuitemradio" aria-checked="${on}" data-sc="${i}"${i === 1 && !newSeen ? ' data-new="1"' : ''}><span class="scope-run" data-run="${run}" title="${run === 'run' ? '수행중' : '완료'}"></span><span class="scope-name"><span class="t-label-2">${m.mis}</span>${sv ? `<span class="i i-16 scope-sev" data-sev="${sv[0]}" style="--i:var(--ic-${sv[1]})" title="${sv[2]} 알림 있음"></span>` : ''}${i === 1 && !newSeen ? '<em class="nwm">새 위험</em>' : ''}</span><span class="scope-floors">${fls}</span><span class="scope-robots num">${m.robot.replace(/\D+/g, '')}</span></button>`;
    }).join('');
    return `<button type="button" class="sb-overview t-title-2 ${isAll ? 'is-on' : ''}" data-sc="all">통합 순회 현황</button><span class="status-bar-sep t-title-2" aria-hidden="true">›</span>\n      <div class="scope-menu-box"><button type="button" class="scope-trigger" data-menu="1" aria-haspopup="true" aria-expanded="${menu}"><span class="t-title-2">${isAll ? '미션 고르기' : M[scope].mis}</span><span class="i i-16" style="--i:var(--ic-chevron-down)" aria-hidden="true"></span></button><div class="dropdown-menu scope-menu sf-scope" role="menu" aria-label="미션"${menu ? '' : ' hidden'}>${items}</div></div>${dt ? `<span class="status-bar-sep t-title-2" aria-hidden="true">›</span><span class="t-title-2 sf-crumb-k">${dt.k}</span>` : ''}`;
  }
  function cardX(h, k, named) {
    let c = h.replace(/<span class="nm">([^<]*)<\/span>(<span class="verdict-chip(?: ds-badge)? is-([a-z]+)">([^<]*)<\/span>)?/, (a, t, pl, st, w) => {
      const mm = t.match(/(\d+)개(?:·(\d+))?/) || [], n = mm[1], sm = mm[2];
      const cnt = sm && +sm < +n ? ' ' + sm + ' 외 ' + (n - sm) + '곳' : n ? ' ' + n : '';
      return '<span class="nm"></span>' + (pl && st !== 'ok' ? `<span class="verdict-chip${V7 ? ' ds-badge' : ''} is-${st}">${w}${cnt}</span>` : '');
    });
    if (named) c = c.replace('</div>', `</div><span class="knm">${k}</span>`);
    return c.replace(/<span class="sm">([^<]*), (\d\d:\d\d)<\/span>/, '<span class="mt lc">$1</span><span class="mt tm">$2</span>').replace(/<span class="mt tm">([^<]*)<\/span>(<span class="req">[^<]*<\/span>)?/, (q, t, r) => `<span class="mt trow"><span class="tm">${V7 ? '<span class="tm-k">발생 시간</span>' : ''}${t}</span>${r || ''}</span>`);
  }
  function secsAll() {
    const mh = `<div class="mhead" aria-hidden="true">${K.map(k => `<span><b>${k}</b>${V7 ? '' : `<small>${STD[k]}</small>`}</span>`).join('')}</div>`;
    return '<div class="msecs">' + mh + M.map((m, i) => {
      const fl = K;
      const w = worst(i);
      return `<section class="msec ${w}" data-mi="${i}"><div class="msh2">${V6 ? `<button type="button" class="msh-go" data-sc="${i}" aria-label="${m.mis} 미션 보기"><b>${m.mis}</b><span class="i i-16" style="--i:var(--ic-chevron-right)" aria-hidden="true"></span></button>` : `<b>${m.mis}</b>`}${i === 1 && !newSeen ? '<em class="nwm">새로</em>' : ''}</div>\n        <div class="mrow cx vC">${fl.map(k => cardX(cardM(i, k), k, false)).join('')}</div></section>`;
    }).join('') + '</div>';
  }
  function cardsAll() {
    return K.map(k => {
      const has = M.map((m, i) => [ i, m.r[k] ]).filter(([, x]) => x);
      if (!has.length) return cardC(k, null);
      const top = has.reduce((a, b) => RANK[b[1][0]] > RANK[a[1][0]] ? b : a), others = has.filter(([i, x]) => i !== top[0] && x[0] !== 'ok').length;
      return cardC(k, top[1], top[1][0] === 'ok' ? '' : `<span class="mchip"><b>${M[top[0]].mis} ${M[top[0]].fl}</b>${others ? ` 외 ${others}개 미션` : ''}</span>`, top[0]);
    }).join('');
  }
  function view() {
    if (dt) return detail();
    if (scope === 'all') {
      const done = M.reduce((a, m) => a + m.done, 0), total = M.reduce((a, m) => a + m.total, 0), n = M.reduce((a, m, i) => a + hits(i), 0);
      return head((window.APRISM_MISSION ? APRISM_MISSION('m9') : '통합 순회') + ' 현황', done, total, n) + (lay === 'table' ? tableAll() : secsAll());
    }
    const m = M[scope];
    return head(m.mis, m.done, m.total, hits(scope)) + (lay === 'table' ? tableOne(scope) : `<div class="g6 cx vC mmg">${K.map(k => `<div class="mcell"><div class="mch"><b>${k}</b>${V7 ? '' : `<small>${STD[k]}</small>`}</div>${cardX(cardM(M.indexOf(m), k), k, false)}</div>`).join('')}</div>`);
  }
  function spec3(cv) {
    const W = cv.clientWidth || 400, H = cv.clientHeight || 160;
    cv.width = W;
    cv.height = H;
    let seed = 7;
    const R = () => {
      seed = seed + 0x6D2B79F5 | 0;
      let q = Math.imul(seed ^ seed >>> 15, 1 | seed);
      q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q;
      return ((q ^ q >>> 14) >>> 0) / 4294967296;
    };
    const c = cv.getContext('2d');
    for (let x = 0; x < 40; x++) for (let y = 0; y < 18; y++) {
      const vv = .25 + y / 18 * .35 + R() * .3, h = x / 40 > .6 && x / 40 < .78 && y / 18 > .5 && y / 18 < .85;
      c.fillStyle = h ? `rgb(250,${190 + R() * 50 | 0},60)` : `rgb(${30 + 50 * vv | 0},${70 + 110 * vv | 0},${150 + 90 * vv | 0})`;
      c.fillRect(x * W / 40, y * H / 18, W / 40 + .6, H / 18 + .6);
    }
  }
  const pv = document.createElement('div');
  pv.className = 'pvx';
  pv.hidden = true;
  sf.appendChild(pv);
  function showPv(el) {
    const k = el.dataset.dk, mi = +el.dataset.dm, m = M[mi], x = m.r[k];
    if (!x) return;
    const wp = el.dataset.dw || (x[0] !== 'ok' ? wpOf(x) : ''), hx = el.dataset.dw ? itemsOf(mi, k).find(y => y[0] !== 'ok' && wpOf(y) === el.dataset.dw) : x[0] !== 'ok' ? x : null, hit = !!hx;
    const st = hit ? hx[0] : el.classList.contains('plan') ? 'plan' : 'ok', val = el.textContent.trim(), md = MD(k, st, mi);
    pv.innerHTML = `<div class="pvh"><b>${k}</b><span>${m.mis} ${m.fl}${wp ? ', ' + wp : ''}${hit ? ', ' + hx[3] : ''}</span></div><div class="pvm md ${md[0]}">${md[1]}</div>\n      <div class="pvf"><span class="verdict-chip${V7 ? ' ds-badge' : ''} is-${st}">${WORD[st]}</span><b>${val}</b><span>기준 ${STD[k]}</span></div><span class="pvn">${hit ? '누르면 자세히 보기' : '시안용 예시 이미지(같은 감지의 사진), 누르면 자세히 보기'}</span>`;
    pv.querySelectorAll('canvas[data-spec3]').forEach(spec3);
    const sr = sf.getBoundingClientRect(), cr = el.getBoundingClientRect();
    let px = cr.right - sr.left + 12, py = cr.top - sr.top - 40;
    if (px + 300 > sr.width) px = cr.left - sr.left - 312;
    py = Math.max(12, Math.min(py, sf.offsetHeight - 290));
    pv.style.left = px + 'px';
    pv.style.top = py + 'px';
    pv.hidden = false;
  }
  scr.addEventListener('mouseover', e => {
    if (dt) return;
    const c = e.target.closest('.cv[data-dk][data-dm]');
    if (c) showPv(c);
  });
  scr.addEventListener('mouseout', e => {
    const c = e.target.closest('.cv[data-dk][data-dm]');
    if (c && !c.contains(e.relatedTarget)) pv.hidden = true;
  });
  const RM2 = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frEl = () => sf;
  function relR(el) {
    const a = el.getBoundingClientRect(), b = frEl().getBoundingClientRect();
    return {
      l: a.left - b.left,
      t: a.top - b.top,
      w: a.width,
      h: a.height
    };
  }
  function ghostR(from, to, done) {
    const g = document.createElement('div');
    g.className = 'gx';
    const put = r => Object.assign(g.style, {
      left: r.l + 'px',
      top: r.t + 'px',
      width: r.w + 'px',
      height: r.h + 'px'
    });
    put(from);
    frEl().appendChild(g);
    g.getBoundingClientRect();
    g.style.transition = [ 'left', 'top', 'width', 'height' ].map(p => p + ' 260ms cubic-bezier(.2,.7,.2,1)').join(',');
    put(to);
    setTimeout(() => {
      g.remove();
      done();
    }, 270);
  }
  function zoomIn(el, run) {
    if (RM2) {
      run();
      return;
    }
    const from = relR(el), to = relR(v);
    v.classList.add('xfade');
    ghostR(from, to, () => {
      run();
      v.classList.add('xin');
      requestAnimationFrame(() => requestAnimationFrame(() => v.classList.remove('xfade', 'xin')));
    });
  }
  function zoomOut(el, done) {
    if (RM2) {
      done();
      return;
    }
    const to = relR(el), from = relR(v);
    v.classList.add('xfade');
    ghostR(from, to, () => {
      v.classList.remove('xfade');
      done();
    });
  }
  scr.addEventListener('mouseover', e => {
    scr.querySelectorAll('.colhi').forEach(x => x.classList.remove('colhi'));
    if (dt) return;
    const c = e.target.closest('.mx [data-col]');
    if (c) scr.querySelectorAll(`.mx [data-col="${c.dataset.col}"]`).forEach(x => x.classList.add('colhi'));
  });
  scr.addEventListener('mouseover', e => {
    const kd = e.target.closest('.kd[data-n]');
    side.querySelectorAll('.m2v').forEach(sv => {
      sv.classList.toggle('dimk', !!kd);
      sv.querySelectorAll('.wpm').forEach(g => g.classList.toggle('hit', !!kd && g.dataset.ks.split(',').includes(kd.dataset.n)));
    });
  });
  scr.addEventListener('mouseleave', () => scr.querySelectorAll('.colhi').forEach(x => x.classList.remove('colhi')));
  function render() {
    pv.hidden = true;
    v.innerHTML = view();
    const top = document.createElement('div'), sc = document.createElement('div'), hd = v.querySelector(':scope > .hd'), mh = v.querySelector('.mhead');
    top.className = 'sftop';
    sc.className = 'sfsc';
    if (hd) {
      top.appendChild(hd);
      if (mh) top.appendChild(mh);
    }
    while (v.firstChild) sc.appendChild(v.firstChild);
    if (hd) v.appendChild(top);
    v.appendChild(sc);
    const sc0 = scope;
    if (V6 && dt) scope = dt.mi;
    bc.innerHTML = crumb();
    side.innerHTML = sideHtml();
    scope = sc0;
    bindThumb();
    if (gnbMain && V6) gnbMain.href = (window.aprismHref || String)('./control-v6.html' + (scope === 'all' ? '?view=building' : '?mission=' + encodeURIComponent(M[scope].mis) + '&floor=' + (PLANOF[viewF(scope).cur] || viewF(scope).cur))); else if (gnbMain) gnbMain.href = scope === 'all' ? './building-v5.html' : mainUrl(scope, viewF(scope).cur);
    requestAnimationFrame(() => v.querySelectorAll('canvas[data-spec3]').forEach(spec3));
  }
  function bindThumb() {
    const wrap = side.querySelector('.sf-mwrap'), l = wrap && wrap.querySelector('.sf-mlist'), t = wrap && wrap.querySelector('.sf-mthumb');
    if (!l || !t) return;
    const upd = () => {
      const h = l.clientHeight, sh = l.scrollHeight, over = sh > h + 1;
      wrap.classList.toggle('can', over);
      wrap.classList.toggle('more', over && l.scrollTop + h < sh - 1);
      if (!over) return;
      const th = Math.max(24, h * h / sh);
      t.style.height = th + 'px';
      t.style.transform = `translateY(${(h - th) * l.scrollTop / (sh - h)}px)`;
    };
    l.addEventListener('scroll', upd, {
      passive: true
    });
    t.addEventListener('pointerdown', e => {
      e.preventDefault();
      const y0 = e.clientY, s0 = l.scrollTop, k = l.scrollHeight / l.clientHeight;
      t.setPointerCapture(e.pointerId);
      wrap.classList.add('drag');
      const mv = ev => {
        l.scrollTop = s0 + (ev.clientY - y0) * k;
      }, up = () => {
        t.removeEventListener('pointermove', mv);
        t.removeEventListener('pointerup', up);
        wrap.classList.remove('drag');
      };
      t.addEventListener('pointermove', mv);
      t.addEventListener('pointerup', up);
    });
    upd();
    requestAnimationFrame(upd);
  }
  window.addEventListener('resize', () => bindThumb && side.querySelector('.sf-mlist') && side.querySelector('.sf-mlist').dispatchEvent(new Event('scroll')));
  function go(id) {
    const to = id === 'all' ? 'all' : +id, from = scope, wasDt = !!dt;
    const apply = () => {
      mapF = {};
      dt = null;
      menu = false;
      drawer = null;
      scope = to;
      if (scope === 1) {
        newSeen = true;
        toasts = toasts.filter(t => t.mi !== 1);
      }
      render();
    };
    if (to === from && !wasDt) {
      menu = false;
      return render();
    }
    const sec = from === 'all' && to !== 'all' && !wasDt ? v.querySelector(`.msec[data-mi="${to}"]`) : null;
    if (sec) {
      if (RM2) return apply();
      const prev = cardRects(sec);
      apply();
      return flipCards(prev, v);
    }
    if (to === 'all' && from !== 'all' && !wasDt && !RM2) {
      const prev = cardRects(v);
      apply();
      const back = v.querySelector(`.msec[data-mi="${from}"]`);
      if (back) {
        back.scrollIntoView({
          block: 'nearest'
        });
        flipCards(prev, back);
        if (!V7) {
          back.classList.add('ring');
          setTimeout(() => back.classList.remove('ring'), 1500);
        }
      }
      return;
    }
    apply();
    if (to === 'all' && from !== 'all') {
      const back = v.querySelector(`.msec[data-mi="${from}"]`);
      if (back) {
        back.scrollIntoView({
          block: 'nearest'
        });
        zoomOut(back, () => {
          if (!V7) {
            back.classList.add('ring');
            setTimeout(() => back.classList.remove('ring'), 1500);
          }
        });
      }
    }
  }
  function cardRects(root) {
    const o = {};
    root.querySelectorAll('.kd[data-n]').forEach(k => {
      o[k.dataset.n] = k.getBoundingClientRect();
    });
    return o;
  }
  function flipCards(prev, root) {
    const ks = [ ...root.querySelectorAll('.kd[data-n]') ].filter(k => prev[k.dataset.n]);
    ks.forEach(k => {
      const a = prev[k.dataset.n], b = k.getBoundingClientRect();
      if (!b.width || !b.height) return;
      k.style.transition = 'none';
      k.style.transformOrigin = '0 0';
      k.style.zIndex = '3';
      k.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
    });
    v.classList.add('flip');
    v.getBoundingClientRect();
    requestAnimationFrame(() => {
      ks.forEach(k => {
        k.style.transition = 'transform 360ms cubic-bezier(.2,.7,.2,1)';
        k.style.transform = '';
      });
      setTimeout(() => {
        ks.forEach(k => {
          k.style.transition = k.style.transformOrigin = k.style.zIndex = '';
        });
        v.classList.remove('flip');
      }, 400);
    });
  }
  scr.addEventListener('pointerover', e => {
    const svg = e.target.closest && e.target.closest('.sfx-plan .m2v');
    if (!svg) return;
    const r = e.target.closest('.eqr[data-e]');
    svg.querySelectorAll('.eql.on, .eqr.on').forEach(n => n.classList.remove('on'));
    if (r) {
      r.classList.add('on');
      const t = svg.querySelector(`.eql[data-e="${r.dataset.e}"]`);
      if (t) t.classList.add('on');
    }
  });
  scr.addEventListener('pointerout', e => {
    const svg = e.target.closest && e.target.closest('.sfx-plan .m2v');
    if (svg && !svg.contains(e.relatedTarget)) svg.querySelectorAll('.eql.on, .eqr.on').forEach(n => n.classList.remove('on'));
  });
  scr.addEventListener('click', e => {
    const mfb = e.target.closest('[data-mf]');
    if (mfb) {
      return pickF(+mfb.dataset.mi, mfb.dataset.mf);
    }
    if (e.target.closest('[data-thumb]')) {
      const c = v.querySelector('.lvA.s2');
      if (c) {
        c.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
        c.classList.add('ring');
        setTimeout(() => c.classList.remove('ring'), 1200);
      }
      return;
    }
    if (e.target.closest('[data-menu]')) {
      menu = !menu;
      bc.innerHTML = crumb();
      return;
    }
    if (dt) {
      if (e.target.closest('[data-dback]')) {
        const k = dt.k, w = dt.w, mi = dt.mi;
        dt = null;
        render();
        const c = v.querySelector(`.kd[data-n="${k}"]`) || v.querySelector(`[data-dk="${k}"][data-dm="${mi}"]${w ? `[data-dw="${w}"]` : ''}`) || v.querySelector(`[data-dk="${k}"][data-dm="${mi}"]`);
        if (c) {
          const t = c.closest('td') || c;
          zoomOut(t, () => {
            if (!V7) {
              t.classList.add('ring');
              setTimeout(() => t.classList.remove('ring'), 1500);
            }
          });
        }
        return;
      }
      if (e.target.closest('[data-bigd]')) {
        bigD = !bigD;
        return render();
      }
      if (e.target.closest('[data-req]')) {
        const m = M[dt.mi];
        const acts = [ ...v.querySelectorAll('.lvD .c1x') ].filter(l => l.querySelector('input:checked')).map(l => l.querySelector('b').textContent);
        const c0 = v.querySelector('.lvD .c1x input:checked'), to0 = c0 ? c0.closest('.c1x').querySelector('small').textContent : '현장 작업자';
        const memo = (v.querySelector('#sfMemo') || {}).value || '';
        if (m.rs && m.rs[dt.k]) {
          const w = dt.w || wpOf(m.r[dt.k]), it = m.rs[dt.k].find(y => wpOf(y) === w);
          if (it) {
            it[4] = '10:17';
          }
          sync(m, dt.mi);
          dt.w = w;
        } else {
          m.r[dt.k][4] = '10:17';
        }
        if (V7) reqSend(dt.mi, dt.k, dt.wp, {
          acts: acts,
          memo: memo.trim(),
          who: to0.split(',')[0].trim()
        });
        return render();
      }
      if (e.target.closest('[data-reqdone]')) {
        reqStep(dt.mi + '|' + dt.k + '|' + dt.wp, 'done');
        return;
      }
      if (e.target.closest('[data-dret]')) {
        dt = {
          mi: dt.mi,
          k: dt.from.k,
          w: dt.from.w
        };
        return render();
      }
      if (e.target.closest('[data-dretx]')) {
        delete dt.from;
        return render();
      }
      const dk2 = e.target.closest('[data-dk]');
      if (dk2) {
        const from = dk2.dataset.rel ? dt.from || {
          k: dt.k,
          w: dt.w
        } : null;
        dt = {
          mi: dt.mi,
          k: dk2.dataset.dk,
          w: dk2.dataset.dw
        };
        if (from) dt.from = from;
        return render();
      }
    }
    if (e.target.closest('[data-sf-fold]')) {
      const f = sf.classList.toggle('is-fold'), t = e.target.closest('[data-sf-fold]');
      t.setAttribute('aria-expanded', String(!f));
      t.setAttribute('aria-label', f ? '안전진단 패널 펼치기' : '안전진단 패널 접기');
      return;
    }
    const kd = e.target.closest('.kd[data-n][role="button"]');
    if (kd && !dt) {
      const sec = kd.closest('[data-mi]');
      const mi = sec ? +sec.dataset.mi : scope === 'all' ? null : scope;
      if (mi !== null) {
        return zoomIn(kd, () => {
          dt = {
            mi: mi,
            k: kd.dataset.n
          };
          render();
        });
      }
    }
    const tdc = e.target.closest('[data-dk][data-dm]');
    if (tdc && !dt) {
      pv.hidden = true;
      const cell = tdc.closest('td') || tdc;
      return zoomIn(cell, () => {
        dt = {
          mi: +tdc.dataset.dm,
          k: tdc.dataset.dk,
          w: tdc.dataset.dw
        };
        render();
      });
    }
    const ly = !V7 && e.target.closest('[data-lay]');
    if (ly) {
      lay = ly.dataset.lay;
      return render();
    }
    const sc = e.target.closest('[data-sc]');
    if (sc) return go(sc.dataset.sc);
    if (menu) {
      menu = false;
      bc.innerHTML = crumb();
    }
  });
  window.APRISM_SAFETY = S7 ? {
    reset() {
      mapF = {};
      init();
      dt = null;
      render();
    }
  } : {
    fire() {
      if (fired) return;
      fired = true;
      newSeen = false;
      if (scope === 1) scope = 0;
      M[NEWR[0]].r[NEWR[1]] = NEWR[2].slice();
      toasts.unshift({
        mi: NEWR[0],
        k: NEWR[1]
      });
      render();
    },
    reset() {
      mapF = {};
      init();
      dt = null;
      render();
    }
  };
  const hlSet = b => {
    side.querySelectorAll('.wpm.hl').forEach(x => x.classList.remove('hl'));
    if (!b) return;
    const g = side.querySelector(`.wpm[data-w="${b.dataset.dw}"]`);
    if (g) g.classList.add('hl');
  };
  [ 'mouseover', 'focusin' ].forEach(ev => document.addEventListener(ev, e => {
    const b = e.target.closest && e.target.closest('[data-sf] .lvB.ref .rlx');
    if (b) hlSet(b);
  }));
  [ 'mouseout', 'focusout' ].forEach(ev => document.addEventListener(ev, e => {
    const b = e.target.closest && e.target.closest('[data-sf] .lvB.ref .rlx');
    if (b && !(e.relatedTarget && b.contains(e.relatedTarget))) hlSet(null);
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu) {
      menu = false;
      bc.innerHTML = crumb();
    }
  });
  const h = location.hash.slice(1);
  if (h === 'table' && !V7) lay = 'table'; else if (h === 'all') scope = 'all'; else if (h === 'detail') dt = {
    mi: 0,
    k: '안전감지'
  };
  const qs = new URLSearchParams(location.search), qm = qs.get('mission'), qk = qs.get('detect');
  if (qm || qk) {
    let mi = qm ? M.findIndex(m => m.mis === qm) : -1;
    if (mi < 0 && qm) mi = M.findIndex(m => qm.includes(m.mis) || m.mis.includes(qm));
    if (mi < 0) scope = 'all'; else {
      scope = mi;
      if (mi === 1) {
        newSeen = true;
        toasts = toasts.filter(t => t.mi !== 1);
      }
      if (K.includes(qk) && M[mi].r[qk]) dt = {
        mi: mi,
        k: qk
      };
    }
  }
  render();
})();
