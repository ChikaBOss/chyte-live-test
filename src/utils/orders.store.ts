// src/utils/orders.store.ts

export type DeliveryMethod =
  | "SITE_COMPANY"
  | "SELF_PICKUP"
  | "OWN_RIDER"
  | "VENDOR_RIDER";

export type ChildOrder = {
  id: string;
  parentId: string;
  vendorId: string;
  vendorName: string;
  items: any[];
  subtotal: number;
  deliveryChoice: DeliveryMethod;
  pickupCode: string;
};

export type ParentOrder = {
  id: string;
  customer: { name: string; phone: string; address: string };
  childOrderIds: string[];
  selectedChildIds: string[];
  method: DeliveryMethod;
  deliveryStatus:
    | "UNSELECTED" | "NEGOTIATING" | "QUOTED" | "QUOTE_ACCEPTED"
    | "DELIVERY_PAID" | "APPROVED" | "EN_ROUTE" | "DELIVERED" | "COMPLETED";
  deliveryForm?: { window: string; notes?: string; companyId?: string };
  quote?: { amount: number; etaMins: number; expiresAt: string; notes?: string };
  addOn?: {
    amount: number;
    adminCutPct: number;
    adminCutAmount: number;
    companyPayout: number;
    paid: boolean;
    paidAt?: string;
  };
  timeline: Array<{ at: string; status: string; note?: string }>;
};

const PARENTS_KEY = "chyte_parents";
const CHILDREN_KEY = "chyte_children";
const isClient = () => typeof window !== "undefined";

function readArray<T>(key: string): T[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}
function writeArray<T>(key: string, value: T[]) {
  if (!isClient()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const genId = () => Math.random().toString(36).slice(2);

export function saveParent(parent: ParentOrder) {
  const all = readArray<ParentOrder>(PARENTS_KEY);
  const idx = all.findIndex((p) => p.id === parent.id);
  if (idx >= 0) all[idx] = parent; else all.push(parent);
  writeArray(PARENTS_KEY, all);
}

export function saveChildren(children: ChildOrder[]) {
  const all = readArray<ChildOrder>(CHILDREN_KEY);
  writeArray(CHILDREN_KEY, [...all, ...children]);
}

// Optional getters (useful for /orders/[id])
export function getParent(id: string) {
  return readArray<ParentOrder>(PARENTS_KEY).find((p) => p.id === id) || null;
}
export function getChildrenByParent(parentId: string) {
  return readArray<ChildOrder>(CHILDREN_KEY).filter((c) => c.parentId === parentId);
}