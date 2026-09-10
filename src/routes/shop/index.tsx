import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShoppingBag, Droplets, Filter } from "lucide-react";
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
        <section className="relative text-white py-24 sm:py-32 min-h-[340px] sm:min-h-[400px] flex items-center justify-center px-4 sm:px-8 overflow-hidden">
          {/* Engaging Photographic Water Solutions eStore Background & Gradient Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src="/img/commercial-plantroom.jpg"
              alt="Tovila Water Solutions eShop Facility"
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* Elegant dual-tone gradient creating water depth and highlighting text */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06182b] via-[#0a2540]/80 to-[#071d33]/85" />
            <div className="absolute inset-0 bg-[#0a2540]/30 backdrop-blur-[1.5px]" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
              Welcome to Tovila eShop
            </h1>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === "all"
                    ? "bg-[#0a2540] text-white"
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
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === cat.slug
                      ? "bg-[#0a2540] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products or services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#0a2540] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-4 font-medium">Loading catalog items...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-center">
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Products Section */}
              {filteredProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Physical Products &amp; Equipment
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Bottled water supplies, dispensers, test kits, and replacement filtration
                        parts
                      </p>
                    </div>
                    <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                      {filteredProducts.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Services Section */}
              {filteredServices.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Professional Water Services &amp; Borehole Drilling
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Certified turnkey engineering, installation, hydro-geological surveys, and
                        maintenance
                      </p>
                    </div>
                    <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                      {filteredServices.length} services
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 && filteredServices.length === 0 && (
                <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8">
                  <Filter className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No matching items found</h3>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
                    Try clearing your search query or selecting a different catalog category.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveTab("all");
                    }}
                    className="mt-5 px-5 py-2.5 bg-[#0a2540] text-white text-xs font-semibold rounded-xl transition"
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
          <div className="sticky bottom-6 z-40 max-w-2xl mx-auto px-4">
            <div className="bg-[#0a2540] text-white p-4 px-6 rounded-2xl flex items-center justify-between gap-4 border border-slate-700 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  {totals.totalCount}
                </div>
                <div>
                  <span className="text-xs text-slate-300 block">Total items in cart</span>
                  <span className="text-sm font-semibold text-white">
                    Amount Due: GHS {totals.depositDue.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/shop/cart"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
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
