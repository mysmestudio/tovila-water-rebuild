import { useState } from "react";
import { CalendarCheck, Check, Info } from "lucide-react";
import { addToCart } from "../../lib/cart";
import type { Service } from "../../server/types";

export function ServiceCard({ service }: { service: Service }) {
  const [added, setAdded] = useState(false);

  const handleBook = () => {
    addToCart(
      {
        id: service.id,
        item_type: "service",
        name: service.name,
        price: Number(service.starting_price),
        deposit_amount: Number(service.deposit_amount),
        image_url: "/img/shop/service-borehole-res.svg",
      },
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isDepositEqualTotal = Number(service.deposit_amount) >= Number(service.starting_price);

  return (
    <div
      id={`service-card-${service.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="bg-cyan-50 text-[#0288d1] border border-cyan-200/80 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md">
            Professional Engineering Service
          </span>
          <span className="text-xs text-slate-500 font-medium">On-Site Service</span>
        </div>

        <h3 className="font-bold text-slate-900 text-lg mt-3 leading-snug">{service.name}</h3>

        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{service.description}</p>

        <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#0288d1] shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            {isDepositEqualTotal
              ? "Full fixed price payable online. Comprehensive report & site certificate included."
              : `Booking deposit of GHS ${Number(service.deposit_amount).toFixed(2)} payable online today to lock your date and dispatch the field engineering team. Balance due upon commissioning.`}
          </p>
        </div>
      </div>

      <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-slate-500 block">Starting Project Estimate</span>
            <span className="text-sm font-semibold text-slate-700">
              GHS {Number(service.starting_price).toFixed(2)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-[#e53935] block">
              {isDepositEqualTotal ? "Amount Due Today" : "Deposit Due Today"}
            </span>
            <span className="text-xl font-bold text-[#0a2540]">
              GHS {Number(service.deposit_amount).toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="button"
          id={`book-service-btn-${service.id}`}
          onClick={handleBook}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition ${
            added ? "bg-emerald-600 text-white" : "bg-[#0a2540] hover:bg-[#184b7a] text-white"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Added to Cart!
            </>
          ) : (
            <>
              <CalendarCheck className="w-4 h-4 text-cyan-400" />
              {isDepositEqualTotal
                ? "Book Service (Pay GHS " + Number(service.deposit_amount).toFixed(2) + ")"
                : "Book Service (Pay Deposit GHS " +
                  Number(service.deposit_amount).toFixed(2) +
                  ")"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
