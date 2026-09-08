import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShoppingBag, Droplets, Filter, ArrowRight, Wrench, Compass } from "lucide-react";
import { ShopHeader } from "../../components/shop/ShopHeader";
import { ShopFooter } from "../../components/shop/ShopFooter";
import { ProductCard } from "../../components/shop/ProductCard";
import { ServiceCard } from "../../components/shop/ServiceCard";
import { getCart, getCartTotals, type CartItem } from "../../lib/cart";
import type { Category, Product, Service } from "../../server/types";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Online Shop & Service Booking | Tovila Water Solutions Ghana" },
      {
        name: "description",
        content:
          "Order 18.9L dispenser drinking water refills, replacement RO & carbon filters, and book borehole drilling and engineering services in Accra, Ghana.",
      },
    ],
  }),
  component: ShopIndexPage,
});

function ShopIndexPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
    const handler = () => setCart(getCart());
    window.addEventListener("tovila_cart_updated", handler);
    return () => window.removeEventListener("tovila_cart_updated", handler);
  }, []);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        const res = await fetch("/api/catalog");
        if (!res.ok) throw new Error("Failed to load catalog");
        const data = await res.json();
        setCategories(data.categories || []);
        setProducts(data.products || []);
        setServices(data.services || []);
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load shop catalog");
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  const totals = getCartTotals(cart);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "all") return true;

    const cat = categories.find((c) => c.slug === activeTab);
    return cat ? p.category_id === cat.id : true;
  });

  // Filter services
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "all") return true;

    const cat = categories.find((c) => c.slug === activeTab);
    return cat ? s.category_id === cat.id : true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ShopHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#0a2540] via-[#10385c] to-[#0a2540] text-white py-12 px-4 sm:px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 bg-cyan-500/20 text-[#00bcd4] border border-cyan-500/30 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Droplets className="w-3.5 h-3.5" />
                Pure Water Solutions &bull; Direct Online Ordering
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Dispenser Water, Purification Parts &amp; Engineering Services
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Order 18.9L refill bottles, countertop &amp; floor dispensers, filtration media, or
                secure your borehole drilling survey date with an online deposit.
              </p>
            </div>

            {/* Quick category banner cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-700/60">
              <Link
                to="/shop/$categorySlug"
                params={{ categorySlug: "dispenser-drinking-water" }}
                className="bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-xl transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                    Dispenser Drinking Water
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    18.9L bottles, 10L, sachets &amp; units
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition shrink-0" />
              </Link>

              <Link
                to="/shop/$categorySlug"
                params={{ categorySlug: "water-treatment" }}
                className="bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-xl transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                    Water Treatment &amp; Parts
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    RO membranes, filters &amp; servicing
                  </p>
                </div>
                <Wrench className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition shrink-0" />
              </Link>

              <Link
                to="/shop/$categorySlug"
                params={{ categorySlug: "borehole-drilling" }}
                className="bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-xl transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                    Borehole Drilling Services
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Residential &amp; commercial rig drilling
                  </p>
                </div>
                <Compass className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition shrink-0" />
              </Link>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === "all"
                    ? "bg-[#0a2540] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Items ({products.length + services.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.slug)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === cat.slug
                      ? "bg-[#0a2540] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products or services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#0a2540] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-3 font-medium">Loading catalog items...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center">
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Products Section */}
              {filteredProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Physical Products &amp; Equipment
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Bottled water supplies, dispensers, test kits, and replacement filtration
                        parts
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">
                      {filteredProducts.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Services Section */}
              {filteredServices.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Professional Water Services &amp; Borehole Drilling
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Certified turnkey engineering, installation, hydro-geological surveys, and
                        maintenance
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">
                      {filteredServices.length} services
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 && filteredServices.length === 0 && (
                <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
                  <Filter className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <h3 className="text-base font-bold text-slate-800">No matching items found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try clearing your search query or selecting a different catalog category.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveTab("all");
                    }}
                    className="mt-4 px-4 py-2 bg-[#0a2540] text-white text-xs font-semibold rounded-lg"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Floating Cart Notification Bar if Cart Has Items */}
        {totals.totalCount > 0 && (
          <div className="sticky bottom-4 z-40 max-w-2xl mx-auto px-4">
            <div className="bg-[#0a2540] text-white p-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  {totals.totalCount}
                </div>
                <div>
                  <span className="text-xs text-slate-300 block">Total items in cart</span>
                  <span className="text-sm font-bold text-white">
                    Amount Due: GHS {totals.depositDue.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/shop/cart"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  View Cart &amp; Checkout &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <ShopFooter />
    </div>
  );
}
