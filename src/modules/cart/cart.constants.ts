export const CART_CONSTANTS = {
  MAX_ITEMS_PER_CART: 50,              // Maximum number of items allowed in cart
  MAX_QUANTITY_PER_ITEM: 99,           // Maximum quantity of a single item
  MIN_QUANTITY_PER_ITEM: 1,            // Minimum quantity of a single item

  // Cart expiration
  CART_EXPIRY_DAYS: 30,               // Days until abandoned cart expires
  SAVE_FOR_LATER_EXPIRY_DAYS: 90,     // Days until saved items expire

  // Price related
  MIN_ORDER_AMOUNT: 0,                 // Minimum order amount
  MAX_ORDER_AMOUNT: 10000,            // Maximum order amount
  MAX_DISCOUNT_PERCENTAGE: 70,         // Maximum allowed discount percentage

  // Coupon related
  MAX_COUPONS_PER_CART: 1,            // Maximum number of coupons per cart
  COUPON_CODE_LENGTH: 8,              // Standard coupon code length

  // Activity timeouts (in milliseconds)
  CART_LOCK_TIMEOUT: 5 * 60 * 1000,   // 5 minutes lock during checkout

  // Stock validation
  STOCK_BUFFER: 5,                    // Buffer quantity for stock validation

  // Error messages
  ERRORS: {
    CART_FULL: 'Cart has reached maximum item limit',
    INVALID_QUANTITY: 'Invalid item quantity',
    CART_EXPIRED: 'Cart has expired',
    MAX_AMOUNT_EXCEEDED: 'Maximum order amount exceeded',
    INSUFFICIENT_STOCK: 'Insufficient stock available',
    INVALID_COUPON: 'Invalid coupon code',
    CART_LOCKED: 'Cart is currently locked for checkout',
  }
};