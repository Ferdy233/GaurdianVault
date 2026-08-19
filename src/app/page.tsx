import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { PHOTOS } from "@/lib/images";

const holdings = [
  {
    title: "Jewellery and watches",
    body: "Individually described and, where instructed, photographed at intake.",
    photo: PHOTOS.jewellery
  },
  {
    title: "Precious metals",
    body: "Bullion and coin recorded by weight, fineness and serial where applicable.",
    photo: PHOTOS.bullion
  },
  {
    title: "Documents and deeds",
    body: "Title deeds, wills, share certificates and contracts, kept flat and dry.",
    photo: PHOTOS.documents
  }
];

const terms = [
  ["Access", "By appointment during opening hours. Identity is checked on every visit."],
  ["Register", "Deposits, withdrawals and inspections are entered in the vault register."],
  ["Insurance", "Cover is arranged per account. Declared values remain the client's responsibility."],
  ["Accounts", "Opened in person. Credentials are issued by a member of the vault team."]
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b-2 border-brass bg-navy-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="inline-flex items-baseline gap-2">
            <span className="font-serif text-[17px] font-semibold tracking-tight text-white">
              Guardian Vault
            </span>
            <span className="hidden border-l border-white/25 pl-2 text-2xs uppercase tracking-[0.18em] text-brass-400 sm:inline">
              Custody
            </span>
          </Link>
          <nav className="flex items-baseline gap-5 text-[13px]">
            <a href="#holdings" className="hidden text-navy-100 hover:text-white sm:inline">
              What we hold
            </a>
            <a href="#terms" className="hidden text-navy-100 hover:text-white sm:inline">
              Terms of custody
            </a>
            <a href="#contact" className="hidden text-navy-100 hover:text-white sm:inline">
              Contact
            </a>
            <Link href="/login" className="btn-brass">
              Client login
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative">
        <div className="photo-frame h-[22rem] border-x-0 border-t-0 sm:h-[26rem]">
          <Image
            src={PHOTOS.vaultRoom.src}
            alt={PHOTOS.vaultRoom.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/80 to-navy-900/20" />
          <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-center px-6">
            <p className="eyebrow text-brass-400">Safe deposit &amp; private custody</p>
            <h1 className="mt-4 max-w-2xl font-serif text-3xl font-semibold leading-snug text-white sm:text-[2.6rem]">
              Documented custody of property that should not be kept at home.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-navy-100">
              {COMPANY.name} holds jewellery, precious metals, documents and collectibles for private
              clients and businesses. Everything we accept is entered in the vault register, and each
              client can review their own holding online.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link href="/login" className="btn-brass">
                Sign in to your account
              </Link>
              <a href="#contact" className="text-[13px] text-white underline underline-offset-4">
                Enquire about an account
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6">
        <section id="holdings" className="border-b border-rule py-14">
          <p className="eyebrow">What we hold</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-navy">
            Four categories, one register
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-700">
            Custody is arranged per client. Every entry on the register carries a description, a
            declared value and the box it sits in.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {holdings.map(({ title, body, photo }) => (
              <article key={title}>
                <div className="photo-frame aspect-[4/3]">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-3 border-t-2 border-brass pt-2 text-[14px] font-semibold text-navy">
                  {title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 border-l-2 border-brass bg-brass-100/60 px-4 py-3 text-[13px] leading-relaxed text-ink-700">
            We do not accept perishable goods, firearms, hazardous materials, or anything whose
            possession would be unlawful. Storage limits and acceptance are agreed in writing when the
            account is opened.
          </div>
        </section>

        <section id="terms" className="border-b border-rule py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
            <div>
              <p className="eyebrow">Terms of custody</p>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-navy">
                What a client can expect
              </h2>
              <dl className="mt-6 divide-y divide-rule border-y border-rule">
                {terms.map(([term, detail]) => (
                  <div key={term} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <dt className="text-[13px] font-semibold text-navy">{term}</dt>
                    <dd className="text-[13px] leading-relaxed text-ink-700">{detail}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 max-w-2xl text-[13px] leading-relaxed text-ink-500">
                There is no public registration. If you have not been given a username by the vault
                team, you do not yet have an online account.
              </p>
            </div>

            <div className="photo-frame aspect-[3/4] lg:aspect-auto">
              <Image
                src={PHOTOS.regalia.src}
                alt={PHOTOS.regalia.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 18rem"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section id="contact" className="py-14">
          <p className="eyebrow">Contact</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-navy">Open an account</h2>

          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <dl className="space-y-2 text-[13px]">
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-ink-500">Telephone</dt>
                <dd>
                  <a href={`tel:${COMPANY.telephoneHref}`} className="link">
                    {COMPANY.telephone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-ink-500">Email</dt>
                <dd>
                  <a href={`mailto:${COMPANY.email}`} className="link">
                    {COMPANY.email}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-ink-500">Hours</dt>
                <dd className="text-ink">{COMPANY.hours}</dd>
              </div>
              {COMPANY.address.length > 0 ? (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-ink-500">Address</dt>
                  <dd className="text-ink">
                    {COMPANY.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="border-l-2 border-navy bg-navy-50 px-5 py-4 text-[13px] leading-relaxed text-ink-700">
              <p>
                New accounts require an appointment and photographic identification. Once a box has
                been assigned, the vault team issues your login in person.
              </p>
              <p className="mt-3">
                Existing clients who have lost their password should telephone the vault; passwords
                are reset only after identity has been confirmed.
              </p>
              <Link href="/login" className="btn-primary mt-4">
                Existing client sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-brass bg-navy-900">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-6 text-2xs text-navy-100 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {COMPANY.legalName}
          </p>
          <p>
            <a href={`tel:${COMPANY.telephoneHref}`} className="hover:text-white">
              {COMPANY.telephone}
            </a>
            <span className="px-2 text-brass-400">&middot;</span>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-white">
              {COMPANY.email}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
