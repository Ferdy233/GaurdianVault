import { ActionForm } from "@/components/ActionForm";
import { StatusBadge } from "@/components/StatusBadge";
import { deleteBox, updateBox } from "@/app/admin/actions";
import { BOX_SIZES, BOX_STATUSES, type VaultBox } from "@/lib/types";
import { titleCase } from "@/lib/format";

export function BoxEditor({ box }: { box: VaultBox }) {
  return (
    <details className="group border-b border-rule last:border-b-0">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-[13px] hover:bg-paper">
        <span className="font-medium text-ink">
          {box.box_number}
          <span className="ml-3 font-normal text-ink-500">{box.branch}</span>
        </span>
        <span className="flex items-center gap-2">
          <StatusBadge status={box.status} />
          <span className="text-2xs uppercase tracking-wide text-ink-500">
            {box.visible_to_customer ? "Shown to client" : "Withheld"}
          </span>
        </span>
      </summary>

      <div className="border-t border-rule bg-paper p-4">
        <ActionForm action={updateBox} submitLabel="Save box" className="space-y-3">
          <input type="hidden" name="box_id" value={box.id} />
          <input type="hidden" name="customer_id" value={box.customer_id} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Box number</label>
              <input name="box_number" defaultValue={box.box_number} required className="input" />
            </div>
            <div>
              <label className="label">Branch</label>
              <input name="branch" defaultValue={box.branch} className="input" />
            </div>
            <div>
              <label className="label">Size</label>
              <select name="size" defaultValue={box.size} className="input">
                {BOX_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {titleCase(size)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" defaultValue={box.status} className="input">
                {BOX_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Renewal date</label>
              <input
                type="date"
                name="renewal_at"
                defaultValue={box.renewal_at ?? ""}
                className="input"
              />
            </div>
            <label className="flex items-center gap-2 self-end text-[13px] text-ink-700">
              <input
                type="checkbox"
                name="visible_to_customer"
                defaultChecked={box.visible_to_customer}
                className="h-3.5 w-3.5 border-rule accent-navy"
              />
              Show this box to the client
            </label>
          </div>
        </ActionForm>

        <div className="mt-4 border-t border-rule pt-4">
          <ActionForm
            action={deleteBox}
            submitLabel="Delete box"
            pendingLabel="Deleting…"
            buttonClassName="btn-danger"
            className="space-y-0"
            confirmMessage={`Delete box ${box.box_number}? Items stay on the register but lose their box link.`}
          >
            <input type="hidden" name="box_id" value={box.id} />
            <input type="hidden" name="customer_id" value={box.customer_id} />
          </ActionForm>
        </div>
      </div>
    </details>
  );
}
