(function() {
  "use strict";
  var LIM = {
    "누출감지": [ 55, "%" ],
    "온도감지": [ 40, " ℃" ],
    "이상음향": [ 19, "" ],
    "부분방전": [ 8.6, "" ]
  };
  var GAUGE = {
    MPa: [ 0.60, 0.80 ],
    Pa: [ null, 250 ],
    bar: [ 6.0, 7.5 ]
  };
  var AT = {
    "압력 0.62 MPa": [ 0.65, 0.75 ]
  };
  function gaugeOf(label, value, unit) {
    return AT[(label ? label + " " : "") + value] || AT["압력 " + value] || GAUGE[unit];
  }
  function verdict(detect, value) {
    if (detect === "안전감지") {
      return "기준 위반";
    }
    var m = String(value || "").match(/(-?\d+(?:\.\d+)?)\s*(℃|%|MPa|kPa|Pa|bar)?/);
    if (!m) {
      return "";
    }
    var v = parseFloat(m[1]), decs = (m[1].split(".")[1] || "").length, lo = null, hi, unit;
    if (detect === "계기인식") {
      var g = gaugeOf("", String(value).trim(), m[2]);
      if (!g) {
        return "기준 초과";
      }
      lo = g[0];
      hi = g[1];
      unit = " " + m[2];
    } else if (LIM[detect]) {
      hi = LIM[detect][0];
      unit = LIM[detect][1];
    } else {
      return "";
    }
    if (lo !== null && v < lo) {
      return "기준 미달 −" + (lo - v).toFixed(decs) + unit;
    }
    if (!(v > hi)) {
      return "";
    }
    return "기준 초과 +" + (v - hi).toFixed(decs) + unit;
  }
  window.APRISM_VERDICT = verdict;
  verdict.gaugeStd = function(value) {
    var m = String(value || "").match(/(-?\d+(?:\.\d+)?)\s*(MPa|Pa|bar)/);
    if (!m) {
      return "";
    }
    var g = gaugeOf("", String(value).trim(), m[2]);
    if (!g) {
      return "";
    }
    var f = function(x) {
      return m[2] === "MPa" ? x.toFixed(2) : String(x);
    };
    return g[0] === null ? f(g[1]) + " " + m[2] + " 미만" : f(g[0]) + " ~ " + f(g[1]) + " " + m[2];
  };
})();
