// Annotated intro: one detail card below the intro. Clicking a dotted phrase opens it;
// clicking another phrase morphs the same card to the new content in place, so the
// page never jumps between lines. Clicking the open phrase again, or Esc, closes it.
(function () {
  var panel = document.getElementById("term-panel");
  var terms = document.querySelectorAll(".term");
  if (!panel || !terms.length) return;
  var inner = panel.querySelector(".term-panel-inner");
  var label = panel.querySelector(".term-label");
  var text = panel.querySelector(".term-text");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ease = "cubic-bezier(0.2, 0.8, 0.2, 1)";
  var current = null;

  function fill(source) {
    label.textContent = source.getAttribute("data-label");
    text.textContent = source.textContent;
  }

  function close() {
    if (!current) return;
    current.setAttribute("aria-expanded", "false");
    current = null;
    panel.classList.remove("is-open");
  }

  function open(btn) {
    var source = document.getElementById("term-" + btn.getAttribute("data-term"));
    if (!source) return;
    var switching = current !== null;
    if (current) current.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-expanded", "true");
    current = btn;

    if (!switching) {
      fill(source);
      panel.classList.add("is-open");
      return;
    }

    // Already open: keep the card where it is, swap its content, and ease its
    // height from the old content to the new while the new text fades in.
    var from = inner.offsetHeight;
    fill(source);
    var to = inner.offsetHeight;
    if (reduce.matches || typeof inner.animate !== "function") return;
    inner.animate([{ height: from + "px" }, { height: to + "px" }], { duration: 240, easing: ease });
    [label, text].forEach(function (el) {
      el.animate([{ opacity: 0, transform: "translateY(3px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: ease });
    });
  }

  terms.forEach(function (btn) {
    btn.addEventListener("click", function () { current === btn ? close() : open(btn); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) { var b = current; close(); b.focus(); }
  });
})();
