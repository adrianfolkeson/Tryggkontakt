import { Calendar, House, User } from "lucide-react";

export default function AppPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <main className="flex-1 px-4 pt-8 pb-32 max-w-content mx-auto w-full">
        <h1 className="text-display text-text">God morgon, Adrian</h1>

        <section
          aria-labelledby="latest-update-title"
          className="mt-8 rounded-md bg-surface shadow-soft p-4 flex flex-col gap-3"
        >
          <div>
            <h2 id="latest-update-title" className="text-h2 text-text">
              Senaste från Maria
            </h2>
            <p className="text-meta text-text-muted mt-1">idag 09:14</p>
          </div>

          <p className="text-body text-text">
            <span aria-hidden="true">🙂</span> Lugn{" "}
            <span aria-hidden="true">·</span> Sömn okej{" "}
            <span aria-hidden="true">·</span> Energi medel
          </p>

          <p className="text-body-lg text-text">
            Åt bra till frukost, lite trött efter promenaden.
          </p>
        </section>

        <div className="mt-12">
          <button
            type="button"
            className="w-full min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-colors duration-quick ease-standard"
          >
            Lägg till uppdatering
          </button>
        </div>

        <section aria-labelledby="today-title" className="mt-8">
          <h2 id="today-title" className="text-h2 text-text">
            Idag
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-body text-text">
            <li>
              <span aria-hidden="true">•</span> 14:00 Tandläkare
            </li>
            <li>
              <span aria-hidden="true">•</span> 17:00 Maria slutar pass
            </li>
          </ul>
        </section>
      </main>

      <nav
        aria-label="Huvudnavigering"
        className="fixed inset-x-0 bottom-0 bg-surface border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="flex h-16 max-w-content mx-auto">
          <li className="flex-1">
            <a
              href="/app"
              aria-current="page"
              className="h-full flex flex-col items-center justify-center gap-1 text-primary font-semibold"
            >
              <House size={28} strokeWidth={1.75} aria-hidden="true" />
              <span className="text-caption">Hem</span>
            </a>
          </li>
          <li className="flex-1">
            <a
              href="/app/schema"
              className="h-full flex flex-col items-center justify-center gap-1 text-text-muted font-medium"
            >
              <Calendar size={28} strokeWidth={1.75} aria-hidden="true" />
              <span className="text-caption">Kalender</span>
            </a>
          </li>
          <li className="flex-1">
            <a
              href="/app/mig"
              className="h-full flex flex-col items-center justify-center gap-1 text-text-muted font-medium"
            >
              <User size={28} strokeWidth={1.75} aria-hidden="true" />
              <span className="text-caption">Min sida</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
