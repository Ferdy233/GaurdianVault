import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { StatusBadge } from "@/components/StatusBadge";
import { ActionForm } from "@/components/ActionForm";
import { BoxEditor } from "@/components/admin/BoxEditor";
import { ItemEditor } from "@/components/admin/ItemEditor";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { COMPANY } from "@/lib/company";
import { formatDateTime, formatMoney, titleCase } from "@/lib/format";
import {
  BOX_SIZES,
  BOX_STATUSES,
  ITEM_CATEGORIES,
  ITEM_STATUSES,
  type ActivityEntry,
  type DashboardSettings,
  type Profile,
  type VaultBox,
  type VaultItem
} from "@/lib/types";
import {
  createActivity,
  createBox,
  createItem,
  deleteActivity,
  deleteCustomer,
  resetCustomerPassword,
  updateCustomer,
  updateDashboardSettings
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  const client = createAdminClient();
  const customerId = params.id;

  const [customerRes, settingsRes, boxesRes, itemsRes, activityRes] = await Promise.all([
    client.from("profiles").select("*").eq("id", customerId).maybeSingle(),
    client.from("dashboard_settings").select("*").eq("customer_id", customerId).maybeSingle(),
    client.from("vault_boxes").select("*").eq("customer_id", customerId).order("box_number"),
    client
      .from("vault_items")
      .select("*")
      .eq("customer_id", customerId)
      .order("deposited_at", { ascending: false }),
    client
      .from("activity_log")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(30)
  ]);

  const customer = customerRes.data as Profile | null;
  if (!customer) notFound();

  const settings = settingsRes.data as DashboardSettings | null;
  const boxes = (boxesRes.data as VaultBox[] | null) ?? [];
  const items = (itemsRes.data as VaultItem[] | null) ?? [];
  const activity = (activityRes.data as ActivityEntry[] | null) ?? [];

  const totalValue = items.reduce((sum, item) => sum + (item.estimated_value ?? 0), 0);
  const today = new Date().toISOString().slice(0, 10);

  const visibilitySwitches: [string, string, boolean][] = [
    ["show_values", "Declared values", settings?.show_values ?? true],
    ["show_boxes", "Assigned boxes", settings?.show_boxes ?? true],
    ["show_documents", "Items in the documents category", settings?.show_documents ?? true],
    ["show_activity", "Register of activity", settings?.show_activity ?? true]
  ];

  return (
    <div className="min-h-screen bg-paper">
      <TopBar profile={admin} links={[{ href: "/admin", label: "Clients" }]} />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/admin" className="text-[13px] text-ink-700 hover:text-navy">
          &larr; Clients
        </Link>

        <header className="mt-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-4">
          <div>
            <h1 className="font-serif text-xl font-semibold text-ink">{customer.full_name}</h1>
            <p className="mt-1 text-[13px] text-ink-500">
              {customer.email}
              {customer.client_ref ? ` · ${customer.client_ref}` : ""}
              {customer.phone ? ` · ${customer.phone}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-ink-700">
            <StatusBadge status={customer.status} />
            <span>
              {items.length} items · {formatMoney(totalValue, items[0]?.currency ?? "USD")}
            </span>
          </div>
        </header>

        <section className="panel mt-8">
          <div className="panel-head">
            <h2 className="panel-title">Client record</h2>
          </div>
          <div className="grid gap-6 p-5 lg:grid-cols-2">
            <ActionForm action={updateCustomer} submitLabel="Save record">
              <input type="hidden" name="customer_id" value={customer.id} />

              <div>
                <label className="label">Full name</label>
                <input name="full_name" defaultValue={customer.full_name} required className="input" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Phone</label>
                  <input name="phone" defaultValue={customer.phone ?? ""} className="input" />
                </div>
                <div>
                  <label className="label">Client reference</label>
                  <input name="client_ref" defaultValue={customer.client_ref ?? ""} className="input" />
                </div>
              </div>

              <div>
                <label className="label">Account status</label>
                <select name="status" defaultValue={customer.status} className="input">
                  <option value="active">Active</option>
                  <option value="suspended">Suspended (login blocked)</option>
                </select>
              </div>

              <div>
                <label className="label">Internal notes (never shown to the client)</label>
                <textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} className="input" />
              </div>
            </ActionForm>

            <div className="space-y-6 lg:border-l lg:border-rule lg:pl-6">
              <div>
                <h3 className="text-[13px] font-semibold text-ink">Reset password</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                  Only after the client&apos;s identity has been confirmed.
                </p>
                <div className="mt-3">
                  <ActionForm
                    action={resetCustomerPassword}
                    submitLabel="Set new password"
                    resetOnSuccess
                  >
                    <input type="hidden" name="customer_id" value={customer.id} />
                    <input
                      name="password"
                      minLength={10}
                      required
                      className="input"
                      placeholder="New password, 10 characters or more"
                    />
                  </ActionForm>
                </div>
              </div>

              <div className="border-t border-rule pt-5">
                <h3 className="text-[13px] font-semibold text-oxblood">Close and delete account</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                  Deletes the login, boxes, register entries and activity history. Not reversible.
                </p>
                <div className="mt-3">
                  <ActionForm
                    action={deleteCustomer}
                    submitLabel="Delete account"
                    pendingLabel="Deleting…"
                    buttonClassName="btn-danger"
                    className="space-y-0"
                    confirmMessage={`Delete ${customer.full_name} and every vault record attached to them?`}
                  >
                    <input type="hidden" name="customer_id" value={customer.id} />
                  </ActionForm>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel mt-8">
          <div className="panel-head">
            <h2 className="panel-title">Client dashboard</h2>
            <p className="text-2xs text-ink-500">
              Withheld data is filtered server-side, not hidden in the page
            </p>
          </div>
          <div className="p-5">
            <ActionForm action={updateDashboardSettings} submitLabel="Save dashboard settings">
              <input type="hidden" name="customer_id" value={customer.id} />

              <div>
                <label className="label">Message shown at the top of their dashboard</label>
                <textarea
                  name="welcome_message"
                  rows={2}
                  defaultValue={settings?.welcome_message ?? "Welcome to your Guardian Vault."}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Support contact shown to the client</label>
                <input
                  name="support_contact"
                  defaultValue={settings?.support_contact ?? COMPANY.email}
                  className="input"
                />
              </div>

              <fieldset>
                <legend className="label">Sections the client may see</legend>
                <div className="divide-y divide-rule border-y border-rule">
                  {visibilitySwitches.map(([name, label, checked]) => (
                    <label
                      key={name}
                      className="flex items-center gap-2.5 py-2 text-[13px] text-ink-700"
                    >
                      <input
                        type="checkbox"
                        name={name}
                        defaultChecked={checked}
                        className="h-3.5 w-3.5 border-rule accent-navy"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </ActionForm>
          </div>
        </section>

        <section className="panel mt-8">
          <div className="panel-head">
            <h2 className="panel-title">Boxes</h2>
            <p className="text-2xs text-ink-500">{boxes.length} assigned</p>
          </div>

          {boxes.length === 0 ? (
            <p className="border-b border-rule px-4 py-6 text-center text-[13px] text-ink-500">
              No boxes assigned.
            </p>
          ) : (
            <div className="border-b border-rule">
              {boxes.map((box) => (
                <BoxEditor key={box.id} box={box} />
              ))}
            </div>
          )}

          <details>
            <summary className="cursor-pointer px-4 py-2.5 text-[13px] font-medium text-navy hover:bg-paper">
              Assign a box
            </summary>
            <div className="border-t border-rule bg-paper p-4">
              <ActionForm action={createBox} submitLabel="Assign box" resetOnSuccess>
                <input type="hidden" name="customer_id" value={customer.id} />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Box number</label>
                    <input name="box_number" required className="input" />
                  </div>
                  <div>
                    <label className="label">Branch</label>
                    <input name="branch" defaultValue="Head Office" className="input" />
                  </div>
                  <div>
                    <label className="label">Size</label>
                    <select name="size" defaultValue="medium" className="input">
                      {BOX_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {titleCase(size)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select name="status" defaultValue="active" className="input">
                      {BOX_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {titleCase(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Opened on</label>
                    <input type="date" name="opened_at" defaultValue={today} className="input" />
                  </div>
                  <div>
                    <label className="label">Renewal date</label>
                    <input type="date" name="renewal_at" className="input" />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-[13px] text-ink-700">
                  <input
                    type="checkbox"
                    name="visible_to_customer"
                    defaultChecked
                    className="h-3.5 w-3.5 border-rule accent-navy"
                  />
                  Show this box to the client
                </label>
              </ActionForm>
            </div>
          </details>
        </section>

        <section className="panel mt-8">
          <div className="panel-head">
            <h2 className="panel-title">Register of items</h2>
            <p className="text-2xs text-ink-500">
              {items.filter((item) => item.visible_to_customer).length} of {items.length} shown to the
              client
            </p>
          </div>

          {items.length === 0 ? (
            <p className="border-b border-rule px-4 py-6 text-center text-[13px] text-ink-500">
              Nothing catalogued for this client.
            </p>
          ) : (
            <div className="border-b border-rule">
              {items.map((item) => (
                <ItemEditor key={item.id} item={item} boxes={boxes} />
              ))}
            </div>
          )}

          <details>
            <summary className="cursor-pointer px-4 py-2.5 text-[13px] font-medium text-navy hover:bg-paper">
              Add an entry to the register
            </summary>
            <div className="border-t border-rule bg-paper p-4">
              <ActionForm action={createItem} submitLabel="Add item" resetOnSuccess>
                <input type="hidden" name="customer_id" value={customer.id} />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label">Item name</label>
                    <input name="name" required className="input" />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select name="category" defaultValue="jewellery" className="input">
                      {ITEM_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {titleCase(category)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select name="status" defaultValue="stored" className="input">
                      {ITEM_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {titleCase(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Box</label>
                    <select name="box_id" defaultValue="" className="input">
                      <option value="">Unassigned</option>
                      {boxes.map((box) => (
                        <option key={box.id} value={box.id}>
                          {box.box_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Quantity</label>
                    <input type="number" min={1} name="quantity" defaultValue={1} className="input" />
                  </div>
                  <div>
                    <label className="label">Declared value</label>
                    <input type="number" step="0.01" name="estimated_value" className="input" />
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <input name="currency" defaultValue="USD" className="input" />
                  </div>
                  <div>
                    <label className="label">Deposited on</label>
                    <input type="date" name="deposited_at" defaultValue={today} className="input" />
                  </div>
                  <label className="flex items-center gap-2 self-end text-[13px] text-ink-700">
                    <input
                      type="checkbox"
                      name="visible_to_customer"
                      defaultChecked
                      className="h-3.5 w-3.5 border-rule accent-navy"
                    />
                    Visible to client
                  </label>
                  <div className="sm:col-span-2">
                    <label className="label">Description shown to the client</label>
                    <textarea name="description" rows={2} className="input" />
                  </div>
                </div>
              </ActionForm>
            </div>
          </details>
        </section>

        <section className="panel mt-8 mb-12">
          <div className="panel-head">
            <h2 className="panel-title">Register of activity</h2>
          </div>

          <div className="border-b border-rule p-4">
            <ActionForm action={createActivity} submitLabel="Add entry" resetOnSuccess>
              <input type="hidden" name="customer_id" value={customer.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Entry</label>
                  <input name="action" required className="input" placeholder="Box inspected" />
                </div>
                <div>
                  <label className="label">Detail</label>
                  <input name="detail" className="input" placeholder="Client attended with ID" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-ink-700">
                <input
                  type="checkbox"
                  name="visible_to_customer"
                  defaultChecked
                  className="h-3.5 w-3.5 border-rule accent-navy"
                />
                Visible to client
              </label>
            </ActionForm>
          </div>

          {activity.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-ink-500">No entries.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-head w-48">Date</th>
                  <th className="table-head">Entry</th>
                  <th className="table-head w-28">Visibility</th>
                  <th className="table-head w-20" />
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
                    <td className="table-cell text-2xs uppercase tracking-wide text-ink-500">
                      {entry.visible_to_customer ? "Client" : "Internal"}
                    </td>
                    <td className="table-cell text-right">
                      <ActionForm
                        action={deleteActivity}
                        submitLabel="Remove"
                        pendingLabel="…"
                        buttonClassName="text-[13px] text-ink-500 underline underline-offset-2 hover:text-oxblood disabled:opacity-50"
                        className="space-y-0"
                      >
                        <input type="hidden" name="activity_id" value={entry.id} />
                        <input type="hidden" name="customer_id" value={customer.id} />
                      </ActionForm>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
