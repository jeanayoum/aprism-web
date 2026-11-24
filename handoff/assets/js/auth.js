(function() {
  "use strict";
  var splash = document.querySelector("[data-splash]");
  var V2 = /-v2\.html$/.test(location.pathname);
  var SIGNED = "aprism.signedIn";
  if (splash) {
    var HOLD = 2000;
    var m = /[?&]hold=(\d+)/.exec(location.search);
    var hold = m ? parseInt(m[1], 10) : HOLD;
    var gone = false;
    var ready = !V2, timeUp = false;
    var next = V2 ? "./login-v2.html" : "./login.html";
    if (V2) {
      var signed = false;
      try {
        signed = sessionStorage.getItem(SIGNED) === "1" || Number(localStorage.getItem(SIGNED) || 0) > Date.now();
      } catch (e) {
        signed = false;
      }
      if (signed) {
        next = "./control-v7.html";
      }
    }
    var leave = function() {
      if (gone || !ready) {
        return;
      }
      gone = true;
      splash.classList.add("is-leaving");
      window.setTimeout(function() {
        location.href = (window.aprismHref || String)(next);
      }, 240);
    };
    var fail = null;
    var check = function(failing) {
      window.setTimeout(function() {
        if (failing) {
          if (!fail) {
            fail = document.createElement("div");
            fail.className = "splash-error";
            fail.setAttribute("role", "alert");
            fail.innerHTML = '<p class="splash-error-text">서버에 연결할 수 없어요</p><button type="button" class="btn btn-secondary splash-retry">다시 시도</button>';
            splash.querySelector(".brand-block").appendChild(fail);
            fail.querySelector(".splash-retry").addEventListener("click", function() {
              fail.remove();
              fail = null;
              check(false);
            });
          }
          return;
        }
        ready = true;
        if (timeUp) {
          leave();
        }
      }, failing ? 1200 : 600);
    };
    if (V2) {
      check(/[?&]server=fail/.test(location.search));
    }
    if (hold > 0) {
      window.setTimeout(function() {
        timeUp = true;
        leave();
      }, hold);
      document.addEventListener("pointerdown", function(e) {
        if (!e.target.closest(".splash-error")) {
          leave();
        }
      });
      document.addEventListener("keydown", function() {
        leave();
      });
    }
  }
  if (V2 && document.querySelector("[data-login-form]") && /[?&]reason=(idle|logout)/.test(location.search)) {
    var by = "";
    try {
      by = sessionStorage.getItem("aprism.logoutBy") || "";
      sessionStorage.removeItem("aprism.logoutBy");
    } catch (e) {
      by = "";
    }
    if (/reason=logout/.test(location.search)) {
      by = "user";
    }
    var toast = document.createElement("div");
    toast.className = "auth-toast";
    toast.setAttribute("role", "status");
    toast.textContent = by === "user" ? "로그아웃됐어요" : "사용 기록이 없어 로그아웃됐어요";
    document.body.appendChild(toast);
    window.setTimeout(function() {
      toast.classList.add("is-out");
      window.setTimeout(function() {
        toast.remove();
      }, 300);
    }, 3000);
    try {
      history.replaceState(null, "", location.pathname);
    } catch (e) {}
  }
  if (V2 && document.querySelector("[data-login-form]")) {
    try {
      sessionStorage.removeItem(SIGNED);
      localStorage.removeItem(SIGNED);
      sessionStorage.removeItem("aprism.who");
    } catch (e) {}
  }
  Array.prototype.slice.call(document.querySelectorAll("[data-pw-toggle]")).forEach(function(toggle) {
    var input = document.getElementById(toggle.getAttribute("aria-controls"));
    toggle.addEventListener("click", function() {
      var shown = toggle.getAttribute("aria-pressed") === "true";
      toggle.setAttribute("aria-pressed", shown ? "false" : "true");
      toggle.setAttribute("aria-label", shown ? "비밀번호 보기" : "비밀번호 숨기기");
      if (input) {
        input.type = shown ? "password" : "text";
        input.focus();
      }
    });
  });
  function landing() {
    if (/-v2\.html$/.test(location.pathname)) {
      return "./control-v7.html";
    }
    var running = "0";
    try {
      running = window.sessionStorage.getItem("aprism.running") || "0";
    } catch (e) {
      running = "0";
    }
    var v = /-en\.html$/.test(location.pathname) ? "v6" : "v7";
    return running === "1" ? "./main-" + v + ".html" : "./mission-setup-" + v + ".html";
  }
  var form = document.querySelector("[data-login-form]");
  if (form) {
    var EMPTY = {
      "login-id": "아이디를 입력하세요",
      "login-pw": "비밀번호를 입력하세요"
    };
    var setErr = function(input, on) {
      var field = input.closest(".field");
      if (!field) {
        return;
      }
      field.classList.toggle("is-error", on);
      input.setAttribute("aria-invalid", on ? "true" : "false");
      var help = field.querySelector(".field-helper");
      if (on && !help) {
        help = document.createElement("p");
        help.className = "field-helper t-caption";
        help.setAttribute("role", "alert");
        help.id = input.id + "-help";
        input.setAttribute("aria-describedby", help.id);
        field.appendChild(help);
      }
      if (help) {
        help.textContent = on ? EMPTY[input.id] : "";
        help.hidden = !on;
      }
    };
    var MAX = 5, FAILS = "aprism.fails";
    var idIn = document.getElementById("login-id"), pwIn = document.getElementById("login-pw");
    var fails = function() {
      try {
        return JSON.parse(sessionStorage.getItem(FAILS) || "{}");
      } catch (e) {
        return {};
      }
    };
    var saveFails = function(o) {
      try {
        sessionStorage.setItem(FAILS, JSON.stringify(o));
      } catch (e) {}
    };
    var authErr = function(msg) {
      [ idIn, pwIn ].forEach(function(el) {
        if (el) {
          setErr(el, false);
          el.closest(".field").classList.toggle("is-error", !!msg);
          el.setAttribute("aria-invalid", msg ? "true" : "false");
        }
      });
      if (!msg || !pwIn) {
        return;
      }
      var field = pwIn.closest(".field"), help = field.querySelector(".field-helper");
      if (!help) {
        help = document.createElement("p");
        help.className = "field-helper t-caption";
        help.setAttribute("role", "alert");
        help.id = "login-pw-help";
        pwIn.setAttribute("aria-describedby", help.id);
        field.appendChild(help);
      }
      help.textContent = msg;
      help.hidden = false;
    };
    var lockBox = null;
    var setLock = function(on) {
      var btn0 = form.querySelector(".login-submit");
      if (on && !lockBox) {
        lockBox = document.createElement("div");
        lockBox.className = "login-alert ds-notice is-critical";
        lockBox.setAttribute("role", "alert");
        lockBox.innerHTML = '<span class="i i-16" style="--i:var(--ic-error)" aria-hidden="true"></span><span class="body"><p class="login-alert-title title">계정이 잠겼어요</p>' + '<p class="login-alert-text desc">비밀번호를 ' + MAX + '회 잘못 입력했어요. 설비운영팀(내선 2400)에 잠금 해제를 요청하세요.</p></span>';
        form.querySelector(".login-head").insertAdjacentElement("afterend", lockBox);
      } else if (!on && lockBox) {
        lockBox.remove();
        lockBox = null;
      }
      if (btn0) {
        btn0.disabled = on;
      }
      if (pwIn) {
        pwIn.disabled = on;
      }
      if (on) {
        authErr(null);
      }
    };
    var isLocked = function() {
      var id0 = idIn ? idIn.value.trim() : "";
      return (fails()[id0] || 0) >= MAX;
    };
    if (V2 && idIn) {
      idIn.addEventListener("input", function() {
        setLock(isLocked());
        if (!lockBox) {
          authErr(null);
        }
      });
      var lastUser = "";
      try {
        lastUser = sessionStorage.getItem("aprism.user") || "";
      } catch (e) {
        lastUser = "";
      }
      if (lastUser && (fails()[lastUser] || 0) >= MAX) {
        idIn.value = lastUser;
        setLock(true);
      }
      var demo = (/[?&]demo=(fail|lock)/.exec(location.search) || [])[1];
      if (demo) {
        idIn.value = "hong.gd";
        var o = {};
        o["hong.gd"] = demo === "lock" ? MAX : 2;
        saveFails(o);
        if (demo === "lock") {
          setLock(true);
        } else {
          authErr("아이디 또는 비밀번호가 맞지 않아요 (남은 시도 " + (MAX - 2) + "회)");
        }
      }
    }
    if (V2) {
      Object.keys(EMPTY).forEach(function(k) {
        var el = document.getElementById(k);
        if (el) {
          el.addEventListener("input", function() {
            if (el.value.trim()) {
              setErr(el, false);
            }
          });
        }
      });
    }
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      var btn = form.querySelector(".login-submit");
      if (V2) {
        if (btn && btn.disabled) {
          return;
        }
        var first = null;
        Object.keys(EMPTY).forEach(function(k) {
          var el = document.getElementById(k);
          if (!el) {
            return;
          }
          var empty = !el.value.trim();
          setErr(el, empty);
          if (empty && !first) {
            first = el;
          }
        });
        if (first) {
          first.focus();
          return;
        }
        if (isLocked()) {
          setLock(true);
          return;
        }
      }
      var id = form.querySelector("#login-id");
      try {
        sessionStorage.setItem("aprism.user", id ? id.value.trim() : "");
      } catch (e) {}
      if (V2) {
        try {
          sessionStorage.setItem("aprism.handover", "1");
        } catch (e) {}
        var keep = form.querySelector('input[name="remember"]');
        try {
          if (keep && keep.checked) {
            localStorage.setItem(SIGNED, String(Date.now() + 72 * 3600 * 1000));
          } else {
            sessionStorage.setItem(SIGNED, "1");
          }
        } catch (e) {}
        if (btn) {
          btn.disabled = true;
          btn.classList.add("is-loading");
          btn.setAttribute("aria-busy", "true");
          btn.innerHTML = '<span class="i i-20 login-spin" aria-hidden="true"></span><span class="sr-only">로그인 중</span>';
        }
        var uid = idIn ? idIn.value.trim() : "", bad = pwIn && pwIn.value === "wrong";
        window.setTimeout(function() {
          if (!bad) {
            var o2 = fails();
            delete o2[uid];
            saveFails(o2);
            location.href = (window.aprismHref || String)(landing());
            return;
          }
          try {
            sessionStorage.removeItem(SIGNED);
            localStorage.removeItem(SIGNED);
            sessionStorage.removeItem("aprism.who");
          } catch (e) {}
          var o3 = fails();
          o3[uid] = (o3[uid] || 0) + 1;
          saveFails(o3);
          if (btn) {
            btn.classList.remove("is-loading");
            btn.removeAttribute("aria-busy");
            btn.textContent = "로그인";
            btn.disabled = false;
          }
          if (o3[uid] >= MAX) {
            setLock(true);
            return;
          }
          pwIn.value = "";
          pwIn.focus();
          authErr("아이디 또는 비밀번호가 맞지 않아요 (남은 시도 " + (MAX - o3[uid]) + "회)");
        }, 700);
        return;
      }
      location.href = (window.aprismHref || String)(landing());
    });
  }
  var pwForm = document.querySelector("[data-password-form]");
  if (pwForm) {
    var current = pwForm.querySelector("[data-pwx-current]");
    var next = pwForm.querySelector("[data-pwx-new]");
    var confirm = pwForm.querySelector("[data-pwx-confirm]");
    var submit = pwForm.querySelector("[data-pwx-submit]");
    var confirmField = pwForm.querySelector("[data-pwx-confirm-field]");
    var confirmHelp = pwForm.querySelector("[data-pwx-confirm-help]");
    var confirmTouched = false;
    var userId = "";
    try {
      userId = (sessionStorage.getItem("aprism.user") || "").toLowerCase();
    } catch (e) {
      userId = "";
    }
    var RULES = {
      length: function(pw) {
        return pw.length >= (V2 ? 8 : 4);
      },
      kinds: function(pw) {
        var n = 0;
        if (/[A-Za-z]/.test(pw)) {
          n += 1;
        }
        if (/[0-9]/.test(pw)) {
          n += 1;
        }
        if (/[^A-Za-z0-9]/.test(pw)) {
          n += 1;
        }
        return n >= 2;
      },
      notid: function(pw) {
        if (!pw) {
          return false;
        }
        if (userId.length < 3) {
          return true;
        }
        var low = pw.toLowerCase();
        for (var i = 0; i + 3 <= userId.length; i += 1) {
          if (low.indexOf(userId.slice(i, i + 3)) !== -1) {
            return false;
          }
        }
        return true;
      },
      notreused: function(pw) {
        return pw.length > 0 && pw !== current.value;
      }
    };
    var rows = Array.prototype.slice.call(pwForm.querySelectorAll("[data-rule]"));
    var check = function() {
      var pw = next.value;
      var all = true;
      rows.forEach(function(row) {
        var test = RULES[row.getAttribute("data-rule")];
        var met = !!test && test(pw);
        row.classList.toggle("is-met", met);
        if (!met) {
          all = false;
        }
      });
      var matched = pw === confirm.value;
      var showError = confirmTouched && confirm.value.length > 0 && !matched;
      confirmField.classList.toggle("is-error", showError);
      confirmHelp.hidden = !showError;
      confirm.setAttribute("aria-invalid", showError ? "true" : "false");
      submit.disabled = !(all && current.value.length > 0 && matched);
    };
    [ current, next, confirm ].forEach(function(input) {
      input.addEventListener("input", check);
    });
    confirm.addEventListener("blur", function() {
      confirmTouched = true;
      check();
    });
    check();
    var curErr = function(msg) {
      var field = current.closest(".field"), help = field.querySelector(".field-helper");
      field.classList.toggle("is-error", !!msg);
      current.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg && !help) {
        help = document.createElement("p");
        help.className = "field-helper t-caption";
        help.setAttribute("role", "alert");
        help.id = "pwx-current-help";
        current.setAttribute("aria-describedby", help.id);
        field.appendChild(help);
      }
      if (help) {
        help.textContent = msg || "";
        help.hidden = !msg;
      }
    };
    if (V2) {
      current.addEventListener("input", function() {
        curErr(null);
      });
    }
    pwForm.addEventListener("submit", function(event) {
      event.preventDefault();
      if (submit.disabled) {
        return;
      }
      if (V2) {
        var label = submit.textContent, bad = current.value === "wrong";
        submit.disabled = true;
        submit.classList.add("is-loading");
        submit.setAttribute("aria-busy", "true");
        submit.innerHTML = '<span class="i i-20 login-spin" aria-hidden="true"></span><span class="sr-only">변경 중</span>';
        window.setTimeout(function() {
          if (!bad) {
            try {
              sessionStorage.setItem(SIGNED, "1");
            } catch (e) {}
            location.href = (window.aprismHref || String)(landing());
            return;
          }
          var uid = "", o = {};
          try {
            uid = sessionStorage.getItem("aprism.user") || "";
          } catch (e) {
            uid = "";
          }
          try {
            o = JSON.parse(sessionStorage.getItem("aprism.fails") || "{}");
          } catch (e) {
            o = {};
          }
          o[uid] = (o[uid] || 0) + 1;
          try {
            sessionStorage.setItem("aprism.fails", JSON.stringify(o));
          } catch (e) {}
          if (o[uid] >= 5) {
            location.href = (window.aprismHref || String)("./login-v2.html");
            return;
          }
          submit.classList.remove("is-loading");
          submit.removeAttribute("aria-busy");
          submit.textContent = label;
          current.value = "";
          current.focus();
          check();
          curErr("현재 비밀번호가 맞지 않아요 (남은 시도 " + (5 - o[uid]) + "회)");
        }, 700);
        return;
      }
      location.href = (window.aprismHref || String)(landing());
    });
  }
})();
