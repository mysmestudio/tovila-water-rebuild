import {
  getCategories,
  getProducts,
  getServices,
  getProductById,
  getServiceById,
  createOrder,
  getOrderByNumber,
  getOrderByReference,
  markOrderPaid,
  adminGetAllData,
  adminUpdateProduct,
  adminCreateProduct,
  adminUpdateService,
  adminCreateService,
  adminUpdateOrderStatus,
  getSupabaseAdmin,
} from "./db";
import { initializePaystackPayment, verifyPaystackWebhookSignature } from "./paystack";
import type { CheckoutPayload, OrderStatus } from "./types";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-paystack-signature",
    },
  });
}

export async function handleApiRequest(req: Request, url: URL): Promise<Response | null> {
  const path = url.pathname;
  const method = req.method;

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-paystack-signature",
      },
    });
  }

  // --- Public Catalog ---
  if (path === "/api/catalog" && method === "GET") {
    try {
      const [categories, products, services] = await Promise.all([
        getCategories(),
        getProducts(true),
        getServices(true),
      ]);
      return jsonResponse({ categories, products, services });
    } catch (e: unknown) {
      return jsonResponse({ error: (e as Error).message || "Failed to load catalog" }, 500);
    }
  }

  // --- Public Checkout ---
  if (path === "/api/checkout" && method === "POST") {
    try {
      const payload = (await req.json()) as CheckoutPayload;

      if (!payload.customer_name || !payload.customer_email || !payload.customer_phone) {
        return jsonResponse({ error: "Name, email and phone number are required" }, 400);
      }

      if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
        return jsonResponse({ error: "Cart is empty" }, 400);
      }

      let subtotal = 0;
      let amountDue = 0;
      const orderItems = [];

      for (const item of payload.items) {
        const qty = Math.max(1, parseInt(String(item.quantity || 1), 10));

        if (item.item_type === "product") {
          const product = await getProductById(item.id);
          if (!product || !product.active) {
            return jsonResponse({ error: `Product not available: ${item.id}` }, 400);
          }
          const lineTotal = Number(product.price) * qty;
          subtotal += lineTotal;
          amountDue += lineTotal; // Products are paid 100% upfront

          orderItems.push({
            item_type: "product" as const,
            product_id: product.id,
            service_id: null,
            name_snapshot: product.name,
            price_snapshot: Number(product.price),
            quantity: qty,
            line_total: lineTotal,
          });
        } else if (item.item_type === "service") {
          const service = await getServiceById(item.id);
          if (!service || !service.active) {
            return jsonResponse({ error: `Service not available: ${item.id}` }, 400);
          }
          const lineTotal = Number(service.starting_price) * qty;
          const depositTotal = Number(service.deposit_amount) * qty;
          subtotal += lineTotal;
          amountDue += depositTotal; // Services require booking deposit

          orderItems.push({
            item_type: "service" as const,
            product_id: null,
            service_id: service.id,
            name_snapshot: service.name,
            price_snapshot: Number(service.starting_price),
            quantity: qty,
            line_total: lineTotal,
          });
        }
      }

      // Generate order number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `TOV-${dateStr}-${randomSuffix}`;

      // Initialize Paystack payment
      const origin = url.origin || "http://localhost:3000";
      const callbackUrl = `${origin}/shop/confirmation?order=${encodeURIComponent(orderNumber)}`;

      const paystackResult = await initializePaystackPayment({
        email: payload.customer_email,
        amountInGHS: amountDue,
        orderNumber,
        callbackUrl,
        metadata: {
          customer_name: payload.customer_name,
          customer_phone: payload.customer_phone,
          delivery_address: payload.delivery_address || null,
          site_address: payload.site_address || null,
        },
      });

      const paystackRef = paystackResult.data?.reference || null;

      // Create Order in DB
      const createdOrder = await createOrder(
        {
          order_number: orderNumber,
          customer_name: payload.customer_name,
          customer_email: payload.customer_email,
          customer_phone: payload.customer_phone,
          delivery_address: payload.delivery_address || null,
          site_address: payload.site_address || null,
          preferred_date: payload.preferred_date || null,
          status: "pending",
          subtotal,
          amount_due: amountDue,
          amount_paid: 0,
          paystack_reference: paystackRef,
        },
        orderItems,
      );

      return jsonResponse({
        success: true,
        order: createdOrder,
        orderNumber,
        authorizationUrl: paystackResult.data?.authorization_url,
        reference: paystackRef,
        simulated: paystackResult.simulated || false,
      });
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      return jsonResponse({ error: (err as Error).message || "Failed to process checkout" }, 500);
    }
  }

  // --- Paystack Webhook (Server-Side Only) ---
  if (path === "/api/paystack/webhook" && method === "POST") {
    try {
      const rawBody = await req.text();
      const signatureHeader = req.headers.get("x-paystack-signature");

      // Verify signature in production
      const isVerified = verifyPaystackWebhookSignature(rawBody, signatureHeader);
      const isDevOrDemo =
        !process.env.PAYSTACK_SECRET_KEY ||
        process.env.PAYSTACK_SECRET_KEY.includes("your-paystack");

      if (!isVerified && !isDevOrDemo) {
        console.warn("Invalid Paystack webhook signature rejected");
        return new Response("Unauthorized signature", { status: 401 });
      }

      const event = JSON.parse(rawBody);

      if (event.event === "charge.success") {
        const data = event.data;
        const reference = data.reference;
        const orderNumber = data.metadata?.order_number;
        const amountPaidInGHS = data.amount ? data.amount / 100 : 0;

        console.log(
          `[Paystack Webhook] Charge success for order: ${orderNumber}, ref: ${reference}`,
        );
        await markOrderPaid({ orderNumber, reference }, amountPaidInGHS, reference);
      }

      return new Response("Webhook processed", { status: 200 });
    } catch (e: unknown) {
      console.error("Paystack webhook parsing error:", e);
      return new Response("Webhook error", { status: 400 });
    }
  }

  // --- Get Order Status ---
  if (path.startsWith("/api/orders/") && method === "GET") {
    const orderNumber = decodeURIComponent(path.replace("/api/orders/", ""));
    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return jsonResponse({ error: "Order not found" }, 404);
    }
    return jsonResponse({ order });
  }

  // --- Simulated Payment Complete (Demo Mode) ---
  if (path === "/api/orders/confirm-simulated" && method === "POST") {
    try {
      const body = await req.json();
      const { orderNumber, reference } = body;
      const order = await getOrderByNumber(orderNumber);

      if (!order) {
        return jsonResponse({ error: "Order not found" }, 404);
      }

      const result = await markOrderPaid(
        { orderNumber },
        order.amount_due,
        reference || `DEMO_REF_${Date.now()}`,
      );

      return jsonResponse({ success: true, order: result.order });
    } catch (e: unknown) {
      return jsonResponse({ error: (e as Error).message || "Failed to confirm payment" }, 500);
    }
  }

  // --- Admin Endpoints ---

  // Admin Data Fetch
  if (path === "/api/admin/data" && method === "GET") {
    try {
      const data = await adminGetAllData();
      return jsonResponse(data);
    } catch (e: unknown) {
      return jsonResponse({ error: (e as Error).message }, 500);
    }
  }

  // Admin Update Product
  if (path.startsWith("/api/admin/products/") && method === "PATCH") {
    try {
      const id = path.replace("/api/admin/products/", "");
      const updates = await req.json();
      const updated = await adminUpdateProduct(id, updates);
      return jsonResponse({ success: true, product: updated });
    } catch (e: unknown) {
      return jsonResponse({ error: (e as Error).message }, 500);
    }
  }

  // Admin Create Product
  if (path === "/api/admin/products" && method === "POST") {
    try {
      const body = await req.json();
      const created = await adminCreateProduct(body);
      return jsonResponse({ success: true, product: created });
    } catch (e: unknown) {
      return jsonResponse({ error: (e as Error).message }, 500);
    }
  }

  // Admin Update Service
  if (path.startsWith("/api/admin/services/") && method === "PATCH") {
    try {
      const id = path.replace("/api/admin/services/", "");
      const updates = await req.json();
      const updated = await adminUpdateService(id, updates);
      return jsonResponse({ success: true, service: updated });
    } catch (e: unknown) {
      return jsonResponse({ error: (e as Error).message }, 500);
    }
  }

  // Admin Create Service
  if (path === "/api/admin/services" && method === "POST") {
    try {
      const body = await req.json();
      const created = await adminCreateService(body);
      return jsonResponse({ success: true, service: created });
    } catch (e: unknown) {
      return jsonResponse({ error: (e as Error).message }, 500);
    }
  }

  // Admin Update Order Status
  if (path.startsWith("/api/admin/orders/") && path.endsWith("/status") && method === "PATCH") {
    try {
      const id = path.replace("/api/admin/orders/", "").replace("/status", "");
      const body = await req.json();
      const status = body.status as OrderStatus;
      const updated = await adminUpdateOrderStatus(id, status);
      return jsonResponse({ success: true, order: updated });
    } catch (e: unknown) {
      return jsonResponse({ error: (e as Error).message }, 500);
    }
  }

  return null;
}
