import { signInWithMagicLink } from "./actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const sp = await searchParams;

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

        <form
          action={signInWithMagicLink}
          className="w-full max-w-sm flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-caption text-text">
              E-postadress
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
            />
          </div>

          {sp.sent && (
            <p role="status" className="text-body text-text">
              Vi har skickat en länk till din e-post.
            </p>
          )}
          {sp.error && (
            <p role="alert" className="text-body text-warn">
              Det gick inte att skicka länken. Försök igen.
            </p>
          )}

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
