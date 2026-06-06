import Link from "next/link";

export default function PublicHeader() {
  return (
    <header
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      className="sticky top-0 bg-bg flex items-center h-14 px-4 max-w-content mx-auto w-full"
    >
      <Link
        href="/"
        className="text-h2 text-primary font-semibold transition-colors duration-quick ease-standard hover:text-primary-hover"
      >
        TryggKontakt
      </Link>
    </header>
  );
}
