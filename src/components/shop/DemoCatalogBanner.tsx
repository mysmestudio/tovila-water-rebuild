import { AlertTriangle } from "lucide-react";

export function DemoCatalogBanner() {
  return (
    <div
      id="demo-catalog-banner"
      className="w-full bg-amber-400 text-amber-950 px-4 py-2 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border-b border-amber-500/40 tracking-normal"
    >
      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-900 stroke-[2]" />
      <span>
        <strong className="font-semibold">Demo Catalog:</strong> Product details and pricing are
        placeholders pending client confirmation.
      </span>
    </div>
  );
}
