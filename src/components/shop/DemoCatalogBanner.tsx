import { AlertTriangle } from "lucide-react";

export function DemoCatalogBanner() {
  return (
    <div
      id="demo-catalog-banner"
      className="w-full bg-amber-500 text-slate-950 px-4 py-2.5 font-medium text-xs sm:text-sm shadow-inner sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-amber-600/30 tracking-tight"
    >
      <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950 stroke-[2.5]" />
      <span>
        <strong>Demo Catalog:</strong> Product details and pricing are placeholders pending client
        confirmation.
      </span>
    </div>
  );
}
