import Link from "next/link";
import { signOut } from "@/app/login/actions";
import type { Profile } from "@/lib/types";

export function TopBar({
  profile,
  links
}: {
  profile: Profile;
  links?: { href: string; label: string }[];
}) {
  return (
    <header className="border-b-2 border-brass bg-navy-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 py-2.5">
        <div className="flex items-baseline gap-6">
          <Link
            href={profile.role === "admin" ? "/admin" : "/dashboard"}
            className="inline-flex items-baseline gap-2"
          >
            <span className="font-serif text-[16px] font-semibold text-white">Guardian Vault</span>
            <span className="hidden border-l border-white/25 pl-2 text-2xs uppercase tracking-[0.18em] text-brass-400 sm:inline">
              {profile.role === "admin" ? "Vault office" : "Client portal"}
            </span>
          </Link>
          {links?.length ? (
            <nav className="flex items-baseline gap-4 text-[13px]">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="text-navy-100 hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-baseline gap-4 text-[13px]">
          <span className="text-navy-100">
            {profile.full_name || profile.email}
            <span className="ml-2 text-2xs uppercase tracking-wide text-brass-400">
              {profile.role === "admin" ? "Administrator" : "Client"}
            </span>
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-navy-100 underline underline-offset-2 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
