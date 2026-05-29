// Shared domain types for MamaLama

export type Tier = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

export interface Product {
  name: string;
  meta: string;       // e.g. "Ages 6–8 · 100 pieces"
  price: string;      // display price, e.g. "$32.99"
  emoji: string;
  desc: string;
  stock: string;      // e.g. "In stock", "Low stock", "Bestseller"
  tier?: Tier;        // attached when added to cart/wishlist
}

export interface CartItem extends Product {
  qty: number;
  cartId: string;     // unique line id (tier:name)
}

export interface WishlistItem extends Product {
  wishlistId: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  avatar: string;     // emoji
  xp: number;
  tier: Tier;
  badges: string[];   // badge ids
  solves: Solve[];
  createdAt: number;
}

export interface Solve {
  id: string;
  productName: string;
  tier: Tier;
  difficulty: 'easy' | 'medium' | 'hard';
  timeMinutes?: number;
  xpEarned: number;
  loggedAt: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PaymentDetails {
  method: 'card' | 'upi' | 'netbanking' | 'wallet';
  name?: string;
  last4?: string;     // never store full card numbers
}

export interface Order {
  id: string;                 // "ML-XXXXXX"
  items: CartItem[];
  shipping: Address;
  payment: PaymentDetails;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'cancelled';
  placedAt: number;
  etaStart?: string;
  etaEnd?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export interface Store {
  cart: CartItem[];
  wishlist: WishlistItem[];
  profiles: Profile[];
  activeProfileId: string | null;
}
