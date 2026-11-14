/* IRIS  tableaux lisibles sur telephone.
   Ajoute a chaque cellule l'intitule de sa colonne (data-l) ; le CSS (iris.css) s'en sert pour afficher
   les lignes en cartes empilees sous 768 px. Ne lit, ne modifie et n'envoie aucune donnee. */
(function () {
  "use strict";
  var planifie = false;
  function traiter() {
    planifie = false;
    var tables = document.querySelectorAll("table");
    for (var t = 0; t < tables.length; t++) {
      var tb = tables[t], tete = tb.querySelector("thead tr") || tb.querySelector("tr");
      if (!tete) continue;
      var ths = tete.children, lib = [], n = 0, i;
      for (i = 0; i < ths.length; i++) { lib.push((ths[i].textContent || "").replace(/\s+/g, " ").trim()); if (lib[i]) n++; }
      if (n < 3) continue;
      tb.classList.add("rc");
      var lignes = tb.querySelectorAll("tbody tr");
      for (var r = 0; r < lignes.length; r++) {
        var cel = lignes[r].children;
        for (i = 0; i < cel.length; i++) {
          if (cel[i].tagName !== "TD") continue;
          if (cel[i].colSpan > 1) { cel[i].setAttribute("data-l", ""); continue; }
          var v = i < lib.length ? lib[i] : "";
          if (cel[i].getAttribute("data-l") !== v) cel[i].setAttribute("data-l", v);
        }
      }
    }
  }
  function planifier() { if (planifie) return; planifie = true; (window.requestAnimationFrame || setTimeout)(traiter); }
  function demarrer() {
    traiter();
    if (window.MutationObserver) new MutationObserver(planifier).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
})();
