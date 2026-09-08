import { useState } from "react";
import { ShoppingBag, Check, Plus, Minus } from "lucide-react";
import { addToCart } from "../../lib/cart";
import type { Product } from "../../server/types";

export function ProductCard({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(
      {
        id: product.id,
        item_type: "product",
        name: product.name,
        price: Number(product.price),
        unit: product.unit,
        image_url: product.image_url,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-contain hover:scale-105 transition duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className="bg-[#0a2540] text-white text-[10px] font-mono font-semibold px-2 py-0.5 rounded shadow-sm">
            {product.sku}
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold px-2 py-0.5 rounded">
              Out of stock
            </span>
          ) : product.stock_quantity < 20 ? (
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded">
              {product.stock_quantity} left
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded">
              In Stock
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-slate-500">Price: </span>
              <span className="text-lg font-black text-[#0a2540]">
                GHS {Number(product.price).toFixed(2)}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">{product.unit}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quantity Selector */}
            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1 || isOutOfStock}
                className="px-2.5 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-bold text-slate-800 w-7 text-center">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                disabled={isOutOfStock || qty >= product.stock_quantity}
                className="px-2.5 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              type="button"
              id={`add-product-btn-${product.id}`}
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold shadow-sm transition ${
                added
                  ? "bg-emerald-600 text-white"
                  : isOutOfStock
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-[#0a2540] hover:bg-[#184b7a] text-white"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
