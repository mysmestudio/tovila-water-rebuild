import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  PhoneCall,
  CalendarCheck,
} from "lucide-react";
import { ShopHeader } from "../../components/shop/ShopHeader";
import { ShopFooter } from "../../components/shop/ShopFooter";
import {
  getCart,
  getCartTotals,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  type CartItem,
} from "../../lib/cart";

export const Route = createFileRoute("/shop/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart & Booking Summary | Tovila Water Solutions" },
      {
        name: "description",
        content:
          "Review your water products and borehole service bookings before completing secure Paystack checkout.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
    const handler = () => setItems(getCart());
    window.addEventListener("tovila_cart_updated", handler);
    return () => window.removeEventListener("tovila_cart_updated", handler);
  }, []);

  const totals = getCartTotals(items);

  const handleQtyChange = (id: string, type: "product" | "service", newQty: number) => {
    updateCartQuantity(id, type, newQty);
  };

  const handleRemove = (id: string, type: "product" | "service") => {
    removeFromCart(id, type);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ShopHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Review Your Order &amp; Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Physical items are supplied with standard delivery; services include immediate
            scheduling with our certified engineering unit.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Your cart is empty</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              You have not added any drinking water refills, treatment cartridges, or drilling
              services to your cart.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-[#0a2540] hover:bg-[#184b7a] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
            >
              Browse Catalog &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Item Details ({totals.totalCount})
                  </span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const isProduct = item.item_type === "product";
                    const lineTotal = item.price * item.quantity;
                    const depositDue = isProduct
                      ? lineTotal
                      : (item.deposit_amount ?? item.price) * item.quantity;

                    return (
                      <div
                        key={`${item.item_type}-${item.id}`}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-contain bg-slate-50 border border-slate-100 p-1 shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#0288d1] shrink-0 font-bold text-xs">
                              {isProduct ? "PRODUCT" : "SERVICE"}
                            </div>
                          )}

                          <div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-block mb-1 ${
                                isProduct
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-cyan-50 text-[#0288d1] border border-cyan-200"
                              }`}
                            >
                              {isProduct ? "Physical Product" : "Engineering Service"}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {item.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {isProduct ? (
                                <>
                                  GHS {item.price.toFixed(2)} {item.unit || "per item"}
                                </>
                              ) : (
                                <>Starting project: GHS {item.price.toFixed(2)}</>
                              )}
                            </p>
                            {!isProduct && (
                              <p className="text-[11px] text-amber-700 mt-1 font-medium flex items-center gap-1">
                                <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />
                                Booking deposit: GHS{" "}
                                {(item.deposit_amount ?? item.price).toFixed(2)} / job
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Controls and pricing */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              type="button"
                              onClick={() =>
                                handleQtyChange(item.id, item.item_type, item.quantity - 1)
                              }
                              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-800 w-7 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleQtyChange(item.id, item.item_type, item.quantity + 1)
                              }
                              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Line total breakdown */}
                          <div className="text-right min-w-[100px]">
                            <span className="text-xs text-slate-400 block">
                              Total: GHS {lineTotal.toFixed(2)}
                            </span>
                            <span className="text-sm font-black text-[#0a2540] block">
                              Due: GHS {depositDue.toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemove(item.id, item.item_type)}
                            className="text-slate-400 hover:text-red-600 transition p-1"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service booking explanation notice */}
              {totals.hasServices && (
                <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-xl text-xs text-slate-700 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#0288d1] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 font-semibold block mb-0.5">
                      Notice for Service Bookings:
                    </strong>
                    The online payment locks your booking date and dispatches the hydro-geological
                    survey or engineering installation team. Any remaining project balance is only
                    due after milestone completion.
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Panel */}
            <div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-20">
                <h3 className="font-extrabold text-slate-900 text-base mb-4 pb-3 border-b border-slate-100">
                  Order Payment Summary
                </h3>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Total Catalog Value</span>
                    <span className="font-semibold text-slate-800">
                      GHS {totals.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {totals.subtotal > totals.depositDue && (
                    <div className="flex justify-between text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <span>Deferred Milestone Balance</span>
                      <span className="font-bold">
                        - GHS {(totals.subtotal - totals.depositDue).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-500 pt-1">
                    <span>Accra Standard Delivery / Mobilization</span>
                    <span className="text-emerald-700 font-semibold">FREE / Included</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Payable Online Today
                    </span>
                    <span className="text-2xl font-black text-[#0a2540]">
                      GHS {totals.depositDue.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 text-right">
                    Secure instant payment via Paystack GHS
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    to="/shop/checkout"
                    id="proceed-to-checkout-btn"
                    className="w-full bg-[#0a2540] hover:bg-[#184b7a] text-white py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </Link>

                  <Link
                    to="/shop"
                    className="w-full block text-center py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    &larr; Continue Shopping
                  </Link>
                </div>

                {/* Badges */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>MTN Mobile Money, Telecel Cash, AT &amp; Cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Customer support hotline: +233 20 812 3456</span>
                  </div>
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
