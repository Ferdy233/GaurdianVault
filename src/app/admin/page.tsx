import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import type { Profile, VaultItem } from "@/lib/types";

export const dynamic = "force-dynamic";

type ItemSummary = Pick<VaultItem, "id" | "customer_id" | "visible_to_customer">;

export default async function AdminHomePage() {
  const profile = await requireAdmin();
  const client = createAdminClient();

  const [customersRes, itemsRes] = await Promise.all([
    client
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("created_at", { ascending: false }),
    client.from("vault_items").select("id, customer_id, visible_to_customer")
  ]);

  const customers = (customersRes.data as Profile[] | null) ?? [];
  const items = (itemsRes.data as ItemSummary[] | null) ?? [];
  const hidden = items.filter((item) => !item.visible_to_customer).length;

  return (
    <div className="min-h-screen bg-paper">
      <TopBar profile={profile} links={[{ href: "/admin", label: "Clients" }]} />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-serif text-xl font-semibold text-ink">Client accounts</h1>
          <Link href="/admin/customers/new" className="btn-primary">
            Open new account
          </Link>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-x-8 border-y border-rule py-3 text-[13px]">
          <div>
            <dt className="text-2xs uppercase tracking-wide text-ink-500">Accounts</dt>
            <dd className="mt-0.5 text-ink">{customers.length}</dd>
          </div>
          <div>
            <dt className="text-2xs uppercase tracking-wide text-ink-500">Items catalogued</dt>
            <dd className="mt-0.5 text-ink">{items.length}</dd>
          </div>
          <div>
            <dt className="text-2xs uppercase tracking-wide text-ink-500">Withheld from clients</dt>
            <dd className="mt-0.5 text-ink">{hidden}</dd>
          </div>
        </dl>

        <section className="panel mt-8">
          <div className="panel-head">
            <h2 className="panel-title">Clients</h2>
            <p className="text-2xs text-ink-500">Newest first</p>
          </div>

          {customers.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-ink-500">
              No client accounts yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-head">Name</th>
                    <th className="table-head">Email</th>
                    <th className="table-head">Reference</th>
                    <th className="table-head text-right">Items</th>
                    <th className="table-head text-right">Visible</th>
                    <th className="table-head">Opened</th>
                    <th className="table-head">Status</th>
                    <th className="table-head" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {customers.map((customer) => {
                    const owned = items.filter((item) => item.customer_id === customer.id);

                    return (
                      <tr key={customer.id}>
                        <td className="table-cell font-medium">{customer.full_name}</td>
                        <td className="table-cell text-ink-700">{customer.email}</td>
                        <td className="table-cell text-ink-700">{customer.client_ref ?? "—"}</td>
                        <td className="table-cell text-right tabular-nums text-ink-700">
                          {owned.length}
                        </td>
                        <td className="table-cell text-right tabular-nums text-ink-700">
                          {owned.filter((item) => item.visible_to_customer).length}
                        </td>
                        <td className="table-cell whitespace-nowrap text-ink-700">
                          {formatDate(customer.created_at)}
                        </td>
                        <td className="table-cell">
                          <StatusBadge status={customer.status} />
                        </td>
                        <td className="table-cell text-right">
                          <Link href={`/admin/customers/${customer.id}`} className="link">
                            Open
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
