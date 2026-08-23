# Bouwploeg materiaal - Projectlogboek

Dit bestand is het "recept" van de app. Het beschrijft wat de app is, hoe hij in
elkaar zit en welke keuzes er gemaakt zijn. Bewaar dit samen met de app.
Als je later iets wilt aanpassen, geef dit bestand er dan bij, dan is meteen
duidelijk hoe alles bedoeld is.

Laatst bijgewerkt: 23 augustus 2026 (draaiboekmenu toegevoegd)

---

## 1. Wat is de app

Een gedeelde lijst om geleend materiaal van de bouwploeg bij te houden.
Ongeveer acht gebruikers. Werkt op Android en iPhone doordat je hem als webapp
(PWA) aan je beginscherm toevoegt. De lijst is voor iedereen hetzelfde, want de
gegevens staan in een gedeelde database.

Live adres: https://ne6us.github.io/bouwploeg-materiaal/

---

## 2. Waar staat de app

De app draait via GitHub Pages vanuit één GitHub-repository. In die repository
horen deze bestanden te staan, allemaal naast elkaar in dezelfde map:

- index.html               De hele app in één bestand (dit is de gebouwde versie)
- manifest.webmanifest     Zorgt dat Android hem als app kan installeren
- sw.js                    Service worker, nodig voor de installatiemelding
- icon-192.png             App-icoon klein
- icon-512.png             App-icoon groot

Aanbevolen om ook op GitHub te bewaren (in een map "bron"):

- contact-broncode.js      Leesbare broncode van het contactmenu
- draaiboek-broncode.js    Leesbare broncode van het draaiboekmenu

Extra bewaard in deze backup, hoeven NIET op GitHub:

- app-icoon-master-1024.png   Het originele icoon op vol formaat, om nieuwe
                              icoonmaten uit te maken als dat ooit nodig is
- PROJECTLOGBOEK.md           Dit bestand

---

## 3. Belangrijk om te weten over de code

De index.html is een GEBOUWDE (samengeperste) versie. Dat is voor een mens vrijwel
onleesbaar. De oorspronkelijke leesbare broncode is niet als los bestand bewaard
gebleven. Daarom geldt vanaf nu de afspraak hieronder in punt 8.

De app is oorspronkelijk gemaakt met React en TypeScript en daarna samengeperst
tot dat ene HTML-bestand. De database is Firebase (van Google), met Firestore voor
de lijst en Storage voor de foto's. Firebase wordt vanaf internet ingeladen, dus
de app heeft internet nodig om de actuele lijst te tonen.

---

## 4. De categorieen (met kleur)

Elke categorie heeft een eigen kleur en icoon in de app.

| Categorie          | interne naam  | kleur    |
|--------------------|---------------|----------|
| Touw               | touw          | #A9762F  |
| Klimmateriaal      | klimmateriaal | #C15A38  |
| Spanmateriaal      | spanmateriaal | #3E6E8E  |
| Vlotmateriaal      | vlotmateriaal | #2F8F9D  |
| Banden en slings   | banden        | #8A5A9E  |
| D-ringen           | dringen       | #4E7D42  |
| Ladders            | ladders       | #B8902E  |
| Overige            | overige       | #6B7280  |

Let op: het D-ringen icoon is geen lijn-icoon maar een aparte afbeelding (een
witte vorm die de app groen inkleurt). Zit vast in de index.html.

---

## 5. Geleend van (de opties)

H3, HKG, Ada's hoeve, VLG, Bouwploeg

---

## 6. Statussen per item

- Ingecheckt (groen) / Uitgecheckt (oranje)
- Gebruikt (blauw) / Niet gebruikt (geel)

Verder per item: foto (wordt automatisch verkleind), omschrijving, categorie,
geleend van, aantal, naam invoerder, notities.

---

## 7. De menu's / schermen

1. Nieuw materiaal toevoegen
2. Materiaal (overzicht met filters en print-optie)
3. Inlever/afstreeplijst (met uitcheck-knop per item)
4. Draaiboek (bouwposten per dag, met filters en kaartkoppeling)
5. Contact (contactpersonen per hike, met belknop)

Let op de volgorde in de menubalk onderin: Toevoegen, Overzicht, Inleveren,
Draaiboek, Contact.

---

## 8. De belangrijkste afspraak voor de toekomst

Om aanpassen makkelijk te houden, geldt vanaf nu:

> Elke keer dat de app aangepast wordt, bewaren we NIET alleen de gebouwde
> index.html, maar OOK de leesbare broncode, op GitHub in een aparte map
> (bijvoorbeeld een map met de naam "bron").

Zo raakt het recept nooit meer kwijt en blijft elke volgende aanpassing eenvoudig.

Wil je iets aanpassen? Geef dan door wat je wilt, samen met dit logboek. Dan wordt
de wijziging gedaan, wordt de nieuwe index.html gebouwd EN wordt de leesbare
broncode meteen meegeleverd om op GitHub te bewaren.

---

## 9. Het contactmenu (toegevoegd 21 augustus 2026)

Het vierde menu "Contact" verschijnt in het middendeel van de app, net als de
andere schermen, dus met de header bovenin en het menu onderin zichtbaar. Het is
verder een op zichzelf staand onderdeel en raakt de materiaallijst niet aan.

- Contactpersonen worden bewaard in de database in een APART onderdeel
  genaamd "contacts" (de materiaallijst blijft in "items").
- Per contactpersoon: naam, hike en telefoonnummer.
- De hikes en hun volgorde: A hike, B hike, C hike, D hike, E hike, F hike,
  Vliegende keep, Kampstaf, Overige. De lijst wordt per hike gegroepeerd en in
  deze volgorde getoond.
- Onderin staat een plusknop om toe te voegen. Elke contactpersoon heeft een
  belknop (belt via de telefoon) en een wijzigknop. Verwijderen kan in het
  wijzigscherm.

BELANGRIJK, eenmalig in Firebase regelen: de databaseregels (Firestore Rules)
moeten het onderdeel "contacts" toestaan om te lezen en te schrijven, net zoals
"items". Staat dat niet aan, dan kunnen contactpersonen niet opgeslagen worden.
Zolang de regels niet goed staan, werkt het scherm nog wel, maar bewaart het
alleen op de telefoon zelf in plaats van gedeeld.

LEESBARE BRONCODE: van dit contactmenu is de leesbare broncode WEL bewaard, in
het bestand contact-broncode.js. Dezelfde code zit ook onderin index.html. Wil je
het contactmenu later aanpassen, gebruik dan dat bestand.

---

## 10. Het draaiboekmenu (toegevoegd 23 augustus 2026)

Het menu "Draaiboek" verschijnt in het middendeel van de app, net als de andere
schermen, dus met de header bovenin en het menu onderin zichtbaar. In de menubalk
staat het tussen Inleveren en Contact. Het raakt de materiaallijst en de contacten
niet aan.

- Bouwposten worden bewaard in de database in een APART onderdeel genaamd
  "draaiboek" (naast "items" en "contacts").
- De dagen en hun volgorde: dinsdag, woensdag, donderdag, vrijdag, zaterdag.
  De lijst wordt per dag gegroepeerd, met een duidelijke scheiding, en binnen een
  dag gesorteerd op tijdstip.
- Per bouwpost kun je invoeren: dag, tijdstip, hike (A t/m F of Nvt), bouwpost
  nummer, locatie, activiteit, foto, coördinaat, status en bijzonderheden.
- Het bouwpost nummer wordt getoond als de hikeletter met een tweecijferig
  nummer, bijvoorbeeld "C03". Bij hike Nvt is er geen letter (dan bijv. "01").
- De foto wordt automatisch verkleind (net als bij het materiaal) en verschijnt
  rechts in het overzicht bij de bouwpost, en groot in het detailscherm.
- De hikes gebruiken dezelfde kleuren als bij Contact. Nvt is grijs.
- Statussen en kleur: nog niet gebouwd (oranje), gebouwd (groen), opgeruimd
  (blauw). Bij status opgeruimd staat er in het overzicht een streep door de naam
  van de post, zodat je ziet dat die klaar is.
- Bovenaan staan filters voor dag, status en hike.
- Onderin staat een plusknop om een bouwpost toe te voegen. Tik je op een bouwpost
  in de lijst, dan verschijnt het detailscherm met alle informatie en een knop
  "Aanpassen". Verwijderen kan in het aanpasscherm.
- Coördinaat en kaart: je kunt een losse coördinaat invoeren zoals
  "52.1234, 5.6789", of een Google Maps-link plakken. Bij een coördinaat
  verschijnen in het detailscherm knoppen voor Google Maps, Apple Maps of een
  andere kaart-app. Bij een geplakte link verschijnt een knop die die link
  rechtstreeks opent (meestal in Google Maps). De keuze tussen kaart-apps werkt
  alleen als er een coördinaat bekend is; een losse Google-link opent in Google
  Maps.
- Volgorde in het detailscherm: foto, dan activiteit en bouwpost nummer naast
  elkaar, dan dag en tijdstip naast elkaar, dan locatie, status, bijzonderheden
  en onderaan de kaart.

BELANGRIJK, eenmalig in Firebase regelen: de databaseregels (Firestore Rules)
moeten het onderdeel "draaiboek" toestaan om te lezen en te schrijven, net zoals
"items" en "contacts". Staat dat niet aan, dan worden bouwposten alleen op de
telefoon zelf bewaard in plaats van gedeeld.

LEESBARE BRONCODE: van dit draaiboekmenu is de leesbare broncode bewaard in het
bestand draaiboek-broncode.js. Dezelfde code zit ook onderin index.html.

---

## 11. De Firebase-instellingen

De koppeling met de database staat bovenin de index.html, in een blok dat begint
met `window.__BOUWPLOEG_FIREBASE__`. Dit zijn geen geheime wachtwoorden, maar de
gewone verbindingsgegevens die elke webapp van Firebase gebruikt. Als je ooit naar
een ander Firebase-project overstapt, is dit de enige plek die je hoeft te
vervangen.
