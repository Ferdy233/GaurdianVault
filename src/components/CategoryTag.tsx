import { titleCase } from "@/lib/format";
import type { ItemCategory } from "@/lib/types";

/** A small colour key so long registers can be scanned by category. */
const DOTS: Record<ItemCategory, string> = {
  jewellery: "bg-oxblood",
  documents: "bg-navy",
  cash: "bg-moss",
  metals: "bg-brass",
  collectibles: "bg-brass-400",
  electronics: "bg-ink-500",
  other: "bg-ink-300"
};

export function CategoryTag({ category }: { category: ItemCategory }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-ink-700">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOTS[category] ?? "bg-ink-300"}`} />
      {titleCase(category)}
    </span>
  );
}
