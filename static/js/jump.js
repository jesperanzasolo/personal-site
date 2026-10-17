// Jump menu: open with Cmd/Ctrl+K or "/", type to filter, arrows to move, Enter to open.
(function () {
  var dialog = document.querySelector(".jump-menu");
  var dataEl = document.getElementById("jump-data");
  if (!dialog || !dataEl || typeof dialog.showModal !== "function") return;

  var items;
  try { items = JSON.parse(dataEl.textContent); } catch (e) { return; }

  var input = dialog.querySelector("input");
  var list = dialog.querySelector(".jump-list");
  var empty = dialog.querySelector(".jump-empty");
  var openers = document.querySelectorAll("[data-jump-open]");
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var results = [];
  var active = 0;

  document.querySelectorAll("[data-jump-key]").forEach(function (el) {
    el.textContent = isMac ? "⌘K" : "Ctrl K";
  });

  // Simple ranked match: prefix of a word beats substring; title beats hint.
  function score(item, q) {
    if (!q) return 1;
    var t = item.title.toLowerCase();
    var h = (item.hint || "").toLowerCase() + " " + item.group.toLowerCase();
    if (t.indexOf(q) === 0) return 4;
    if ((" " + t).indexOf(" " + q) !== -1) return 3;
    if (t.indexOf(q) !== -1) return 2;
    if (h.indexOf(q) !== -1) return 1;
    return 0;
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    results = items
      .map(function (item, i) { return { item: item, s: score(item, q), i: i }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return q ? b.s - a.s || a.i - b.i : a.i - b.i; })
      .map(function (r) { return r.item; });

    list.textContent = "";
    var lastGroup = null;
    results.forEach(function (item, i) {
      if (!q && item.group !== lastGroup) {
        var g = document.createElement("li");
        g.className = "jump-group";
        g.setAttribute("role", "presentation");
        g.textContent = item.group;
        list.appendChild(g);
        lastGroup = item.group;
      }
      var li = document.createElement("li");
      li.id = "jump-opt-" + i;
      li.className = "jump-opt";
      li.setAttribute("role", "option");
      var title = document.createElement("span");
      title.className = "jump-title";
      title.textContent = item.title;
      li.appendChild(title);
      if (item.hint || q) {
        var hint = document.createElement("span");
        hint.className = "jump-hint";
        hint.textContent = q ? item.group + (item.hint ? ", " + item.hint : "") : item.hint;
        li.appendChild(hint);
      }
      li.addEventListener("mousemove", function () { if (active !== i) setActive(i); });
      li.addEventListener("click", function () { go(i); });
      list.appendChild(li);
    });
    empty.hidden = results.length > 0;
    setActive(0);
  }

  function setActive(i) {
    var opts = list.querySelectorAll(".jump-opt");
    if (!opts.length) { input.removeAttribute("aria-activedescendant"); return; }
    active = (i + opts.length) % opts.length;
    opts.forEach(function (o, n) { o.setAttribute("aria-selected", n === active ? "true" : "false"); });
    input.setAttribute("aria-activedescendant", opts[active].id);
    opts[active].scrollIntoView({ block: "nearest" });
  }

  function go(i) {
    var item = results[i];
    if (!item) return;
    var external = /^https?:\/\//.test(item.url) && item.url.indexOf(location.origin) !== 0;
    close();
    if (external) window.open(item.url, "_blank", "noopener"); else location.href = item.url;
  }

  function open() {
    if (dialog.open) return;
    input.value = "";
    render();
    dialog.showModal();
    input.focus();
  }
  function close() { if (dialog.open) dialog.close(); }

  openers.forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); open(); });
  });

  document.addEventListener("keydown", function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      dialog.open ? close() : open();
    } else if (e.key === "/" && !typing && !dialog.open) {
      e.preventDefault();
      open();
    }
  });

  input.addEventListener("input", render);
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter") { e.preventDefault(); go(active); }
  });

  dialog.querySelectorAll("[data-jump-close]").forEach(function (el) { el.addEventListener("click", close); });

  // Click on the backdrop closes the menu.
  dialog.addEventListener("click", function (e) { if (e.target === dialog) close(); });
})();
