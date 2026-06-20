import PublicHeader from "../_components/public-header";

import { checkHealth } from "./check";

export const metadata = {
  title: "Status — TryggKontakt",
};

// Re-render at most every 30 seconds. The page is cheap to compute
// but the underlying DB ping isn't free; 30s is plenty for a status
// page and keeps Supabase load minimal under any kind of traffic
// spike toward this URL.
export const revalidate = 30;

export default async function StatusPage() {
  const health = await checkHealth();
  const dbOk = health.db === "ok";
  const allOk = dbOk;

  const lastChecked = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(health.timestamp));

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <PublicHeader />
      <main className="flex-1 px-4 pb-20 max-w-content mx-auto w-full flex flex-col gap-6">
        <header className="mt-4 flex flex-col gap-2">
          <h1 className="text-h1 text-text">TryggKontakt status</h1>
          <p className="text-meta text-text-muted">
            Senast kontrollerad: {lastChecked}
          </p>
        </header>

        <StatusCard
          label="Tjänsten"
          ok={allOk}
          okText="Tjänsten fungerar"
          downText="Tjänsten har problem"
        />

        <StatusCard
          label="Databas"
          ok={dbOk}
          okText="Svarar normalt"
          downText="Svarar inte"
        />

        {!allOk && (
          <section
            aria-labelledby="contact-heading"
            className="rounded-md bg-surface shadow-soft p-4 flex flex-col gap-2"
          >
            <h2 id="contact-heading" className="text-h2 text-text">
              Kontakt
            </h2>
            <p className="text-body text-text">
              Vi arbetar på att lösa problemet. Hör av dig om du har
              frågor:
            </p>
            <p className="text-body text-text">
              <a
                href="mailto:support@tryggkontakt.se"
                className="text-primary"
              >
                support@tryggkontakt.se
              </a>
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

function StatusCard({
  label,
  ok,
  okText,
  downText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  downText: string;
}) {
  return (
    <section
      aria-label={label}
      style={{
        backgroundColor: ok ? "var(--primary)" : "var(--danger)",
        color: "var(--primary-text)",
      }}
      className="rounded-md p-6 flex flex-col gap-1"
    >
      <p className="text-caption font-medium opacity-90">{label}</p>
      <p className="text-h1 font-semibold">{ok ? okText : downText}</p>
    </section>
  );
}
