export default function OnboardingLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Laddar"
      className="min-h-dvh flex flex-col px-4 max-w-content mx-auto w-full"
    >
      <div className="flex-1 flex flex-col py-16 gap-8">
        <div
          aria-hidden="true"
          className="h-8 w-48 rounded-sm bg-surface-sunken animate-pulse"
        />
        <div className="flex flex-col gap-6">
          <div className="min-h-button rounded-sm bg-surface-sunken animate-pulse" />
          <div className="min-h-button rounded-sm bg-surface-sunken animate-pulse" />
          <div className="min-h-button rounded-sm bg-surface-sunken animate-pulse" />
        </div>
      </div>
    </main>
  );
}
