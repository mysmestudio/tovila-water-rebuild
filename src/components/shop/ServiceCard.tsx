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
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="bg-cyan-50 text-[#0288d1] border border-cyan-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            Professional Engineering Service
          </span>
          <span className="text-[11px] text-slate-500 font-medium">On-Site Service</span>
        </div>

        <h3 className="font-bold text-slate-900 text-base sm:text-lg mt-2 leading-snug">
          {service.name}
        </h3>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{service.description}</p>

        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#0288d1] shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-normal">
            {isDepositEqualTotal
              ? "Full fixed price payable online. Comprehensive report & site certificate included."
              : `Booking deposit of GHS ${Number(service.deposit_amount).toFixed(2)} payable online today to lock your date and dispatch the field engineering team. Balance due upon commissioning.`}
          </p>
        </div>
      </div>

      <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] text-slate-500 block">Starting Project Estimate</span>
            <span className="text-sm font-semibold text-slate-700">
              GHS {Number(service.starting_price).toFixed(2)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-[#e53935] block">
              {isDepositEqualTotal ? "Amount Due Today" : "Deposit Due Today"}
            </span>
            <span className="text-lg font-black text-[#0a2540]">
              GHS {Number(service.deposit_amount).toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="button"
          id={`book-service-btn-${service.id}`}
          onClick={handleBook}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold shadow-sm transition ${
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
