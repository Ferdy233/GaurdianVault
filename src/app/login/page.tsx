import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { PHOTOS } from "@/lib/images";
import { LoginForm } from "./LoginForm";

const ERRORS: Record<string, string> = {
  suspended: "This account is suspended. Please contact the vault team.",
  session: "Your session expired. Please sign in again."
};

export default function LoginPage({
  searchParams
}: {
  searchParams?: { next?: string; error?: string };
}) {
  const initialError = searchParams?.error ? ERRORS[searchParams.error] : undefined;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_28rem]">
      {/* Photographic panel, hidden on small screens. */}
      <div className="photo-frame hidden border-0 lg:block">
        <Image
          src={PHOTOS.vaultRoom.src}
          alt={PHOTOS.vaultRoom.alt}
          fill
          priority
          sizes="60vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-navy-900 via-navy-900/70 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <span className="font-serif text-[17px] font-semibold text-white">Guardian Vault</span>
          <div>
            <p className="eyebrow text-brass-400">Client portal</p>
            <p className="mt-3 max-w-md font-serif text-2xl leading-snug text-white">
              Your holding, exactly as it appears in our vault register.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col border-l border-rule bg-paper">
        <header className="flex items-center justify-between border-b-2 border-brass bg-navy-900 px-6 py-3">
          <span className="font-serif text-[15px] font-semibold text-white lg:hidden">
            Guardian Vault
          </span>
          <span className="hidden text-2xs uppercase tracking-[0.18em] text-brass-400 lg:inline">
            Client sign in
          </span>
          <Link href="/" className="text-[13px] text-navy-100 hover:text-white">
            Return to site
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center px-6 py-12">
          <h1 className="font-serif text-xl font-semibold text-navy">Client sign in</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
            Enter the credentials issued to you by the vault team.
          </p>

          <div className="panel mt-6 border-t-2 border-t-brass p-5">
            <LoginForm next={searchParams?.next} initialError={initialError} />
          </div>

          <p className="mt-5 text-[13px] leading-relaxed text-ink-500">
            Lost your password? Telephone{" "}
            <a href={`tel:${COMPANY.telephoneHref}`} className="link">
              {COMPANY.telephone}
            </a>{" "}
            or email{" "}
            <a href={`mailto:${COMPANY.email}`} className="link">
              {COMPANY.email}
            </a>
            . For security, passwords are reset by a vault administrator once your identity has been
            confirmed. Accounts cannot be created online.
          </p>
        </main>
      </div>
    </div>
  );
}
