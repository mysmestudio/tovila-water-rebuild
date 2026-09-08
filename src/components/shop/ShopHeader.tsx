import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ShoppingBag, Phone, Mail, Shield, Menu, X, ArrowLeft } from "lucide-react";
import { DemoCatalogBanner } from "./DemoCatalogBanner";
import { getCart, getCartTotals, type CartItem } from "../../lib/cart";

export function ShopHeader() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setCart(getCart());
    const handler = () => setCart(getCart());
    window.addEventListener("tovila_cart_updated", handler);
    return () => window.removeEventListener("tovila_cart_updated", handler);
  }, []);

  const totals = getCartTotals(cart);

  return (
    <header id="shop-header" className="w-full bg-white border-b border-slate-200">
      <DemoCatalogBanner />

      {/* Top info bar */}
      <div className="bg-[#0a2540] text-slate-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#00bcd4]" />
              <a href="tel:+233208123456" className="hover:text-white transition">
                +233 (0) 20 812 3456
              </a>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#00bcd4]" />
              <a href="mailto:info@tovila.com" className="hover:text-white transition">
                info@tovila.com
              </a>
            </span>
            <span className="hidden md:inline-block text-slate-400">
              Accra & Greater Accra Region, Ghana
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/index.html"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3 h-3" />
              Corporate Website
            </a>
            <span className="text-slate-600">|</span>
            <Link
              to="/admin"
              className="text-xs text-[#00bcd4] hover:text-cyan-300 font-medium flex items-center gap-1 transition"
            >
              <Shield className="w-3 h-3" />
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/shop" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#0a2540] flex items-center justify-center text-white font-bold text-xl shadow-sm border border-cyan-500/30">
              <span className="text-[#00bcd4]">T</span>V
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#0a2540] block leading-none">
                TOVILA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#0288d1]">
                Online Shop &amp; Booking
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop category links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/shop"
            className={`px-3 py-2 rounded-md text-sm font-medium transition ${
              location.pathname === "/shop"
                ? "bg-slate-100 text-[#0a2540] font-semibold"
                : "text-slate-600 hover:text-[#0a2540] hover:bg-slate-50"
            }`}
          >
            All Catalog
          </Link>
          <Link
            to="/shop/$categorySlug"
            params={{ categorySlug: "dispenser-drinking-water" }}
            className={`px-3 py-2 rounded-md text-sm font-medium transition ${
              location.pathname.includes("dispenser-drinking-water")
                ? "bg-slate-100 text-[#0a2540] font-semibold"
                : "text-slate-600 hover:text-[#0a2540] hover:bg-slate-50"
            }`}
          >
            Dispenser Water
          </Link>
          <Link
            to="/shop/$categorySlug"
            params={{ categorySlug: "water-treatment" }}
            className={`px-3 py-2 rounded-md text-sm font-medium transition ${
              location.pathname.includes("water-treatment")
                ? "bg-slate-100 text-[#0a2540] font-semibold"
                : "text-slate-600 hover:text-[#0a2540] hover:bg-slate-50"
            }`}
          >
            Water Treatment
          </Link>
          <Link
            to="/shop/$categorySlug"
            params={{ categorySlug: "borehole-drilling" }}
            className={`px-3 py-2 rounded-md text-sm font-medium transition ${
              location.pathname.includes("borehole-drilling")
                ? "bg-slate-100 text-[#0a2540] font-semibold"
                : "text-slate-600 hover:text-[#0a2540] hover:bg-slate-50"
            }`}
          >
            Borehole Drilling
          </Link>
        </nav>

        {/* Cart button */}
        <div className="flex items-center gap-2">
          <Link
            to="/shop/cart"
            id="header-cart-button"
            className="flex items-center gap-2 bg-[#0a2540] hover:bg-[#184b7a] text-white px-3.5 py-2 rounded-lg text-sm font-medium shadow-sm transition group"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
              {totals.totalCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#e53935] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totals.totalCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
            {totals.depositDue > 0 && (
              <span className="font-semibold text-cyan-300 ml-1 text-xs sm:text-sm">
                GHS {totals.depositDue.toFixed(2)}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-white"
          >
            All Catalog
          </Link>
          <Link
            to="/shop/$categorySlug"
            params={{ categorySlug: "dispenser-drinking-water" }}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-white"
          >
            Dispenser Drinking Water
          </Link>
          <Link
            to="/shop/$categorySlug"
            params={{ categorySlug: "water-treatment" }}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-white"
          >
            Water Treatment Products &amp; Services
          </Link>
          <Link
            to="/shop/$categorySlug"
            params={{ categorySlug: "borehole-drilling" }}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-white"
          >
            Borehole Drilling Services
          </Link>
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <Link
              to="/shop/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-md bg-white border text-sm font-semibold text-slate-800"
            >
              <span>View Cart</span>
              <span>
                {totals.totalCount} items (GHS {totals.depositDue.toFixed(2)})
              </span>
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[#0288d1] font-medium"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
