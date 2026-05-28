export default function SignInPage() {
  return (
    <main className="min-h-dvh flex flex-col px-4 max-w-content mx-auto w-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-12 py-16">
        <header className="text-center">
          <h1 className="text-display text-text">TryggKontakt</h1>
          <p className="mt-6 text-body text-text-muted">
            En lugn plats för
            <br />
            de runt en person.
          </p>
        </header>

        <form className="w-full max-w-sm flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-caption text-text">
              E-postadress
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-colors duration-quick ease-standard"
          >
            Skicka inloggningslänk
          </button>
        </form>
      </div>

      <footer className="py-8 text-center text-meta text-text-muted">
        <a href="/hjalp" className="hover:underline">
          Hjälp
        </a>
        <span className="mx-2" aria-hidden="true">
          ·
        </span>
        <a href="/integritet" className="hover:underline">
          Integritet
        </a>
      </footer>
    </main>
  );
}
