import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  AlertCircle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  CheckCircle2,
} from "lucide-react";
import { ShopHeader } from "../../components/shop/ShopHeader";
import { ShopFooter } from "../../components/shop/ShopFooter";
import { getCart, getCartTotals, clearCart, type CartItem } from "../../lib/cart";

export const Route = createFileRoute("/shop/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout & Secure Paystack Payment | Tovila Water Solutions" },
      {
        name: "description",
        content:
          "Complete your order with Ghana Mobile Money (MTN, Telecel, AT) or Visa/Mastercard via secure Paystack processing.",
      },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const current = getCart();
    setItems(current);
    if (current.length === 0) {
      // Empty cart redirect
      navigate({ to: "/shop" });
    }
  }, [navigate]);

  const totals = getCartTotals(items);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid email address for order receipts.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please provide a contact phone number.");
      return;
    }

    if (totals.hasProducts && !deliveryAddress.trim()) {
      setErrorMessage("Please enter a delivery address for physical items.");
      return;
    }

    if (totals.hasServices && !siteAddress.trim()) {
      setErrorMessage("Please enter the project or borehole drilling site location.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer_name: fullName.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        delivery_address: deliveryAddress.trim() || null,
        site_address: siteAddress.trim() || null,
        preferred_date: preferredDate || null,
        notes: notes.trim() || null,
        items: items.map((it) => ({
          id: it.id,
          item_type: it.item_type,
          quantity: it.quantity,
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize payment.");
      }

      // Order created successfully in DB
      clearCart();

      // Redirect to authorization URL (Paystack checkout or simulated confirmation)
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        navigate({
          to: "/shop/confirmation",
          search: { order: data.orderNumber },
        });
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ShopHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to="/shop/cart"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Checkout &amp; Payment
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Accra deliveries &bull; Turnkey engineering &bull; Paystack Ghana Mobile Money &amp;
              Card
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-lg font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            256-bit Encrypted Checkout
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-2.5 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Details & Logistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Customer Contact */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0288d1]" />
                1. Customer Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name / Corporate Entity <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kwame Mensah / Apex Logistics Ltd"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="kwame@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Paystack receipts and order numbers are sent here.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (MoMo / WhatsApp) <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="024 123 4567 or +233 24 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    For driver delivery coordination or engineering dispatch.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Delivery & Site Logistics */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0288d1]" />
                2. Location &amp; Scheduling
              </h2>

              <div className="space-y-4">
                {totals.hasProducts && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Delivery Address (Drinking Water / Dispensers / Parts){" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="House / Street / Area (e.g. House 14, Boundary Rd, East Legon, Accra)"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white"
                    />
                  </div>
                )}

                {totals.hasServices && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Project Site Location (Borehole Drilling / System Installation){" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Site Coordinates, Town / Landmark (e.g. Oyibi near Valley View University, or Tema Comm 25)"
                      value={siteAddress}
                      onChange={(e) => setSiteAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Our hydro-geological surveying team will review access for drilling rigs.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Date (Delivery or Site Visit)
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Special Delivery / Site Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gate code, call before arrival, high water tank"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Payment Method Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0288d1]" />
                3. Secure Payment with Paystack
              </h2>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Clicking <strong>"Complete Order &amp; Pay"</strong> will initiate your secure
                Paystack transaction. You can pay with your preferred local payment channel:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                  MTN Mobile Money
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                  Telecel Cash
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                  AT Money
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                  Visa &bull; Mastercard
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-20">
              <h3 className="font-extrabold text-slate-900 text-base mb-4 pb-3 border-b border-slate-100">
                Order Summary ({totals.totalCount} items)
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div
                    key={`${it.item_type}-${it.id}`}
                    className="flex justify-between text-xs gap-2"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block leading-tight">
                        {it.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Qty: {it.quantity} &bull;{" "}
                        {it.item_type === "service" ? "Service Booking" : "Product"}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700 shrink-0">
                      GHS{" "}
                      {(
                        (it.item_type === "service" ? (it.deposit_amount ?? it.price) : it.price) *
                        it.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Full Order Value</span>
                  <span className="font-semibold">GHS {totals.subtotal.toFixed(2)}</span>
                </div>

                {totals.subtotal > totals.depositDue && (
                  <div className="flex justify-between text-amber-700">
                    <span>Balance Due Upon Completion</span>
                    <span className="font-bold">
                      GHS {(totals.subtotal - totals.depositDue).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Total Due Today
                  </span>
                  <span className="text-2xl font-black text-[#0a2540]">
                    GHS {totals.depositDue.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                id="submit-order-button"
                disabled={submitting}
                className={`mt-6 w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 text-white ${
                  submitting ? "bg-slate-400 cursor-not-allowed" : "bg-[#0a2540] hover:bg-[#184b7a]"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting to Paystack...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    Complete Order &amp; Pay GHS {totals.depositDue.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center mt-3 leading-tight">
                By completing your order, you agree to Tovila Water Solutions terms of supply &amp;
                engineering site dispatch.
              </p>
            </div>
          </div>
        </form>
      </main>

      <ShopFooter />
    </div>
  );
}
