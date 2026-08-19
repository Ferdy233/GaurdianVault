import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { ActionForm } from "@/components/ActionForm";
import { requireAdmin } from "@/lib/auth";
import { createCustomer } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function NewCustomerPage() {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen bg-paper">
      <TopBar profile={profile} links={[{ href: "/admin", label: "Clients" }]} />

      <main className="mx-auto max-w-xl px-6 py-8">
        <Link href="/admin" className="text-[13px] text-ink-700 hover:text-navy">
          &larr; Clients
        </Link>

        <h1 className="mt-4 font-serif text-xl font-semibold text-ink">Open a client account</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
          Clients cannot register themselves. Set a temporary password here and hand it over after an
          in-person identity check.
        </p>

        <div className="panel mt-6">
          <div className="p-5">
            <ActionForm action={createCustomer} submitLabel="Create login" resetOnSuccess>
              <div>
                <label className="label" htmlFor="full_name">
                  Full name
                </label>
                <input id="full_name" name="full_name" required className="input" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="email">
                    Email (login)
                  </label>
                  <input id="email" name="email" type="email" required className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="phone">
                    Phone
                  </label>
                  <input id="phone" name="phone" className="input" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="client_ref">
                    Client reference
                  </label>
                  <input id="client_ref" name="client_ref" className="input" placeholder="GV-1042" />
                </div>
                <div>
                  <label className="label" htmlFor="password">
                    Temporary password
                  </label>
                  <input
                    id="password"
                    name="password"
                    minLength={10}
                    required
                    className="input"
                    placeholder="At least 10 characters"
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="notes">
                  Internal notes (never shown to the client)
                </label>
                <textarea id="notes" name="notes" rows={3} className="input" />
              </div>
            </ActionForm>
          </div>
        </div>

        <p className="mt-4 text-[13px] text-ink-500">
          The temporary password is not stored in readable form. Record it before leaving this page.
        </p>
      </main>
    </div>
  );
}
