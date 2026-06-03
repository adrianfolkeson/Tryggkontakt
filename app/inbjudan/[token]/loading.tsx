export default function InviteLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Laddar"
      className="min-h-dvh flex flex-col px-4 max-w-content mx-auto w-full"
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-16">
        <div
          aria-hidden="true"
          className="h-8 w-64 rounded-sm bg-surface-sunken animate-pulse"
        />
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="min-h-button rounded-sm bg-surface-sunken animate-pulse" />
          <div className="min-h-button rounded-sm bg-surface-sunken animate-pulse" />
          <div className="min-h-button rounded-lg bg-surface-sunken animate-pulse" />
        </div>
      </div>
    </main>
  );
}
