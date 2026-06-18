import PublicHeader from "../_components/public-header";

export const metadata = {
  title: "Personuppgiftspolicy — TryggKontakt",
};

const TOC = [
  { id: "ansvarig", label: "1. Personuppgiftsansvarig" },
  { id: "vad-vi-gor", label: "2. Vad TryggKontakt är och vad vi gör med dina uppgifter" },
  { id: "uppgifter", label: "3. Vilka uppgifter vi behandlar" },
  { id: "halsa", label: "4. Hälsorelaterad information (Art 9)" },
  { id: "rattslig-grund", label: "5. Rättslig grund för behandlingen" },
  { id: "mottagare", label: "6. Vilka som tar del av uppgifterna" },
  { id: "lagring", label: "7. Lagring och radering" },
  { id: "overforing", label: "8. Överföringar utanför EU/EES" },
  { id: "sakerhet", label: "9. Säkerhet" },
  { id: "cookies", label: "10. Cookies" },
  { id: "rattigheter", label: "11. Dina rättigheter" },
  { id: "klagomal", label: "12. Klagomål till Integritetsskyddsmyndigheten" },
  { id: "automatik", label: "13. Automatiserat beslutsfattande och profilering" },
  { id: "andringar", label: "14. Ändringar i policyn" },
  { id: "andringslogg", label: "15. Ändringslogg" },
];

export default function IntegritetPage() {
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
            <h1 className="text-h1 text-text">
              Personuppgiftspolicy för TryggKontakt
            </h1>
            <p className="text-meta text-text-muted">
              Senast uppdaterad 2026-06-15 · Version 1.0-utkast
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

          <section aria-labelledby="ansvarig" className="flex flex-col gap-3">
            <h2 id="ansvarig" className="text-h2 text-text">
              1. Personuppgiftsansvarig
            </h2>
            <p className="text-body text-text">
              Personuppgiftsansvarig för behandlingen är:
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
              <br />
              Webbplats: www.tryggkontakt.se
              <br />
              Kontaktperson: Adrian Folkeson
            </address>
            <p className="text-body text-text">
              Vi har inte utsett ett dataskyddsombud (DPO). Vår
              verksamhet bedöms inte uppfylla kriterierna i artikel 37
              GDPR för obligatoriskt dataskyddsombud. Vill du nå oss i
              dataskyddsfrågor skickar du e-post till info@auroraecom.se.
            </p>
          </section>

          <section aria-labelledby="vad-vi-gor" className="flex flex-col gap-3">
            <h2 id="vad-vi-gor" className="text-h2 text-text">
              2. Vad TryggKontakt är och vad vi gör med dina uppgifter
            </h2>
            <p className="text-body text-text">
              TryggKontakt är en kommunikationsyta för familjer, personliga
              assistenter, skolpersonal och samordnare som tillsammans
              stöttar en person med kognitiv funktionsnedsättning. Du och
              de andra i <strong>kretsen</strong> delar korta uppdateringar
              om vardagen, ett gemensamt schema, och påminnelser.
            </p>
            <p className="text-body text-text">
              Vi behandlar dina personuppgifter för att:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>du ska kunna logga in på ditt konto</li>
              <li>du ska kunna skapa, läsa och dela uppdateringar inom din krets</li>
              <li>du ska kunna bjuda in andra till kretsen och hantera medlemskap</li>
              <li>du ska kunna exportera dina egna uppgifter och radera ditt konto</li>
              <li>vi ska kunna skicka transaktionsmejl (inbjudningslänkar och inloggningslänkar)</li>
            </ul>
            <p className="text-body text-text">
              Vi använder <strong>inte</strong> dina uppgifter för
              marknadsföring, profilering, tredjepartsanalys eller
              försäljning. Vi tränar inga AI-modeller på ditt innehåll.
            </p>
          </section>

          <section aria-labelledby="uppgifter" className="flex flex-col gap-3">
            <h2 id="uppgifter" className="text-h2 text-text">
              3. Vilka uppgifter vi behandlar
            </h2>

            <h3 className="text-h2 text-text">Identitets- och kontaktuppgifter</h3>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>Namn (visningsnamn)</li>
              <li>Profilbild (om du laddar upp en)</li>
              <li>E-postadress (används för inloggning)</li>
              <li>Telefonnummer (frivilligt, syns för övriga kretsmedlemmar)</li>
            </ul>

            <h3 className="text-h2 text-text">Autentiseringsuppgifter</h3>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>Magic-link-token för engångsinloggning</li>
              <li>Sessionskakor som håller dig inloggad</li>
              <li>Tidsstämplar för senaste inloggning</li>
            </ul>

            <h3 className="text-h2 text-text">Innehåll du själv skapar i kretsen</h3>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                <strong>Dagliga uppdateringar:</strong> korta texter om hur
                det går — sömn, måltider, humör, energi, samt en valfri
                fritext
              </li>
              <li>
                <strong>Snabbnoteringar:</strong> korta fritextanteckningar
              </li>
              <li>
                <strong>Schemaposter:</strong> aktiviteter med tid, titel
                och eventuella anteckningar
              </li>
              <li>
                <strong>Påminnelser:</strong> korta titlar med tidpunkt
              </li>
              <li>
                <strong>Inbjudningar:</strong> e-postadressen till personer
                du bjuder in
              </li>
            </ul>

            <h3 className="text-h2 text-text">
              Information om personen i kretsens centrum
            </h3>
            <p className="text-body text-text">
              Den person som kretsen är till för (ofta ett barn eller en
              vuxen familjemedlem) förekommer i:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>Namn (visningsnamn)</li>
              <li>Eventuellt födelsedatum, om du lägger till det</li>
              <li>
                Innehållet i dagliga uppdateringar och anteckningar handlar
                i praktiken oftast om denna person
              </li>
            </ul>
            <p className="text-body text-text">
              Se även avsnitt 4 om hälsorelaterad information.
            </p>

            <h3 className="text-h2 text-text">Tekniska uppgifter</h3>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                Inställningar: standard­synlighet för dina uppdateringar
                (alla i kretsen / bara anhöriga) och vald textstorlek
              </li>
              <li>
                Medlemsroll i kretsen (anhörig, personal, skola,
                samordnare) och giltighetstid för medlemskapet
              </li>
              <li>
                Åtkomstloggar (när byggt — i dag enbart vid behov för
                felsökning)
              </li>
            </ul>
          </section>

          <section aria-labelledby="halsa" className="flex flex-col gap-3">
            <h2 id="halsa" className="text-h2 text-text">
              4. Hälsorelaterad information (Art 9)
            </h2>
            <p className="text-body text-text">
              Innehållet i en daglig uppdatering kan röra hälsa: sömn,
              måltider, humör och energi hos personen i kretsens centrum.
              Sådana uppgifter räknas som{" "}
              <strong>särskilda kategorier av personuppgifter</strong>{" "}
              enligt artikel 9 GDPR.
            </p>
            <p className="text-body text-text">
              Den rättsliga grunden för att behandla dessa uppgifter är{" "}
              <strong>uttryckligt samtycke</strong> enligt artikel 9.2.a
              GDPR. Samtycket inhämtas från personen själv eller från
              företrädare (vårdnadshavare eller god man) vid den tidpunkt
              då kretsen skapas eller en medlem läggs till.
            </p>
            <p className="text-body text-text">
              Du kan när som helst återkalla samtycket. Återkallandet
              påverkar inte behandling som redan skett. Hur du återkallar:
              se avsnitt 11.
            </p>
          </section>

          <section aria-labelledby="rattslig-grund" className="flex flex-col gap-3">
            <h2 id="rattslig-grund" className="text-h2 text-text">
              5. Rättslig grund för behandlingen
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-body text-text border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Behandling</th>
                    <th className="text-left py-2 font-semibold">Rättslig grund</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">Skapa och driva ditt konto</td>
                    <td className="py-2">Avtal (Art 6.1.b)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">Skicka magic-link och inbjudningar</td>
                    <td className="py-2">Avtal (Art 6.1.b)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">Innehåll i dagliga uppdateringar</td>
                    <td className="py-2">Samtycke (Art 6.1.a)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">
                      Hälsorelaterat innehåll om personen i kretsens centrum
                    </td>
                    <td className="py-2">Uttryckligt samtycke (Art 9.2.a)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Säkerhetsloggar och felsökning</td>
                    <td className="py-2">Berättigat intresse (Art 6.1.f)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="mottagare" className="flex flex-col gap-3">
            <h2 id="mottagare" className="text-h2 text-text">
              6. Vilka som tar del av uppgifterna
            </h2>

            <h3 className="text-h2 text-text">Inom kretsen</h3>
            <p className="text-body text-text">
              Andra medlemmar i din krets ser de uppdateringar som du
              skriver. Du bestämmer per uppdatering om den ska vara synlig
              för <strong>alla i kretsen</strong> eller{" "}
              <strong>bara anhöriga</strong>. Avsändaren ser alltid sina
              egna uppdateringar.
            </p>
            <p className="text-body text-text">
              Personal, skola och samordnare ser <strong>inte</strong>{" "}
              uppdateringar markerade som &ldquo;bara anhöriga&rdquo;.
            </p>

            <h3 className="text-h2 text-text">Underbiträden (subprocessors)</h3>
            <p className="text-body text-text">
              Vi anlitar följande tjänsteleverantörer:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-body text-text border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Underbiträde</th>
                    <th className="text-left py-2 pr-4 font-semibold">Ändamål</th>
                    <th className="text-left py-2 font-semibold">Plats</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">Supabase Inc.</td>
                    <td className="py-2 pr-4">Databas, autentisering, lagring</td>
                    <td className="py-2">EU (Frankfurt, eu-central-1)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">Vercel Inc.</td>
                    <td className="py-2 pr-4">Applikationshosting</td>
                    <td className="py-2">EU (Frankfurt, fra1)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Resend Inc.</td>
                    <td className="py-2 pr-4">
                      Transaktionsmejl (inbjudningar och magic-link)
                    </td>
                    <td className="py-2">USA — se avsnitt 8</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-body text-text">
              Vi har personuppgiftsbiträdesavtal (DPA) med samtliga
              underbiträden.
            </p>

            <h3 className="text-h2 text-text">Andra mottagare</h3>
            <p className="text-body text-text">
              Vi delar inte personuppgifter med någon annan part. Vi
              använder inga reklamnätverk, analystjänster eller
              spårningspixlar. Vi säljer aldrig data vidare.
            </p>
            <p className="text-body text-text">
              Om vi blir skyldiga att lämna ut uppgifter enligt svensk lag
              (t.ex. till polis eller domstol) gör vi det enbart efter
              formellt föreläggande.
            </p>
          </section>

          <section aria-labelledby="lagring" className="flex flex-col gap-3">
            <h2 id="lagring" className="text-h2 text-text">
              7. Lagring och radering
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-body text-text border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Datatyp</th>
                    <th className="text-left py-2 font-semibold">Lagringstid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">Aktiva konton och tillhörande innehåll</td>
                    <td className="py-2">Så länge du är aktiv medlem i en krets</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">
                      Konton som raderas via &ldquo;Ta bort mitt konto&rdquo;
                    </td>
                    <td className="py-2">
                      Raderas omedelbart i produktion. Backuper rensas
                      inom 30 dagar.
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">Inbjudningar som inte accepterats</td>
                    <td className="py-2">7 dagar (då löper de ut automatiskt)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">Magic-link-token</td>
                    <td className="py-2">
                      Engångsbruk; löper ut enligt Supabase-standard, max 24
                      timmar
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">Inloggningssessioner</td>
                    <td className="py-2">
                      Tills du loggar ut eller sessionen löper ut
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">Backuper</td>
                    <td className="py-2">30 dagar rullande, hanterat av Supabase</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Felsökningsloggar</td>
                    <td className="py-2">14 dagar</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-body text-text">
              När ett medlemskap avslutas (en personal eller samordnare
              lämnar kretsen) tappar personen omedelbart läs­åtkomst till
              kretsens data, men det innehåll de tidigare skrivit ligger
              kvar i kretsens historik. Detta är för att övriga medlemmar
              ska kunna gå tillbaka i journalen.
            </p>
          </section>

          <section aria-labelledby="overforing" className="flex flex-col gap-3">
            <h2 id="overforing" className="text-h2 text-text">
              8. Överföringar utanför EU/EES
            </h2>
            <p className="text-body text-text">
              Vår databas, autentisering och applikationshosting drivs i
              Tyskland (Frankfurt). All data du skriver in lagras inom EU.
            </p>
            <p className="text-body text-text">
              Vår leverantör av transaktionsmejl,{" "}
              <strong>Resend Inc.</strong>, har infrastruktur i USA. När vi
              skickar en inbjudan eller en inloggningslänk passerar
              e-postadressen och själva e-postinnehållet Resends servrar.
            </p>
            <p className="text-body text-text">
              Överföringen sker med stöd av{" "}
              <strong>standardavtalsklausuler</strong> (SCC, Standard
              Contractual Clauses) enligt artikel 46 GDPR, kombinerat med
              tekniska skyddsåtgärder (TLS i transit).
            </p>
          </section>

          <section aria-labelledby="sakerhet" className="flex flex-col gap-3">
            <h2 id="sakerhet" className="text-h2 text-text">
              9. Säkerhet
            </h2>
            <p className="text-body text-text">Vi använder:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>TLS 1.3 för all dataöverföring mellan dig och våra system</li>
              <li>Kryptering i vila (AES-256) på databasen</li>
              <li>
                <strong>Row-Level Security (RLS)</strong> i databasen —
                åtkomst till varje enskild rad styrs av regler i databasen,
                inte av appen. Det innebär att en buggig klient inte kan
                kringgå behörigheterna.
              </li>
              <li>Rollbaserad behörighet på varje krets</li>
              <li>
                Tidsbegränsade medlemskap — när en medlem avslutas tappas
                åtkomsten omedelbart
              </li>
              <li>Magic-link-inloggning (inga lösenord)</li>
              <li>EU-baserad hosting i Frankfurt</li>
            </ul>
          </section>

          <section aria-labelledby="cookies" className="flex flex-col gap-3">
            <h2 id="cookies" className="text-h2 text-text">
              10. Cookies
            </h2>
            <p className="text-body text-text">
              TryggKontakt använder endast <strong>funktionella kakor</strong>:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-body text-text border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Kaka</th>
                    <th className="text-left py-2 pr-4 font-semibold">Syfte</th>
                    <th className="text-left py-2 font-semibold">Varaktighet</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">
                      <code>sb-*</code>
                    </td>
                    <td className="py-2 pr-4">Håller dig inloggad efter magic-link</td>
                    <td className="py-2">
                      Tills du loggar ut eller sessionen löper ut
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      <code>tk-text-size</code>
                    </td>
                    <td className="py-2 pr-4">Sparar din valda textstorlek</td>
                    <td className="py-2">1 år</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-body text-text">
              Vi använder <strong>inga</strong> tredjepartskakor,{" "}
              <strong>inga</strong> spårningsskript, <strong>inga</strong>{" "}
              analyspixlar och <strong>ingen</strong> reklam. Vi behöver
              därför inte visa någon kaksamtycke-banner eftersom samtliga
              kakor är nödvändiga för tjänsten respektive baseras på en
              uttrycklig användarinställning.
            </p>
          </section>

          <section aria-labelledby="rattigheter" className="flex flex-col gap-3">
            <h2 id="rattigheter" className="text-h2 text-text">
              11. Dina rättigheter
            </h2>
            <p className="text-body text-text">
              Som registrerad har du rätt att:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-body text-text">
              <li>
                <strong>Få tillgång till dina uppgifter (Art 15).</strong> Du
                laddar själv ner alla uppgifter du har skapat via{" "}
                <em>Inställningar → Exportera all min data</em> i appen.
                Filen är i JSON-format.
              </li>
              <li>
                <strong>Rätta felaktiga uppgifter (Art 16).</strong> Du
                redigerar din profil och dina uppdateringar direkt i appen.
                Vid behov kan du skriva till info@auroraecom.se.
              </li>
              <li>
                <strong>Radera dina uppgifter (Art 17).</strong> Du raderar
                själv hela ditt konto via{" "}
                <em>Inställningar → Ta bort mitt konto</em>. Allt innehåll
                du skapat tas bort i produktionsdatabasen omedelbart.
              </li>
              <li>
                <strong>Begränsa behandlingen (Art 18).</strong> Kontakta
                info@auroraecom.se.
              </li>
              <li>
                <strong>Få ut dina uppgifter i ett portabelt format (Art 20).</strong>{" "}
                Använd exportfunktionen (samma som under &ldquo;tillgång&rdquo;).
              </li>
              <li>
                <strong>Invända mot behandling (Art 21).</strong> Kontakta
                info@auroraecom.se.
              </li>
              <li>
                <strong>Återkalla samtycke (Art 7).</strong> Du kan när som
                helst återkalla ditt samtycke genom att radera kontot eller
                genom att kontakta oss. Återkallande påverkar inte
                behandling som redan skett.
              </li>
            </ul>
            <p className="text-body text-text">
              Vi svarar på begäranden inom 30 dagar.
            </p>
          </section>

          <section aria-labelledby="klagomal" className="flex flex-col gap-3">
            <h2 id="klagomal" className="text-h2 text-text">
              12. Klagomål till Integritetsskyddsmyndigheten
            </h2>
            <p className="text-body text-text">
              Anser du att vi behandlar dina uppgifter felaktigt har du
              rätt att lämna klagomål till tillsynsmyndigheten:
            </p>
            <address className="text-body text-text not-italic">
              <strong>Integritetsskyddsmyndigheten (IMY)</strong>
              <br />
              E-post:{" "}
              <a href="mailto:imy@imy.se" className="text-primary">
                imy@imy.se
              </a>
              <br />
              Postadress: Box 8114, 104 20 Stockholm
              <br />
              Webbplats: www.imy.se
            </address>
          </section>

          <section aria-labelledby="automatik" className="flex flex-col gap-3">
            <h2 id="automatik" className="text-h2 text-text">
              13. Automatiserat beslutsfattande och profilering
            </h2>
            <p className="text-body text-text">
              TryggKontakt utför <strong>inget</strong> automatiserat
              beslutsfattande som ger juridisk verkan eller på annat sätt
              påverkar dig på liknande betydande sätt enligt artikel 22
              GDPR. Vi profilerar dig inte.
            </p>
          </section>

          <section aria-labelledby="andringar" className="flex flex-col gap-3">
            <h2 id="andringar" className="text-h2 text-text">
              14. Ändringar i policyn
            </h2>
            <p className="text-body text-text">
              Vi kan komma att uppdatera denna policy. Vid väsentliga
              ändringar informerar vi via e-post och/eller en notis i
              appen innan ändringen träder i kraft. Tidigare versioner
              finns i ändringsloggen nedan och i Git-historiken för
              www.tryggkontakt.se.
            </p>
          </section>

          <section aria-labelledby="andringslogg" className="flex flex-col gap-3">
            <h2 id="andringslogg" className="text-h2 text-text">
              15. Ändringslogg
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-body text-text">
              <li>
                <strong>1.0-utkast (2026-06-15)</strong> — Första utkastet.
                Skickas för juridisk granskning innan publicering.
              </li>
            </ul>
          </section>
        </article>
      </main>
    </div>
  );
}
