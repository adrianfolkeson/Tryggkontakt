# TryggKontakt

**En lugn kommunikationsplattform för människor runt personer med stödbehov.**

För familjer, assistenter, skolor och LSS-verksamheter som tillsammans stöttar en person med exempelvis Downs syndrom, autism eller intellektuell funktionsnedsättning.

---

## 1. Varför finns vi?

### Problemet

Runt varje person med stödbehov finns ofta 5–15 vuxna: föräldrar, syskon, personliga assistenter, lärare, fritidsledare, gruppchef på LSS-boende, habiliteringspersonal.

Idag sker kommunikationen mellan dem i:

- Messenger-grupper som blir oöverskådliga
- WhatsApp-trådar som ingen läser i tid
- Pappersanteckningar som glöms vid byte av personal
- Telefonsamtal mellan utmattade föräldrar och stressad personal
- Mejlkedjor som ingen vågar svara på

Konsekvenserna är konkreta:

- En assistent börjar sitt pass utan att veta att personen sov dåligt i natt
- Skolan vet inte att medicinen ändrades i fredags
- En förälder får samma fråga från tre olika personer på samma dag
- Vid personalbyte försvinner år av tyst kunskap om vad som fungerar
- Föräldern blir den enda *integrerande punkten* i hela nätverket — och bränner ut sig

### Hypotesen

Det behövs ett lugnt, gemensamt skikt där dagens viktigaste information finns på *ett* ställe — utan att bli ett socialt medium, ett vårdsystem eller ett företagsverktyg.

> *"Jag vill inte logga in i ett system. Jag vill bara veta att morgonen gick bra."*
> — Förälder, intervju *(platshållare — fylls på med riktiga citat innan lansering)*

---

## 2. Vision

TryggKontakt blir den **självklara, lugna kontaktytan** mellan hem, skola, assistans och LSS för personer med stödbehov.

Inte den största. Inte den mest funktionsrika. Den lugnaste och mest pålitliga.

---

## 3. Vilka är vi till för?

**Primära användare**

| Roll | Vad de behöver av oss |
|---|---|
| Förälder / anhörig | Översikt, lugn, slippa upprepa sig |
| Personlig assistent | Snabb överlämning, veta vad som hänt senast |
| Lärare / skolpersonal | Korta uppdateringar, inga inloggningar med tolv steg |
| Gruppchef / samordnare | Kontinuitet vid personalbyten |

**Sekundära användare**

Habilitering, fritidsledare, kommunens biståndshandläggare. De ska kunna bjudas in, men ska inte driva designen i MVP.

**Vi designar inte för**

Stora vårdorganisationer, sjukhus, kommunadministratörer som vill ha rapporter. De är inte fel — de är någon annans produkt.

---

## 4. Produktprinciper

Fem principer. Inte tio. Om en av dem inte driver beslut är den inte en princip.

1. **Lugn före funktion.** Om en funktion gör skärmen rörigare väger den negativt, även om den är "användbar".
2. **En primär handling per vy.** Varje skärm har en sak du ska kunna göra utan att tänka.
3. **Kognitiv tillgänglighet är en designparameter, inte en eftertanke.**
4. **Färre val är bättre val.** Standardinställningar ska räcka för 90 % av användarna.
5. **Förtroende byggs av tystnad lika mycket som av funktion.** Vi notifierar sparsamt, vi samlar minimalt med data, vi visar bara det som spelar roll just nu.

---

## 5. MVP — vad vi bygger först

Fem funktioner. Inget mer i version 1.

### 5.1 Dagens uppdatering

En rullande dagbok kring personen, knuten till tre tidsfönster på dygnet, plus en parallell *Snabbnotering* för observationer som inte hör hemma i ett fönster.

**Tre fönster (svensk tid):**
- *Morgon* öppnar 07:30
- *Lunch* öppnar 11:30
- *Eftermiddag* öppnar 15:00

Varje fönster är en uppdatering: humör, energi, fri text (max 280 tecken), valbar synlighet (*Alla i kretsen* eller *Bara anhöriga*). *Morgon* lägger till sömn och frukost. *Lunch* och *Eftermiddag* lägger till en sammanfattning av perioden samt en måltid.

**Snabbnotering** är en parallell väg för korta observationer som inte är knutna till ett fönster — *"Han var orolig efter promenaden"*. Bara fri text + synlighet.

**Hemskärmen visar bara idag.** Ifyllda fönster syns som kort. Ett fönster vars tid passerat men som ännu inte fyllts visas som *Väntar* — tills ett senare fönster fylls, då försvinner det stilla från hemskärmen. Datat finns kvar i databasen och i PDF-exporten.

**Mental modell**: hemskärmen är ett **nu**, PDF:en är ett **journalspår**. Varje fönster fylls en gång om dagen; *Snabbnotering* fyller mellanrummen.

**Synlighet:**

Standard: hela kretsen ser uppdateringen. Anhöriga kan välja *"Bara anhöriga"* per uppdatering — då är raden osynlig för personal och samordnare. Det är enda synlighetsnivån i MVP; finkornigare nivåer (bara personal, specifika medlemmar) är uttryckligen utanför scope.

**Exempel:**
> *"Åt bra till frukost, lite trött efter promenaden. Pratade mycket om tåget vi såg på lördagen."*
> — Maria, assistent, 09:14

### 5.2 Status just nu

En vy som visar var personen är, med vem, om något är planerat just nu, och senaste uppdatering. Ingen historik, ingen analys. Bara *nu*.

### 5.3 Gemensamt schema

Veckovy. Inga inbjudningar, inga Outlook-funktioner. Lägg in: aktivitet, tid, vem som följer med. Klart.

### 5.4 Påminnelser

Rena och enkla. *"Tandläkaren kl 14 på torsdag."* Inga prioriteringsnivåer, inga taggar, ingen kategorisering.

### 5.5 Veckosammanfattning (AI)

Söndag kväll. En vänligt skriven sammanfattning av veckan i tre meningar. Skickas till alla i kretsen.

**Exempel:**
> *"Den här veckan var morgnarna lugna. Onsdagens simning gav glädje, torsdag eftermiddag var lite orolig. Sömnen har varit jämnare än förra veckan."*

---

## 6. Vad vi medvetet **inte** bygger i MVP

| Inte med | Varför inte |
|---|---|
| Chatt | Det finns redan i Messenger. Vi tävlar inte. |
| Inläggsflöde / "feed" | Vi är inte sociala medier. Lugn > engagemang. |
| Behörighetsnivåer med kryssrutor | För komplext. Tre roller räcker. |
| Anpassningsbara fält | Skapar beslutsbörda för stressade användare. |
| Statistik och grafer | Vi är inte ett vårdjournalsystem. |
| Fakturering i appen | Sköts utanför, senare. |
| Push-notiser för allt | Notiser bara för: ny dagsuppdatering, akut påminnelse. |
| Integration mot kommunsystem | Senare. Skapar säkerhetsskuld vi inte vill ha i MVP. |

Regel: *Om en funktion läggs till måste något annat tas bort eller motiveras explicit.*

---

## 7. En dag i appen

**07:20.** Maria (assistent) loggar in. Ser senaste uppdateringen från nattpersonalen: personen vaknade två gånger, ovanligt för veckan. Hon vet att förmiddagen ska tas lugnt.

**08:50.** Maria öppnar appen efter frukost, knappar in: humör 🙂, sömn dålig, energi medel, fri text *"Lite trött men åt bra, vi tar en kort promenad istället för simning."*

**09:01.** Mamman får en mjuk notis: *"Maria uppdaterade morgonen."* Hon läser den på tio sekunder mellan möten och behöver inte ringa.

**14:30.** Skolan vet att personen kommer trött. Pedagogen Sara öppnar status-vyn i korridoren, ser senaste uppdateringen, justerar eftermiddagens plan utan att fråga någon.

**Söndag 19:00.** Hela kretsen får veckosammanfattningen. Pappa, som varit bortrest, läser den på tre minuter och känner sig à jour.

---

## 8. Roller och behörigheter

Tre roller. Inte fler.

| Roll | Kan läsa | Kan skriva | Kan bjuda in |
|---|---|---|---|
| **Anhörig** | Allt om personen | Allt | Ja |
| **Personal** | Allt om personen, under aktiv period | Dagsuppdateringar, scheman, påminnelser | Nej |
| **Samordnare** | Allt om personen | Allt utom anhörigkontakter | Personal, ej anhöriga |

**Personals tillgång upphör automatiskt** när de tas bort från personens krets. Ingen data följer med, ingen export.

En **person** (den vi finns för) har sin egen profil. Personen kan ha flera kretsar samtidigt — t.ex. separerade föräldrar med varsitt hushåll → båda är anhöriga och ser samma data. Det här är kärnan i datamodellen och måste fungera prickfritt innan lansering.

---

## 9. Teknik

### Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind, shadcn/ui
- **Backend:** Next.js server actions + Supabase (Postgres, Auth, Storage, RLS)
- **AI:** Anthropic Claude via API, EU-hosting där tillgängligt
- **Hosting:** Vercel (EU-region) + Supabase EU
- **Observability:** Sentry, PostHog (med samtycke)

### Designbeslut med motivering

- **Supabase före egen backend:** Row-Level Security ger oss en granskningsbar behörighetsmodell utan eget auktoriseringslager. Färre fel i tidig fas.
- **Server actions före REST API:** Mindre kod, snabbare iteration i MVP. Vi kan extrahera ett API när det behövs externt.
- **Inga native-appar i MVP:** PWA räcker. Native byggs när vi vet att vi har retention.
- **AI som tjänst, inte i kärnan:** Veckosammanfattning ska vara en bra sak att tappa om leverantören krånglar. Inget i produkten ska *kräva* AI för att fungera.

---

## 10. AI: hur, var, och vad

### Vad AI gör

- Skriver veckosammanfattningar utifrån dagsuppdateringar
- *(Framtid, inte MVP)* Föreslår textförbättringar för stressade skribenter

### Vad AI **inte** gör

- Ger inga medicinska tolkningar eller råd
- Drar inga slutsatser om diagnoser, mående eller behov
- Skickar inte data till leverantörer utanför EU utan uttryckligt samtycke
- Ersätter aldrig mänsklig bedömning

### Modell och hosting

- Anthropic Claude via API
- Pseudonymisering: personens namn ersätts med initialer eller alias innan data skickas till modellen
- Zero-retention hos leverantör där det är tillgängligt
- Tydlig avstängningsknapp per krets: *"Använd inte AI för vår krets."*

### Hur AI får låta

**Bra:**
> *"Den här veckan var det fler lugna stunder än stressiga. Sömnen blev jämnare mot slutet."*

**Dåligt (för kliniskt):**
> *"Patienten uppvisar förbättrad sömnkvalitet och minskad agitation."*

**Dåligt (för käckt):**
> *"Vilken vecka! 🎉 Verkligen kämpat på!"*

**Dåligt (drar slutsatser):**
> *"Det verkar som att medicineringen börjar verka."*

Tonen är **lugn vän som varit närvarande** — inte journal, inte coach, inte vän som överengagerar sig.

---

## 11. Språk och ton i gränssnittet

- Tilltala användaren med *du*, aldrig *ni* eller *användaren*
- Verb i presens: *"Lägg till en uppdatering"*, inte *"Tillägg av uppdatering"*
- Maxlängd för knapptext: tre ord
- Maxlängd för rubriker: sex ord
- Inga versaler mitt i meningar, ingen ALL CAPS
- Fel ska vara mänskliga: *"Det gick inte att spara. Vill du försöka igen?"* — inte *"Error 500"*
- Vi använder inte ordet *patient*, *brukare* eller *klient* om personen. Vi använder personens namn.

---

## 12. Tillgänglighet — konkreta åtaganden

Inte aspirationer, krav som testas i CI där det går.

- WCAG 2.2 AA som golv, AAA där det inte kostar tydlighet
- Lägsta brödtextstorlek: 17 px på mobil
- Kontrast: minst 7:1 för brödtext
- Animationer respekterar `prefers-reduced-motion`
- Alla interaktiva element är minst 48×48 px
- Alla flöden kan slutföras med enbart tangentbord
- Testas regelbundet av en person med kognitiv funktionsnedsättning innan release av nya flöden

---

## 13. Säkerhet och GDPR

- All data lagras inom EU (Supabase EU, Vercel EU)
- Personuppgiftsbiträdesavtal med samtliga underbiträden
- Kryptering i transit (TLS 1.3) och i vila (AES-256)
- Row-Level Security på alla tabeller med personlig data
- Loggning av all åtkomst till personens data, synlig för anhörig
- Datalagring: dagsuppdateringar lagras i 24 månader som standard, justerbart per krets
- Export och radering på begäran, klart inom 30 dagar
- Självbetjäning i appen (under *Inställningar*):
  - **Dataportabilitet (Art 20):** ”Exportera all min data” laddar ner en JSON-fil med användarens egna uppdateringar, schema-poster, påminnelser, inbjudningar och profil. Innehåll som andra i kretsen skapat ingår inte i exporten.
  - **Rätt till radering (Art 17):** ”Ta bort mitt konto” kräver att användaren skriver bekräftelsetexten **TA BORT** och kör därefter en atomisk RPC som raderar alla rader användaren skrivit, deras kretsmedlemskap, profil och `auth.users`-raden. Kretsar som blir tomma efter raderingen städas också bort. Sessionen avslutas direkt och användaren landar på inloggningssidan med en kort bekräftelse.
- Personuppgiftspolicy publicerad på `/integritet`. Aktuell version är ett utkast (1.0-utkast, 2026-06-15) som ligger ute med en synlig "under juridisk granskning"-banner i väntan på dataskydd-juristens granskning. Innehållet baseras på de faktiska dataflödena i koden (Supabase EU, Vercel EU, Resend USA under SCC) — uppdatera policyn samtidigt med eventuella underbiträdesbyten.
- Användarvillkor publicerade på `/villkor`. Aktuell version är ett utkast (1.0-utkast, 2026-06-19) som granskas i samma juridiska engagemang som personuppgiftspolicyn. Innehåller bl.a. ansvarsbegränsning, medicinsk disclaimer, konsumenträtt (ARN/ODR) och tillämplig lag (svensk lag, Stockholms tingsrätt).
- DPIA (konsekvensbedömning) genomförs innan lansering — vår användargrupp räknas som särskilt skyddsvärd

---

## 14. Hur vi vet att vi lyckas

Inga vanity-metrics. Ingen DAU.

| Mått | Mål för MVP |
|---|---|
| Tid till första uppdatering för ny assistent | < 60 sekunder |
| Andel pass som börjar med läst senaste uppdatering | > 80 % |
| Andel överlämningar som sker utan kompletterande telefonsamtal | > 60 % |
| Förälderns NPS efter 4 veckor | > 50 |
| *"Skulle du sakna TryggKontakt om det försvann imorgon?"* — andel "ja, mycket" | > 40 % |

Det sista måttet är viktigast. De övriga är försökskaniner till det.

---

## 15. Risker

| Risk | Sannolikhet | Konsekvens | Hur vi möter den |
|---|---|---|---|
| Användare uppfattar oss som ännu ett vårdsystem | Hög | Hög | Onboarding fokuserar på en enda funktion första veckan |
| Personal tycker det är extra jobb | Medel | Hög | Dagsuppdatering ska gå att göra på under 30 sekunder |
| Anhöriga får för många notiser och stänger av | Medel | Medel | Notiser standardinställs konservativt; vi mäter och justerar |
| AI-sammanfattningen säger något olämpligt | Låg | Hög | Mall + granskad prompt + möjlighet att stänga av AI per krets |
| GDPR-incident | Låg | Mycket hög | DPIA innan lansering, regelbunden granskning |
| Vi växer in i komplexitet | Hög | Hög | Den här filen läses i början av varje större beslut |

---

## 16. Roadmap

**Fas 1 — Stilla lansering (månad 0–3)**
MVP enligt avsnitt 5. 5–10 kretsar i sluten betatest. Vi ringer dem varje vecka.

**Fas 2 — Bredare beta (månad 4–6)**
50 kretsar. Iteration på vad som verkligen används. Inga nya funktioner — bara förbättring av de fem.

**Fas 3 — Öppen lansering (månad 7–9)**
Publik registrering. Första LSS-organisationen som kund. Samordnarvyn får mer kärlek.

**Fas 4 — Skola och fritids (månad 10–12)**
Skolan blir en egen roll med begränsad vy. Inga lärplattformsintegrationer än.

**Vi lovar inte mer än så här.** En produkt som ska vara lugn får inte ha en stressad roadmap.

---

## 17. Öppna frågor

Saker vi inte vet än, och som ska besvaras innan lansering:

- Hur hanterar vi separerade föräldrar där samarbetet är svårt?
- Vad händer med data när personen fyller 18 och själv vill råda över den?
- Vill vi någonsin låta personen själv vara aktiv användare? (Sannolikt ja, men inte MVP.)
- Hur fungerar betalning — per krets, per organisation, friskvård via kommun?
- Behöver vi offline-läge för assistenter på platser med dålig täckning?

---

## 18. Ordlista

- **LSS:** Lag om stöd och service till vissa funktionshindrade (1993:387). Den svenska lag som ger rätt till bland annat personlig assistans och gruppbostad.
- **Krets:** Den grupp människor runt en specifik person som har tillgång i appen. En person har en krets; en familj med två barn med stödbehov har två kretsar.
- **Person:** Den individ som kretsen finns runt. Vi använder ordet *person*, aldrig *brukare* eller *patient*.
- **Anhörig:** Förälder, syskon, vårdnadshavare eller annan närstående med fullständig läs- och skrivrättighet.
- **Personal:** Assistent, lärare, fritidsledare — någon med yrkesroll i personens vardag.
- **Samordnare:** Den som administrerar en personalgrupp, ofta gruppchef på LSS-verksamhet.

---

## 19. Den sista regeln

> *Om en funktion adderar komplexitet utan att tydligt minska stress för någon i kretsen — bygg den inte.*

Den här filen läses högt vid varje större beslut.