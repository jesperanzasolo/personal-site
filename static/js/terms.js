// Annotated intro: one detail card below the intro.
// Open: the card grows from 0 to its measured height. Switch: the card stays put
// and eases to the new content's height while only its text fades in through a
// slight blur. Close: it shrinks back to 0, keeping its content until it is gone.
// Heights are set on the element and animated by CSS transitions, so rapid clicks
// retarget smoothly. Timing and easing live in global.css.
(function () {
  var panel = document.getElementById("term-panel");
  var terms = document.querySelectorAll(".term");
  if (!panel || !terms.length) return;
  var inner = panel.querySelector(".term-panel-inner");
  var label = panel.querySelector(".term-label");
  var text = panel.querySelector(".term-text");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var easeOut = getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out";
  var current = null;
  var fades = [];

  function fill(source) {
    label.textContent = source.getAttribute("data-label");
    text.textContent = source.textContent;
  }

  function fitHeight() {
    panel.style.height = inner.offsetHeight + "px";
  }

  // If the card would open past the bottom of the screen, bring it into view.
  // Never scroll so far that the phrase that was just pressed leaves the top.
  function reveal(btn) {
    var gap = 16;
    var over = panel.getBoundingClientRect().top + inner.offsetHeight + gap - window.innerHeight;
    over = Math.min(over, btn.getBoundingClientRect().top - gap);
    if (over > 0) window.scrollBy({ top: over, behavior: reduce.matches ? "auto" : "smooth" });
  }

  function close() {
    if (!current) return;
    current.setAttribute("aria-expanded", "false");
    current = null;
    panel.classList.remove("is-open");
    panel.style.height = "0px";
  }

  function open(btn) {
    var source = document.getElementById("term-" + btn.getAttribute("data-term"));
    if (!source) return;
    var switching = current !== null;
    if (current) current.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-expanded", "true");
    current = btn;

    fill(source);
    panel.classList.add("is-open");
    fitHeight();
    reveal(btn);

    // The card is one object that changes what it says, so only the words fade.
    fades.forEach(function (a) { a.cancel(); });
    fades = [];
    if (switching && typeof text.animate === "function") {
      var frames = reduce.matches
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, filter: "blur(2px)" }, { opacity: 1, filter: "blur(0)" }];
      fades = [label, text].map(function (el) {
        return el.animate(frames, { duration: 180, easing: easeOut });
      });
    }
  }

  terms.forEach(function (btn) {
    btn.addEventListener("click", function () { current === btn ? close() : open(btn); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) { var b = current; close(); b.focus(); }
  });
  // Keep the height true whenever the content reflows on its own: a window resize,
  // a phone rotating, or the web font arriving after the card is already open.
  // Nobody asked for that change, so it snaps instead of animating; otherwise the
  // card would lag behind its own text while a window is dragged narrower.
  function refit() {
    if (!current || panel.style.height === inner.offsetHeight + "px") return;
    panel.style.transition = "none";
    fitHeight();
    panel.offsetHeight; // commit the height before the transition comes back
    panel.style.transition = "";
  }
  if (typeof ResizeObserver === "function") {
    new ResizeObserver(refit).observe(inner);
  } else {
    window.addEventListener("resize", refit);
  }
})();
