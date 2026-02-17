// src/utils/helpers.ts

// Convert "₦1,200" or "1200" to number
export function parsePriceToNumber(price: any): number {
    if (typeof price === "number") return price;
    if (!price) return 0;
  
    const cleaned = price.toString().replace(/[₦,\s]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  
  // Calculate total of items in cart/order
  export function calcTotal(items: any[]): number {
    if (!Array.isArray(items)) return 0;
  
    return items.reduce((sum, item) => {
      const price = parsePriceToNumber(item.price);
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
  }