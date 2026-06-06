import PublicHeader from "../_components/public-header";

export const metadata = {
  title: "Användarvillkor — TryggKontakt",
};

export default function VillkorPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <PublicHeader />
      <main className="flex-1 px-4 pb-12 max-w-content mx-auto w-full flex flex-col gap-6">
        <h1 className="text-h1 text-text">Användarvillkor</h1>
        <p className="text-body text-text">
          Under utveckling. Användarvillkor formaliseras under sommaren
          2026. Tills dess gäller: TryggKontakt tillhandahålls i nuvarande
          skick som en begränsad förhandsversion. Inget servicenivåavtal.
          Användning sker på egen risk under utvecklingsfasen.
        </p>
      </main>
    </div>
  );
}
