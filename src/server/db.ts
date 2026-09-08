import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Category, Product, Service, Order, OrderItem, OrderStatus } from "./types";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

// =====================================================================
// IN-MEMORY / FALLBACK SEED DATA
// (Used when Supabase credentials are being configured, guaranteeing
// zero crashes and full demo functionality out-of-the-box)
// =====================================================================

const INITIAL_CATEGORIES: Category[] = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    name: "Dispenser Drinking Water Supply",
    slug: "dispenser-drinking-water",
    type: "product",
    created_at: new Date().toISOString(),
  },
  {
    id: "c2000000-0000-0000-0000-000000000002",
    name: "Water Treatment Products & Services",
    slug: "water-treatment",
    type: "mixed",
    created_at: new Date().toISOString(),
  },
  {
    id: "c3000000-0000-0000-0000-000000000003",
    name: "Borehole Drilling Services",
    slug: "borehole-drilling",
    type: "service",
    created_at: new Date().toISOString(),
  },
];

const INITIAL_PRODUCTS: Product[] = [
  // Category 1: Dispenser Drinking Water
  {
    id: "p1000000-0000-0000-0000-000000000001",
    category_id: "c1000000-0000-0000-0000-000000000001",
    name: "18.9L Refillable Water Bottle",
    slug: "18-9l-refillable-water-bottle",
    description:
      "Multi-stage purified drinking water in a heavy-duty polycarbonate bottle. Compatible with standard water dispensers.",
    price: 25,
    unit: "per bottle",
    sku: "DW-189L",
    stock_quantity: 200,
    image_url: "/img/shop/bottle-18-9l.svg",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1000000-0000-0000-0000-000000000002",
    category_id: "c1000000-0000-0000-0000-000000000001",
    name: "10L Water Dispenser Bottle",
    slug: "10l-water-dispenser-bottle",
    description:
      "Compact 10L purified drinking water container for smaller offices, homes, and countertop dispensers.",
    price: 15,
    unit: "per bottle",
    sku: "DW-10L",
    stock_quantity: 150,
    image_url: "/img/shop/bottle-10l.svg",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1000000-0000-0000-0000-000000000003",
    category_id: "c1000000-0000-0000-0000-000000000001",
    name: "500ml Sachet Water (Pack of 30)",
    slug: "500ml-sachet-water-pack-30",
    description:
      "Certified pure drinking water sealed in hygienic 500ml sachets. Convenient bundle pack of 30 for households and events.",
    price: 20,
    unit: "pack of 30",
    sku: "DW-SACHET-30",
    stock_quantity: 500,
    image_url: "/img/shop/sachet-pack.svg",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1000000-0000-0000-0000-000000000004",
    category_id: "c1000000-0000-0000-0000-000000000001",
    name: "1.5L Bottled Water (Pack of 12)",
    slug: "1-5l-bottled-water-pack-12",
    description:
      "Premium bottled drinking water, perfectly mineralized for daily hydration. Pack of 12 durable PET bottles.",
    price: 48,
    unit: "pack of 12",
    sku: "DW-15L-12",
    stock_quantity: 100,
    image_url: "/img/shop/bottles-1-5l.svg",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1000000-0000-0000-0000-000000000005",
    category_id: "c1000000-0000-0000-0000-000000000001",
    name: "Countertop Water Dispenser (Hot & Cold)",
    slug: "countertop-water-dispenser-hot-cold",
    description:
      "Space-saving electronic dispenser providing instant piping hot water and chilled drinking water with child safety locks.",
    price: 850,
    unit: "per unit",
    sku: "WD-CT-HC",
    stock_quantity: 20,
    image_url: "/img/shop/dispenser-countertop.svg",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1000000-0000-0000-0000-000000000006",
    category_id: "c1000000-0000-0000-0000-000000000001",
    name: "Floor-Standing Water Dispenser (Hot & Cold)",
    slug: "floor-standing-water-dispenser-hot-cold",
    description:
      "Commercial-grade freestanding hot and cold water dispenser with stainless steel reservoir and bottom storage cabinet.",
    price: 1200,
    unit: "per unit",
    sku: "WD-FS-HC",
    stock_quantity: 15,
    image_url: "/img/shop/dispenser-floor.svg",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1000000-0000-0000-0000-000000000007",
    category_id: "c1000000-0000-0000-0000-000000000001",
    name: "Monthly Water Refill Subscription (4× 18.9L/month)",
    slug: "monthly-water-refill-subscription-4x18-9l",
    description:
      "Scheduled weekly deliveries directly to your home or office. Includes 4× 18.9L refill bottles per month with free container exchange.",
    price: 90,
    unit: "per month",
    sku: "SUB-189L-4",
    stock_quantity: 999,
    image_url: "/img/shop/subscription-monthly.svg",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Category 2: Water Treatment Products
  {
    id: "p2000000-0000-0000-0000-000000000001",
    category_id: "c2000000-0000-0000-0000-000000000002",
    name: "Replacement Sediment Filter Cartridge",
    slug: "replacement-sediment-filter-cartridge",
    description:
      "5-micron spun polypropylene sediment filter. Traps silt, sand, rust, and particulate matter before fine filtration.",
    price: 45,
    unit: "per cartridge",
    sku: "WT-SED-10",
    stock_quantity: 80,
    image_url: "/img/shop/filter-sediment.svg",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p2000000-0000-0000-0000-000000000002",
    category_id: "c2000000-0000-0000-0000-000000000002",
    name: "Replacement Carbon Filter Cartridge",
    slug: "replacement-carbon-filter-cartridge",
    description:
      "High-absorption extruded activated carbon block. Removes chlorine, odors, pesticides, and organic chemical contaminants.",
    price: 55,
    unit: "per cartridge",
    sku: "WT-CARB-10",
    stock_quantity: 80,
    image_url: "/img/shop/filter-carbon.svg",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p2000000-0000-0000-0000-000000000003",
    category_id: "c2000000-0000-0000-0000-000000000002",
    name: "Replacement RO Membrane",
    slug: "replacement-ro-membrane",
    description:
      "Thin-film composite (TFC) reverse osmosis membrane element. Rejects 97%+ of total dissolved solids, heavy metals, and bacteria.",
    price: 180,
    unit: "per membrane",
    sku: "WT-RO-MEM",
    stock_quantity: 40,
    image_url: "/img/shop/ro-membrane.svg",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p2000000-0000-0000-0000-000000000004",
    category_id: "c2000000-0000-0000-0000-000000000002",
    name: "Home Water Test Kit",
    slug: "home-water-test-kit",
    description:
      "Rapid multi-parameter test kit checking pH, total hardness, iron, chlorine, nitrates, and TDS. Includes colorimetric comparator chart.",
    price: 60,
    unit: "per kit",
    sku: "WT-TEST-KIT",
    stock_quantity: 60,
    image_url: "/img/shop/water-test-kit.svg",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_SERVICES: Service[] = [
  // Category 2: Water Treatment Services
  {
    id: "s2000000-0000-0000-0000-000000000001",
    category_id: "c2000000-0000-0000-0000-000000000002",
    name: "Water Treatment System Installation",
    slug: "water-treatment-system-installation",
    description:
      "Full turnkey installation of home or commercial water filtration/RO systems by Tovila certified engineers. Balance payable upon commissioning.",
    starting_price: 1500,
    deposit_amount: 300,
    deposit_type: "fixed",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s2000000-0000-0000-0000-000000000002",
    category_id: "c2000000-0000-0000-0000-000000000002",
    name: "Annual System Maintenance & Service",
    slug: "annual-system-maintenance-service",
    description:
      "Complete 12-month preventive service covering filter replacements, pump inspection, pressure testing, and water quality recalibration.",
    starting_price: 250,
    deposit_amount: 250, // Fixed, full price
    deposit_type: "fixed",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s2000000-0000-0000-0000-000000000003",
    category_id: "c2000000-0000-0000-0000-000000000002",
    name: "RO System Cleaning & Sanitisation",
    slug: "ro-system-cleaning-sanitisation",
    description:
      "Deep chemical flushing of membrane housings, antimicrobial sanitisation of storage pressure tanks, and flow rate validation.",
    starting_price: 180,
    deposit_amount: 180, // Fixed, full price
    deposit_type: "fixed",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s2000000-0000-0000-0000-000000000004",
    category_id: "c2000000-0000-0000-0000-000000000002",
    name: "Water Quality Testing & Consultation (in-person)",
    slug: "water-quality-testing-consultation-in-person",
    description:
      "On-site water sampling, digital electrochemical probe measurements, and comprehensive engineer assessment report for your site.",
    starting_price: 120,
    deposit_amount: 120, // Fixed, full price
    deposit_type: "fixed",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Category 3: Borehole Drilling Services
  {
    id: "s3000000-0000-0000-0000-000000000001",
    category_id: "c3000000-0000-0000-0000-000000000003",
    name: "Residential Borehole Drilling",
    slug: "residential-borehole-drilling",
    description:
      "Rotary rig borehole drilling up to 80m depth for private homes. Includes geophysical site survey, casing installation, and pump testing. Deposit GHS 2,000.",
    starting_price: 12000,
    deposit_amount: 2000,
    deposit_type: "fixed",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s3000000-0000-0000-0000-000000000002",
    category_id: "c3000000-0000-0000-0000-000000000003",
    name: "Commercial/Institutional Borehole Drilling",
    slug: "commercial-institutional-borehole-drilling",
    description:
      "Heavy-duty deep aquifer borehole drilling for factories, hospitals, universities, and commercial estates. High-yield logging. Deposit GHS 5,000.",
    starting_price: 35000,
    deposit_amount: 5000,
    deposit_type: "fixed",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s3000000-0000-0000-0000-000000000003",
    category_id: "c3000000-0000-0000-0000-000000000003",
    name: "Borehole Rehabilitation & Redrilling",
    slug: "borehole-rehabilitation-redrilling",
    description:
      "High-pressure air compressor flushing, screen descaling, yield restoration, and damaged casing recovery for silted wells. Deposit GHS 1,000.",
    starting_price: 6000,
    deposit_amount: 1000,
    deposit_type: "fixed",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s3000000-0000-0000-0000-000000000004",
    category_id: "c3000000-0000-0000-0000-000000000003",
    name: "Hydro-geological Site Survey",
    slug: "hydro-geological-site-survey",
    description:
      "Advanced electrical resistivity profiling and groundwater table mapping to pinpoint optimal drilling coordinates before drilling starts.",
    starting_price: 800,
    deposit_amount: 800, // Fixed standalone assessment
    deposit_type: "fixed",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Fallback memory state
const memoryCategories: Category[] = [...INITIAL_CATEGORIES];
const memoryProducts: Product[] = [...INITIAL_PRODUCTS];
const memoryServices: Service[] = [...INITIAL_SERVICES];
const memoryOrders: Order[] = [];
const memoryOrderItems: OrderItem[] = [];

// =====================================================================
// DATABASE ADAPTER FUNCTIONS
// =====================================================================

export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    } catch (e) {
      console.warn("Supabase categories fetch error, using fallback:", e);
    }
  }
  return memoryCategories;
}

export async function getProducts(activeOnly = true): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      let query = supabase.from("products").select("*").order("name");
      if (activeOnly) {
        query = query.eq("active", true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {
      console.warn("Supabase products fetch error, using fallback:", e);
    }
  }
  return activeOnly ? memoryProducts.filter((p) => p.active) : memoryProducts;
}

export async function getServices(activeOnly = true): Promise<Service[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      let query = supabase.from("services").select("*").order("name");
      if (activeOnly) {
        query = query.eq("active", true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Service[];
      }
    } catch (e) {
      console.warn("Supabase services fetch error, using fallback:", e);
    }
  }
  return activeOnly ? memoryServices.filter((s) => s.active) : memoryServices;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (!error && data) {
        return data as Product;
      }
    } catch (e) {
      console.warn("Supabase getProductById error, checking fallback:", e);
    }
  }
  return memoryProducts.find((p) => p.id === id) || null;
}

export async function getServiceById(id: string): Promise<Service | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("services").select("*").eq("id", id).single();
      if (!error && data) {
        return data as Service;
      }
    } catch (e) {
      console.warn("Supabase getServiceById error, checking fallback:", e);
    }
  }
  return memoryServices.find((s) => s.id === id) || null;
}

export async function createOrder(
  orderData: Omit<Order, "id" | "created_at" | "updated_at">,
  items: Omit<OrderItem, "id" | "order_id" | "created_at">[],
): Promise<Order> {
  const supabase = getSupabaseAdmin();
  const orderId = "ord_" + Math.random().toString(36).substring(2, 12);
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id: orderId,
    created_at: now,
    updated_at: now,
  };

  const newItems: OrderItem[] = items.map((it) => ({
    ...it,
    id: "item_" + Math.random().toString(36).substring(2, 12),
    order_id: orderId,
    created_at: now,
  }));

  if (supabase) {
    try {
      const { data: createdOrder, error: orderErr } = await supabase
        .from("orders")
        .insert([
          {
            order_number: orderData.order_number,
            customer_name: orderData.customer_name,
            customer_email: orderData.customer_email,
            customer_phone: orderData.customer_phone,
            delivery_address: orderData.delivery_address,
            site_address: orderData.site_address,
            preferred_date: orderData.preferred_date,
            status: "pending",
            subtotal: orderData.subtotal,
            amount_due: orderData.amount_due,
            amount_paid: 0,
            paystack_reference: orderData.paystack_reference,
          },
        ])
        .select()
        .single();

      if (!orderErr && createdOrder) {
        const orderIdReal = createdOrder.id;
        const itemsToInsert = items.map((it) => ({
          order_id: orderIdReal,
          item_type: it.item_type,
          product_id: it.product_id,
          service_id: it.service_id,
          name_snapshot: it.name_snapshot,
          price_snapshot: it.price_snapshot,
          quantity: it.quantity,
          line_total: it.line_total,
        }));

        const { error: itemsErr } = await supabase.from("order_items").insert(itemsToInsert);

        if (itemsErr) {
          console.error("Error inserting order items in Supabase:", itemsErr);
        }

        return {
          ...createdOrder,
          items: newItems,
        };
      }
    } catch (e) {
      console.warn("Supabase createOrder error, recording in memory store:", e);
    }
  }

  // Fallback memory store
  memoryOrders.push(newOrder);
  memoryOrderItems.push(...newItems);
  return { ...newOrder, items: newItems };
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("order_number", orderNumber)
        .single();

      if (!error && order) {
        return {
          ...order,
          items: order.order_items || [],
        };
      }
    } catch (e) {
      console.warn("Supabase getOrderByNumber error, checking memory:", e);
    }
  }

  const order = memoryOrders.find((o) => o.order_number === orderNumber);
  if (order) {
    return {
      ...order,
      items: memoryOrderItems.filter((it) => it.order_id === order.id),
    };
  }
  return null;
}

export async function getOrderByReference(reference: string): Promise<Order | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("paystack_reference", reference)
        .single();

      if (!error && order) {
        return {
          ...order,
          items: order.order_items || [],
        };
      }
    } catch (e) {
      console.warn("Supabase getOrderByReference error, checking memory:", e);
    }
  }

  const order = memoryOrders.find((o) => o.paystack_reference === reference);
  if (order) {
    return {
      ...order,
      items: memoryOrderItems.filter((it) => it.order_id === order.id),
    };
  }
  return null;
}

export async function markOrderPaid(
  orderIdentifier: { orderNumber?: string; reference?: string },
  amountPaid: number,
  paystackRef: string,
): Promise<{ success: boolean; order?: Order; message?: string }> {
  const supabase = getSupabaseAdmin();

  // Find order first
  let order: Order | null = null;
  if (orderIdentifier.orderNumber) {
    order = await getOrderByNumber(orderIdentifier.orderNumber);
  } else if (orderIdentifier.reference) {
    order = await getOrderByReference(orderIdentifier.reference);
  }

  if (!order) {
    return { success: false, message: "Order not found" };
  }

  if (order.status === "paid") {
    // Already marked paid idempotently
    return { success: true, order };
  }

  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data: updated, error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          amount_paid: amountPaid,
          paystack_reference: paystackRef,
          updated_at: now,
        })
        .eq("id", order.id)
        .select("*, order_items(*)")
        .single();

      if (!error && updated) {
        // Decrement stock for physical products in Supabase
        const items = updated.order_items || [];
        for (const item of items) {
          if (item.item_type === "product" && item.product_id) {
            await decrementProductStock(item.product_id, item.quantity);
          }
        }

        return {
          success: true,
          order: {
            ...updated,
            items: updated.order_items || [],
          },
        };
      }
    } catch (e) {
      console.warn("Supabase markOrderPaid error, falling back to memory:", e);
    }
  }

  // Memory fallback
  order.status = "paid";
  order.amount_paid = amountPaid;
  order.paystack_reference = paystackRef;
  order.updated_at = now;

  // Decrement physical stock in memory
  const items = memoryOrderItems.filter((it) => it.order_id === order.id);
  for (const item of items) {
    if (item.item_type === "product" && item.product_id) {
      const prod = memoryProducts.find((p) => p.id === item.product_id);
      if (prod) {
        prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        prod.updated_at = now;
      }
    }
  }

  return { success: true, order: { ...order, items } };
}

export async function decrementProductStock(productId: string, quantity: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      // Use atomic RPC or fetch + conditional update
      const { data: current } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", productId)
        .single();

      if (current) {
        const newStock = Math.max(0, current.stock_quantity - quantity);
        await supabase.from("products").update({ stock_quantity: newStock }).eq("id", productId);
      }
    } catch (e) {
      console.error("Error decrementing stock in Supabase:", e);
    }
  }

  const memProd = memoryProducts.find((p) => p.id === productId);
  if (memProd) {
    memProd.stock_quantity = Math.max(0, memProd.stock_quantity - quantity);
    memProd.updated_at = new Date().toISOString();
  }
}

// =====================================================================
// ADMIN OPERATIONS
// =====================================================================

export async function adminGetAllData() {
  const [categories, products, services, orders] = await Promise.all([
    getCategories(),
    getProducts(false),
    getServices(false),
    adminGetOrders(),
  ]);

  return {
    categories,
    products,
    services,
    orders,
  };
}

export async function adminGetOrders(): Promise<Order[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((o) => ({
          ...o,
          items: o.order_items || [],
        }));
      }
    } catch (e) {
      console.warn("Supabase adminGetOrders error, using memory:", e);
    }
  }

  return memoryOrders
    .map((o) => ({
      ...o,
      items: memoryOrderItems.filter((it) => it.order_id === o.id),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function adminUpdateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<Order | null> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: now })
        .eq("id", orderId)
        .select("*, order_items(*)")
        .single();

      if (!error && data) {
        return {
          ...data,
          items: data.order_items || [],
        };
      }
    } catch (e) {
      console.warn("Supabase adminUpdateOrderStatus error, using memory:", e);
    }
  }

  const order = memoryOrders.find((o) => o.id === orderId);
  if (order) {
    order.status = newStatus;
    order.updated_at = now;
    return {
      ...order,
      items: memoryOrderItems.filter((it) => it.order_id === order.id),
    };
  }
  return null;
}

export async function adminUpdateProduct(
  id: string,
  updates: Partial<Product>,
): Promise<Product | null> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({ ...updates, updated_at: now })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return data as Product;
      }
    } catch (e) {
      console.warn("Supabase adminUpdateProduct error, using memory:", e);
    }
  }

  const prod = memoryProducts.find((p) => p.id === id);
  if (prod) {
    Object.assign(prod, updates, { updated_at: now });
    return prod;
  }
  return null;
}

export async function adminCreateProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const id = "p_" + Math.random().toString(36).substring(2, 10);

  const newProd: Product = {
    ...product,
    id,
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from("products").insert([product]).select().single();

      if (!error && data) {
        return data as Product;
      }
    } catch (e) {
      console.warn("Supabase adminCreateProduct error, using memory:", e);
    }
  }

  memoryProducts.push(newProd);
  return newProd;
}

export async function adminUpdateService(
  id: string,
  updates: Partial<Service>,
): Promise<Service | null> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("services")
        .update({ ...updates, updated_at: now })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return data as Service;
      }
    } catch (e) {
      console.warn("Supabase adminUpdateService error, using memory:", e);
    }
  }

  const srv = memoryServices.find((s) => s.id === id);
  if (srv) {
    Object.assign(srv, updates, { updated_at: now });
    return srv;
  }
  return null;
}

export async function adminCreateService(
  service: Omit<Service, "id" | "created_at" | "updated_at">,
): Promise<Service> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const id = "s_" + Math.random().toString(36).substring(2, 10);

  const newSrv: Service = {
    ...service,
    id,
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from("services").insert([service]).select().single();

      if (!error && data) {
        return data as Service;
      }
    } catch (e) {
      console.warn("Supabase adminCreateService error, using memory:", e);
    }
  }

  memoryServices.push(newSrv);
  return newSrv;
}
