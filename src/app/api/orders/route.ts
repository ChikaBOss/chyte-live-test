// app/api/orders/route.ts
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/orderModel";
import { parsePriceToNumber, calcTotal } from "@/utils/helpers";

export const runtime = "nodejs";

// helper to parse Request body safely for Edge/Node
async function safeParse(req: Request) {
  try {
    const text = await req.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch (err) {
    return {};
  }
}

/**
 * POST: Create an order or booking
 * Expected body:
 * {
 *   customer: { name, phone, email? },
 *   delivery?: { address, note?, method },  // optional for bookings
 *   items?: [ { id, name, price, quantity, image, chefId?, vendorId? } ],
 *   serviceType?: "order" | "booking" | "pharmacy" | "chef" | "vendor",
 *   providerId?: string,
 * }
 */
export async function POST(req: Request) {
  await connectToDB();
  const body = (await safeParse(req)) || {};

  const {
    customer,
    delivery,
    items = [],
    serviceType: rawServiceType,
    providerId,
  } = body || {};

  const serviceType = rawServiceType || "order";

  if (!customer?.name || !customer?.phone) {
    return Response.json({ error: "Customer name and phone are required" }, { status: 400 });
  }

  if (serviceType !== "booking" && !delivery?.address) {
    return Response.json({ error: "Delivery address is required for orders" }, { status: 400 });
  }

  if (serviceType !== "booking" && (!Array.isArray(items) || items.length === 0)) {
    return Response.json({ error: "Items required for normal orders" }, { status: 400 });
  }

  const normalizedItems = Array.isArray(items)
    ? items.map((it: any) => ({
        ...it,
        price: parsePriceToNumber(it.price),
        quantity: Number(it.quantity) || 1,
      }))
    : [];

  const total = serviceType === "booking" ? 0 : calcTotal(normalizedItems);

  let chefId: string | undefined;
  if (normalizedItems.length > 0) {
    const ids = new Set(
      normalizedItems
        .map((i: any) => i.chefId || i.vendorId)
        .filter(Boolean)
    );
    if (ids.size === 1) chefId = Array.from(ids)[0];
  } else {
    chefId = providerId;
  }

  const orderPayload: any = {
    customer,
    delivery,
    items: normalizedItems,
    total,
    serviceType,
    providerId,
    chefId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const order = await Order.create(orderPayload);

  return Response.json(order, { status: 201 });
}

export async function GET(req: Request) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone") || undefined;

  const query: any = {};
  if (phone) query["customer.phone"] = phone;

  const orders = await Order.find(query).sort({ createdAt: -1 }).limit(100);

  return Response.json(orders, { status: 200 });
}