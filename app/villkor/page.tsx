import Link from "next/link";

import PublicHeader from "../_components/public-header";

export const metadata = {
  title: "Användarvillkor — TryggKontakt",
};

const TOC = [
  { id: "definitioner", label: "1. Inledning och definitioner" },
  { id: "acceptans", label: "2. Acceptans av villkoren" },
  { id: "tjansten", label: "3. Tjänstebeskrivning" },
  { id: "konto", label: "4. Behörighetskrav och konto" },
  { id: "roller", label: "5. Roller och ansvar i en krets" },
  { id: "fokusperson", label: "6. Ansvar gentemot fokuspersonen" },
  { id: "innehall", label: "7. Innehåll och immateriella rättigheter" },
  { id: "tillaten", label: "8. Tillåten användning" },
  { id: "otillaten", label: "9. Otillåten användning" },
  { id: "personuppgifter", label: "10. Personuppgifter och integritet" },
  { id: "pris", label: "11. Pris och betalning" },
  { id: "tillganglighet", label: "12. Tjänstens tillgänglighet" },
  { id: "ansvar", label: "13. Ansvarsbegränsning" },
  { id: "medicinskt", label: "14. Inget medicinskt råd" },
  { id: "uppsagning", label: "15. Uppsägning och avslut" },
  { id: "lag", label: "16. Tillämplig lag och tvistlösning" },
  { id: "andringar", label: "17. Ändringar i villkoren" },
  { id: "kontakt", label: "18. Kontakt" },
];

export default function VillkorPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <PublicHeader />
      <main className="flex-1 px-4 pb-20 max-w-content mx-auto w-full flex flex-col gap-6">
        <aside
          role="note"
          className="mt-4 rounded-md bg-warn-soft border border-warn p-4 flex flex-col gap-1"
        >
          <p className="text-body text-text font-semibold">
            Utkast — under juridisk granskning
          </p>
          <p className="text-body text-text">
            Slutgiltig version publiceras efter granskning av jurist.
            Datum och organisationsuppgifter är preliminära.
          </p>
        </aside>

        <article className="flex flex-col gap-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-h1 text-text">Användarvillkor för TryggKontakt</h1>
            <p className="text-meta text-text-muted">
              Senast uppdaterad 2026-06-19 · Version 1.0-utkast
            </p>
          </header>

          <nav aria-labelledby="toc-heading" className="flex flex-col gap-2">
            <h2 id="toc-heading" className="text-h2 text-text">
              Innehåll
            </h2>
            <ol className="list-decimal pl-5 flex flex-col gap-1 text-body text-primary">
              {TOC.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="transition-colors duration-quick ease-standard hover:text-primary-hover"
                  >
                    {t.label.replace(/^\d+\.\s*/, "")}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <section aria-labelledby="definitioner" className="flex flex-col gap-3">
            <h2 id="definitioner" className="text-h2 text-text">
              1. Inledning och definitioner
            </h2>
            <p className="text-body text-text">
              Dessa användarvillkor reglerar din användning av TryggKontakt
              (&ldquo;<strong>tjänsten</strong>&rdquo;), som tillhandahålls
              av Aurora Ecom AB (&ldquo;<strong>Aurora</strong>&rdquo;,
              &ldquo;<strong>vi</strong>&rdquo;, &ldquo;<strong>oss</strong>&rdquo;).
            </p>
            <p className="text-body text-text">
              I dessa villkor används följande termer:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                <strong>Tjänsten</strong> — webbappen TryggKontakt på
                www.tryggkontakt.se, inklusive alla tillhörande
                funktioner.
              </li>
              <li>
                <strong>Användare</strong> (&ldquo;<strong>du</strong>&rdquo;)
                — den fysiska person som har skapat ett konto och loggar
                in i tjänsten.
              </li>
              <li>
                <strong>Krets</strong> — den gemensamma yta i tjänsten där
                flera användare tillsammans koordinerar vardagen runt en
                fokusperson.
              </li>
              <li>
                <strong>Fokusperson</strong> — den person som kretsen är
                till för. Fokuspersonen är inte nödvändigtvis själv
                användare av tjänsten.
              </li>
              <li>
                <strong>Anhörig</strong> — en användare med rollen
                &ldquo;anhörig&rdquo; i en krets. Anhöriga administrerar
                kretsen och bjuder in övriga medlemmar.
              </li>
              <li>
                <strong>Personal</strong> — en användare med rollen
                &ldquo;personal&rdquo; (personlig assistent eller
                motsvarande).
              </li>
              <li>
                <strong>Skola</strong> — en användare med rollen
                &ldquo;skola&rdquo; (lärare eller elevassistent).
              </li>
              <li>
                <strong>Samordnare</strong> — en användare med rollen
                &ldquo;samordnare&rdquo; från socialtjänst,
                LSS-handläggning eller motsvarande.
              </li>
              <li>
                <strong>Innehåll</strong> — text, bilder och annan
                information som du eller andra användare publicerar i en
                krets.
              </li>
            </ul>
          </section>

          <section aria-labelledby="acceptans" className="flex flex-col gap-3">
            <h2 id="acceptans" className="text-h2 text-text">
              2. Acceptans av villkoren
            </h2>
            <p className="text-body text-text">
              Genom att logga in i tjänsten godkänner du dessa villkor
              och vår{" "}
              <Link href="/integritet" className="text-primary">
                Personuppgiftspolicy
              </Link>
              . Om du inte godkänner villkoren ska du inte använda
              tjänsten.
            </p>
            <p className="text-body text-text">
              Vi kan komma att uppdatera villkoren — se avsnitt 17.
            </p>
          </section>

          <section aria-labelledby="tjansten" className="flex flex-col gap-3">
            <h2 id="tjansten" className="text-h2 text-text">
              3. Tjänstebeskrivning
            </h2>
            <p className="text-body text-text">
              TryggKontakt är ett <strong>koordinationsverktyg</strong>{" "}
              för familjer och yrkesverksamma som tillsammans stöttar en
              person med kognitiv funktionsnedsättning. Du delar korta
              uppdateringar om vardagen, ett gemensamt schema och
              påminnelser inom din krets.
            </p>
            <p className="text-body text-text">
              TryggKontakt är <strong>inte</strong>:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>en vårdtjänst eller medicinsk produkt</li>
              <li>
                en ersättning för bedömning av legitimerad vårdpersonal
              </li>
              <li>en larm- eller övervakningstjänst</li>
              <li>
                en plattform för diagnoser, behandlingsrekommendationer
                eller medicinska beslut
              </li>
            </ul>
            <p className="text-body text-text">
              Se även avsnitt 14 om medicinska råd.
            </p>
          </section>

          <section aria-labelledby="konto" className="flex flex-col gap-3">
            <h2 id="konto" className="text-h2 text-text">
              4. Behörighetskrav och konto
            </h2>
            <p className="text-body text-text">För att skapa ett konto:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                Du måste vara <strong>minst 18 år</strong> eller ha
                tillstånd från vårdnadshavare.
              </li>
              <li>
                Du måste ange en e-postadress som du själv kontrollerar.
              </li>
              <li>
                Du loggar in med <strong>magic-link</strong> — en
                engångslänk skickad till din e-post. Vi använder inga
                lösenord.
              </li>
            </ul>
            <p className="text-body text-text">
              Du ansvarar för att hålla din e-postaccess säker.
              Misstänker du att någon obehörig fått tillgång till ditt
              konto ska du kontakta oss omgående på info@auroraecom.se.
            </p>
            <p className="text-body text-text">
              Du får inte dela din inloggningslänk med någon annan. Varje
              person ska ha sitt eget konto.
            </p>
          </section>

          <section aria-labelledby="roller" className="flex flex-col gap-3">
            <h2 id="roller" className="text-h2 text-text">
              5. Roller och ansvar i en krets
            </h2>
            <p className="text-body text-text">
              Varje krets har en eller flera <strong>anhöriga</strong> som
              administrerar kretsen. Anhöriga bjuder in övriga medlemmar
              och kan avsluta medlemskap.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-body text-text border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Roll</th>
                    <th className="text-left py-2 font-semibold">Kan göra</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 align-top">Anhörig</td>
                    <td className="py-2">
                      Bjuda in, avsluta medlemskap för andra, skapa
                      uppdateringar med valfri synlighet (alla i kretsen /
                      bara anhöriga), exportera kretsdata till PDF
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 align-top">Personal</td>
                    <td className="py-2">
                      Skapa uppdateringar synliga för hela kretsen
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 align-top">Skola</td>
                    <td className="py-2">
                      Skapa uppdateringar synliga för hela kretsen
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top">Samordnare</td>
                    <td className="py-2">
                      Skapa uppdateringar synliga för hela kretsen, läsa
                      kretsens schema och påminnelser
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-body text-text">
              Alla medlemmar förbinder sig att:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                läsa varandras uppdateringar och respektera den valda
                synligheten
              </li>
              <li>skriva sakligt och respektfullt</li>
              <li>
                inte vidarebefordra innehåll från kretsen till någon
                utanför kretsen utan samtycke
              </li>
            </ul>
          </section>

          <section aria-labelledby="fokusperson" className="flex flex-col gap-3">
            <h2 id="fokusperson" className="text-h2 text-text">
              6. Ansvar gentemot fokuspersonen
            </h2>
            <p className="text-body text-text">
              Fokuspersonen är ofta inte själv användare och kan ha
              begränsad förmåga att samtycka till varje enskild
              användning av sina uppgifter. Det medför ett särskilt
              ansvar för dig som skriver om fokuspersonen.
            </p>
            <p className="text-body text-text">Du förbinder dig att:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                <strong>lämna saklig och korrekt information</strong> —
                inte överdriva, fabricera eller gissa
              </li>
              <li>
                <strong>respektera fokuspersonens värdighet</strong> —
                skriva som om personen själv läste det
              </li>
              <li>
                <strong>
                  inte publicera kränkande, förlöjligande eller skadligt
                  innehåll
                </strong>
              </li>
              <li>
                <strong>
                  inte använda fokuspersonens uppgifter kommersiellt
                </strong>{" "}
                — t.ex. i marknadsföring, forskning eller publikationer
                utan separat samtycke från fokuspersonen själv eller
                dennes företrädare
              </li>
              <li>
                <strong>avstå från medicinska påståenden</strong> som
                riskerar att tolkas som diagnos eller behandlingsråd
              </li>
            </ul>
            <p className="text-body text-text">
              Om fokuspersonen själv kan uttrycka önskemål om vad som ska
              eller inte ska delas ska du följa dessa önskemål.
            </p>
          </section>

          <section aria-labelledby="innehall" className="flex flex-col gap-3">
            <h2 id="innehall" className="text-h2 text-text">
              7. Innehåll och immateriella rättigheter
            </h2>

            <h3 className="text-h2 text-text">Du äger ditt innehåll</h3>
            <p className="text-body text-text">
              Allt innehåll du skapar i tjänsten — uppdateringar,
              schemaposter, påminnelser, anteckningar — tillhör{" "}
              <strong>dig</strong>. Aurora gör inga anspråk på
              äganderätten.
            </p>

            <h3 className="text-h2 text-text">Din licens till oss</h3>
            <p className="text-body text-text">
              För att vi ska kunna driva tjänsten behöver vi en begränsad
              licens att lagra, visa och bearbeta ditt innehåll. Du ger
              oss därför en{" "}
              <strong>
                icke-exklusiv, royaltyfri, världsomspännande licens
              </strong>{" "}
              att:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>lagra ditt innehåll i vår databas</li>
              <li>
                visa det för de medlemmar i kretsen som har rätt att se
                det
              </li>
              <li>
                bearbeta det tekniskt i den utsträckning som krävs för
                leverans av tjänsten (t.ex. säkerhetskopiering,
                indexering, format­konvertering vid PDF-export)
              </li>
            </ul>
            <p className="text-body text-text">
              Licensen är <strong>begränsad till leverans av tjänsten</strong>.
              Vi använder <strong>inte</strong> ditt innehåll för:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>reklam eller marknadsföring</li>
              <li>försäljning till tredje part</li>
              <li>träning av AI-modeller</li>
              <li>
                statistik eller analys utöver det som krävs för att driva
                tjänsten
              </li>
            </ul>
            <p className="text-body text-text">
              Licensen upphör att gälla när du raderar innehållet eller
              ditt konto.
            </p>

            <h3 className="text-h2 text-text">Vårt innehåll</h3>
            <p className="text-body text-text">
              Tjänstens kod, design, varumärke och dokumentation tillhör
              Aurora Ecom AB.
            </p>
          </section>

          <section aria-labelledby="tillaten" className="flex flex-col gap-3">
            <h2 id="tillaten" className="text-h2 text-text">
              8. Tillåten användning
            </h2>
            <p className="text-body text-text">Du får använda tjänsten:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                för det avsedda ändamålet — koordination runt en
                fokusperson
              </li>
              <li>på flera enheter under ditt eget konto</li>
              <li>för privata, icke-kommersiella ändamål</li>
            </ul>
          </section>

          <section aria-labelledby="otillaten" className="flex flex-col gap-3">
            <h2 id="otillaten" className="text-h2 text-text">
              9. Otillåten användning
            </h2>
            <p className="text-body text-text">
              Du får <strong>inte</strong>:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                publicera olagligt, kränkande eller diskriminerande
                innehåll
              </li>
              <li>trakassera eller hota någon via tjänsten</li>
              <li>publicera falsk information som kan skada någon</li>
              <li>försöka komma åt data utanför din egen krets</li>
              <li>
                skrapa, kopiera eller systematiskt extrahera data från
                tjänsten utan vårt skriftliga tillstånd
              </li>
              <li>
                utföra säkerhetstester (penetrationstest, fuzzning) utan
                vårt skriftliga tillstånd
              </li>
              <li>utge dig för att vara någon annan</li>
              <li>dela inloggningslänkar eller sessionscookies</li>
              <li>
                använda tjänsten kommersiellt utan separat avtal med
                Aurora
              </li>
              <li>
                använda tjänsten för att exploatera, övervaka eller på
                annat sätt skada fokuspersonen
              </li>
            </ul>
            <p className="text-body text-text">
              Brott mot dessa regler kan leda till att vi avslutar ditt
              medlemskap eller ditt konto (se avsnitt 15).
            </p>
          </section>

          <section aria-labelledby="personuppgifter" className="flex flex-col gap-3">
            <h2 id="personuppgifter" className="text-h2 text-text">
              10. Personuppgifter och integritet
            </h2>
            <p className="text-body text-text">
              Behandlingen av dina personuppgifter beskrivs i vår{" "}
              <Link href="/integritet" className="text-primary">
                Personuppgiftspolicy
              </Link>
              . Personuppgiftspolicyn är en integrerad del av dessa
              villkor.
            </p>
            <p className="text-body text-text">
              Sammanfattningsvis: all data lagras i Tyskland (EU), vi
              använder inga spårningskakor, vi säljer aldrig data, och du
              kan när som helst exportera eller radera dina uppgifter via{" "}
              <em>Inställningar</em> i appen.
            </p>
          </section>

          <section aria-labelledby="pris" className="flex flex-col gap-3">
            <h2 id="pris" className="text-h2 text-text">
              11. Pris och betalning
            </h2>
            <p className="text-body text-text">
              TryggKontakt är i nuvarande version{" "}
              <strong>kostnadsfritt</strong> att använda.
            </p>
            <p className="text-body text-text">
              Aurora förbehåller sig rätten att i framtiden införa
              abonnemangsavgifter. I så fall:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                meddelar vi dig minst <strong>30 dagar i förväg</strong>{" "}
                via e-post
              </li>
              <li>
                erbjuder vi befintliga användare en rimlig övergångsperiod
                eller fortsatt tillgång till en kostnadsfri basversion
              </li>
              <li>
                har du rätt att avsluta ditt konto utan kostnad innan
                eventuell betalning aktiveras
              </li>
            </ul>
          </section>

          <section aria-labelledby="tillganglighet" className="flex flex-col gap-3">
            <h2 id="tillganglighet" className="text-h2 text-text">
              12. Tjänstens tillgänglighet
            </h2>
            <p className="text-body text-text">
              Vi strävar efter hög tillgänglighet men ger{" "}
              <strong>inga garantier</strong> om upptid i MVP-skedet. Det
              finns inget formellt servicenivåavtal (SLA).
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                Planerat underhåll meddelas i förväg när möjligt.
              </li>
              <li>
                Vi kan tillfälligt stänga av tjänsten av tekniska,
                säkerhets- eller juridiska skäl.
              </li>
              <li>
                Vi ansvarar inte för avbrott som beror på underbiträden,
                internet­leverantörer eller force majeure.
              </li>
            </ul>
          </section>

          <section aria-labelledby="ansvar" className="flex flex-col gap-3">
            <h2 id="ansvar" className="text-h2 text-text">
              13. Ansvarsbegränsning
            </h2>
            <p className="text-body text-text">
              Tjänsten tillhandahålls <strong>i befintligt skick</strong>{" "}
              (&ldquo;as is&rdquo;) och i mån av tillgång. Inom ramen för
              vad svensk lag tillåter:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                lämnar vi inga garantier för att tjänsten är felfri,
                oavbruten eller lämplig för ett visst ändamål
              </li>
              <li>
                ansvarar vi inte för indirekta skador, följdskador,
                förlorad data, förlorade intäkter eller utebliven vinst
              </li>
              <li>
                är vårt sammanlagda ansvar gentemot dig begränsat till
                det belopp du betalat för tjänsten under de senaste 12
                månaderna före skadetillfället, eller{" "}
                <strong>1 000 SEK</strong>, beroende på vilket belopp som
                är högst
              </li>
            </ul>
            <p className="text-body text-text">
              <strong>
                Konsumenters tvingande rättigheter enligt svensk lag
                påverkas inte av denna ansvarsbegränsning.
              </strong>
            </p>
          </section>

          <section aria-labelledby="medicinskt" className="flex flex-col gap-3">
            <h2 id="medicinskt" className="text-h2 text-text">
              14. Inget medicinskt råd
            </h2>
            <blockquote className="border-l-4 border-warn pl-4 text-body text-text">
              <strong>
                TryggKontakt är ett koordinationsverktyg — inte en
                medicinsk tjänst.
              </strong>{" "}
              Inget i tjänsten utgör medicinsk rådgivning, diagnos eller
              behandlingsrekommendation.
            </blockquote>
            <p className="text-body text-text">
              För medicinska beslut ska du alltid konsultera legitimerad
              vårdpersonal. Aurora ansvarar inte för medicinska
              konsekvenser av beslut som fattats baserat på innehåll i
              tjänsten.
            </p>
            <p className="text-body text-text">
              I akuta situationer — ring <strong>112</strong>.
            </p>
          </section>

          <section aria-labelledby="uppsagning" className="flex flex-col gap-3">
            <h2 id="uppsagning" className="text-h2 text-text">
              15. Uppsägning och avslut
            </h2>

            <h3 className="text-h2 text-text">Din uppsägning</h3>
            <p className="text-body text-text">
              Du kan när som helst avsluta ditt konto via{" "}
              <em>Inställningar → Ta bort mitt konto</em> i appen.
              Raderingen är omedelbar i produktionsdatabasen; backuper
              rensas inom 30 dagar.
            </p>

            <h3 className="text-h2 text-text">Vår uppsägning</h3>
            <p className="text-body text-text">Vi kan avsluta ditt konto:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                med <strong>30 dagars varsel</strong> av valfri anledning
              </li>
              <li>
                <strong>omedelbart</strong> vid väsentligt avtalsbrott
                (t.ex. brott mot avsnitt 9), olaglig användning, eller om
                vår leverantör tvingas stänga tjänsten
              </li>
            </ul>
            <p className="text-body text-text">
              Vid uppsägning från vår sida informerar vi dig via e-post
              och ger dig — när det är möjligt — tid att exportera din
              data via <em>Exportera all min data</em>.
            </p>

            <h3 className="text-h2 text-text">
              Effekter av avslutat konto
            </h3>
            <p className="text-body text-text">När ditt konto avslutas:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>raderas allt innehåll du själv skapat</li>
              <li>avslutas dina medlemskap i alla kretsar</li>
              <li>
                ligger innehåll som du delat i andras kretsar kvar i
                kretsen enligt vad de andra medlemmarna har rätt till;
                kretsen kan inte fungera om varje historisk uppdatering
                försvinner när författaren lämnar (jfr.{" "}
                <Link href="/integritet#lagring" className="text-primary">
                  Personuppgiftspolicyn avsnitt 7
                </Link>
                )
              </li>
              <li>
                upphör dessa villkor att gälla för dig, med undantag för
                bestämmelser som till sin natur ska fortsätta gälla
                (avsnitt 7, 10, 13, 14, 16 och 18)
              </li>
            </ul>
          </section>

          <section aria-labelledby="lag" className="flex flex-col gap-3">
            <h2 id="lag" className="text-h2 text-text">
              16. Tillämplig lag och tvistlösning
            </h2>
            <p className="text-body text-text">
              Dessa villkor regleras av <strong>svensk lag</strong>.
            </p>
            <p className="text-body text-text">
              Tvister ska i första hand lösas i samförstånd. Når vi inte
              en lösning prövas tvisten av allmän domstol i Sverige, med{" "}
              <strong>Stockholms tingsrätt</strong> som första instans.
            </p>
            <p className="text-body text-text">
              Är du konsument har du rätt att vända dig till{" "}
              <strong>Allmänna reklamationsnämnden (ARN)</strong> —
              www.arn.se — och till EU:s plattform för tvistlösning
              online: ec.europa.eu/consumers/odr.
            </p>
          </section>

          <section aria-labelledby="andringar" className="flex flex-col gap-3">
            <h2 id="andringar" className="text-h2 text-text">
              17. Ändringar i villkoren
            </h2>
            <p className="text-body text-text">
              Vi kan komma att uppdatera dessa villkor. Vid{" "}
              <strong>väsentliga</strong> ändringar informerar vi dig via
              e-post och/eller en notis i appen minst{" "}
              <strong>30 dagar</strong> innan ändringen träder i kraft.
              Vid mindre ändringar (t.ex. förtydliganden, stavfel)
              meddelar vi via en notis på webbplatsen.
            </p>
            <p className="text-body text-text">
              Fortsätter du att använda tjänsten efter att ändringen trätt
              i kraft anses du ha accepterat den. Vill du inte acceptera
              den nya versionen kan du avsluta ditt konto enligt avsnitt
              15.
            </p>
          </section>

          <section aria-labelledby="kontakt" className="flex flex-col gap-3">
            <h2 id="kontakt" className="text-h2 text-text">
              18. Kontakt
            </h2>
            <p className="text-body text-text">
              Frågor om dessa villkor? Skriv till oss:
            </p>
            <address className="text-body text-text not-italic">
              <strong>Aurora Ecom AB</strong>
              <br />
              Org.nr: [ORG.NR — fylls i före publicering]
              <br />
              Adress: [POSTADRESS — fylls i före publicering]
              <br />
              E-post:{" "}
              <a href="mailto:info@auroraecom.se" className="text-primary">
                info@auroraecom.se
              </a>
            </address>
          </section>
        </article>
      </main>
    </div>
  );
}
