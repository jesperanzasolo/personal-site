// Annotated intro: every dotted phrase carries a note, and the note opens as
// close to its phrase as the window allows.
//   Wide:   in the right margin, on the phrase's line. Hover opens it, a click
//           pins it, and moving to another phrase glides it there.
//   Aside:  the margin is a little too small, so the column steps left to make
//           one. Click only: on hover the phrase would slide out from under
//           the cursor.
//   Narrow: no margin can exist (phones). The paragraph parts under the
//           phrase's line and the note sits between the lines. Tap to open.
// Looks, timing, and easing live in global.css.
(function () {
  var lead = document.querySelector(".lead");
  var column = document.querySelector("main");
  var terms = Array.prototype.slice.call(document.querySelectorAll(".term"));
  if (!lead || !column || !terms.length) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  var easeOut = getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out";
  var NOTE_MIN = 200, NOTE_MAX = 260; // narrower than this is not worth reading in a margin
  // Where the note's first line sits relative to the top of the phrase's line:
  // half the difference in line-height centres the two, and the rest drops the
  // smaller text onto the same baseline.
  var SEAT = (32 - 20) / 2 + 2;

  function source(btn) { return document.getElementById("term-" + btn.getAttribute("data-term")); }
  function labelOf(btn) { return source(btn).getAttribute("data-label"); }
  function textOf(btn) { return source(btn).textContent; }
  function lastLine(btn) { var r = btn.getClientRects(); return r[r.length - 1]; }

  // Apply styles with or without their transition. A note that is opening fresh
  // jumps to its place; one that is already open glides there.
  function apply(node, animate, fn) {
    if (animate) { fn(); return; }
    node.style.transition = "none";
    fn();
    node.offsetHeight; // commit before the transition comes back
    node.style.transition = "";
  }

  // The note is one object that changes what it says, so only the words fade.
  function crossfade(nodes) {
    var frames = reduce.matches
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ opacity: 0, filter: "blur(2px)" }, { opacity: 1, filter: "blur(0)" }];
    nodes.forEach(function (el) {
      if (typeof el.animate === "function") el.animate(frames, { duration: 180, easing: easeOut });
    });
  }

  // If the note would end below the window, bring it into view. Never scroll
  // so far that the phrase that was just pressed leaves the top.
  function reveal(btn, bottom) {
    var gap = 16;
    var over = Math.min(bottom + gap - window.innerHeight, btn.getBoundingClientRect().top - gap);
    if (over > 0) window.scrollBy({ top: over, behavior: reduce.matches ? "auto" : "smooth" });
  }

  // ---------- In the margin ----------
  var note = document.createElement("div");
  note.className = "note";
  note.hidden = true;
  note.setAttribute("role", "note");
  note.setAttribute("aria-live", "polite");
  note.innerHTML = '<div class="note-body"><span class="note-label"></span><span class="note-text"></span></div>';
  lead.appendChild(note);
  var noteLabel = note.querySelector(".note-label"), noteText = note.querySelector(".note-text");
  var hideNoteT = 0;

  var margin = {
    show: function (btn, wasOpen, t, changed) {
      clearTimeout(hideNoteT);
      note.hidden = false;
      noteLabel.textContent = labelOf(btn);
      noteText.textContent = textOf(btn);
      note.style.width = t.width + "px";
      // Seat the note's first line on the phrase's line
      var first = btn.getClientRects()[0];
      var y = Math.round(first.top - lead.getBoundingClientRect().top + SEAT);
      apply(note, wasOpen, function () { note.style.transform = "translateY(" + y + "px)"; });
      column.style.transform = t.shift ? "translateX(" + -t.shift + "px)" : "";
      note.offsetHeight;
      note.classList.add("is-open");
      if (wasOpen && changed) crossfade([noteLabel, noteText]);
      reveal(btn, note.getBoundingClientRect().bottom);
    },
    hide: function () {
      note.classList.remove("is-open");
      column.style.transform = "";
      // Out of the layout once it has faded, so it can never widen the page
      hideNoteT = setTimeout(function () { note.hidden = true; }, 320);
    }
  };
  // ---------- Between the lines ----------
  var inline = null, inlineHost = null;

  function fitInline(animate) {
    if (!inline) return;
    apply(inline, animate, function () { inline.style.height = inline.firstChild.offsetHeight + "px"; });
  }
  function collapse(node) {
    node.classList.remove("is-open");
    node.style.height = "0px";
    setTimeout(function () { node.remove(); }, reduce.matches ? 0 : 220);
  }
  // Keep the height true when the note reflows on its own: a rotation, a
  // resize, or the web font arriving after it is already open.
  var watcher = typeof ResizeObserver === "function"
    ? new ResizeObserver(function () {
        if (inline && inline.style.height !== inline.firstChild.offsetHeight + "px") fitInline(false);
      })
    : null;

  var between = {
    show: function (btn, wasOpen, t, changed) {
      if (inline && !changed) { fitInline(false); return; }
      var sameLine = inline && inlineHost && Math.round(lastLine(inlineHost).top) === Math.round(lastLine(btn).top);
      if (inline && !sameLine) { collapse(inline); inline = null; }
      if (!inline) {
        inline = document.createElement("span");
        inline.className = "note-inline";
        inline.setAttribute("role", "note");
        inline.setAttribute("aria-live", "polite");
        inline.innerHTML = '<span class="note-inner"><span class="note-label"></span><span class="note-text"></span></span>';
        source(btn).after(inline);
        if (watcher) watcher.observe(inline.firstChild);
      } else {
        // Same line: the gap is already open, so only the words change
        source(btn).after(inline);
        crossfade([inline.firstChild]);
      }
      inline.querySelector(".note-label").textContent = labelOf(btn);
      inline.querySelector(".note-text").textContent = textOf(btn);
      inline.offsetHeight;
      inline.classList.add("is-open");
      fitInline(true);
      inlineHost = btn;
      reveal(btn, inline.getBoundingClientRect().top + inline.firstChild.offsetHeight);
    },
    hide: function () {
      if (inline) collapse(inline);
      inline = null; inlineHost = null;
    }
  };

  // ---------- Which one: how much margin is there? ----------
  var gutter = parseFloat(getComputedStyle(document.body).paddingLeft) || 24;
  // The gap between column and note is set in CSS; read it once, while the
  // note is briefly in the layout
  note.hidden = false;
  var gap = parseFloat(getComputedStyle(note).left) - lead.offsetWidth || 40;
  note.hidden = true;
  function tier() {
    // Space beside the centred column. The root's own box, not clientWidth,
    // so a reserved scrollbar gutter is not counted as room.
    var side = (document.documentElement.getBoundingClientRect().width - lead.offsetWidth) / 2;
    var room = 2 * side - gutter - gap - gutter;
    if (room < NOTE_MIN) return { name: "narrow" };
    var width = Math.min(NOTE_MAX, room);
    var shift = Math.max(0, Math.round(gap + width + gutter - side));
    return { name: shift ? "aside" : "wide", width: width, shift: shift };
  }
  // ---------- One set of triggers for both ----------
  var current = null, pinned = false, active = null, openT = 0, closeT = 0;

  function show(btn, pin) {
    clearTimeout(openT); clearTimeout(closeT);
    var t = tier();
    var where = t.name === "narrow" ? between : margin;
    if (active && active !== where) { active.hide(); current.setAttribute("aria-expanded", "false"); current = null; }
    var wasOpen = current !== null, changed = current !== btn;
    if (current) current.setAttribute("aria-expanded", "false");
    current = btn; active = where;
    btn.setAttribute("aria-expanded", "true");
    if (pin) pinned = true;
    where.show(btn, wasOpen, t, changed);
  }

  function hide() {
    clearTimeout(openT); clearTimeout(closeT);
    if (!current) return;
    current.setAttribute("aria-expanded", "false");
    current = null; pinned = false;
    active.hide(); active = null;
  }

  function hideSoon() { clearTimeout(closeT); closeT = setTimeout(hide, 160); }

  terms.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var wide = tier().name === "wide";
      // Wide: hover already opened it, so a click pins and a second click closes.
      // Everywhere else a click simply opens and closes.
      if (current === btn && (pinned || !wide || !canHover.matches)) hide(); else show(btn, true);
    });
    btn.addEventListener("mouseenter", function () {
      if (!canHover.matches) return;
      var t = tier().name;
      if (t === "narrow") return;
      clearTimeout(closeT);
      if (current === btn) return;
      // Once a note is open, the next phrase answers at once
      if (current) { show(btn, false); return; }
      // The first one waits a beat so a passing cursor does not set it off
      if (t !== "wide") return;
      clearTimeout(openT);
      openT = setTimeout(function () { show(btn, false); }, 140);
    });
    btn.addEventListener("mouseleave", function () {
      if (!canHover.matches) return;
      clearTimeout(openT);
      if (current && !pinned) hideSoon();
    });
  });
  // The note itself can be hovered, to read or select it without it leaving
  note.addEventListener("mouseenter", function () { clearTimeout(closeT); });
  note.addEventListener("mouseleave", function () { if (canHover.matches && current && !pinned) hideSoon(); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) { var b = current; hide(); b.focus(); }
  });
  document.addEventListener("pointerdown", function (e) {
    if (!current || !e.target.closest) return;
    if (e.target.closest(".term, .note, .note-inline")) return;
    hide();
  });
  window.addEventListener("resize", function () {
    if (!current) return;
    var t = tier(), where = t.name === "narrow" ? between : margin;
    if (where !== active) hide(); else where.show(current, false, t, false);
  });
})();
