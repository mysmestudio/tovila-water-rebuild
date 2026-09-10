import { useState, useEffect } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Droplets, Wrench, Compass } from "lucide-react";
import { ShopHeader } from "../../components/shop/ShopHeader";
import { ShopFooter } from "../../components/shop/ShopFooter";
import { ProductCard } from "../../components/shop/ProductCard";
import { ServiceCard } from "../../components/shop/ServiceCard";
import type { Category, Product, Service } from "../../server/types";

export const Route = createFileRoute("/shop/$categorySlug")({
  head: () => ({
    meta: [
      { title: "Category Catalog | Tovila Water Solutions" },
      {
        name: "description",
        content:
          "Browse specialized water equipment, purification filters, and engineering drilling services in Accra, Ghana.",
      },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { categorySlug } = useParams({ from: "/shop/$categorySlug" });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const res = await fetch("/api/catalog");
        if (!res.ok) throw new Error("Failed to load catalog data");
        const data = await res.json();
        setCategories(data.categories || []);
        setProducts(data.products || []);
        setServices(data.services || []);
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load category");
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const category = categories.find((c) => c.slug === categorySlug);
  const catProducts = category ? products.filter((p) => p.category_id === category.id) : [];
  const catServices = category ? services.filter((s) => s.category_id === category.id) : [];

  const getCategoryIcon = (slug: string) => {
    if (slug === "dispenser-drinking-water") return <Droplets className="w-5 h-5 text-cyan-400" />;
    if (slug === "water-treatment") return <Wrench className="w-5 h-5 text-cyan-400" />;
    return <Compass className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ShopHeader />

      <main className="flex-1">
        {/* Category Header */}
        <section className="relative text-white py-12 sm:py-16 px-4 sm:px-8 overflow-hidden">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src="/img/commercial-plantroom.jpg"
              alt="Tovila Water Engineering"
              className="w-full h-full object-cover object-center scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#06182b]/95 via-[#0a2540]/85 to-[#071d33]/90" />
            <div className="absolute inset-0 bg-[#0a2540]/30 backdrop-blur-[1px]" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white font-medium mb-4 transition bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg border border-white/15 backdrop-blur-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store Catalog
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 backdrop-blur-xs">
                {getCategoryIcon(categorySlug)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {category ? category.name : "Category Catalog"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 font-normal">
                  Factory-direct supply &bull; Certified water engineering standards in Ghana
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Items */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#0a2540] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-4 font-medium">Loading items...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-center">
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : !category ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Category Not Found</h2>
              <p className="text-xs text-slate-500 mt-1.5">
                The requested catalog category does not exist.
              </p>
              <Link
                to="/shop"
                className="mt-5 inline-block px-5 py-2.5 bg-[#0a2540] text-white text-xs font-semibold rounded-xl"
              >
                Return to Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Products in this category */}
              {catProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      Products ({catProducts.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {catProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Services in this category */}
              {catServices.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      Engineering Services &amp; Bookings ({catServices.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {catServices.map((s) => (
                      <ServiceCard key={s.id} service={s} />
                    ))}
                  </div>
                </div>
              )}

              {catProducts.length === 0 && catServices.length === 0 && (
                <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium">
                    No items currently available in this category.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-4 inline-block px-4 py-2 bg-[#0a2540] text-white text-xs font-semibold rounded-lg"
                  >
                    View All Products
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <ShopFooter />
    </div>
  );
}
