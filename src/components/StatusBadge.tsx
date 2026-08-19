import { titleCase } from "@/lib/format";

const TONES: Record<string, string> = {
  active: "border-moss/30 bg-moss-100 text-moss",
  stored: "border-moss/30 bg-moss-100 text-moss",
  pending: "border-brass/40 bg-brass-100 text-brass",
  in_transit: "border-navy/25 bg-navy-100 text-navy",
  withdrawn: "border-rule bg-paper text-ink-500",
  closed: "border-rule bg-paper text-ink-500",
  suspended: "border-oxblood/30 bg-oxblood-100 text-oxblood"
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${TONES[status] ?? "border-rule bg-white text-ink-500"}`}>
      {titleCase(status)}
    </span>
  );
}
