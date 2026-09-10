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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Review Your Order &amp; Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Physical items are supplied with standard delivery; services include immediate
            scheduling with our certified engineering unit.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-5">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Your cart is empty</h2>
            <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed">
              You have not added any drinking water refills, treatment cartridges, or drilling
              services to your cart.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-[#0a2540] hover:bg-[#184b7a] text-white px-6 py-3 rounded-xl text-xs font-semibold transition"
            >
              Browse Catalog &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Item Details ({totals.totalCount})
                  </span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 transition"
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
                        className="p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                      >
                        <div className="flex items-start gap-4">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-16 h-16 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1.5 shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#0288d1] shrink-0 font-bold text-xs">
                              {isProduct ? "PRODUCT" : "SERVICE"}
                            </div>
                          )}

                          <div>
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md inline-block mb-1.5 ${
                                isProduct
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-cyan-50 text-[#0288d1] border border-cyan-200/80"
                              }`}
                            >
                              {isProduct ? "Physical Product" : "Engineering Service"}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 leading-snug">
                              {item.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              {isProduct ? (
                                <>
                                  GHS {item.price.toFixed(2)} {item.unit || "per item"}
                                </>
                              ) : (
                                <>Starting project: GHS {item.price.toFixed(2)}</>
                              )}
                            </p>
                            {!isProduct && (
                              <p className="text-xs text-amber-700 mt-1.5 font-medium flex items-center gap-1.5">
                                <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />
                                Booking deposit: GHS{" "}
                                {(item.deposit_amount ?? item.price).toFixed(2)} / job
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Controls and pricing */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                            <button
                              type="button"
                              onClick={() =>
                                handleQtyChange(item.id, item.item_type, item.quantity - 1)
                              }
                              className="px-3 py-2 text-slate-600 hover:text-slate-900 transition"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-slate-800 w-7 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleQtyChange(item.id, item.item_type, item.quantity + 1)
                              }
                              className="px-3 py-2 text-slate-600 hover:text-slate-900 transition"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Line total breakdown */}
                          <div className="text-right min-w-[110px]">
                            <span className="text-xs text-slate-400 block">
                              Total: GHS {lineTotal.toFixed(2)}
                            </span>
                            <span className="text-base font-bold text-[#0a2540] block">
                              Due: GHS {depositDue.toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemove(item.id, item.item_type)}
                            className="text-slate-400 hover:text-red-600 transition p-1.5"
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
                <div className="p-5 bg-cyan-50/70 border border-cyan-200/80 rounded-2xl text-xs text-slate-700 flex items-start gap-3.5">
                  <ShieldCheck className="w-5 h-5 text-[#0288d1] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 font-semibold block mb-1">
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
              <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sticky top-24">
                <h3 className="font-bold text-slate-900 text-base mb-5 pb-4 border-b border-slate-100">
                  Order Payment Summary
                </h3>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Total Catalog Value</span>
                    <span className="font-semibold text-slate-800">
                      GHS {totals.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {totals.subtotal > totals.depositDue && (
                    <div className="flex justify-between text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200/80">
                      <span>Deferred Milestone Balance</span>
                      <span className="font-semibold">
                        - GHS {(totals.subtotal - totals.depositDue).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-500 pt-1">
                    <span>Accra Standard Delivery / Mobilization</span>
                    <span className="text-emerald-700 font-semibold">FREE / Included</span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-200">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Payable Online Today
                    </span>
                    <span className="text-2xl font-bold text-[#0a2540]">
                      GHS {totals.depositDue.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 text-right">
                    Secure instant payment via Paystack GHS
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  <Link
                    to="/shop/checkout"
                    id="proceed-to-checkout-btn"
                    className="w-full bg-[#0a2540] hover:bg-[#184b7a] text-white py-3.5 px-5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
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
                <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col gap-2.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>MTN Mobile Money, Telecel Cash, AT &amp; Cards</span>
                  </div>
                  <div className="flex items-center gap-2.5">
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
