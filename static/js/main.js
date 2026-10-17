(function () {
  var root = document.documentElement;
  var button = document.querySelector("button.theme");
  if (!button) return;
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function current() {
    return root.dataset.theme || (media.matches ? "dark" : "light");
  }
  function label() {
    var next = current() === "dark" ? "Light" : "Dark";
    button.textContent = next;
    button.setAttribute("aria-label", "Switch to " + next.toLowerCase() + " theme");
  }

  button.hidden = false;
  label();
  button.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    label();
  });
  media.addEventListener("change", label);
})();
