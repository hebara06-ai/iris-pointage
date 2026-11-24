/* IRIS — confort téléphone et tablette (administration) : listes compactes dépliables, recherche, QR repliable, barre de navigation en bas.
   Actif seulement sur écran étroit (≤ 1024 px) ; l'affichage ordinateur n'est pas modifié. Ne lit, ne modifie et n'envoie aucune donnée. */
(function () {
  "use strict";
  var MQ_TAB = window.matchMedia ? window.matchMedia("(max-width:1024px)") : { matches: false };
  var MQ_TEL = window.matchMedia ? window.matchMedia("(max-width:700px)") : { matches: false };
  var TITRE = { "Nom": 1, "Prénom": 1, "Agent": 1 };
  var STATUT = { "Statut": 1, "Contrôle": 1 };
  var REPERE = { "Date": 1, "Arrivée": 1, "Départ": 1, "Horaire": 1, "Présences": 1, "Retards": 1, "Absences": 1 };
  var planifie = false;

  function etiquettes(tb) {
    var tete = tb.querySelector("thead tr") || tb.querySelector("tr");
    if (!tete) return null;
    var lib = [], i;
    for (i = 0; i < tete.children.length; i++) lib.push((tete.children[i].textContent || "").replace(/\s+/g, " ").trim());
    return lib;
  }
  function classer(tb) {
    var lib = etiquettes(tb);
    if (!lib) return;
    var lignes = tb.querySelectorAll("tbody tr");
    for (var r = 0; r < lignes.length; r++) {
      var cel = lignes[r].children;
      for (var i = 0; i < cel.length; i++) {
        var td = cel[i];
        if (td.tagName !== "TD") continue;
        var l = td.getAttribute("data-l");
        if (l === null) l = i < lib.length ? lib[i] : "";
        var c = "im-x";
        if (td.querySelector("input[type=checkbox]")) c = "im-sel";
        else if (TITRE[l]) c = "im-t";
        else if (STATUT[l]) c = "im-s";
        else if (REPERE[l]) c = "im-m";
        if (!td.classList.contains(c)) { td.classList.remove("im-x", "im-sel", "im-t", "im-s", "im-m"); td.classList.add(c); }
        if (c === "im-m") { var vide = /^[\s—–-]*$/.test(td.textContent || ""); if (td.classList.contains("im-vide") !== vide) td.classList.toggle("im-vide", vide); }
      }
    }
  }
  function champRecherche(tb) {
    var zone = tb.parentElement;
    if (!zone) return null;
    var q = zone.querySelector(".im-q[data-im-pour]");
    if (q && q.getAttribute("data-im-pour") === (tb.getAttribute("data-im-id") || "")) return q;
    if (!tb.getAttribute("data-im-id")) tb.setAttribute("data-im-id", "t" + Math.random().toString(36).slice(2, 8));
    q = document.createElement("input");
    q.type = "search"; q.className = "im-q"; q.placeholder = "Rechercher dans la liste…"; q.setAttribute("aria-label", "Rechercher dans la liste");
    q.setAttribute("data-im-pour", tb.getAttribute("data-im-id")); q.autocomplete = "off";
    q.addEventListener("input", function () { filtrer(tb, q.value); });
    zone.insertBefore(q, tb);
    return q;
  }
  function norm(s) { return String(s || "").toLowerCase().normalize ? String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") : String(s || "").toLowerCase(); }
  function filtrer(tb, texte) {
    var t = norm(texte).trim(), lignes = tb.querySelectorAll("tbody tr");
    for (var i = 0; i < lignes.length; i++) {
      var ok = !t || norm(lignes[i].textContent).indexOf(t) >= 0;
      lignes[i].classList.toggle("im-cache", !ok);
    }
  }
  function tables() {
    var all = document.querySelectorAll("table.rc"), actif = MQ_TAB.matches;
    for (var i = 0; i < all.length; i++) {
      var tb = all[i];
      if (!actif) {
        tb.classList.remove("im-c");
        var q0 = tb.parentElement && tb.parentElement.querySelector('.im-q[data-im-pour="' + (tb.getAttribute("data-im-id") || "_") + '"]');
        if (q0) q0.style.display = "none";
        continue;
      }
      if (tb.querySelectorAll("tbody tr").length < 1) continue;
      classer(tb); tb.classList.add("im-c");
      var q = champRecherche(tb); if (q) { q.style.display = ""; if (q.value) filtrer(tb, q.value); }
    }
  }

  /* ---- QR de l'accueil : replié par défaut sur téléphone ---- */
  function qr() {
    var q = document.querySelector(".b.q");
    if (!q) return;
    var btn = q.querySelector(".im-qbtn");
    if (!MQ_TEL.matches) { q.classList.remove("im-replie"); if (btn) btn.style.display = "none"; return; }
    if (!btn) {
      btn = document.createElement("button"); btn.type = "button"; btn.className = "im-qbtn";
      btn.addEventListener("click", function () { var r = q.classList.toggle("im-replie"); btn.textContent = r ? "Afficher le QR code" : "Masquer le QR code"; btn.setAttribute("aria-expanded", r ? "false" : "true"); });
      q.appendChild(btn); q.classList.add("im-replie"); btn.textContent = "Afficher le QR code"; btn.setAttribute("aria-expanded", "false");
    }
    btn.style.display = "";
  }

  /* ---- Barre de navigation en bas (téléphone) pour les corrections ---- */
  var ICONES = {
    "Pointages": '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    "Absences": '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/><path d="M17.5 4.5l3 3m0-3l-3 3"/></svg>',
    "Congés": '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M8 3.5v4M16 3.5v4M4 10h16"/></svg>',
    "Agents": '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M16.5 14.2c2.3.1 3.7 1.6 4.2 4.3"/></svg>',
    "Plus": '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/></svg>'
  };
  var PRINCIPAUX = ["Pointages", "Absences", "Congés", "Agents"];
  var nav = null, plus = null;
  function onglets() {
    var ed = document.getElementById("ed");
    var seg = ed && ed.querySelector(".ed-top .ed-seg");
    return seg ? Array.prototype.slice.call(seg.querySelectorAll("button")) : [];
  }
  function cle(b) { var t = (b.textContent || "").trim(); for (var i = 0; i < PRINCIPAUX.length; i++) if (t.indexOf(PRINCIPAUX[i]) === 0) return PRINCIPAUX[i]; return ""; }
  function construireNav() {
    if (nav) return;
    nav = document.createElement("nav"); nav.id = "im-nav"; nav.setAttribute("aria-label", "Navigation");
    plus = document.createElement("div"); plus.id = "im-plus"; plus.setAttribute("role", "menu");
    document.body.appendChild(nav); document.body.appendChild(plus);
    document.addEventListener("click", function (e) { if (plus.classList.contains("im-on") && !plus.contains(e.target) && !(e.target.closest && e.target.closest("#im-nav"))) plus.classList.remove("im-on"); });
  }
  function majNav() {
    var ed = document.getElementById("ed");
    var visible = MQ_TEL.matches && ed && ed.className.indexOf("on") >= 0;
    if (!visible) { if (nav) { nav.classList.remove("im-on"); plus.classList.remove("im-on"); } return; }
    var tabs = onglets();
    if (!tabs.length) return;
    construireNav();
    var actifCle = "", actifAutre = false, autres = [];
    nav.textContent = ""; plus.textContent = "";
    PRINCIPAUX.forEach(function (nom) {
      var o = tabs.filter(function (b) { return cle(b) === nom; })[0];
      if (!o) return;
      var b = document.createElement("button"); b.type = "button";
      var on = o.className.indexOf("on") >= 0; if (on) { b.className = "im-actif"; actifCle = nom; }
      b.innerHTML = ICONES[nom] + "<span>" + nom.replace("Absences", "Absences") + (/\((\d+)\)/.test(o.textContent) ? " (" + /\((\d+)\)/.exec(o.textContent)[1] + ")" : "") + "</span>";
      b.addEventListener("click", function () { plus.classList.remove("im-on"); o.click(); });
      nav.appendChild(b);
    });
    tabs.forEach(function (o) {
      if (cle(o)) return;
      autres.push(o);
      var on = o.className.indexOf("on") >= 0; if (on) actifAutre = true;
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "menuitem"); b.textContent = (o.textContent || "").trim(); if (on) b.className = "im-actif";
      b.addEventListener("click", function () { plus.classList.remove("im-on"); o.click(); });
      plus.appendChild(b);
    });
    var bp = document.createElement("button"); bp.type = "button"; bp.innerHTML = ICONES.Plus + "<span>Plus</span>"; if (actifAutre) bp.className = "im-actif";
    bp.setAttribute("aria-haspopup", "true");
    bp.addEventListener("click", function (e) { e.stopPropagation(); plus.classList.toggle("im-on"); });
    nav.appendChild(bp);
    nav.classList.add("im-on");
  }

  /* ---- Déplier / replier une carte d'un toucher (sauf sur une case, un lien ou un bouton) ---- */
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var tr = t.closest("table.rc.im-c tbody tr");
    if (!tr || t.closest("input,a,button,select,textarea,label")) return;
    tr.classList.toggle("im-ouvert");
  });

  var obs = null, OPTS = { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] };
  function tout() {
    planifie = false;
    if (obs) obs.disconnect();           /* nos propres changements ne relancent pas le traitement */
    try { tables(); qr(); majNav(); } catch (e) { }
    if (obs) obs.observe(document.body, OPTS);
  }
  function planifier() { if (planifie) return; planifie = true; (window.requestAnimationFrame || setTimeout)(tout); }
  function demarrer() {
    if (window.MutationObserver) obs = new MutationObserver(planifier);
    tout();
    if (MQ_TAB.addEventListener) { MQ_TAB.addEventListener("change", planifier); MQ_TEL.addEventListener("change", planifier); }
    window.addEventListener("resize", planifier);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
})();
