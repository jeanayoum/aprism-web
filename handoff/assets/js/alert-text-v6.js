(function() {
  "use strict";
  var T = {
    "지하발전소 B3 터빈 2 NG 1건 발견": [ "계기인식", "압력", "0.86 MPa" ],
    "지하발전소 터빈 2 NG 1건 발견": [ "계기인식", "압력", "0.86 MPa" ],
    "터빈 2 NG 1건 발견": [ "계기인식", "압력", "0.86 MPa" ],
    "안전감지 · 안전벨트 미착용 1명": [ "안전감지", "안전벨트 미착용", "1명" ],
    "누출감지 · 냉각수 배관 밸브": [ "누출감지", "누출 의심도", "62%" ],
    "이상음향 · 냉각 펌프 P-2": [ "이상음향", "이상 점수", "20.4" ],
    "온도감지 · 냉각 펌프 P-2 48.6℃": [ "온도감지", "최고 온도", "48.6 ℃" ],
    "부분방전 · CH1 이상 점수 9.05": [ "부분방전", "이상 점수", "9.05", "CH1" ],
    "차압 NG · HEPA Filter 차압계": [ "계기인식", "차압", "312 Pa" ],
    "압력 편차 · N₂ 배관 압력계": [ "계기인식", "압력", "0.62 MPa" ],
    "과열 · 발전기 베어링 68.4℃": [ "온도감지", "최고 온도", "68.4 ℃" ],
    "부분방전 · 이상 점수 9.41": [ "부분방전", "이상 점수", "9.41" ],
    "이상음향 · 이상 점수 21.6": [ "이상음향", "이상 점수", "21.6" ],
    "진동 상승 · 냉각 펌프 P-2": [ "이상음향", "이상 점수", "21.6" ],
    "압력 편차 · 공기 압축기 C-1": [ "계기인식", "압력", "7.9 bar" ]
  };
  var DET = /^(안전감지|누출감지|온도감지|계기인식|이상음향|부분방전) · (.+)$/;
  function v7() {
    return !!(document.body && document.body.classList.contains("ver-7"));
  }
  function lab7(detect, label) {
    return label === "이상 점수" ? detect + " 점수" : label;
  }
  function of(t) {
    var r = window.APRISM_ALERTS7 && window.APRISM_ALERTS7.of(t) || T[String(t || "")];
    if (!r) {
      return null;
    }
    return {
      detect: r[0],
      label: v7() ? lab7(r[0], r[1]) : r[1],
      value: r[2],
      ch: r[3] || ""
    };
  }
  function title(t) {
    var r = of(t);
    if (r) {
      return v7() ? r.label + " " + r.value : r.detect + " · " + r.label + " " + r.value;
    }
    var m = v7() && DET.exec(String(t || ""));
    if (m) {
      var rest = m[2];
      return rest.indexOf("이상 점수") === 0 ? m[1] + " 점수" + rest.slice(5) : rest;
    }
    return t;
  }
  window.APRISM_ALERT6 = {
    of: of,
    title: title
  };
})();
