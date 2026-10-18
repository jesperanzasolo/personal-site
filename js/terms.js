// Annotated intro: one detail card below the intro.
// Open: the card grows from 0 to its measured height. Switch: it eases to the new
// content's height while the new text fades in through a slight blur. Close: it
// shrinks back to 0, keeping its content until it is gone. Heights are set on the
// element and animated by CSS transitions, so rapid clicks retarget smoothly.
(function () {
  var panel = document.getElementById("term-panel");
  var terms = document.querySelectorAll(".term");
  if (!panel || !terms.length) return;
  var inner = panel.querySelector(".term-panel-inner");
  var card = panel.querySelector(".term-card");
  var label = panel.querySelector(".term-label");
  var text = panel.querySelector(".term-text");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var current = null;

  function fill(source) {
    label.textContent = source.getAttribute("data-label");
    text.textContent = source.textContent;
  }

  function fitHeight() {
    panel.style.height = inner.offsetHeight + "px";
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

    if (switching && typeof card.animate === "function") {
      var frames = reduce.matches
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, filter: "blur(2px)" }, { opacity: 1, filter: "blur(0)" }];
      card.animate(frames, { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    }
  }

  terms.forEach(function (btn) {
    btn.addEventListener("click", function () { current === btn ? close() : open(btn); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) { var b = current; close(); b.focus(); }
  });
  window.addEventListener("resize", function () { if (current) fitHeight(); });
})();
