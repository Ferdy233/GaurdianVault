import { ActionForm } from "@/components/ActionForm";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryTag } from "@/components/CategoryTag";
import { deleteItem, setItemVisibility, updateItem } from "@/app/admin/actions";
import { ITEM_CATEGORIES, ITEM_STATUSES, type VaultBox, type VaultItem } from "@/lib/types";
import { formatMoney, titleCase } from "@/lib/format";

export function ItemEditor({ item, boxes }: { item: VaultItem; boxes: VaultBox[] }) {
  return (
    <details className="border-b border-rule last:border-b-0">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-[13px] hover:bg-paper">
        <span className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-ink">{item.name}</span>
          <CategoryTag category={item.category} />
          <span className="text-ink-500">{formatMoney(item.estimated_value, item.currency)}</span>
        </span>
        <span className="flex items-center gap-2">
          <StatusBadge status={item.status} />
          <span className="text-2xs uppercase tracking-wide text-ink-500">
            {item.visible_to_customer ? "Shown to client" : "Withheld"}
          </span>
        </span>
      </summary>

      <div className="border-t border-rule bg-paper p-4">
        <ActionForm action={updateItem} submitLabel="Save item" className="space-y-3">
          <input type="hidden" name="item_id" value={item.id} />
          <input type="hidden" name="customer_id" value={item.customer_id} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Item name</label>
              <input name="name" defaultValue={item.name} required className="input" />
            </div>

            <div>
              <label className="label">Category</label>
              <select name="category" defaultValue={item.category} className="input">
                {ITEM_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {titleCase(category)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Status</label>
              <select name="status" defaultValue={item.status} className="input">
                {ITEM_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Box</label>
              <select name="box_id" defaultValue={item.box_id ?? ""} className="input">
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
              <input
                type="number"
                min={1}
                name="quantity"
                defaultValue={item.quantity}
                className="input"
              />
            </div>

            <div>
              <label className="label">Declared value</label>
              <input
                type="number"
                step="0.01"
                name="estimated_value"
                defaultValue={item.estimated_value ?? ""}
                className="input"
              />
            </div>

            <div>
              <label className="label">Currency</label>
              <input name="currency" defaultValue={item.currency} className="input" />
            </div>

            <div>
              <label className="label">Deposited on</label>
              <input
                type="date"
                name="deposited_at"
                defaultValue={item.deposited_at}
                className="input"
              />
            </div>

            <label className="flex items-center gap-2 self-end text-[13px] text-ink-700">
              <input
                type="checkbox"
                name="visible_to_customer"
                defaultChecked={item.visible_to_customer}
                className="h-3.5 w-3.5 border-rule accent-navy"
              />
              Visible to client
            </label>

            <div className="sm:col-span-2">
              <label className="label">Description shown to the client</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={item.description ?? ""}
                className="input"
              />
            </div>
          </div>
        </ActionForm>

        <div className="mt-4 flex flex-wrap gap-3 border-t border-rule pt-4">
          <ActionForm
            action={setItemVisibility}
            submitLabel={item.visible_to_customer ? "Withhold from client" : "Show to client"}
            pendingLabel="Updating…"
            buttonClassName="btn-ghost"
            className="space-y-0"
          >
            <input type="hidden" name="item_id" value={item.id} />
            <input type="hidden" name="customer_id" value={item.customer_id} />
            <input type="hidden" name="visible" value={item.visible_to_customer ? "false" : "true"} />
          </ActionForm>

          <ActionForm
            action={deleteItem}
            submitLabel="Delete item"
            pendingLabel="Deleting…"
            buttonClassName="btn-danger"
            className="space-y-0"
            confirmMessage={`Permanently delete "${item.name}" from the register?`}
          >
            <input type="hidden" name="item_id" value={item.id} />
            <input type="hidden" name="customer_id" value={item.customer_id} />
          </ActionForm>
        </div>
      </div>
    </details>
  );
}
