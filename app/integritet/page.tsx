import PublicHeader from "../_components/public-header";

export const metadata = {
  title: "Integritetspolicy — TryggKontakt",
};

export default function IntegritetPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <PublicHeader />
      <main className="flex-1 px-4 pb-12 max-w-content mx-auto w-full flex flex-col gap-6">
        <h1 className="text-h1 text-text">Integritetspolicy</h1>
        <p className="text-body text-text">
          Under utveckling. Vi formaliserar vår integritetspolicy under
          sommaren 2026. Tills dess gäller: data lagras i Frankfurt (EU),
          inga tredjepartsspårare används, och vi säljer aldrig data
          vidare. Kontakta info@tryggkontakt.se vid frågor.
        </p>
      </main>
    </div>
  );
}
