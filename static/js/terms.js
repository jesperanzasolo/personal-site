// Annotated intro: clicking a dotted phrase unfolds its detail in the panel below.
(function () {
  var panel = document.getElementById("term-panel");
  var terms = document.querySelectorAll(".term");
  if (!panel || !terms.length) return;
  var label = panel.querySelector(".term-label");
  var text = panel.querySelector(".term-text");
  var current = null;

  function close() {
    if (!current) return;
    current.setAttribute("aria-expanded", "false");
    current = null;
    panel.classList.remove("is-open");
  }

  function open(btn) {
    var source = document.getElementById("term-" + btn.getAttribute("data-term"));
    if (!source) return;
    if (current) current.setAttribute("aria-expanded", "false");
    label.textContent = source.getAttribute("data-label");
    text.textContent = source.textContent;
    btn.setAttribute("aria-expanded", "true");
    current = btn;
    panel.classList.add("is-open");
  }

  terms.forEach(function (btn) {
    btn.addEventListener("click", function () { current === btn ? close() : open(btn); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) { var b = current; close(); b.focus(); }
  });
  document.documentElement.classList.add("has-terms");
})();
