import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  Package,
  Wrench,
  ShoppingBag,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Search,
  Lock,
} from "lucide-react";
import type { Category, Product, Service, Order, OrderStatus } from "../../server/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Portal | Tovila Water Solutions" },
      { name: "description", content: "Tovila online shop management dashboard." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(true);
  const [adminEmail, setAdminEmail] = useState("admin@tovila.com");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"orders" | "products" | "services">("orders");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New item modal states
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("50");
  const [newProdCategory, setNewProdCategory] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");

  const [showNewService, setShowNewService] = useState(false);
  const [newServName, setNewServName] = useState("");
  const [newServPrice, setNewServPrice] = useState("");
  const [newServDeposit, setNewServDeposit] = useState("");
  const [newServCategory, setNewServCategory] = useState("");
  const [newServDesc, setNewServDesc] = useState("");

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/data");
      if (!res.ok) throw new Error("Failed to load admin data");
      const data = await res.json();
      setCategories(data.categories || []);
      setProducts(data.products || []);
      setServices(data.services || []);
      setOrders(data.orders || []);
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
        showNotification(`Order status updated to ${status}`);
      }
    } catch (e: unknown) {
      alert("Failed to update status: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProductActive = async (p: Product) => {
    try {
      const next = !p.active;
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, active: next } : item)),
        );
        showNotification(`${p.name} is now ${next ? "active" : "inactive"}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProductStock = async (p: Product, newStock: number) => {
    try {
      const stock = Math.max(0, newStock);
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_quantity: stock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, stock_quantity: stock } : item)),
        );
        showNotification(`Updated ${p.name} stock to ${stock}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProductPrice = async (p: Product, newPrice: number) => {
    try {
      const price = Math.max(0, newPrice);
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((item) => (item.id === p.id ? { ...item, price } : item)));
        showNotification(`Updated ${p.name} price to GHS ${price.toFixed(2)}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleServiceActive = async (s: Service) => {
    try {
      const next = !s.active;
      const res = await fetch(`/api/admin/services/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((item) => (item.id === s.id ? { ...item, active: next } : item)),
        );
        showNotification(`${s.name} is now ${next ? "active" : "inactive"}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdCategory) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName.trim(),
          slug: newProdName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category_id: newProdCategory,
          description: newProdDesc.trim() || "Tovila certified water product.",
          price: parseFloat(newProdPrice),
          unit: "per unit",
          sku: newProdSku.trim() || `PROD-${Date.now().toString().slice(-4)}`,
          stock_quantity: parseInt(newProdStock, 10) || 50,
          image_url: "/img/shop/bottle-18-9l.svg",
          active: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => [data.product, ...prev]);
        setShowNewProduct(false);
        setNewProdName("");
        setNewProdSku("");
        setNewProdPrice("");
        showNotification("Product created successfully!");
      }
    } catch (e: unknown) {
      alert("Failed to create product: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServName || !newServPrice || !newServCategory) return;
    try {
      setSaving(true);
      const startingPrice = parseFloat(newServPrice);
      const depositAmount = parseFloat(newServDeposit) || startingPrice;

      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newServName.trim(),
          slug: newServName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category_id: newServCategory,
          description: newServDesc.trim() || "Tovila certified water engineering service.",
          starting_price: startingPrice,
          deposit_amount: depositAmount,
          deposit_type: "fixed",
          active: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.service) {
        setServices((prev) => [data.service, ...prev]);
        setShowNewService(false);
        setNewServName("");
        setNewServPrice("");
        setNewServDeposit("");
        showNotification("Service created successfully!");
      }
    } catch (e: unknown) {
      alert("Failed to create service: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-md w-full border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#0a2540] text-cyan-400 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Tovila Admin Portal</h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Secure Supabase PostgreSQL &amp; Paystack backend management
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
              {authError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (adminEmail && password) {
                setAuthenticated(true);
              } else {
                setAuthError("Please enter email and password.");
              }
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0a2540] hover:bg-[#184b7a] text-white py-3 rounded-xl text-xs font-semibold transition"
            >
              Sign In to Admin
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <Link
              to="/shop"
              className="text-xs text-slate-500 hover:text-slate-800 font-medium transition"
            >
              &larr; Back to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0a2540] text-white px-4 sm:px-8 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center text-[#0a2540] font-bold text-sm">
            TV
          </div>
          <div>
            <span className="font-bold text-sm sm:text-base tracking-tight block leading-none">
              Tovila Admin Backend
            </span>
            <span className="text-xs text-cyan-300 font-mono mt-1 block">
              Supabase DB &bull; RLS Security &bull; Paystack GHS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {feedback && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> {feedback}
            </span>
          )}

          <button
            type="button"
            onClick={loadAdminData}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            to="/shop"
            className="text-xs bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30 px-3.5 py-2 rounded-xl font-medium flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Storefront
          </Link>

          <button
            type="button"
            onClick={() => setAuthenticated(false)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-slate-800 transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === "orders"
                  ? "bg-[#0a2540] text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Orders &amp; Bookings ({orders.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === "products"
                  ? "bg-[#0a2540] text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90"
              }`}
            >
              <Package className="w-4 h-4" />
              Products ({products.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("services")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === "services"
                  ? "bg-[#0a2540] text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90"
              }`}
            >
              <Wrench className="w-4 h-4" />
              Engineering Services ({services.length})
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {activeTab === "products" && (
              <button
                type="button"
                onClick={() => {
                  setNewProdCategory(categories[0]?.id || "");
                  setShowNewProduct(true);
                }}
                className="bg-[#0a2540] hover:bg-[#184b7a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
              >
                + Add Product
              </button>
            )}

            {activeTab === "services" && (
              <button
                type="button"
                onClick={() => {
                  setNewServCategory(categories[1]?.id || categories[0]?.id || "");
                  setShowNewService(true);
                }}
                className="bg-[#0a2540] hover:bg-[#184b7a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
              >
                + Add Service
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by order #, customer name, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                  />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Showing {orders.length} total orders logged
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-3.5">Order #</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Contact</th>
                      <th className="p-3.5">Destination / Site</th>
                      <th className="p-3.5 text-right">Subtotal</th>
                      <th className="p-3.5 text-right">Amount Paid</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders
                      .filter((o) => {
                        const q = search.toLowerCase();
                        return (
                          o.order_number.toLowerCase().includes(q) ||
                          o.customer_name.toLowerCase().includes(q) ||
                          o.customer_phone.toLowerCase().includes(q) ||
                          o.customer_email.toLowerCase().includes(q)
                        );
                      })
                      .map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 font-mono font-semibold text-slate-900">
                            {order.order_number}
                          </td>
                          <td className="p-3.5 font-semibold text-slate-800">
                            {order.customer_name}
                          </td>
                          <td className="p-3.5 text-slate-600">
                            <div>{order.customer_phone}</div>
                            <div className="text-xs text-slate-400">{order.customer_email}</div>
                          </td>
                          <td className="p-3.5 text-slate-600 max-w-[200px] truncate">
                            {order.delivery_address || order.site_address || "Standard Accra"}
                          </td>
                          <td className="p-3.5 text-right font-semibold text-slate-700">
                            GHS {Number(order.subtotal).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-bold text-emerald-700">
                            GHS {Number(order.amount_paid).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-center">
                            <select
                              value={order.status}
                              disabled={saving}
                              onChange={(e) =>
                                handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                                order.status === "paid"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : order.status === "delivered" || order.status === "fulfilled"
                                    ? "bg-blue-50 text-blue-800 border-blue-300"
                                    : order.status === "processing"
                                      ? "bg-purple-50 text-purple-800 border-purple-300"
                                      : order.status === "cancelled"
                                        ? "bg-red-50 text-red-800 border-red-300"
                                        : "bg-amber-50 text-amber-800 border-amber-300"
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="processing">Processing</option>
                              <option value="fulfilled">Fulfilled</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="text-cyan-700 hover:text-cyan-900 font-semibold underline text-xs"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}

                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No orders recorded yet. Place a test order in the storefront!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-xl w-full p-8 border border-slate-200/90 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="font-bold text-base text-slate-900">
                      Order Details: {selectedOrder.order_number}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="mt-5 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-slate-500 block">Customer:</span>
                        <strong className="text-slate-900 font-semibold">
                          {selectedOrder.customer_name}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Contact:</span>
                        <strong className="font-semibold">{selectedOrder.customer_phone}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Email:</span>
                        <span>{selectedOrder.customer_email}</span>
                      </div>
                      {selectedOrder.delivery_address && (
                        <div className="col-span-2">
                          <span className="text-slate-500 block">Delivery Address:</span>
                          <span>{selectedOrder.delivery_address}</span>
                        </div>
                      )}
                      {selectedOrder.site_address && (
                        <div className="col-span-2">
                          <span className="text-slate-500 block">Project / Drilling Site:</span>
                          <span>{selectedOrder.site_address}</span>
                        </div>
                      )}
                      {selectedOrder.preferred_date && (
                        <div>
                          <span className="text-slate-500 block">Preferred Date:</span>
                          <span>{selectedOrder.preferred_date}</span>
                        </div>
                      )}
                      {selectedOrder.paystack_reference && (
                        <div>
                          <span className="text-slate-500 block">Paystack Ref:</span>
                          <span className="font-mono">{selectedOrder.paystack_reference}</span>
                        </div>
                      )}
                    </div>

                    <h4 className="font-semibold text-slate-800 pt-2">Purchased Items:</h4>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 font-semibold">
                          <tr>
                            <th className="p-3">Item</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-right">Price</th>
                            <th className="p-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedOrder.items?.map((it) => (
                            <tr key={it.id}>
                              <td className="p-3 font-medium text-slate-900">{it.name_snapshot}</td>
                              <td className="p-3 text-center">{it.quantity}</td>
                              <td className="p-3 text-right text-slate-600">
                                GHS {Number(it.price_snapshot).toFixed(2)}
                              </td>
                              <td className="p-3 text-right font-semibold text-slate-900">
                                GHS {Number(it.line_total).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === "products" && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm">
                  Physical Products &amp; Dispenser Inventory
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {products.length} products
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-3.5">SKU</th>
                      <th className="p-3.5">Product Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 text-right">Price (GHS)</th>
                      <th className="p-3.5 text-center">Stock</th>
                      <th className="p-3.5 text-center">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => {
                      const cat = categories.find((c) => c.id === p.category_id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 font-mono font-semibold text-slate-900">{p.sku}</td>
                          <td className="p-3.5 font-semibold text-slate-800">{p.name}</td>
                          <td className="p-3.5 text-slate-500">{cat?.name || "Standard"}</td>
                          <td className="p-3.5 text-right">
                            <input
                              type="number"
                              step="0.5"
                              defaultValue={p.price}
                              onBlur={(e) =>
                                handleUpdateProductPrice(p, parseFloat(e.target.value))
                              }
                              className="w-24 text-right px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                            />
                          </td>
                          <td className="p-3.5 text-center">
                            <input
                              type="number"
                              defaultValue={p.stock_quantity}
                              onBlur={(e) =>
                                handleUpdateProductStock(p, parseInt(e.target.value, 10))
                              }
                              className="w-20 text-center px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                            />
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleProductActive(p)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                p.active
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              }`}
                            >
                              {p.active ? "Active" : "Inactive"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: New Product */}
            {showNewProduct && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <form
                  onSubmit={handleCreateProduct}
                  className="bg-white rounded-2xl max-w-md w-full p-8 border border-slate-200/90 space-y-4"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-base text-slate-900">Add New Product</h3>
                    <button
                      type="button"
                      onClick={() => setShowNewProduct(false)}
                      className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                    >
                      &times;
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="e.g. 20L Heavy Duty Water Bottle"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={newProdSku}
                        onChange={(e) => setNewProdSku(e.target.value)}
                        placeholder="DW-20L"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Price (GHS)
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        placeholder="35.00"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Category
                      </label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Initial Stock
                      </label>
                      <input
                        type="number"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      placeholder="High quality drinking water..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowNewProduct(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-[#0a2540] hover:bg-[#184b7a] text-white text-xs font-semibold rounded-xl transition"
                    >
                      {saving ? "Saving..." : "Save Product"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SERVICES */}
        {activeTab === "services" && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm">
                  Turnkey Engineering &amp; Borehole Services
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {services.length} services
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-3.5">Service Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 text-right">Starting Price (GHS)</th>
                      <th className="p-3.5 text-right">Deposit Due (GHS)</th>
                      <th className="p-3.5 text-center">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map((s) => {
                      const cat = categories.find((c) => c.id === s.category_id);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 font-semibold text-slate-800">{s.name}</td>
                          <td className="p-3.5 text-slate-500">{cat?.name || "Services"}</td>
                          <td className="p-3.5 text-right font-semibold text-slate-700">
                            GHS {Number(s.starting_price).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-bold text-[#0a2540]">
                            GHS {Number(s.deposit_amount).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleServiceActive(s)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                s.active
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              }`}
                            >
                              {s.active ? "Active" : "Inactive"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: New Service */}
            {showNewService && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <form
                  onSubmit={handleCreateService}
                  className="bg-white rounded-2xl max-w-md w-full p-8 border border-slate-200/90 space-y-4"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-base text-slate-900">Add New Service</h3>
                    <button
                      type="button"
                      onClick={() => setShowNewService(false)}
                      className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                    >
                      &times;
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Service Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newServName}
                      onChange={(e) => setNewServName(e.target.value)}
                      placeholder="e.g. Industrial RO Plant Commissioning"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Starting Est. (GHS)
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={newServPrice}
                        onChange={(e) => setNewServPrice(e.target.value)}
                        placeholder="5000.00"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Booking Deposit (GHS)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newServDeposit}
                        onChange={(e) => setNewServDeposit(e.target.value)}
                        placeholder="1000.00"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Category
                    </label>
                    <select
                      value={newServCategory}
                      onChange={(e) => setNewServCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Service Description
                    </label>
                    <textarea
                      rows={2}
                      value={newServDesc}
                      onChange={(e) => setNewServDesc(e.target.value)}
                      placeholder="Detailed engineering scope of work..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:bg-white transition"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowNewService(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-[#0a2540] hover:bg-[#184b7a] text-white text-xs font-semibold rounded-xl transition"
                    >
                      {saving ? "Saving..." : "Save Service"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
