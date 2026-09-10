import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  Printer,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ShopHeader } from "../../components/shop/ShopHeader";
import { ShopFooter } from "../../components/shop/ShopFooter";
import type { Order } from "../../server/types";

export const Route = createFileRoute("/shop/confirmation")({
  validateSearch: (search: Record<string, unknown>) => ({
    order: (search.order as string) || "",
    ref: (search.ref as string) || "",
    simulated: (search.simulated as string) === "true",
  }),
  head: () => ({
    meta: [
      { title: "Order & Booking Confirmation | Tovila Water Solutions" },
      {
        name: "description",
        content: "Your Tovila water supply order and engineering booking reference.",
      },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const search = useSearch({ from: "/shop/confirmation" });
  const orderNumber = search.order;
  const isSimulated = search.simulated;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderNumber) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
      if (!res.ok) throw new Error("Could not retrieve order details");
      const data = await res.json();
      setOrder(data.order || null);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleSimulatePayment = async () => {
    if (!orderNumber) return;
    try {
      setConfirming(true);
      const res = await fetch("/api/orders/confirm-simulated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          reference: search.ref || `SIM_${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ShopHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-12 w-full">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#0a2540] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 mt-4 font-medium">Verifying order status...</p>
          </div>
        ) : error || !order ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
            <p className="text-xs text-slate-500 mt-1.5 mb-5">
              We couldn't locate order reference "{orderNumber || "unknown"}".
            </p>
            <Link
              to="/shop"
              className="inline-block px-5 py-2.5 bg-[#0a2540] text-white text-xs font-semibold rounded-xl"
            >
              Return to Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Header Box */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  {order.status === "paid" ? (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {order.status === "paid"
                          ? "Order Confirmed & Paid"
                          : "Order Placed — Pending Payment"}
                      </h1>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Order Reference:{" "}
                      <strong className="text-slate-900 font-mono">{order.order_number}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      order.status === "paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    Status: {order.status}
                  </span>
                </div>
              </div>

              {/* Simulated Demo Trigger Banner */}
              {isSimulated && order.status === "pending" && (
                <div className="mt-6 p-5 bg-amber-50 border border-amber-300/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        Demo Environment Simulation
                      </h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        This test order was initialized in demo mode without calling a live payment
                        gateway. Click below to simulate an incoming Paystack webhook payload,
                        marking this order paid in the database and decrementing stock.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={confirming}
                    className="w-full sm:w-auto shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                  >
                    {confirming ? "Updating..." : "Simulate Payment Success"}
                  </button>
                </div>
              )}

              {/* Order Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-2">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Customer Information
                  </h4>
                  <p className="text-xs text-slate-800 font-semibold">{order.customer_name}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{order.customer_email}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{order.customer_phone}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Logistics &amp; Scheduling
                  </h4>
                  {order.delivery_address && (
                    <p className="text-xs text-slate-700 mb-1.5">
                      <strong>Delivery:</strong> {order.delivery_address}
                    </p>
                  )}
                  {order.site_address && (
                    <p className="text-xs text-slate-700 mb-1.5">
                      <strong>Project Site:</strong> {order.site_address}
                    </p>
                  )}
                  {order.preferred_date && (
                    <p className="text-xs text-slate-700">
                      <strong>Requested Date:</strong> {order.preferred_date}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="mt-8">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Ordered Items &amp; Bookings
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-3.5">Item / Service</th>
                        <th className="p-3.5 text-center">Type</th>
                        <th className="p-3.5 text-center">Qty</th>
                        <th className="p-3.5 text-right">Unit Price</th>
                        <th className="p-3.5 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items?.map((it) => (
                        <tr key={it.id}>
                          <td className="p-3.5 font-semibold text-slate-900">{it.name_snapshot}</td>
                          <td className="p-3.5 text-center">
                            <span className="capitalize text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              {it.item_type}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-medium">{it.quantity}</td>
                          <td className="p-3.5 text-right text-slate-600">
                            GHS {Number(it.price_snapshot).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-semibold text-slate-900">
                            GHS {Number(it.line_total).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial totals summary */}
                <div className="mt-5 p-5 bg-slate-50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border border-slate-100">
                  <div>
                    <span className="text-slate-500">Order Subtotal: </span>
                    <strong className="text-slate-800 font-semibold">
                      GHS {Number(order.subtotal).toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Amount Due Today: </span>
                    <strong className="text-slate-800 font-semibold">
                      GHS {Number(order.amount_due).toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Amount Paid: </span>
                    <strong className="text-emerald-700 font-bold">
                      GHS {Number(order.amount_paid).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Next Steps Card */}
              <div className="mt-8 p-6 bg-cyan-50/60 border border-cyan-200/80 rounded-2xl text-xs text-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#0288d1]" />
                  What Happens Next?
                </div>
                <ul className="space-y-2 list-disc list-inside text-slate-600 leading-relaxed">
                  <li>
                    Our logistics dispatcher will confirm your delivery slot via WhatsApp or phone
                    call.
                  </li>
                  <li>
                    For borehole drilling and treatment engineering bookings, a field
                    hydro-geologist will contact you to coordinate site access.
                  </li>
                  <li>
                    Inquiries? Call our Accra operations center directly at{" "}
                    <strong>+233 (0) 20 812 3456</strong>.
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>

                <div className="flex items-center gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 bg-[#0a2540] hover:bg-[#184b7a] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                    Back to Online Shop
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <ShopFooter />
    </div>
  );
}
