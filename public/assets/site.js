/* Smart Browser — site behavior. Everything here is an enhancement:
   the pages read and navigate fully without it. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");

  /* ---------- Display control: the site fits itself to the reader ---------- */
  var STORE = "sb-display";
  function readPrefs() {
    try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) { return {}; }
  }
  function writePrefs(p) {
    try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) { /* storage unavailable: settings last for this page only */ }
  }
  function applyPrefs(p) {
    ["size", "spacing", "theme"].forEach(function (k) {
      if (p[k] && p[k] !== "default" && p[k] !== "auto") { root.setAttribute("data-" + k, p[k]); }
      else { root.removeAttribute("data-" + k); }
    });
  }
  var prefs = readPrefs();
  applyPrefs(prefs);

  var ctl = document.querySelector(".display-ctl");
  if (ctl) {
    ctl.querySelectorAll("input[type=radio]").forEach(function (r) {
      var want = prefs[r.name] || (r.name === "theme" ? "auto" : "default");
      r.checked = (r.value === want);
      r.addEventListener("change", function () {
        prefs[r.name] = r.value;
        applyPrefs(prefs);
        writePrefs(prefs);
      });
    });
    var reset = ctl.querySelector("[data-reset]");
    if (reset) {
      reset.addEventListener("click", function () {
        prefs = {};
        applyPrefs(prefs);
        writePrefs(prefs);
        ctl.querySelectorAll("input[type=radio]").forEach(function (r) {
          r.checked = (r.value === "default" || r.value === "auto");
        });
      });
    }
    document.addEventListener("click", function (e) {
      if (ctl.open && !ctl.contains(e.target)) { ctl.open = false; }
    });
    ctl.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ctl.open) { ctl.open = false; ctl.querySelector("summary").focus(); }
    });
  }

  /* ---------- The fitting demo on the home page ---------- */
  var fit = document.querySelector(".fit");
  if (fit) {
    var changes = {
      none: [],
      maria: [
        "Rewrote the long sentence about the detour in plain words (the original is one click away).",
        "Marked the idiom “back on track” and added what it means.",
        "Spelled out the abbreviations ADA and ETA the first time they appear.",
        "Set text left-aligned instead of justified, which is easier to track line to line."
      ],
      devon: [
        "Raised all text to at least 18 pixels and made the headline larger still.",
        "Replaced the light gray text with dark text that meets the contrast minimum.",
        "Underlined the links so color is not the only cue.",
        "Added a little letter and word spacing and set a comfortable line length.",
        "Changed the pale red error and alert text to a readable dark red."
      ],
      aisha: [
        "Gave the two unlabeled icon buttons names: Search and Menu.",
        "Marked the page title as a real heading so it can be jumped to.",
        "Wrote a description for the detour map, which had no alt text.",
        "Replaced the “Click here” link with text that says where it goes.",
        "Attached a label to the email field and turned the red-only error into a message that says what is wrong and how to fix it."
      ],
      lee: [
        "Stopped the blinking alert and noted that it was blinking.",
        "Toned down the map colors.",
        "Removed the decorative tagline and added space between blocks.",
        "Set text left-aligned so the page is steadier to read."
      ]
    };
    var names = { none: "No one. This is the page as the site sent it.", maria: "Maria", devon: "Devon", aisha: "Aisha", lee: "Lee" };
    var live = fit.querySelector(".fit-live");
    var heading = live.querySelector("h2");
    var list = live.querySelector("ul");
    var status = fit.querySelector("[role=status]");

    function render(who, announce) {
      fit.setAttribute("data-fit", who);
      var items = changes[who] || [];
      list.innerHTML = "";
      if (who === "none") {
        heading.textContent = "What the page looks like as sent";
        var li = document.createElement("li");
        li.className = "none";
        li.textContent = "Gray 11-pixel justified text, two icon buttons with no names, a blinking alert, a map with no description, a “Click here” link, an idiom and two abbreviations, and an email field with no label and a red-only error. Pick a person above to see it fitted to them.";
        list.appendChild(li);
      } else {
        heading.textContent = "What changed for " + names[who] + " (" + items.length + " changes)";
        items.forEach(function (t) {
          var li = document.createElement("li");
          li.textContent = t;
          list.appendChild(li);
        });
      }
      if (announce && status) {
        status.textContent = who === "none" ? "Showing the page as sent." : "Fitted for " + names[who] + ": " + items.length + " changes, listed below.";
      }
      // Restart the blink so the "as sent" state shows it (it stops on its own after a few seconds).
      var alert = fit.querySelector(".mock .alert");
      if (alert) { alert.classList.remove("blink"); void alert.offsetWidth; if (who === "none") { alert.classList.add("blink"); } }
    }
    fit.querySelectorAll("input[name=fit-person]").forEach(function (r) {
      r.addEventListener("change", function () { render(r.value, true); });
    });
    var marks = fit.querySelector("input[name=fit-marks]");
    if (marks) {
      marks.addEventListener("change", function () { fit.setAttribute("data-marks", marks.checked ? "on" : "off"); });
      fit.setAttribute("data-marks", marks.checked ? "on" : "off");
    }
    var checked = fit.querySelector("input[name=fit-person]:checked");
    render(checked ? checked.value : "none", false);
  }

  /* ---------- Settings explorer: filter 85 settings as you type ---------- */
  var explorer = document.querySelector(".explorer");
  if (explorer) {
    var input = explorer.querySelector("input[type=search]");
    var count = explorer.querySelector(".count");
    var groups = Array.prototype.slice.call(explorer.querySelectorAll("details"));
    var total = explorer.querySelectorAll("dt").length;
    var wasOpen = groups.map(function (d) { return d.open; });
    function filter() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      groups.forEach(function (d, i) {
        var visible = 0;
        var dts = d.querySelectorAll("dt");
        dts.forEach(function (dt) {
          var dd = dt.nextElementSibling;
          var hit = !q || (dt.textContent + " " + (dd ? dd.textContent : "")).toLowerCase().indexOf(q) !== -1;
          dt.classList.toggle("hide", !hit);
          if (dd) { dd.classList.toggle("hide", !hit); }
          if (hit) { visible++; }
        });
        shown += visible;
        d.classList.toggle("hide", q && visible === 0);
        if (q) { d.open = visible > 0; } else { d.open = wasOpen[i]; }
      });
      count.textContent = q ? ("Showing " + shown + " of " + total + " settings") : (total + " settings in " + groups.length + " groups");
    }
    if (input && count) {
      count.textContent = total + " settings in " + groups.length + " groups";
      input.addEventListener("input", filter);
    }
  }
})();
