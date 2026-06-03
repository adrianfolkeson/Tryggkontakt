import BottomNav from "./_components/bottom-nav";

export default function AppLoading() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 bg-bg flex items-center h-14 px-4 max-w-content mx-auto w-full">
        <div
          aria-hidden="true"
          className="h-6 w-32 rounded-sm bg-surface-sunken animate-pulse"
        />
      </header>
      <main
        aria-busy="true"
        aria-label="Laddar"
        className="flex-1 px-4 pt-4 pb-32 max-w-content mx-auto w-full flex flex-col gap-4"
      >
        <div className="h-32 rounded-md bg-surface shadow-soft animate-pulse" />
        <div className="h-32 rounded-md bg-surface shadow-soft animate-pulse" />
        <div className="h-32 rounded-md bg-surface shadow-soft animate-pulse" />
      </main>
      <BottomNav />
    </div>
  );
}
