'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

/* ================= TYPES ================= */

export type CartItem = {
  id: string;
  name: string;
  price: number;          // always normalized number
  image?: string;
  description?: string;
  quantity: number;
  vendorId?: string;
  vendorName?: string;
  vendorBaseLocation?: string;
  vendorRole?: 'chef' | 'vendor' | 'pharmacy' | 'topvendor'; // ENUM of all roles
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  getTotal: () => number;
  getItemCount: () => number;
  getVendorSummary: () => Array<{
    vendorId: string;
    vendorName: string;
    vendorRole: string;
    total: number;
    itemCount: number;
  }>;
  getRoleSummary: () => Record<string, number>;
};

/* ================= CONSTANTS ================= */

const STORAGE_KEY = 'cart_v4'; // Updated version

/* ================= CONTEXT ================= */

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ================= HELPERS ================= */

const normalizeItem = (item: CartItem): CartItem => ({
  ...item,
  price: Number(item.price) || 0,
  quantity: Math.max(1, Number(item.quantity) || 1),
  vendorBaseLocation: item.vendorBaseLocation || 'Eziobodo',
  vendorRole: item.vendorRole || 'vendor', // Default to "vendor" if not specified
});

/* ================= PROVIDER ================= */

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  /* ---- Persist cart ---- */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  /* ---- Actions ---- */

  const addToCart = (item: CartItem) => {
    const normalized = normalizeItem(item);
    
    console.log('🛒 Adding to cart:', {
      name: normalized.name,
      vendorRole: normalized.vendorRole,
      vendorName: normalized.vendorName,
      vendorId: normalized.vendorId,
      vendorBaseLocation: normalized.vendorBaseLocation
    });

    setCart((prev) => {
      const existing = prev.find((p) => p.id === normalized.id);

      if (existing) {
        return prev.map((p) =>
          p.id === normalized.id
            ? { ...p, quantity: p.quantity + normalized.quantity }
            : p
        );
      }

      return [...prev, normalized];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getVendorSummary = () => {
    const summaryMap: Record<string, {
      vendorId: string;
      vendorName: string;
      vendorRole: string;
      total: number;
      itemCount: number;
    }> = {};

    cart.forEach(item => {
      const key = `${item.vendorId}-${item.vendorRole}`;
      
      if (!summaryMap[key]) {
        summaryMap[key] = {
          vendorId: item.vendorId || '',
          vendorName: item.vendorName || 'Unknown Vendor',
          vendorRole: item.vendorRole || 'vendor',
          total: 0,
          itemCount: 0
        };
      }
      
      summaryMap[key].total += item.price * item.quantity;
      summaryMap[key].itemCount += item.quantity;
    });

    return Object.values(summaryMap);
  };

  const getRoleSummary = () => {
    const roleMap: Record<string, number> = {};

    cart.forEach(item => {
      const role = item.vendorRole || 'vendor';
      roleMap[role] = (roleMap[role] || 0) + (item.price * item.quantity);
    });

    return roleMap;
  };

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        clearCart,
        updateQuantity,
        getTotal,
        getItemCount,
        getVendorSummary,
        getRoleSummary
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}