# Bouwploeg materiaal - Projectlogboek

Dit bestand is het "recept" van de app. Het beschrijft wat de app is, hoe hij in
elkaar zit en welke keuzes er gemaakt zijn. Bewaar dit samen met de app.
Als je later iets wilt aanpassen, geef dit bestand er dan bij, dan is meteen
duidelijk hoe alles bedoeld is.

Laatst bijgewerkt: 22 september 2026 (technieken in het draaiboek)

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
- linkvoorbeeld.png        Plaatje dat WhatsApp toont bij de link (1200 bij 630)
- techniek-*.jpg           Uitlegplaatjes van knopen en technieken voor het
                           draaiboek, bijvoorbeeld techniek-triple-bowline.jpg

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

H3, HKG, Ada's hoeve, VLG, Bouwploeg, Overig

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
- Per bouwpost kun je invoeren: dag, tijdstip, hike (A t/m F of Bouwploeg), bouwpost
  nummer, locatie, activiteit, techniek, foto, coördinaat, status en afspraken en
  bijzonderheden. (Techniek is toegevoegd op 22 september 2026, zie punt 17.)
- Het bouwpost nummer wordt getoond als de hikeletter met een tweecijferig
  nummer, bijvoorbeeld "C03". Bij hike Bouwploeg is er geen letter (dan bijv. "01").
- De foto wordt automatisch verkleind (net als bij het materiaal) en verschijnt
  rechts in het overzicht bij de bouwpost, en groot in het detailscherm.
- De hikes gebruiken dezelfde kleuren als bij Contact. Bouwploeg is grijs.
- Statussen en kleur: nog niet gebouwd (oranje), gebouwd (groen), afgerond
  (blauw). Bij status afgerond staat er in het overzicht een streep door de naam
  van de post, zodat je ziet dat die klaar is.
- Bovenaan staan filters voor dag, status en hike.
- Onderin staat een plusknop om een bouwpost toe te voegen. Tik je op een bouwpost
  in de lijst, dan verschijnt het detailscherm met alle informatie en een knop
  "Aanpassen". Verwijderen kan in het aanpasscherm.
- Coördinaat en kaart: je kunt een losse coördinaat invoeren zoals
  "52.1234, 5.6789", of een Google Maps-link plakken. Bij een coördinaat
  verschijnen in het detailscherm knoppen voor Google Maps of Apple Maps. Bij een geplakte link verschijnt een knop die die link
  rechtstreeks opent (meestal in Google Maps). De keuze tussen deze twee werkt
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

## 11. De verwijdercode (toegevoegd 24 augustus 2026)

Verwijderen van materiaal, contacten en bouwposten vraagt eerst om een gedeelde
code. Wijzigen (aanpassen) vraagt niet om een code. De code is voor iedereen
hetzelfde; je geeft hem zelf door aan wie mag verwijderen.

Let op: dit is een lichte drempel, geen echte beveiliging. De code staat in de
app zelf, dus wie er technisch handig mee is zou hem kunnen omzeilen. Voor het
voorkomen van per ongeluk of ongewenst verwijderen is het prima.

De code instellen of wijzigen: bovenin index.html staat een blok met het kopje
"Gedeelde verwijdercode". Daarin staat een regel `var CODE = "Bp2026";`.
Verander het woord tussen de aanhalingstekens in je eigen code. Dat is de enige
plek die je hoeft aan te passen; hij geldt meteen voor materiaal, contacten en
bouwposten.

---

## 12. De Firebase-instellingen

De koppeling met de database staat bovenin de index.html, in een blok dat begint
met `window.__BOUWPLOEG_FIREBASE__`. Dit zijn geen geheime wachtwoorden, maar de
gewone verbindingsgegevens die elke webapp van Firebase gebruikt. Als je ooit naar
een ander Firebase-project overstapt, is dit de enige plek die je hoeft te
vervangen.

---

## 13. Wijzigingen 11 september 2026

**Menu-iconen uit elkaar getrokken.** Draaiboek had hetzelfde klembordicoon als
Overzicht. Overzicht is ongewijzigd; Draaiboek is nu een kalender met dagstippen.
Het icoon staat los in index.html bij `label:"Draaiboek"`, dus daar is het altijd
weer aan te passen.

**Inleveren: filterknop in plaats van groepknoppen.** De rij met Alle groepen, H3,
HKG enzovoort is vervangen door een knop Filters, met een telletje erachter en
ernaast in kleine letters welke selectie aanstaat (of Alles zichtbaar). Achter de
knop klapt een paneel open met Geleend van, Categorie en een knop Filters wissen.
Filteren op categorie was nieuw op deze pagina. De knoppen Ingecheckt en
Uitgecheckt zijn bewust blijven staan waar ze stonden.

**Overzicht: filterknop en telling gewisseld.** De telling (bijvoorbeeld
12 items en 34 stuks) staat nu rechts naast de statusknoppen. De knop Filters staat
op de plek waar de telling stond, samen met de printknop, en toont dezelfde
samenvatting als bij Inleveren. Het filterpaneel klapt open onder die knop.

Technisch, voor later: in de inlevercomponent zijn `bpCat` (gekozen categorie),
`bpOpen` (paneel open of dicht) en `bpN` (aantal actieve filters) toegevoegd.
Bovenin het bestand staat `bpCats=s`, een doorverwijzing naar de bestaande
categorieenlijst, omdat die naam binnen die component al bezet was.

---

## 14. Voorvertoning van de link (11 september 2026)

Direct achter `<title>Bouwploeg materiaal</title>` staat nu een blok met regels die
beginnen met og:. Die zorgen dat WhatsApp bij de link een net kaartje toont met de
naam, een zin uitleg en een afbeelding, in plaats van een kale blauwe regel.

De afbeelding heet linkvoorbeeld.png en moet naast de index.html op GitHub staan.
Verander je de naam of de map, pas dan ook de regel og:image aan.

Let op: WhatsApp onthoudt zo'n voorvertoning een tijdje. Na een wijziging de link
opnieuw versturen, eventueel met ?v=2 erachter.

---

## 15. Materiaal om te delen (los bewaard, hoeft niet op GitHub)

- handleiding-bouwploeg-materiaal.pdf en .png   Eén blad met de vijf schermen
- deelkaart-bouwploeg-materiaal.pdf en .png     Kaart met QR code en installatiestappen
- WIJZIGINGEN-11-september-2026.md              Wat er precies veranderd is en waar
                                                (hierin staan ook 13 september)

De QR code op de deelkaart wijst naar het live adres. Blijft dat adres gelijk, dan
blijft de code werken.

---

## 16. Wijzigingen 13 september 2026

**Overzicht: de telling is een vakje geworden.** De regel "7 items · 42 stuks" naast
de statusknoppen was te breed. Er staat nu een afgerond vakje met bijvoorbeeld 7/42,
in dezelfde stijl en hoogte als de knoppen Alles, Ingecheckt en Uitgecheckt. Het
eerste getal is het aantal items, het tweede het aantal stuks, wat lichter gedrukt.
Beide bewegen mee met de filters die aanstaan. Het vakje is een label, geen knop.

**Inleveren: stuks in het groene balkje.** Bovenaan stond alleen het aantal items.
Er staat nu bijvoorbeeld "6 items · 42 stuks". Het aantal stuks is de som van alle
aantallen van het materiaal dat nog ingecheckt staat, dus wat er nog terug moet.
Dit telt alles, ongeacht welk filter aanstaat.

Technisch: in de inlevercomponent is `bpStuks` toegevoegd, dat de aantallen optelt
van alle items met status in. Op Overzicht gebruikt het vakje de bestaande getallen
van de gefilterde lijst.

---

## 17. Technieken in het draaiboek (22 september 2026)

Bij een bouwpost kun je een of meer technieken kiezen, bijvoorbeeld knopen. In het
invulscherm staat Techniek direct onder Status. Elke techniek is een knopje dat je
aan en uit tikt; een gekozen techniek wordt donkergroen met een vinkje. Onder de
knopjes verschijnt per gekozen techniek een klein voorbeeld met de beschrijving.
Niets aangetikt betekent geen techniek.

Waar het zichtbaar wordt:

- In de lijst krijgt de bouwpost per techniek een klein label met een knoopje en de
  naam, op dezelfde regel als de status.
- In het detailscherm staan de technieken onderaan, onder elkaar, elk met naam,
  beschrijving en de uitlegafbeelding over de volle breedte. Tik op de afbeelding om hem schermvullend te openen. Tik daar
  nogmaals om in te zoomen op het stukje waar je tikt, en nog een keer om terug te
  gaan.

Technieken in de app, in deze volgorde:

| Naam                 | sleutel              | afbeelding                         | toegevoegd   |
|----------------------|----------------------|------------------------------------|--------------|
| Gilwell bowline      | triple-bowline       | techniek-triple-bowline.jpg        | 22 sept 2026 |
| Mastworp op het touw | mastworp-op-het-touw | techniek-mastworp-op-het-touw.jpg  | 22 sept 2026 |
| Zeppelin knoop       | zeppelin             | techniek-zeppelin.jpg              | 22 sept 2026 |
| Schootsteek          | schootsteek          | techniek-schootsteek.jpg           | 22 sept 2026 |
| Dubbele schootsteek  | dubbele-schootsteek  | techniek-dubbele-schootsteek.jpg   | 22 sept 2026 |
| Munter mule knoop    | munter-mule          | techniek-munter-mule.jpg           | 22 sept 2026 |
| Paalsteek            | paalsteek            | techniek-paalsteek.jpg             | 22 sept 2026 |
| Dubbele paalsteek    | dubbele-paalsteek    | techniek-dubbele-paalsteek.jpg     | 22 sept 2026 |
| Vlinderknoop         | vlinderknoop         | techniek-vlinderknoop.jpg          | 22 sept 2026 |

De Gilwell bowline heette eerst Triple bowline. Alleen de naam is veranderd; de
sleutel en de bestandsnaam van de afbeelding zijn bewust gelijk gebleven, zodat
bouwposten die hem al hadden hem houden.

Een nieuwe techniek toevoegen gaat in twee stappen:

1. Zet de afbeelding op GitHub naast index.html, met een naam die begint met
   "techniek-", bijvoorbeeld techniek-mastworp.jpg.
2. Voeg in index.html bij TECHNIEKEN (in het draaiboekblok onderin) een regel toe:
   { sleutel: "mastworp", naam: "Mastworp", afbeelding: "techniek-mastworp.jpg" }

Een techniek kan ook een korte beschrijving krijgen, waarvoor je hem gebruikt.
Die staat onder de naam, zowel in het invulscherm als in het detailscherm. Voeg
daarvoor in de regel bij TECHNIEKEN een stukje toe:
beschrijving: "Waarvoor je deze knoop gebruikt."
Zonder beschrijving werkt het ook; dan staat er alleen de naam en het plaatje.

Beschrijvingen die er nu in staan:

- Gilwell bowline: Deze knoop gebruiken we om een touw aan een spanset of tirfor te bevestigen.
- Mastworp op het touw: Deze gebruiken we bijvoorbeeld bij Pics in Space, en
  om een dik touw aan een boom te bevestigen, zoals bij de start van een apenbaan
  of kabelbaan.
- Zeppelin knoop: Geschikt om twee dikke touwen aan elkaar te verbinden. Ook na
  zware spanning is de knoop makkelijk weer los te maken.
- Schootsteek: Om twee touwen van verschillende dikte aan elkaar te verbinden.
- Dubbele schootsteek: Om twee touwen van verschillende dikte aan elkaar te
  verbinden. Houdt beter dan de gewone schootsteek, vooral bij een groot verschil
  in dikte of bij glad touw.
- Munter mule knoop: Om een halve mastworp af te knopen, zodat het touw vast
  blijft staan. Is ook onder spanning weer los te trekken.
- Paalsteek: Maakt een vaste lus die niet dichtloopt. Na belasting makkelijk weer
  los te maken.
- Dubbele paalsteek: Paalsteek met een extra slag. Houdt beter dan de gewone
  paalsteek, vooral bij glad of stijf touw.
- Vlinderknoop: Maakt een vaste lus midden in het touw. Te gebruiken om een
  beschadigd stuk touw af te zonderen, voor hand- en voetlussen of een touwladder,
  als ophangpunt voor bijvoorbeeld een lantaarn of pan, om de middelste persoon in
  een touwteam vast te maken en als katrol in een takel. Een van de sterkste
  lusknopen: het touw houdt 60 tot 80 procent van zijn breeksterkte.
  (Samengevat uit de Engelse uitleg van Knotspedia.)

De sleutel wordt in de database bij de bouwpost bewaard. Verander een sleutel
daarna niet meer, anders raakt een bouwpost zijn techniek kwijt. De naam mag je wel
altijd aanpassen. Haal je een techniek uit de lijst, dan verdwijnt hij gewoon bij
de posten die hem hadden, zonder dat er iets kapot gaat.

Technisch: bij een bouwpost wordt het veld `technieken` bewaard, een lijstje met de
sleutels (leeg als er niets gekozen is). Er zijn geen nieuwe Firebase-regels nodig,
want het zit in het bestaande onderdeel "draaiboek". Tot 22 september 2026 kon je
maar een techniek kiezen; die stond in het veld `techniek`. De app leest dat oude
veld nog steeds, en zet het om naar `technieken` zodra zo'n bouwpost opnieuw wordt
opgeslagen. Bouwposten van voor de technieken hebben gewoon geen techniek.

**Meegenomen reparatie op Overzicht.** Het vakje met items en stuks (bijvoorbeeld
6/41) viel op de meeste iPhones rechts een stukje buiten beeld. De statusknoppen
Alles, Ingecheckt en Uitgecheckt zijn daarom iets smaller gemaakt en staan iets
dichter op elkaar, en het vakje zelf is compacter. Het past nu op schermen van 375
breed en breder, ook bij getallen als 45/310.
