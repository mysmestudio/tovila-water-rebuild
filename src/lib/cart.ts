export interface CartItem {
  id: string;
  item_type: "product" | "service";
  name: string;
  price: number;
  unit?: string;
  deposit_amount?: number;
  image_url?: string;
  quantity: number;
}

const CART_STORAGE_KEY = "tovila_shop_cart_v1";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("tovila_cart_updated"));
  } catch (e) {
    console.error("Failed to save cart:", e);
  }
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1): CartItem[] {
  const current = getCart();
  const existingIdx = current.findIndex(
    (it) => it.id === item.id && it.item_type === item.item_type,
  );

  if (existingIdx >= 0) {
    current[existingIdx].quantity += quantity;
  } else {
    current.push({ ...item, quantity });
  }

  saveCart(current);
  return current;
}

export function updateCartQuantity(
  id: string,
  item_type: "product" | "service",
  quantity: number,
): CartItem[] {
  let current = getCart();
  if (quantity <= 0) {
    current = current.filter((it) => !(it.id === id && it.item_type === item_type));
  } else {
    current = current.map((it) =>
      it.id === id && it.item_type === item_type ? { ...it, quantity } : it,
    );
  }
  saveCart(current);
  return current;
}

export function removeFromCart(id: string, item_type: "product" | "service"): CartItem[] {
  const current = getCart().filter((it) => !(it.id === id && it.item_type === item_type));
  saveCart(current);
  return current;
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event("tovila_cart_updated"));
}

export function getCartTotals(items: CartItem[]) {
  let subtotal = 0;
  let depositDue = 0;
  let totalCount = 0;

  for (const item of items) {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    totalCount += item.quantity;

    if (item.item_type === "service") {
      // Service deposit
      const dep = (item.deposit_amount ?? item.price) * item.quantity;
      depositDue += dep;
    } else {
      // Product 100% upfront
      depositDue += lineTotal;
    }
  }

  return {
    subtotal,
    depositDue,
    totalCount,
    hasServices: items.some((i) => i.item_type === "service"),
    hasProducts: items.some((i) => i.item_type === "product"),
  };
}
