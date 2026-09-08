export type CategoryType = "product" | "service" | "mixed";

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  unit: string;
  sku: string;
  stock_quantity: number;
  image_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type DepositType = "fixed" | "percentage";

export interface Service {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  starting_price: number;
  deposit_amount: number;
  deposit_type: DepositType;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  "pending" | "paid" | "processing" | "fulfilled" | "delivered" | "cancelled";

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string | null;
  site_address: string | null;
  preferred_date: string | null;
  status: OrderStatus;
  subtotal: number;
  amount_due: number;
  amount_paid: number;
  paystack_reference: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: "product" | "service";
  product_id: string | null;
  service_id: string | null;
  name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  line_total: number;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export interface CheckoutPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address?: string | null;
  site_address?: string | null;
  preferred_date?: string | null;
  items: Array<{
    id: string;
    item_type: "product" | "service";
    quantity: number;
  }>;
}
