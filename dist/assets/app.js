/* Milestone 1 prototype: a tap opens the gloss, a second tap withdraws it. */
document.querySelectorAll(".gloss").forEach(function (btn) {
  btn.setAttribute("aria-pressed", "false");
  btn.addEventListener("click", function () {
    var open = btn.getAttribute("aria-pressed") === "true";
    var line = btn.closest(".line");
    var note = line && line.nextElementSibling && line.nextElementSibling.classList.contains("gloss-note")
      ? line.nextElementSibling
      : null;
    if (open) {
      btn.setAttribute("aria-pressed", "false");
      if (note) note.remove();
      return;
    }
    document.querySelectorAll('.gloss[aria-pressed="true"]').forEach(function (other) {
      other.setAttribute("aria-pressed", "false");
    });
    document.querySelectorAll(".gloss-note").forEach(function (n) { n.remove(); });
    btn.setAttribute("aria-pressed", "true");
    var p = document.createElement("p");
    p.className = "gloss-note";
    p.textContent = btn.dataset.vi;
    line.insertAdjacentElement("afterend", p);
  });
});
