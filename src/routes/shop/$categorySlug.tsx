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
        <section className="bg-[#0a2540] text-white py-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium mb-4 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to All Shop Catalog
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                {getCategoryIcon(categorySlug)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {category ? category.name : "Category Catalog"}
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Tovila Certified Standards &bull; Fast Delivery &amp; Engineering Dispatch across
                  Ghana
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Items */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#0a2540] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-3 font-medium">Loading items...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center">
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : !category ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Category Not Found</h2>
              <p className="text-xs text-slate-500 mt-1">
                The requested catalog category does not exist.
              </p>
              <Link
                to="/shop"
                className="mt-4 inline-block px-4 py-2 bg-[#0a2540] text-white text-xs font-semibold rounded-lg"
              >
                Return to Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Products in this category */}
              {catProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      Products ({catProducts.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {catProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Services in this category */}
              {catServices.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      Engineering Services &amp; Bookings ({catServices.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
