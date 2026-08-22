/* =====================================================================
   Bouwploeg materiaal - Contactmodule
   ---------------------------------------------------------------------
   Dit is het LEESBARE bronbestand van het menu "Contact".
   Dezelfde code zit ook ingebouwd in index.html (onderaan, in een
   script-blok). Bewaar dit bestand op GitHub in een map "bron", zodat
   toekomstige aanpassingen makkelijk blijven.

   Wat doet deze module?
   - Het "Contact"-scherm verschijnt in het MIDDENdeel van de app, net als
     Toevoegen, Overzicht en Inleveren. De header bovenin en het menu
     onderin (met de vier knoppen) blijven dus gewoon zichtbaar.
   - Contactpersonen worden per hike bewaard in de gedeelde database
     (Firebase Firestore), in een APART onderdeel genaamd "contacts".
     De materiaallijst ("items") wordt hierdoor met rust gelaten.
   - Je kunt een contactpersoon toevoegen (plusknop onderin), wijzigen,
     verwijderen en rechtstreeks bellen.

   Hoe het aan de app vastzit:
   - In het menu onderin is een knop "Contact" toegevoegd die naar het
     tabblad "contact" schakelt (net als de andere knoppen).
   - Als dat tabblad actief is, plaatst de app in het middendeel een leeg
     vakje met kenmerk id="bpc-mount". Deze module vult dat vakje met de
     contactenlijst.

   Belangrijk: in Firebase moeten de regels het onderdeel "contacts"
   toestaan om te lezen en schrijven, net zoals bij "items". Staat dat
   niet aan, dan worden contacten alleen op de eigen telefoon bewaard.
   ===================================================================== */

(function () {
  "use strict";

  // De vaste hikes, in de volgorde waarin ze getoond moeten worden.
  var HIKES = [
    "A hike", "B hike", "C hike", "D hike", "E hike", "F hike",
    "Vliegende keep", "Kampstaf", "Overige"
  ];

  // Een kleur per hike, zodat in één oogopslag duidelijk is bij welke
  // hike een contactpersoon hoort. Kleuren in stijl van de app.
  var HIKE_KLEUR = {
    "A hike": "#C15A38",
    "B hike": "#3E6E8E",
    "C hike": "#2F8F9D",
    "D hike": "#8A5A9E",
    "E hike": "#4E7D42",
    "F hike": "#B8902E",
    "Vliegende keep": "#A9762F",
    "Kampstaf": "#6B7280",
    "Overige": "#6B7280"
  };

  // ---------------------------------------------------------------------
  // Opslag: eerst proberen we de gedeelde database (Firebase). Lukt dat
  // niet, dan vallen we terug op opslag in deze telefoon zelf, zodat de
  // module altijd blijft werken.
  // ---------------------------------------------------------------------
  var SDK_BASIS = "https://www.gstatic.com/firebasejs/10.14.1/";
  var LOKALE_SLEUTEL = "bouwploeg-contacten";

  var db = null;              // de databaseverbinding (of null bij lokaal)
  var fs = null;              // de firestore-functies
  var modus = "lokaal";       // "cloud" of "lokaal"
  var contacten = [];         // de actuele lijst in het geheugen

  // Kleine hulp: een uniek id maken voor een nieuwe contactpersoon.
  function nieuwId() {
    return "c_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  }

  // Lokale opslag lezen/schrijven (de terugvaloptie).
  function lokaalLezen() {
    try { return JSON.parse(localStorage.getItem(LOKALE_SLEUTEL) || "[]"); }
    catch (e) { return []; }
  }
  function lokaalSchrijven(lijst) {
    try { localStorage.setItem(LOKALE_SLEUTEL, JSON.stringify(lijst)); }
    catch (e) {}
  }

  // Verbinding maken met Firebase. We gebruiken dezelfde gegevens als de
  // rest van de app (window.__BOUWPLOEG_FIREBASE__), maar een eigen
  // verbindingsnaam ("bpContacts") zodat we de app niet in de weg zitten.
  async function verbind() {
    var config = window.__BOUWPLOEG_FIREBASE__;
    if (!config) { modus = "lokaal"; contacten = lokaalLezen(); tekenLijst(); return; }
    try {
      var appMod = await import(SDK_BASIS + "firebase-app.js");
      fs = await import(SDK_BASIS + "firebase-firestore.js");
      var app = appMod.initializeApp(config, "bpContacts");
      db = fs.getFirestore(app);
      modus = "cloud";
      // Live meeluisteren: elke wijziging in de database komt vanzelf binnen.
      fs.onSnapshot(
        fs.collection(db, "contacts"),
        function (snap) {
          var lijst = [];
          snap.forEach(function (d) { lijst.push(d.data()); });
          contacten = lijst;
          tekenLijst();
        },
        function () {
          modus = "lokaal";
          contacten = lokaalLezen();
          tekenLijst();
        }
      );
    } catch (e) {
      modus = "lokaal";
      contacten = lokaalLezen();
      tekenLijst();
    }
  }

  // Een contactpersoon opslaan (nieuw of gewijzigd).
  function bewaarContact(contact) {
    if (modus === "cloud" && db && fs) {
      fs.setDoc(fs.doc(db, "contacts", contact.id), contact).catch(function () {
        alert("Opslaan mislukt. Controleer je internetverbinding.");
      });
    } else {
      var bestaat = contacten.some(function (c) { return c.id === contact.id; });
      contacten = bestaat
        ? contacten.map(function (c) { return c.id === contact.id ? contact : c; })
        : [contact].concat(contacten);
      lokaalSchrijven(contacten);
      tekenLijst();
    }
  }

  // Een contactpersoon verwijderen.
  function verwijderContact(id) {
    if (modus === "cloud" && db && fs) {
      fs.deleteDoc(fs.doc(db, "contacts", id)).catch(function () {
        alert("Verwijderen mislukt.");
      });
    } else {
      contacten = contacten.filter(function (c) { return c.id !== id; });
      lokaalSchrijven(contacten);
      tekenLijst();
    }
  }

  // ---------------------------------------------------------------------
  // De vormgeving. We gebruiken de kleuren van de app (de --variabelen)
  // zodat het contactscherm er hetzelfde uitziet.
  // ---------------------------------------------------------------------
  var css = ""
    // De lijst staat IN het middendeel (niet als los scherm). Ruimte onderin
    // zodat de laatste kaart niet achter het menu of de plusknop valt.
    + "#bpc-list{padding-bottom:104px}"
    + ".bpc-titelbalk{display:flex;align-items:center;justify-content:space-between;margin:2px 2px 10px}"
    + ".bpc-titelbalk h2{font-size:16px;font-weight:800;margin:0}"
    + ".bpc-groep-titel{display:flex;align-items:center;gap:8px;font-weight:800;font-size:13px;"
    + "text-transform:uppercase;letter-spacing:.04em;color:hsl(var(--foreground));margin:18px 4px 8px}"
    + ".bpc-dot{width:12px;height:12px;border-radius:50%;flex:none}"
    + ".bpc-kaart{display:flex;align-items:center;gap:12px;background:hsl(var(--card));"
    + "border:1px solid hsl(var(--border));border-radius:var(--radius);padding:12px 14px;margin-bottom:10px}"
    + ".bpc-kaart .info{flex:1;min-width:0}"
    + ".bpc-kaart .naam{font-weight:700;font-size:15px;color:hsl(var(--foreground))}"
    + ".bpc-kaart .tel{color:hsl(var(--muted-foreground));font-size:14px;margin-top:2px}"
    + ".bpc-knop{border:0;border-radius:12px;width:44px;height:44px;display:flex;align-items:center;"
    + "justify-content:center;cursor:pointer;flex:none;text-decoration:none}"
    + ".bpc-bel{background:hsl(var(--status-in,146 46% 34%));color:#fff}"
    + ".bpc-wijzig{background:hsl(var(--secondary));color:hsl(var(--secondary-foreground))}"
    + ".bpc-leeg{text-align:center;color:hsl(var(--muted-foreground));margin-top:50px;font-size:15px}"
    // De plusknop zweeft rechtsonder, NET BOVEN het menu. Alleen zichtbaar
    // als het contacttabblad open is (dan bestaat #bpc-mount).
    + "#bpc-plus{position:fixed;right:20px;bottom:calc(env(safe-area-inset-bottom) + 80px);"
    + "width:56px;height:56px;border-radius:50%;border:0;background:hsl(var(--accent));color:#3a2c07;"
    + "font-size:32px;line-height:1;display:none;align-items:center;justify-content:center;cursor:pointer;"
    + "box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:40}"
    + "#bpc-plus.zichtbaar{display:flex}"
    // Het invulscherm (toevoegen/wijzigen) is een vol scherm, net als het
    // "Materiaal bewerken"-scherm van de app zelf.
    + "#bpc-form{position:fixed;inset:0;z-index:60;display:none;flex-direction:column;"
    + "background:hsl(var(--background));color:hsl(var(--foreground));font-family:inherit}"
    + "#bpc-form.open{display:flex}"
    + "#bpc-form .kop{position:sticky;top:0;display:flex;align-items:center;gap:12px;"
    + "padding:calc(env(safe-area-inset-top) + 14px) 16px 14px;background:hsl(var(--card));"
    + "border-bottom:1px solid hsl(var(--border))}"
    + "#bpc-form .kop h2{font-size:17px;font-weight:800;margin:0;flex:1}"
    + "#bpc-form .terug{border:0;background:transparent;color:hsl(var(--muted-foreground));"
    + "font-size:22px;padding:6px;cursor:pointer;line-height:1}"
    + "#bpc-form .body{flex:1;overflow-y:auto;padding:18px 16px}"
    + ".bpc-veld{display:block;margin-bottom:16px}"
    + ".bpc-veld span{display:block;font-weight:700;font-size:14px;margin-bottom:6px}"
    + ".bpc-veld input,.bpc-veld select{width:100%;box-sizing:border-box;border-radius:12px;"
    + "border:1px solid hsl(var(--input));background:hsl(var(--card));color:hsl(var(--foreground));"
    + "padding:12px 14px;font-size:16px;outline:none}"
    + ".bpc-veld input:focus,.bpc-veld select:focus{border-color:hsl(var(--accent))}"
    + ".bpc-acties{display:flex;gap:10px;padding:16px;border-top:1px solid hsl(var(--border));"
    + "background:hsl(var(--card))}"
    + ".bpc-primair{flex:1;border:0;border-radius:14px;background:hsl(var(--primary));"
    + "color:hsl(var(--primary-foreground));font-weight:800;font-size:16px;padding:14px;cursor:pointer}"
    + ".bpc-verwijder{border:0;border-radius:14px;background:hsl(var(--destructive));color:#fff;"
    + "font-weight:700;padding:14px 16px;cursor:pointer}";

  // Kleine iconen (bel-hoorn en potlood) als SVG.
  var BEL_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  var POTLOOD_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';

  // ---------------------------------------------------------------------
  // De schermdelen opbouwen (eenmalig).
  // ---------------------------------------------------------------------
  var listRoot, body, plus, form, formTitel, veldNaam, veldHike, veldTel, knopVerwijder, bewerktId;

  function bouwSchermen() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    // Het lijstgedeelte dat in het middendeel (#bpc-mount) geplaatst wordt.
    listRoot = document.createElement("div");
    listRoot.id = "bpc-list";
    listRoot.innerHTML =
      '<div class="bpc-titelbalk"><h2>Contactpersonen</h2></div>'
      + '<div id="bpc-body"></div>';
    body = listRoot.querySelector("#bpc-body");

    // De plusknop (zweeft, staat los in de pagina).
    plus = document.createElement("button");
    plus.id = "bpc-plus";
    plus.setAttribute("aria-label", "Contactpersoon toevoegen");
    plus.textContent = "+";
    plus.addEventListener("click", function () { openForm(null); });
    document.body.appendChild(plus);

    // Het invulscherm (vol scherm).
    form = document.createElement("div");
    form.id = "bpc-form";
    form.innerHTML =
      '<div class="kop"><button class="terug" data-terug aria-label="Terug">&larr;</button>'
      + '<h2 data-titel>Nieuwe contactpersoon</h2></div>'
      + '<div class="body">'
      + '  <label class="bpc-veld"><span>Naam</span><input data-naam type="text" placeholder="Naam contactpersoon"></label>'
      + '  <label class="bpc-veld"><span>Hike</span><select data-hike></select></label>'
      + '  <label class="bpc-veld"><span>Telefoonnummer</span><input data-tel type="tel" inputmode="tel" placeholder="06 12 34 56 78"></label>'
      + '</div>'
      + '<div class="bpc-acties">'
      + '  <button class="bpc-verwijder" data-verwijder style="display:none">Verwijderen</button>'
      + '  <button class="bpc-primair" data-bewaar>Opslaan</button>'
      + '</div>';
    document.body.appendChild(form);

    formTitel = form.querySelector("[data-titel]");
    veldNaam = form.querySelector("[data-naam]");
    veldHike = form.querySelector("[data-hike]");
    veldTel = form.querySelector("[data-tel]");
    knopVerwijder = form.querySelector("[data-verwijder]");

    HIKES.forEach(function (h) {
      var opt = document.createElement("option");
      opt.value = h; opt.textContent = h;
      veldHike.appendChild(opt);
    });

    form.querySelector("[data-terug]").addEventListener("click", sluitForm);
    form.querySelector("[data-bewaar]").addEventListener("click", bewaarVanuitForm);
    knopVerwijder.addEventListener("click", function () {
      if (bewerktId && confirm("Deze contactpersoon verwijderen?")) {
        verwijderContact(bewerktId);
        sluitForm();
      }
    });

    // In de gaten houden of het contacttabblad open is. De app plaatst dan
    // een leeg vakje met id="bpc-mount" in het middendeel; daar hangen we
    // de lijst in. Zodra je naar een ander tabblad gaat, verdwijnt dat vakje.
    function synchroniseer() {
      var mount = document.getElementById("bpc-mount");
      if (mount) {
        if (listRoot.parentNode !== mount) {
          mount.appendChild(listRoot);
          tekenLijst();
        }
        plus.classList.add("zichtbaar");
      } else {
        plus.classList.remove("zichtbaar");
      }
    }
    new MutationObserver(synchroniseer).observe(document.body, { childList: true, subtree: true });
    synchroniseer();
  }

  // ---------------------------------------------------------------------
  // De lijst tekenen, gegroepeerd en gesorteerd per hike.
  // ---------------------------------------------------------------------
  function tekenLijst() {
    if (!body) return;
    body.innerHTML = "";

    if (!contacten.length) {
      var leeg = document.createElement("p");
      leeg.className = "bpc-leeg";
      leeg.textContent = "Nog geen contactpersonen. Tik op + om er een toe te voegen.";
      body.appendChild(leeg);
      return;
    }

    HIKES.forEach(function (hike) {
      var groep = contacten
        .filter(function (c) { return c.hike === hike; })
        .sort(function (a, b) { return (a.naam || "").localeCompare(b.naam || ""); });
      if (!groep.length) return;

      var titel = document.createElement("div");
      titel.className = "bpc-groep-titel";
      titel.innerHTML = '<span class="bpc-dot" style="background:'
        + (HIKE_KLEUR[hike] || "#6B7280") + '"></span>' + hike;
      body.appendChild(titel);

      groep.forEach(function (c) {
        var kaart = document.createElement("div");
        kaart.className = "bpc-kaart";

        var info = document.createElement("div");
        info.className = "info";
        info.innerHTML = '<div class="naam"></div><div class="tel"></div>';
        info.querySelector(".naam").textContent = c.naam || "(geen naam)";
        info.querySelector(".tel").textContent = c.telefoon || "";

        var wijzig = document.createElement("button");
        wijzig.className = "bpc-knop bpc-wijzig";
        wijzig.setAttribute("aria-label", "Wijzigen");
        wijzig.innerHTML = POTLOOD_SVG;
        wijzig.addEventListener("click", function () { openForm(c); });

        var bel = document.createElement("a");
        bel.className = "bpc-knop bpc-bel";
        bel.setAttribute("aria-label", "Bellen");
        bel.innerHTML = BEL_SVG;
        if (c.telefoon) bel.href = "tel:" + String(c.telefoon).replace(/\s+/g, "");

        kaart.appendChild(info);
        kaart.appendChild(wijzig);
        kaart.appendChild(bel);
        body.appendChild(kaart);
      });
    });
  }

  // ---------------------------------------------------------------------
  // Het invulscherm (toevoegen/wijzigen).
  // ---------------------------------------------------------------------
  function openForm(contact) {
    bewerktId = contact ? contact.id : null;
    formTitel.textContent = contact ? "Contactpersoon wijzigen" : "Nieuwe contactpersoon";
    veldNaam.value = contact ? (contact.naam || "") : "";
    veldHike.value = contact ? (contact.hike || HIKES[0]) : HIKES[0];
    veldTel.value = contact ? (contact.telefoon || "") : "";
    knopVerwijder.style.display = contact ? "block" : "none";
    form.classList.add("open");
  }
  function sluitForm() { form.classList.remove("open"); }

  function bewaarVanuitForm() {
    var naam = veldNaam.value.trim();
    if (!naam) { alert("Vul een naam in."); return; }
    var contact = {
      id: bewerktId || nieuwId(),
      naam: naam,
      hike: veldHike.value || "Overige",
      telefoon: veldTel.value.trim(),
      updatedAt: Date.now()
    };
    if (!bewerktId) contact.createdAt = Date.now();
    bewaarContact(contact);
    sluitForm();
  }

  // ---------------------------------------------------------------------
  // Opstarten.
  // ---------------------------------------------------------------------
  function start() {
    bouwSchermen();
    verbind();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
