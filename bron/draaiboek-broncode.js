/* =====================================================================
   Bouwploeg materiaal - Draaiboekmodule
   ---------------------------------------------------------------------
   Dit is het LEESBARE bronbestand van het menu "Draaiboek".
   Dezelfde code zit ook ingebouwd in index.html (onderaan, in een
   script-blok). Bewaar dit bestand op GitHub in de map "bron".

   Wat doet deze module?
   - Het "Draaiboek"-scherm verschijnt in het MIDDENdeel van de app, net
     als de andere schermen, dus met de header bovenin en het menu onderin
     zichtbaar. In het menu staat Draaiboek tussen Inleveren en Contact.
   - Bouwposten worden bewaard in de gedeelde database (Firebase Firestore)
     in een APART onderdeel genaamd "draaiboek". De materiaallijst ("items")
     en de contacten ("contacts") worden hierdoor met rust gelaten.
   - Je kunt bouwposten toevoegen (plusknop onderin), bekijken, wijzigen en
     verwijderen. Per bouwpost kun je het punt openen in Google Maps, Apple
     Maps of een andere kaart-app.
   - Per bouwpost kun je een of meer technieken kiezen (bijvoorbeeld
     knopen). De uitleg daarvan verschijnt als afbeelding in het
     detailscherm. De lijst met technieken staat hieronder bij TECHNIEKEN.

   Hoe het aan de app vastzit:
   - In het menu onderin is een knop "Draaiboek" toegevoegd die naar het
     tabblad "draaiboek" schakelt.
   - Als dat tabblad actief is, plaatst de app in het middendeel een leeg
     vakje met kenmerk id="dbk-mount". Deze module vult dat vakje.

   Belangrijk: in Firebase moeten de regels het onderdeel "draaiboek"
   toestaan om te lezen en schrijven, net zoals bij "items" en "contacts".
   Staat dat niet aan, dan worden bouwposten alleen op de eigen telefoon
   bewaard.
   ===================================================================== */

(function () {
  "use strict";

  // De vaste dagen, in de volgorde waarin ze getoond moeten worden.
  var DAGEN = ["dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

  // De hikes voor het draaiboek: A t/m F, plus Bouwploeg. Kleuren gelijk aan het
  // contactmenu, zodat dezelfde hike overal dezelfde kleur heeft.
  var HIKES = ["A hike", "B hike", "C hike", "D hike", "E hike", "F hike", "Bouwploeg"];
  var HIKE_KLEUR = {
    "A hike": "#C15A38",
    "B hike": "#3E6E8E",
    "C hike": "#2F8F9D",
    "D hike": "#8A5A9E",
    "E hike": "#4E7D42",
    "F hike": "#B8902E",
    "Bouwploeg": "#6B7280"
  };

  // ---------------------------------------------------------------------
  // TECHNIEKEN (knopen en andere technieken)
  //
  // Een nieuwe techniek toevoegen gaat in twee stappen:
  //   1. Zet de afbeelding op GitHub naast index.html, met een naam die
  //      begint met "techniek-", bijvoorbeeld "techniek-mastworp.jpg".
  //   2. Voeg hieronder een regel toe met dezelfde bestandsnaam.
  //
  // - sleutel: vaste korte naam die in de database bewaard wordt. Verander
  //   deze later niet meer, anders raken bouwposten hun techniek kwijt.
  // - naam: zoals hij in de app getoond wordt. Deze mag je wel aanpassen.
  // - afbeelding: de bestandsnaam op GitHub.
  // - beschrijving (mag weg): korte uitleg waarvoor je de techniek gebruikt.
  //   Wordt getoond onder de naam, in het invulscherm en in het detailscherm.
  // De volgorde hieronder is de volgorde in het keuzemenu.
  // ---------------------------------------------------------------------
  var TECHNIEKEN = [
    { sleutel: "triple-bowline", naam: "Gilwell bowline", afbeelding: "techniek-triple-bowline.jpg",
      beschrijving: "Deze knoop gebruiken we om een touw aan een spanset of tirfor te bevestigen." },
    { sleutel: "mastworp-op-het-touw", naam: "Mastworp op het touw", afbeelding: "techniek-mastworp-op-het-touw.jpg",
      beschrijving: "Deze gebruiken we bijvoorbeeld bij Pics in Space, en om een dik touw aan een boom te bevestigen, zoals bij de start van een apenbaan of kabelbaan." },
    { sleutel: "zeppelin", naam: "Zeppelin knoop", afbeelding: "techniek-zeppelin.jpg",
      beschrijving: "Geschikt om twee dikke touwen aan elkaar te verbinden. Ook na zware spanning is de knoop makkelijk weer los te maken." },
    { sleutel: "schootsteek", naam: "Schootsteek", afbeelding: "techniek-schootsteek.jpg",
      beschrijving: "Om twee touwen van verschillende dikte aan elkaar te verbinden." },
    { sleutel: "dubbele-schootsteek", naam: "Dubbele schootsteek", afbeelding: "techniek-dubbele-schootsteek.jpg",
      beschrijving: "Om twee touwen van verschillende dikte aan elkaar te verbinden. Houdt beter dan de gewone schootsteek, vooral bij een groot verschil in dikte of bij glad touw." },
    { sleutel: "munter-mule", naam: "Munter mule knoop", afbeelding: "techniek-munter-mule.jpg",
      beschrijving: "Om een halve mastworp af te knopen, zodat het touw vast blijft staan. Is ook onder spanning weer los te trekken." },
    { sleutel: "paalsteek", naam: "Paalsteek", afbeelding: "techniek-paalsteek.jpg",
      beschrijving: "Maakt een vaste lus die niet dichtloopt. Na belasting makkelijk weer los te maken." },
    { sleutel: "dubbele-paalsteek", naam: "Dubbele paalsteek", afbeelding: "techniek-dubbele-paalsteek.jpg",
      beschrijving: "Paalsteek met een extra slag. Houdt beter dan de gewone paalsteek, vooral bij glad of stijf touw." },
    { sleutel: "vlinderknoop", naam: "Vlinderknoop", afbeelding: "techniek-vlinderknoop.jpg",
      beschrijving: "Maakt een vaste lus midden in het touw. Te gebruiken om een beschadigd stuk touw af te zonderen, voor hand- en voetlussen of een touwladder, als ophangpunt voor bijvoorbeeld een lantaarn of pan, om de middelste persoon in een touwteam vast te maken en als katrol in een takel. Een van de sterkste lusknopen: het touw houdt 60 tot 80 procent van zijn breeksterkte." }
  ];

  function zoekTechniek(sleutel) {
    for (var i = 0; i < TECHNIEKEN.length; i++) {
      if (TECHNIEKEN[i].sleutel === sleutel) return TECHNIEKEN[i];
    }
    return null;
  }

  // De technieken van een bouwpost, in de volgorde van de lijst hierboven.
  // Bouwposten van voor 22 september 2026 hebben er maar een, in het oude
  // veld "techniek"; die worden hier ook meegenomen.
  function techniekenVan(p) {
    var sleutels = Array.isArray(p.technieken) ? p.technieken : (p.techniek ? [p.techniek] : []);
    return TECHNIEKEN.filter(function (t) { return sleutels.indexOf(t.sleutel) !== -1; });
  }

  // De mogelijke statussen en hun kleur.
  var STATUSSEN = ["nog niet gebouwd", "gebouwd", "afgerond"];
  var STATUS_KLEUR = {
    "nog niet gebouwd": "#E6801A",
    "gebouwd": "#4E7D42",
    "afgerond": "#3E6E8E"
  };

  // ---------------------------------------------------------------------
  // Opslag: eerst de gedeelde database (Firebase), anders lokaal op de
  // telefoon zelf zodat de module altijd blijft werken.
  // ---------------------------------------------------------------------
  var SDK_BASIS = "https://www.gstatic.com/firebasejs/10.14.1/";
  var LOKALE_SLEUTEL = "bouwploeg-draaiboek";

  var db = null;
  var fs = null;
  var modus = "lokaal";
  var posten = [];

  // Filters (leeg = alles tonen).
  var filterDag = "";
  var filterStatus = "";
  var filterHike = "";

  function nieuwId() {
    return "b_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  }

  // Verwijderen vraagt eerst om de gedeelde verwijdercode (zie index.html).
  // Wijzigen vraagt hier niet om.
  function magVerwijderen() {
    if (typeof window.__bpMagVerwijderen === "function") return window.__bpMagVerwijderen();
    return confirm("Verwijderen?");
  }

  function lokaalLezen() {
    try { return JSON.parse(localStorage.getItem(LOKALE_SLEUTEL) || "[]"); }
    catch (e) { return []; }
  }
  function lokaalSchrijven(lijst) {
    try { localStorage.setItem(LOKALE_SLEUTEL, JSON.stringify(lijst)); }
    catch (e) {}
  }

  async function verbind() {
    var config = window.__BOUWPLOEG_FIREBASE__;
    if (!config) { modus = "lokaal"; posten = lokaalLezen(); tekenLijst(); return; }
    try {
      var appMod = await import(SDK_BASIS + "firebase-app.js");
      fs = await import(SDK_BASIS + "firebase-firestore.js");
      // Eigen verbindingsnaam zodat we de app en het contactmenu niet storen.
      var app = appMod.initializeApp(config, "bpDraaiboek");
      db = fs.getFirestore(app);
      modus = "cloud";
      fs.onSnapshot(
        fs.collection(db, "draaiboek"),
        function (snap) {
          var lijst = [];
          snap.forEach(function (d) { lijst.push(d.data()); });
          posten = lijst;
          tekenLijst();
        },
        function () {
          modus = "lokaal";
          posten = lokaalLezen();
          tekenLijst();
        }
      );
    } catch (e) {
      modus = "lokaal";
      posten = lokaalLezen();
      tekenLijst();
    }
  }

  function bewaarPost(post) {
    if (modus === "cloud" && db && fs) {
      fs.setDoc(fs.doc(db, "draaiboek", post.id), post).catch(function () {
        alert("Opslaan mislukt. Controleer je internetverbinding.");
      });
    } else {
      var bestaat = posten.some(function (p) { return p.id === post.id; });
      posten = bestaat
        ? posten.map(function (p) { return p.id === post.id ? post : p; })
        : [post].concat(posten);
      lokaalSchrijven(posten);
      tekenLijst();
    }
  }

  function verwijderPost(id) {
    if (modus === "cloud" && db && fs) {
      fs.deleteDoc(fs.doc(db, "draaiboek", id)).catch(function () {
        alert("Verwijderen mislukt.");
      });
    } else {
      posten = posten.filter(function (p) { return p.id !== id; });
      lokaalSchrijven(posten);
      tekenLijst();
    }
  }

  // ---------------------------------------------------------------------
  // Coördinaat inlezen en kaartlinks maken.
  // Accepteert bijvoorbeeld "52.1234, 5.6789" of een geplakte kaart-link;
  // pakt simpelweg de eerste twee getallen.
  // ---------------------------------------------------------------------
  // Uit het ingevoerde veld een coördinaat halen. Dit kan een losse
  // coördinaat zijn ("52.1234, 5.6789") of een kaart-link waarin de
  // coördinaat staat (bijv. ...@52.1234,5.6789... of ...?q=52.1234,5.6789...).
  function leesCoord(tekst) {
    if (!tekst) return null;
    var s = String(tekst).trim();
    // Coördinaat uit een kaart-URL (na @ of na q=/query=/ll=/destination=/center=).
    var m = s.match(/(?:@|[?&](?:q|query|ll|destination|center|daddr)=)\s*(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/i);
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    // Anders alleen bij een losse invoer (geen webadres): eerste twee getallen.
    if (!/^https?:\/\//i.test(s)) {
      var n = s.match(/-?\d+(?:\.\d+)?/g);
      if (n && n.length >= 2) {
        var lat = parseFloat(n[0]), lng = parseFloat(n[1]);
        if (!isNaN(lat) && !isNaN(lng)) return { lat: lat, lng: lng };
      }
    }
    return null;
  }

  // Is de invoer een webadres (bijvoorbeeld een geplakte Google Maps link)?
  function isLink(tekst) {
    return /^https?:\/\//i.test(String(tekst || "").trim());
  }
  function googleMapsUrl(c) {
    return "https://www.google.com/maps/search/?api=1&query=" + c.lat + "," + c.lng;
  }
  function appleMapsUrl(c) {
    return "https://maps.apple.com/?q=" + c.lat + "," + c.lng;
  }

  // Bouwpostnummer tonen als bijvoorbeeld "C03": de hikeletter gevolgd door
  // het nummer met twee cijfers (dus een 0 ervoor als het onder de 10 is).
  // Alleen de hikes A t/m F krijgen een letter; bij Bouwploeg is er geen
  // letter, dan alleen het nummer (bijv. "01").
  function postLabel(p) {
    if (!p.post) return "";
    var letter = /^[A-F] hike$/.test(p.hike || "") ? p.hike.charAt(0) : "";
    var nr = String(p.post).trim();
    if (/^\d+$/.test(nr) && nr.length < 2) nr = "0" + nr;
    return letter + nr;
  }

  // Een gekozen foto verkleinen zodat hij niet te veel ruimte inneemt (net als
  // bij het materiaal). Geeft een verkleinde data-URL terug via de callback.
  function verkleinFoto(file, klaar) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1000, w = img.width, h = img.height;
        if (w > h && w > max) { h = Math.round(h * max / w); w = max; }
        else if (h >= w && h > max) { w = Math.round(w * max / h); h = max; }
        try {
          var canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          var q = 0.72, url = canvas.toDataURL("image/jpeg", q);
          // Nog verder verkleinen als hij toch nog te groot is.
          while (url.length > 500000 && q > 0.4) { q -= 0.1; url = canvas.toDataURL("image/jpeg", q); }
          klaar(url);
        } catch (e) { klaar(reader.result); }
      };
      img.onerror = function () { klaar(reader.result); };
      img.src = reader.result;
    };
    reader.onerror = function () { klaar(null); };
    reader.readAsDataURL(file);
  }

  // ---------------------------------------------------------------------
  // Vormgeving, in de kleuren van de app.
  // ---------------------------------------------------------------------
  var css = ""
    + "#dbk-list{padding-bottom:104px}"
    + ".dbk-filters{display:flex;gap:8px;flex-wrap:wrap;margin:2px 0 12px}"
    + ".dbk-filters select{flex:1 1 30%;min-width:104px;border-radius:999px;border:2px solid hsl(var(--border));"
    + "background:hsl(var(--card));color:hsl(var(--foreground));padding:8px 14px;font-size:14px;font-weight:600;"
    + "outline:none;font-family:inherit;cursor:pointer}"
    + ".dbk-filters select:focus{border-color:hsl(var(--accent))}"
    + ".dbk-dag{margin:20px 2px 10px;padding-bottom:6px;border-bottom:2px solid hsl(var(--border));"
    + "font-size:15px;font-weight:800;text-transform:capitalize;color:hsl(var(--foreground))}"
    + ".dbk-dag:first-child{margin-top:2px}"
    + ".dbk-kaart{display:flex;align-items:stretch;gap:0;background:hsl(var(--card));"
    + "border:1px solid hsl(var(--border));border-radius:var(--radius);overflow:hidden;margin-bottom:10px;"
    + "cursor:pointer;text-align:left;width:100%;padding:0;font-family:inherit}"
    + ".dbk-kleurbalk{width:6px;flex:none}"
    + ".dbk-kaart .binnen{flex:1;min-width:0;padding:11px 13px}"
    + ".dbk-regel1{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px}"
    + ".dbk-tijd{font-weight:800;font-size:14px;color:hsl(var(--foreground))}"
    + ".dbk-hikelabel{font-size:12px;font-weight:700;padding:1px 7px;border-radius:999px;color:#fff}"
    + ".dbk-postnr{font-size:12px;color:hsl(var(--muted-foreground));font-weight:600}"
    + ".dbk-activiteit{font-weight:700;font-size:15px;color:hsl(var(--foreground))}"
    + ".dbk-activiteit.dbk-af{text-decoration:line-through;color:hsl(var(--muted-foreground))}"
    + ".dbk-locatie{font-size:13px;color:hsl(var(--muted-foreground));margin-top:1px}"
    + ".dbk-status{display:inline-block;margin-top:6px;font-size:12px;font-weight:700;"
    + "padding:2px 9px;border-radius:999px;color:#fff}"
    + ".dbk-techlabel{display:inline-flex;align-items:center;gap:5px;margin:6px 0 0 6px;font-size:12px;font-weight:700;"
    + "padding:2px 9px;border-radius:999px;border:1px solid hsl(var(--border));color:hsl(var(--foreground));"
    + "background:hsl(var(--muted))}"
    + ".dbk-techlabel svg{flex:none}"
    + ".dbk-techkop{display:flex;align-items:baseline;justify-content:space-between;gap:10px}"
    + ".dbk-techkop .hint{font-size:12px;color:hsl(var(--muted-foreground));font-weight:600}"
    + ".dbk-techbeeld{display:block;width:100%;padding:0;margin-top:8px;border:1px solid hsl(var(--border));"
    + "border-radius:12px;overflow:hidden;background:#fff;cursor:zoom-in}"
    + ".dbk-techbeeld img{display:block;width:100%;height:auto}"
    + ".dbk-techvoorbeeld{display:block;width:100%;max-height:180px;object-fit:contain;margin-top:8px;"
    + "border:1px solid hsl(var(--border));border-radius:12px;background:#fff}"
    + ".dbk-techuitleg{font-size:14px;line-height:1.45;color:hsl(var(--muted-foreground));margin:6px 0 0;font-weight:500}"
    + ".dbk-techlabels{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}"
    + ".dbk-techlabels .dbk-status{margin-top:0}"
    + ".dbk-techlabels .dbk-techlabel{margin:0}"
    + ".dbk-techkeuze{display:flex;flex-wrap:wrap;gap:8px}"
    + ".dbk-techchip{display:inline-flex;align-items:center;gap:6px;border:2px solid hsl(var(--border));"
    + "background:hsl(var(--card));color:hsl(var(--foreground));border-radius:999px;padding:8px 14px;"
    + "font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}"
    + ".dbk-techchip.aan{background:hsl(var(--primary));border-color:hsl(var(--primary));color:hsl(var(--primary-foreground))}"
    + ".dbk-techchip .vink{display:none}"
    + ".dbk-techchip.aan .vink{display:inline;font-size:14px;line-height:1}"
    + ".dbk-techgekozen{display:flex;gap:12px;align-items:flex-start;margin-top:10px;padding:10px;"
    + "border:1px solid hsl(var(--border));border-radius:12px;background:hsl(var(--card))}"
    + ".dbk-techgekozen img{width:72px;height:72px;object-fit:contain;background:#fff;border-radius:8px;flex:none;"
    + "border:1px solid hsl(var(--border))}"
    + ".dbk-techgekozen .naam{font-weight:700;font-size:15px}"
    + ".dbk-techgekozen .dbk-techuitleg{margin-top:2px;font-size:13px}"
    + ".dbk-techblok{margin-top:12px}"
    + ".dbk-techblok:first-of-type{margin-top:4px}"
    + ".dbk-zoom .body{padding:0;background:#fff}"
    + ".dbk-zoom img{display:block;width:100%;height:auto;cursor:zoom-in}"
    + ".dbk-zoom.groot img{width:200%;max-width:none;cursor:zoom-out}"
    + ".dbk-zoom .kop .hint{font-size:12px;color:hsl(var(--muted-foreground));font-weight:600}"
    + ".dbk-leeg{text-align:center;color:hsl(var(--muted-foreground));margin-top:50px;font-size:15px}"
    + ".dbk-thumb{width:64px;height:64px;object-fit:cover;flex:none;align-self:center;border-radius:10px;margin:8px 10px 8px 4px}"
    + ".dbk-detailfoto{width:100%;border-radius:12px;margin-bottom:16px;display:block}"
    + ".dbk-foto-knoppen{display:flex;gap:8px;flex-wrap:wrap}"
    + ".dbk-fotoknop{border:1px solid hsl(var(--input));border-radius:12px;background:hsl(var(--card));"
    + "color:hsl(var(--foreground));padding:12px 14px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit}"
    + "[data-fotopreview]{width:100%;max-height:220px;object-fit:cover;border-radius:12px;margin-bottom:10px;display:block}"
    + "#dbk-plus{position:fixed;right:20px;bottom:calc(env(safe-area-inset-bottom) + 80px);"
    + "width:56px;height:56px;border-radius:50%;border:0;background:hsl(var(--accent));color:#3a2c07;"
    + "font-size:32px;line-height:1;display:none;align-items:center;justify-content:center;cursor:pointer;"
    + "box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:40}"
    + "#dbk-plus.zichtbaar{display:flex}"
    // Detail- en invulscherm delen dezelfde vol-scherm-stijl.
    + ".dbk-scherm{position:fixed;inset:0;z-index:60;display:none;flex-direction:column;"
    + "background:hsl(var(--background));color:hsl(var(--foreground));font-family:inherit}"
    + ".dbk-scherm.open{display:flex}"
    + ".dbk-scherm .kop{position:sticky;top:0;display:flex;align-items:center;gap:12px;"
    + "padding:calc(env(safe-area-inset-top) + 14px) 16px 14px;background:hsl(var(--card));"
    + "border-bottom:1px solid hsl(var(--border))}"
    + ".dbk-scherm .kop h2{font-size:17px;font-weight:800;margin:0;flex:1}"
    + ".dbk-scherm .terug{border:0;background:transparent;color:hsl(var(--muted-foreground));"
    + "font-size:22px;padding:6px;cursor:pointer;line-height:1}"
    + ".dbk-scherm .body{flex:1;overflow-y:auto;padding:18px 16px}"
    // Detailweergave
    + ".dbk-detailrij{margin-bottom:14px}"
    + ".dbk-detailrij .label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;"
    + "color:hsl(var(--muted-foreground));margin-bottom:2px}"
    + ".dbk-detailrij .waarde{font-size:16px;color:hsl(var(--foreground));white-space:pre-wrap}"
    + ".dbk-detailduo{display:flex;gap:16px;margin-bottom:14px}"
    + ".dbk-detailduo>div{flex:1;min-width:0}"
    + ".dbk-detailduo .label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;"
    + "color:hsl(var(--muted-foreground));margin-bottom:2px}"
    + ".dbk-detailduo .waarde{font-size:16px;color:hsl(var(--foreground));white-space:pre-wrap}"
    + ".dbk-kaartknoppen{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}"
    + ".dbk-kaartknop{border:1px solid hsl(var(--border));border-radius:10px;background:hsl(var(--card));"
    + "color:hsl(var(--foreground));padding:9px 12px;font-size:14px;font-weight:600;cursor:pointer;"
    + "text-decoration:none;display:inline-block}"
    // Formuliervelden
    + ".dbk-veld{display:block;margin-bottom:16px}"
    + ".dbk-veld span{display:block;font-weight:700;font-size:14px;margin-bottom:6px}"
    + ".dbk-veld input,.dbk-veld select,.dbk-veld textarea{width:100%;box-sizing:border-box;border-radius:12px;"
    + "border:1px solid hsl(var(--input));background:hsl(var(--card));color:hsl(var(--foreground));"
    + "padding:12px 14px;font-size:16px;outline:none;font-family:inherit}"
    + ".dbk-veld textarea{min-height:80px;resize:vertical}"
    + ".dbk-veld input:focus,.dbk-veld select:focus,.dbk-veld textarea:focus{border-color:hsl(var(--accent))}"
    + ".dbk-acties{display:flex;gap:10px;padding:16px;border-top:1px solid hsl(var(--border));background:hsl(var(--card))}"
    + ".dbk-primair{flex:1;border:0;border-radius:14px;background:hsl(var(--primary));"
    + "color:hsl(var(--primary-foreground));font-weight:800;font-size:16px;padding:14px;cursor:pointer}"
    + ".dbk-verwijder{border:0;border-radius:14px;background:hsl(var(--destructive));color:#fff;"
    + "font-weight:700;padding:14px 16px;cursor:pointer}";

  // ---------------------------------------------------------------------
  // Schermen opbouwen (eenmalig).
  // ---------------------------------------------------------------------
  var listRoot, body, plus, detail, formScherm;
  var vDag, vTijd, vHike, vPost, vLocatie, vActiviteit, vCoord, vStatus, vBijz, vVerwijder, formTitel, bewerktId;
  var techKeuze, techGekozen, zoomScherm, gekozenTech = [];
  var huidigeFoto = "", fotoPreview, fotoInput, fotoWeg;

  // De fotovoorbeeldweergave in het formulier bijwerken.
  function toonFotoPreview() {
    if (!fotoPreview) return;
    if (huidigeFoto) {
      fotoPreview.src = huidigeFoto;
      fotoPreview.style.display = "block";
      fotoWeg.style.display = "block";
    } else {
      fotoPreview.removeAttribute("src");
      fotoPreview.style.display = "none";
      fotoWeg.style.display = "none";
    }
  }

  function maakSelect(opties, metLeeg, leegLabel) {
    var sel = document.createElement("select");
    if (metLeeg) {
      var o0 = document.createElement("option");
      o0.value = ""; o0.textContent = leegLabel || "Alle";
      sel.appendChild(o0);
    }
    opties.forEach(function (op) {
      var o = document.createElement("option");
      o.value = op; o.textContent = op;
      sel.appendChild(o);
    });
    return sel;
  }

  // Technieken kiezen: elke techniek is een knopje dat je aan en uit tikt,
  // zodat je er meerdere tegelijk kunt kiezen.
  function tekenTechKeuze() {
    if (!techKeuze) return;
    techKeuze.innerHTML = "";
    TECHNIEKEN.forEach(function (t) {
      var aan = gekozenTech.indexOf(t.sleutel) !== -1;
      var knop = document.createElement("button");
      knop.type = "button";
      knop.className = "dbk-techchip" + (aan ? " aan" : "");
      knop.setAttribute("aria-pressed", aan ? "true" : "false");
      knop.innerHTML = '<span class="vink" aria-hidden="true">\u2713</span>';
      knop.appendChild(document.createTextNode(t.naam));
      knop.addEventListener("click", function () {
        var i = gekozenTech.indexOf(t.sleutel);
        if (i === -1) gekozenTech.push(t.sleutel); else gekozenTech.splice(i, 1);
        tekenTechKeuze();
      });
      techKeuze.appendChild(knop);
    });

    // Onder de knopjes: per gekozen techniek een klein voorbeeld met uitleg.
    techGekozen.innerHTML = "";
    TECHNIEKEN.forEach(function (t) {
      if (gekozenTech.indexOf(t.sleutel) === -1) return;
      var rij = document.createElement("div");
      rij.className = "dbk-techgekozen";
      var img = document.createElement("img");
      img.src = t.afbeelding; img.alt = t.naam;
      var tekst = document.createElement("div");
      var naam = document.createElement("div");
      naam.className = "naam"; naam.textContent = t.naam;
      tekst.appendChild(naam);
      if (t.beschrijving) {
        var u = document.createElement("p");
        u.className = "dbk-techuitleg"; u.textContent = t.beschrijving;
        tekst.appendChild(u);
      }
      rij.appendChild(img); rij.appendChild(tekst);
      techGekozen.appendChild(rij);
    });
  }

  // Klein knoop-icoontje voor het label in de lijst.
  var KNOOP_ICOON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + 'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/></svg>';

  // De afbeelding groot tonen. Tik op de afbeelding om nog verder in te zoomen.
  function openZoom(t) {
    zoomScherm.querySelector("[data-zoomtitel]").textContent = t.naam;
    var img = zoomScherm.querySelector("[data-zoombeeld]");
    img.src = t.afbeelding;
    img.alt = t.naam;
    zoomScherm.classList.remove("groot");
    zoomScherm.querySelector(".body").scrollTop = 0;
    zoomScherm.querySelector(".body").scrollLeft = 0;
    zoomScherm.classList.add("open");
  }

  function bouwSchermen() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    // Lijst + filters (komt in het middendeel #dbk-mount)
    listRoot = document.createElement("div");
    listRoot.id = "dbk-list";

    var filterbalk = document.createElement("div");
    filterbalk.className = "dbk-filters";
    var fDag = maakSelect(DAGEN, true, "Alle dagen");
    var fStatus = maakSelect(STATUSSEN, true, "Alle statussen");
    var fHike = maakSelect(HIKES, true, "Alle hikes");
    fDag.addEventListener("change", function () { filterDag = fDag.value; tekenLijst(); });
    fStatus.addEventListener("change", function () { filterStatus = fStatus.value; tekenLijst(); });
    fHike.addEventListener("change", function () { filterHike = fHike.value; tekenLijst(); });
    filterbalk.appendChild(fDag);
    filterbalk.appendChild(fStatus);
    filterbalk.appendChild(fHike);

    body = document.createElement("div");
    body.id = "dbk-body";

    listRoot.appendChild(filterbalk);
    listRoot.appendChild(body);

    // Plusknop
    plus = document.createElement("button");
    plus.id = "dbk-plus";
    plus.setAttribute("aria-label", "Bouwpost toevoegen");
    plus.textContent = "+";
    plus.addEventListener("click", function () { openForm(null); });
    document.body.appendChild(plus);

    // Detailscherm
    detail = document.createElement("div");
    detail.className = "dbk-scherm";
    detail.innerHTML =
      '<div class="kop"><button class="terug" data-terug aria-label="Terug">&larr;</button>'
      + '<h2>Bouwpost</h2></div><div class="body" data-detailbody></div>'
      + '<div class="dbk-acties"><button class="dbk-primair" data-aanpassen>Aanpassen</button></div>';
    document.body.appendChild(detail);
    detail.querySelector("[data-terug]").addEventListener("click", function () {
      detail.classList.remove("open");
    });

    // Invulscherm
    formScherm = document.createElement("div");
    formScherm.className = "dbk-scherm";
    formScherm.innerHTML =
      '<div class="kop"><button class="terug" data-terug aria-label="Terug">&larr;</button>'
      + '<h2 data-titel>Nieuwe bouwpost</h2></div>'
      + '<div class="body">'
      + '  <label class="dbk-veld"><span>Dag</span><span data-dag></span></label>'
      + '  <label class="dbk-veld"><span>Tijdstip</span><input data-tijd type="time"></label>'
      + '  <label class="dbk-veld"><span>Hike</span><span data-hike></span></label>'
      + '  <label class="dbk-veld"><span>Bouwpost nummer</span><input data-post type="text" inputmode="numeric" placeholder="Bijv. 3"></label>'
      + '  <label class="dbk-veld"><span>Locatie</span><input data-locatie type="text" placeholder="Naam of omschrijving van de locatie"></label>'
      + '  <label class="dbk-veld"><span>Activiteit</span><input data-activiteit type="text" placeholder="Wat gebeurt hier"></label>'
      + '  <div class="dbk-veld"><span>Foto</span>'
      + '    <img data-fotopreview alt="" style="display:none">'
      + '    <div class="dbk-foto-knoppen">'
      + '      <button type="button" class="dbk-fotoknop" data-fotokies>Foto toevoegen</button>'
      + '      <button type="button" class="dbk-fotoknop" data-fotoweg style="display:none">Verwijderen</button>'
      + '    </div>'
      + '    <input data-fotoinput type="file" accept="image/*" style="display:none">'
      + '  </div>'
      + '  <label class="dbk-veld"><span>Co\u00f6rdinaat of Google Maps-link</span><input data-coord type="text" placeholder="52.1234, 5.6789 of een kaart-link"></label>'
      + '  <label class="dbk-veld"><span>Status</span><span data-status></span></label>'
      + '  <div class="dbk-veld"><span>Techniek</span>'
      + '    <div class="dbk-techkeuze" data-techkeuze></div>'
      + '    <div data-techgekozen></div></div>'
      + '  <label class="dbk-veld"><span>Afspraken en bijzonderheden</span><textarea data-bijz placeholder="Afspraken en bijzonderheden"></textarea></label>'
      + '</div>'
      + '<div class="dbk-acties">'
      + '  <button class="dbk-verwijder" data-verwijder style="display:none">Verwijderen</button>'
      + '  <button class="dbk-primair" data-bewaar>Opslaan</button>'
      + '</div>';
    document.body.appendChild(formScherm);

    // Selects in het formulier plaatsen
    vDag = maakSelect(DAGEN, false);
    vDag.setAttribute("data-dag", "");
    formScherm.querySelector("[data-dag]").replaceWith(vDag);
    vHike = maakSelect(HIKES, false);
    vHike.setAttribute("data-hike", "");
    formScherm.querySelector("[data-hike]").replaceWith(vHike);
    vStatus = maakSelect(STATUSSEN, true, "Geen status");
    vStatus.setAttribute("data-status", "");
    formScherm.querySelector("[data-status]").replaceWith(vStatus);

    techKeuze = formScherm.querySelector("[data-techkeuze]");
    techGekozen = formScherm.querySelector("[data-techgekozen]");

    // Vergrootscherm voor de techniekafbeelding
    zoomScherm = document.createElement("div");
    zoomScherm.className = "dbk-scherm dbk-zoom";
    zoomScherm.style.zIndex = "70";
    zoomScherm.innerHTML =
      '<div class="kop"><button class="terug" data-terug aria-label="Terug">&larr;</button>'
      + '<h2 data-zoomtitel>Techniek</h2><span class="hint">Tik om in te zoomen</span></div>'
      + '<div class="body"><img data-zoombeeld alt=""></div>';
    document.body.appendChild(zoomScherm);
    zoomScherm.querySelector("[data-terug]").addEventListener("click", function () {
      zoomScherm.classList.remove("open");
    });
    zoomScherm.querySelector("[data-zoombeeld]").addEventListener("click", function (ev) {
      var bodyEl = zoomScherm.querySelector(".body");
      var img = ev.currentTarget;
      var rect = img.getBoundingClientRect();
      var fx = (ev.clientX - rect.left) / rect.width;
      var fy = (ev.clientY - rect.top) / rect.height;
      var wordtGroot = !zoomScherm.classList.contains("groot");
      zoomScherm.classList.toggle("groot");
      if (wordtGroot) {
        // Inzoomen rond het punt waar getikt is.
        bodyEl.scrollLeft = Math.max(0, fx * img.offsetWidth - bodyEl.clientWidth / 2);
        bodyEl.scrollTop = Math.max(0, fy * img.offsetHeight - bodyEl.clientHeight / 2);
      } else {
        bodyEl.scrollLeft = 0;
      }
    });

    vTijd = formScherm.querySelector("[data-tijd]");
    vPost = formScherm.querySelector("[data-post]");
    vLocatie = formScherm.querySelector("[data-locatie]");
    vActiviteit = formScherm.querySelector("[data-activiteit]");
    vCoord = formScherm.querySelector("[data-coord]");
    vBijz = formScherm.querySelector("[data-bijz]");
    vVerwijder = formScherm.querySelector("[data-verwijder]");
    formTitel = formScherm.querySelector("[data-titel]");

    // Fotoveld bedienen
    fotoPreview = formScherm.querySelector("[data-fotopreview]");
    fotoInput = formScherm.querySelector("[data-fotoinput]");
    fotoWeg = formScherm.querySelector("[data-fotoweg]");
    formScherm.querySelector("[data-fotokies]").addEventListener("click", function () {
      fotoInput.click();
    });
    fotoInput.addEventListener("change", function () {
      var f = fotoInput.files && fotoInput.files[0];
      if (!f) return;
      verkleinFoto(f, function (url) {
        if (url) { huidigeFoto = url; toonFotoPreview(); }
      });
      fotoInput.value = "";
    });
    fotoWeg.addEventListener("click", function () { huidigeFoto = ""; toonFotoPreview(); });

    formScherm.querySelector("[data-terug]").addEventListener("click", function () {
      formScherm.classList.remove("open");
    });
    formScherm.querySelector("[data-bewaar]").addEventListener("click", bewaarVanuitForm);
    vVerwijder.addEventListener("click", function () {
      if (bewerktId && magVerwijderen()) {
        verwijderPost(bewerktId);
        formScherm.classList.remove("open");
        detail.classList.remove("open");
      }
    });

    // Meebewegen met het tabblad.
    function synchroniseer() {
      var mount = document.getElementById("dbk-mount");
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
  // De lijst tekenen, gefilterd, gegroepeerd per dag en gesorteerd op tijd.
  // ---------------------------------------------------------------------
  function tekenLijst() {
    if (!body) return;
    body.innerHTML = "";

    var zichtbaar = posten.filter(function (p) {
      if (filterDag && p.dag !== filterDag) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterHike && p.hike !== filterHike) return false;
      return true;
    });

    if (!zichtbaar.length) {
      var leeg = document.createElement("p");
      leeg.className = "dbk-leeg";
      leeg.textContent = posten.length
        ? "Geen bouwposten die aan de filters voldoen."
        : "Nog geen bouwposten. Tik op + om er een toe te voegen.";
      body.appendChild(leeg);
      return;
    }

    DAGEN.forEach(function (dag) {
      var groep = zichtbaar
        .filter(function (p) { return p.dag === dag; })
        .sort(function (a, b) {
          return (a.tijd || "99:99").localeCompare(b.tijd || "99:99");
        });
      if (!groep.length) return;

      var kop = document.createElement("div");
      kop.className = "dbk-dag";
      kop.textContent = dag;
      body.appendChild(kop);

      groep.forEach(function (p) {
        body.appendChild(maakKaart(p));
      });
    });
  }

  function maakKaart(p) {
    var kleur = HIKE_KLEUR[p.hike] || "#6B7280";
    var kaart = document.createElement("button");
    kaart.className = "dbk-kaart";
    kaart.type = "button";

    var balk = document.createElement("div");
    balk.className = "dbk-kleurbalk";
    balk.style.background = kleur;

    var binnen = document.createElement("div");
    binnen.className = "binnen";

    var regel1 = document.createElement("div");
    regel1.className = "dbk-regel1";
    if (p.tijd) {
      var t = document.createElement("span");
      t.className = "dbk-tijd"; t.textContent = p.tijd;
      regel1.appendChild(t);
    }
    if (p.hike) {
      var h = document.createElement("span");
      h.className = "dbk-hikelabel";
      h.style.background = kleur;
      h.textContent = p.hike;
      regel1.appendChild(h);
    }
    if (p.post) {
      var nr = document.createElement("span");
      nr.className = "dbk-postnr";
      nr.textContent = postLabel(p);
      regel1.appendChild(nr);
    }
    binnen.appendChild(regel1);

    if (p.activiteit) {
      var act = document.createElement("div");
      act.className = "dbk-activiteit" + (p.status === "afgerond" ? " dbk-af" : "");
      act.textContent = p.activiteit;
      binnen.appendChild(act);
    }
    if (p.locatie) {
      var loc = document.createElement("div");
      loc.className = "dbk-locatie";
      loc.textContent = p.locatie;
      binnen.appendChild(loc);
    }
    var tech = techniekenVan(p);
    if (p.status || tech.length) {
      var labels = document.createElement("div");
      labels.className = "dbk-techlabels";
      if (p.status) {
        var st = document.createElement("span");
        st.className = "dbk-status";
        st.style.background = STATUS_KLEUR[p.status] || "#6B7280";
        st.textContent = p.status;
        labels.appendChild(st);
      }
      tech.forEach(function (t) {
        var tl = document.createElement("span");
        tl.className = "dbk-techlabel";
        tl.innerHTML = KNOOP_ICOON;
        tl.appendChild(document.createTextNode(t.naam));
        labels.appendChild(tl);
      });
      binnen.appendChild(labels);
    }

    kaart.appendChild(balk);
    kaart.appendChild(binnen);
    if (p.foto) {
      var thumb = document.createElement("img");
      thumb.className = "dbk-thumb";
      thumb.src = p.foto;
      thumb.alt = "";
      kaart.appendChild(thumb);
    }
    kaart.addEventListener("click", function () { openDetail(p); });
    return kaart;
  }

  // ---------------------------------------------------------------------
  // Detailweergave van één bouwpost.
  // ---------------------------------------------------------------------
  function detailRij(label, waarde) {
    var rij = document.createElement("div");
    rij.className = "dbk-detailrij";
    var l = document.createElement("div");
    l.className = "label"; l.textContent = label;
    var w = document.createElement("div");
    w.className = "waarde"; w.textContent = waarde;
    rij.appendChild(l); rij.appendChild(w);
    return rij;
  }

  // Twee waarden naast elkaar tonen in het detailscherm.
  function detailCel(label, waarde) {
    var d = document.createElement("div");
    var l = document.createElement("div");
    l.className = "label"; l.textContent = label;
    var w = document.createElement("div");
    w.className = "waarde"; w.textContent = (waarde !== "" && waarde != null) ? waarde : "\u2014";
    d.appendChild(l); d.appendChild(w);
    return d;
  }
  function detailDuo(label1, waarde1, label2, waarde2) {
    var row = document.createElement("div");
    row.className = "dbk-detailduo";
    row.appendChild(detailCel(label1, waarde1));
    row.appendChild(detailCel(label2, waarde2));
    return row;
  }

  function openDetail(p) {
    var b = detail.querySelector("[data-detailbody]");
    b.innerHTML = "";

    // 1. Foto
    if (p.foto) {
      var f = document.createElement("img");
      f.className = "dbk-detailfoto";
      f.src = p.foto;
      f.alt = "";
      b.appendChild(f);
    }

    // 2. Activiteit en bouwpost nummer naast elkaar
    var duo1 = detailDuo("Activiteit", p.activiteit, "Bouwpost nummer", postLabel(p));
    // De hikekleur meegeven aan het bouwpost nummer, zodat de hike zichtbaar blijft.
    var nrWaarde = duo1.querySelectorAll(".waarde")[1];
    if (p.hike && postLabel(p)) {
      nrWaarde.style.color = HIKE_KLEUR[p.hike] || "";
      nrWaarde.style.fontWeight = "700";
    }
    b.appendChild(duo1);

    // 3. Dag en tijdstip naast elkaar
    b.appendChild(detailDuo("Dag", p.dag, "Tijdstip", p.tijd));

    // 4. Locatie
    if (p.locatie) b.appendChild(detailRij("Locatie", p.locatie));

    // 5. Status
    if (p.status) {
      var rijS = detailRij("Status", p.status);
      rijS.querySelector(".waarde").style.color = STATUS_KLEUR[p.status] || "";
      rijS.querySelector(".waarde").style.fontWeight = "700";
      b.appendChild(rijS);
    }

    // 6. Afspraken en bijzonderheden
    if (p.bijzonderheden) b.appendChild(detailRij("Afspraken en bijzonderheden", p.bijzonderheden));

    // 7. Locatie op kaart: werkt met een losse coördinaat OF een geplakte link.
    if (p.coord) {
      var c = leesCoord(p.coord);
      var rij = document.createElement("div");
      rij.className = "dbk-detailrij";
      var l = document.createElement("div");
      l.className = "label"; l.textContent = "Locatie op kaart";
      rij.appendChild(l);

      var kn = document.createElement("div");
      kn.className = "dbk-kaartknoppen";
      if (c) {
        // Er is een coördinaat bekend: keuze uit Google Maps of Apple Maps.
        kn.appendChild(kaartLink("Google Maps", googleMapsUrl(c)));
        kn.appendChild(kaartLink("Apple Maps", appleMapsUrl(c)));
      } else if (isLink(p.coord)) {
        // Een geplakte link (meestal Google Maps): open die rechtstreeks.
        kn.appendChild(kaartLink("Open in kaart", String(p.coord).trim()));
      } else {
        // Niet te herkennen: toon dan gewoon de ingevoerde tekst.
        var w = document.createElement("div");
        w.className = "waarde"; w.textContent = p.coord;
        rij.appendChild(w);
      }
      if (kn.children.length) rij.appendChild(kn);
      b.appendChild(rij);
    }

    // 8. Technieken, elk met de uitleg als afbeelding. Tik om te vergroten.
    var techLijst = techniekenVan(p);
    if (techLijst.length) {
      var rijT = document.createElement("div");
      rijT.className = "dbk-detailrij";
      var kopT = document.createElement("div");
      kopT.className = "dbk-techkop";
      var lT = document.createElement("div");
      lT.className = "label"; lT.textContent = techLijst.length > 1 ? "Technieken" : "Techniek";
      var hT = document.createElement("span");
      hT.className = "hint"; hT.textContent = "Tik om te vergroten";
      kopT.appendChild(lT); kopT.appendChild(hT);
      rijT.appendChild(kopT);
      techLijst.forEach(function (techD) {
        var blok = document.createElement("div");
        blok.className = "dbk-techblok";
        var wT = document.createElement("div");
        wT.className = "waarde"; wT.style.fontWeight = "700"; wT.textContent = techD.naam;
        blok.appendChild(wT);
        if (techD.beschrijving) {
          var uT = document.createElement("p");
          uT.className = "dbk-techuitleg";
          uT.textContent = techD.beschrijving;
          blok.appendChild(uT);
        }
        var knopT = document.createElement("button");
        knopT.type = "button";
        knopT.className = "dbk-techbeeld";
        knopT.setAttribute("aria-label", techD.naam + " vergroten");
        var imgT = document.createElement("img");
        imgT.src = techD.afbeelding;
        imgT.alt = techD.naam;
        imgT.loading = "lazy";
        knopT.appendChild(imgT);
        knopT.addEventListener("click", function () { openZoom(techD); });
        blok.appendChild(knopT);
        rijT.appendChild(blok);
      });
      b.appendChild(rijT);
    }

    detail.querySelector("[data-aanpassen]").onclick = function () {
      detail.classList.remove("open");
      openForm(p);
    };
    b.scrollTop = 0;
    detail.classList.add("open");
  }

  function kaartLink(tekst, url) {
    var a = document.createElement("a");
    a.className = "dbk-kaartknop";
    a.textContent = tekst;
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  // ---------------------------------------------------------------------
  // Invulscherm (toevoegen/wijzigen).
  // ---------------------------------------------------------------------
  function openForm(post) {
    bewerktId = post ? post.id : null;
    formTitel.textContent = post ? "Bouwpost wijzigen" : "Nieuwe bouwpost";
    vDag.value = post ? (post.dag || DAGEN[0]) : DAGEN[0];
    vTijd.value = post ? (post.tijd || "") : "";
    vHike.value = post ? (post.hike || HIKES[0]) : HIKES[0];
    vPost.value = post ? (post.post || "") : "";
    vLocatie.value = post ? (post.locatie || "") : "";
    vActiviteit.value = post ? (post.activiteit || "") : "";
    vCoord.value = post ? (post.coord || "") : "";
    vStatus.value = post ? (post.status || "") : "";
    gekozenTech = post ? techniekenVan(post).map(function (t) { return t.sleutel; }) : [];
    tekenTechKeuze();
    vBijz.value = post ? (post.bijzonderheden || "") : "";
    vVerwijder.style.display = post ? "block" : "none";
    huidigeFoto = post ? (post.foto || "") : "";
    toonFotoPreview();
    formScherm.classList.add("open");
  }

  function bewaarVanuitForm() {
    var activiteit = vActiviteit.value.trim();
    var locatie = vLocatie.value.trim();
    if (!activiteit && !locatie) {
      alert("Vul minstens een activiteit of een locatie in.");
      return;
    }
    var post = {
      id: bewerktId || nieuwId(),
      dag: vDag.value || DAGEN[0],
      tijd: vTijd.value || "",
      hike: vHike.value || "Bouwploeg",
      post: vPost.value.trim(),
      locatie: locatie,
      activiteit: activiteit,
      coord: vCoord.value.trim(),
      status: vStatus.value || "",
      technieken: gekozenTech.slice(),
      bijzonderheden: vBijz.value.trim(),
      foto: huidigeFoto || "",
      updatedAt: Date.now()
    };
    if (!bewerktId) post.createdAt = Date.now();
    bewaarPost(post);
    formScherm.classList.remove("open");
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

