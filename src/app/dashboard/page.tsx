import Image from "next/image";
import { TopBar } from "@/components/TopBar";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryTag } from "@/components/CategoryTag";
import { PHOTOS } from "@/lib/images";
import { COMPANY } from "@/lib/company";
import { requireCustomer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime, formatMoney, titleCase } from "@/lib/format";
import type { ActivityEntry, DashboardSettings, VaultBox, VaultItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await requireCustomer();
  const supabase = createClient();

  const [settingsRes, boxesRes, itemsRes, activityRes] = await Promise.all([
    supabase.from("dashboard_settings").select("*").eq("customer_id", profile.id).maybeSingle(),
    supabase.from("vault_boxes").select("*").order("box_number"),
    supabase.from("vault_items").select("*").order("deposited_at", { ascending: false }),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(15)
  ]);

  const settings = (settingsRes.data as DashboardSettings | null) ?? null;
  const boxes = (boxesRes.data as VaultBox[] | null) ?? [];
  const items = (itemsRes.data as VaultItem[] | null) ?? [];
  const activity = (activityRes.data as ActivityEntry[] | null) ?? [];

  const showValues = settings?.show_values ?? false;
  const showBoxes = settings?.show_boxes ?? false;
  const showActivity = settings?.show_activity ?? false;
  const showDocuments = settings?.show_documents ?? false;

  const visibleItems = showDocuments ? items : items.filter((item) => item.category !== "documents");
  const stored = visibleItems.filter((item) => item.status === "stored").length;
  const currency = visibleItems[0]?.currency ?? "USD";
  const totalValue = visibleItems.reduce((sum, item) => sum + (item.estimated_value ?? 0), 0);
  const lastDeposit = visibleItems[0]?.deposited_at;

  return (
    <div className="min-h-screen bg-paper">
      <TopBar profile={profile} />

      <div className="photo-frame h-32 border-x-0 border-t-0">
        <Image
          src={PHOTOS.vaultRoom.src}
          alt={PHOTOS.vaultRoom.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/85 to-navy-900/40" />
        <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-center px-6">
          <p className="eyebrow text-brass-400">
            Account {profile.client_ref ?? profile.email}
          </p>
          <h1 className="mt-1.5 font-serif text-2xl font-semibold text-white">Vault holding</h1>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {settings?.welcome_message ? (
          <p className="max-w-2xl border-l-2 border-brass bg-brass-100/60 px-4 py-2.5 text-[13px] leading-relaxed text-ink-700">
            {settings.welcome_message}
          </p>
        ) : null}

        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 border-y border-rule py-3 text-[13px] sm:grid-cols-4">
          <div>
            <dt className="text-2xs uppercase tracking-wide text-ink-500">Items on record</dt>
            <dd className="mt-0.5 text-ink">{visibleItems.length}</dd>
          </div>
          <div>
            <dt className="text-2xs uppercase tracking-wide text-ink-500">Currently stored</dt>
            <dd className="mt-0.5 text-ink">{stored}</dd>
          </div>
          <div>
            <dt className="text-2xs uppercase tracking-wide text-ink-500">Last deposit</dt>
            <dd className="mt-0.5 text-ink">{lastDeposit ? formatDate(lastDeposit) : "—"}</dd>
          </div>
          {showValues ? (
            <div>
              <dt className="text-2xs uppercase tracking-wide text-ink-500">Declared total</dt>
              <dd className="mt-0.5 text-ink">{formatMoney(totalValue, currency)}</dd>
            </div>
          ) : null}
        </dl>

        {showBoxes && boxes.length > 0 ? (
          <section className="panel mt-8">
            <div className="panel-head">
              <h2 className="panel-title">Boxes assigned to you</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-head">Box</th>
                  <th className="table-head">Branch</th>
                  <th className="table-head">Size</th>
                  <th className="table-head">Opened</th>
                  <th className="table-head">Renewal</th>
                  <th className="table-head">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {boxes.map((box) => (
                  <tr key={box.id}>
                    <td className="table-cell font-medium">{box.box_number}</td>
                    <td className="table-cell text-ink-700">{box.branch}</td>
                    <td className="table-cell text-ink-700">{titleCase(box.size)}</td>
                    <td className="table-cell text-ink-700">{formatDate(box.opened_at)}</td>
                    <td className="table-cell text-ink-700">{formatDate(box.renewal_at)}</td>
                    <td className="table-cell">
                      <StatusBadge status={box.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        <section className="panel mt-8">
          <div className="panel-head">
            <h2 className="panel-title">Register of items</h2>
            <p className="text-2xs text-ink-500">
              Maintained by vault staff. Telephone the vault to dispute an entry.
            </p>
          </div>

          {visibleItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-ink-500">
              No items have been published to your account yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-head">Item</th>
                    <th className="table-head">Category</th>
                    <th className="table-head">Box</th>
                    <th className="table-head text-right">Qty</th>
                    {showValues ? <th className="table-head text-right">Declared value</th> : null}
                    <th className="table-head">Deposited</th>
                    <th className="table-head">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {visibleItems.map((item) => {
                    const box = boxes.find((entry) => entry.id === item.box_id);

                    return (
                      <tr key={item.id}>
                        <td className="table-cell">
                          <span className="font-medium">{item.name}</span>
                          {item.description ? (
                            <span className="mt-0.5 block text-2xs text-ink-500">
                              {item.description}
                            </span>
                          ) : null}
                        </td>
                        <td className="table-cell">
                          <CategoryTag category={item.category} />
                        </td>
                        <td className="table-cell text-ink-700">{box?.box_number ?? "—"}</td>
                        <td className="table-cell text-right tabular-nums text-ink-700">
                          {item.quantity}
                        </td>
                        {showValues ? (
                          <td className="table-cell text-right tabular-nums">
                            {formatMoney(item.estimated_value, item.currency)}
                          </td>
                        ) : null}
                        <td className="table-cell whitespace-nowrap text-ink-700">
                          {formatDate(item.deposited_at)}
                        </td>
                        <td className="table-cell">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showActivity ? (
          <section className="panel mt-8">
            <div className="panel-head">
              <h2 className="panel-title">Register of activity</h2>
            </div>
            {activity.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-ink-500">
                No activity recorded yet.
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-head w-52">Date</th>
                    <th className="table-head">Entry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {activity.map((entry) => (
                    <tr key={entry.id}>
                      <td className="table-cell whitespace-nowrap text-ink-700">
                        {formatDateTime(entry.created_at)}
                      </td>
                      <td className="table-cell">
                        {entry.action}
                        {entry.detail ? (
                          <span className="mt-0.5 block text-2xs text-ink-500">{entry.detail}</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ) : null}

        <p className="mt-8 border-t border-rule pt-4 text-[13px] text-ink-500">
          Withdrawals and inspections are by appointment. Telephone{" "}
          <a href={`tel:${COMPANY.telephoneHref}`} className="link">
            {COMPANY.telephone}
          </a>
          {settings?.support_contact ? (
            <>
              {" "}
              or email{" "}
              <a href={`mailto:${settings.support_contact}`} className="link">
                {settings.support_contact}
              </a>
            </>
          ) : null}
          .
        </p>
      </main>
    </div>
  );
}
