// 인덱스 보기 정리.
//
// [11/20 디자이너] 화면 줄마다 최신 판을 제목 바로 옆에 두고, 이전 판은 [이전 버전 N개 ▾] 하나로 접는다.
//   펼치면 최신 → 오래된 순(내림차순)으로 이어서 보인다. HTML 은 예전처럼 시간순(오름차순)으로 카드를 더해 두면
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
    var latest = row.querySelector(".ver-card.is-latest") || cards[0];
    var prev = cards.filter(function (c) { return c !== latest; });

    var area = document.createElement("div");
    area.className = "ver-area";
    var list = document.createElement("ol");
    list.className = "ver-list ver-flow";
    list.id = "ver-flow-" + r;
    list.appendChild(latest);
    prev.forEach(function (c) { c.classList.add("is-prev"); list.appendChild(c); });

    if (prev.length) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ver-prev-toggle";
      btn.setAttribute("aria-controls", list.id);
      btn.innerHTML = "<span>이전 버전 " + prev.length + "개</span>" + CHEV;
      var set = function (open) {
        area.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      };
      btn.addEventListener("click", function () { set(!area.classList.contains("is-open")); });
      area.appendChild(btn);
      set(false);
    }
    area.appendChild(list);

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
