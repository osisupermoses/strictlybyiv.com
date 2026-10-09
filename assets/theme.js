/* Theme control: Auto / Light / Dark. Markup lives in each page header (.theme-ctl);
   the saved choice is applied before first paint by a small inline script in each <head>. */
(function () {
  var root = document.documentElement;
  var KEY = "sbiv-theme";
  var ORDER = ["auto", "light", "dark"];
  var NAMES = { auto: "Auto", light: "Light", dark: "Dark" };
  var system = window.matchMedia("(prefers-color-scheme: dark)");

  function saved() {
    try {
      var t = localStorage.getItem(KEY);
      return t === "light" || t === "dark" ? t : "auto";
    } catch (e) {
      return "auto";
    }
  }

  function label(mode) {
    return mode === "auto" ? "Auto (" + (system.matches ? "dark" : "light") + ")" : NAMES[mode];
  }

  function render(mode) {
    document.querySelectorAll(".theme-pill").forEach(function (pill) {
      pill.dataset.mode = mode;
      pill.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.set === mode));
      });
    });
    document.querySelectorAll(".theme-dial").forEach(function (dial) {
      dial.dataset.mode = mode;
      dial.title = "Theme: " + label(mode);
      dial.setAttribute("aria-label", "Theme: " + label(mode) + ". Tap to change.");
      var tip = dial.querySelector(".theme-tip");
      if (tip) tip.textContent = label(mode);
    });
  }

  function set(mode) {
    if (mode === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    try {
      if (mode === "auto") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch (e) {}
    render(mode);
  }

  document.addEventListener("click", function (e) {
    var choice = e.target.closest(".theme-pill button");
    if (choice) {
      set(choice.dataset.set);
      return;
    }
    var dial = e.target.closest(".theme-dial");
    if (dial) {
      set(ORDER[(ORDER.indexOf(dial.dataset.mode) + 1) % ORDER.length]);
      dial.classList.add("show-tip");
      clearTimeout(dial._tip);
      dial._tip = setTimeout(function () { dial.classList.remove("show-tip"); }, 1400);
    }
  });

  // Auto follows the device live; another open tab changing the choice follows too.
  if (system.addEventListener) system.addEventListener("change", function () { if (saved() === "auto") render("auto"); });
  window.addEventListener("storage", function (e) {
    if (e.key !== KEY) return;
    var mode = saved();
    if (mode === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    render(mode);
  });

  render(saved());
})();
