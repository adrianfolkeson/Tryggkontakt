import { Calendar, House, User, type LucideIcon } from "lucide-react";

type ActiveTab = "home" | "calendar" | "profile";

export default function BottomNav({ active }: { active?: ActiveTab }) {
  return (
    <nav
      aria-label="Huvudnavigering"
      className="fixed inset-x-0 bottom-0 bg-surface border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex h-16 max-w-content mx-auto">
        <NavTab
          href="/app"
          label="Hem"
          Icon={House}
          isActive={active === "home"}
        />
        <NavTab
          href="/app/schema"
          label="Kalender"
          Icon={Calendar}
          isActive={active === "calendar"}
        />
        <NavTab
          href="/app/mig"
          label="Min sida"
          Icon={User}
          isActive={active === "profile"}
        />
      </ul>
    </nav>
  );
}

function NavTab({
  href,
  label,
  Icon,
  isActive,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
}) {
  return (
    <li className="flex-1">
      <a
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`h-full flex flex-col items-center justify-center gap-1 ${
          isActive
            ? "text-primary font-semibold"
            : "text-text-muted font-medium transition-colors duration-quick ease-standard hover:text-text"
        }`}
      >
        <Icon size={28} strokeWidth={1.75} aria-hidden="true" />
        <span className="text-caption">{label}</span>
      </a>
    </li>
  );
}
