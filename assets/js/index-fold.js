// 인덱스 보기 정리.
//
// [11/20 디자이너] 화면 줄마다 최신 판을 제목 바로 옆(왼쪽 카드)에, 이전 판은 오른쪽에 한 줄짜리 목록으로 늘 보인다.
//   이전 판은 최신 → 오래된 순(내림차순). HTML 은 예전처럼 시간순(오름차순)으로 카드를 더해 두면
//   여기서 순서를 뒤집는다 — 새 판을 올릴 때 카드를 오른쪽에 더하고 is-latest 만 옮기면 된다.
//   순서는 카드 날짜(.ver-date) 내림차순, 같은 날짜는 HTML 차례 그대로. 버전 묶음(.ver-group) 열 구분은 접은 보기에서 쓰지 않는다.
//   화면 이름 링크는 최신 판 링크로 맞춘다.
//
// [10/30 디자이너] 최신이 아닌 판의 카드는 화면 목록도 접어 둔다. 이름 · 날짜만 남고 [화면 N개 ▾] 로 펼친다.
//   최신 카드(.is-latest)는 늘 펼쳐 둔다. 목록이 없는 카드(한 화면짜리 판)는 접을 것이 없다.
(function () {
  "use strict";

  var CHEV = '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- 1. 화면 줄: 최신 + [이전 버전 N개] ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".screen-row"), function (row, r) {
    var head = row.querySelector(".screen-head");
    var groups = row.querySelector(".ver-groups");
    var lists = groups ? Array.prototype.slice.call(groups.querySelectorAll(".ver-list")) : Array.prototype.slice.call(row.querySelectorAll(":scope > .ver-list"));
    if (!lists.length) { return; }
    // 카드 날짜(.ver-date) 내림차순. 날짜가 같으면 원래 차례 그대로(v4 위젯형 → 가로형, v1-A → v1-B)
    var cards = [].concat.apply([], lists.map(function (l) { return Array.prototype.slice.call(l.querySelectorAll(":scope > .ver-card")); }));
    var day = function (c) { var d = c.querySelector(".ver-date"); return d ? d.textContent.replace(/\D/g, "") : ""; };
    cards = cards.map(function (c, i) { return { c: c, i: i, d: day(c) }; })
      .sort(function (a, b) { return a.d === b.d ? a.i - b.i : (a.d < b.d ? 1 : -1); })
      .map(function (x) { return x.c; });
    // [11/24] 같은 판의 시안 여럿(v8-A, v8-B)은 is-latest 를 모두 달아 최신 칸에 나란히 둔다
    var latests = cards.filter(function (c) { return c.classList.contains("is-latest"); });
    if (!latests.length) { latests = [cards[0]]; }
    var latest = latests[0];
    var prev = cards.filter(function (c) { return latests.indexOf(c) < 0; });

    var area = document.createElement("div");
    area.className = "ver-area";
    var label = function (t, n) { var p = document.createElement("p"); p.className = "ver-area-label"; p.textContent = t; if (n) { var c = document.createElement("span"); c.className = "num"; c.textContent = n; p.appendChild(c); } return p; };
    var now = document.createElement("ol");
    now.className = "ver-list ver-now";
    latests.forEach(function (c) { now.appendChild(c); });
    area.appendChild(label("최신"));
    if (prev.length) { area.appendChild(label("이전 버전", prev.length)); }
    area.appendChild(now);
    if (prev.length) {
      var list = document.createElement("ol");
      list.className = "ver-prev";
      prev.forEach(function (c) { c.classList.add("is-prev"); list.appendChild(c); });
      area.appendChild(list);
    }

    (groups || lists[0]).replaceWith(area);
    // 화면 이름 → 최신 판
    var title = head && head.querySelector(".screen-title");
    var link = latest.querySelector(".ver-link");
    if (title && link && title.tagName === "A") { title.setAttribute("href", link.getAttribute("href")); }
  });

  /* ---------- 2. 지난 판 카드 안 화면 목록 접기 ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".ver-card:not(.is-latest)"), function (card, n) {
    var pages = card.querySelector(".ver-pages");
    if (!pages) { return; }
    var id = pages.id || "ver-pages-" + n;
    pages.id = id;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ver-fold";
    btn.setAttribute("aria-controls", id);
    btn.innerHTML = '<span>화면 ' + pages.children.length + '개</span>' + CHEV;
    function set(open) {
      card.classList.toggle("is-folded", !open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", (open ? "화면 목록 접기" : "화면 목록 펼치기") + " — " + pages.children.length + "개");
    }
    btn.addEventListener("click", function () { set(card.classList.contains("is-folded")); });
    card.insertBefore(btn, pages);
    set(false);
  });
})();
