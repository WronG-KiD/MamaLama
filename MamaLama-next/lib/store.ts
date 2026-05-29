'use client';

import type { Store, CartItem, WishlistItem, Profile, Product, Tier } from '@/types';

const STORE_KEY = 'mamalama_store_v1';

const emptyStore: Store = {
  cart: [],
  wishlist: [],
  profiles: [],
  activeProfileId: null
};

export function loadStore(): Store {
  if (typeof window === 'undefined') return emptyStore;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore;
    const parsed = JSON.parse(raw);
    return { ...emptyStore, ...parsed };
  } catch {
    return emptyStore;
  }
}

export function saveStore(store: Store): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // swallow storage errors
  }
}

export function makeCartId(product: Product & { tier?: Tier }): string {
  return `${product.tier ?? 'X'}:${product.name}`;
}

export function addToCart(store: Store, product: Product & { tier?: Tier }, qty = 1): Store {
  const id = makeCartId(product);
  const existing = store.cart.find(i => i.cartId === id);
  if (existing) {
    return {
      ...store,
      cart: store.cart.map(i => i.cartId === id ? { ...i, qty: i.qty + qty } : i)
    };
  }
  const item: CartItem = { ...product, qty, cartId: id };
  return { ...store, cart: [...store.cart, item] };
}

export function removeFromCart(store: Store, cartId: string): Store {
  return { ...store, cart: store.cart.filter(i => i.cartId !== cartId) };
}

export function setCartQty(store: Store, cartId: string, qty: number): Store {
  if (qty <= 0) return removeFromCart(store, cartId);
  return {
    ...store,
    cart: store.cart.map(i => i.cartId === cartId ? { ...i, qty } : i)
  };
}

export function toggleWishlist(store: Store, product: Product & { tier?: Tier }): Store {
  const id = makeCartId(product);
  const exists = store.wishlist.find(i => i.wishlistId === id);
  if (exists) {
    return { ...store, wishlist: store.wishlist.filter(i => i.wishlistId !== id) };
  }
  const item: WishlistItem = { ...product, wishlistId: id };
  return { ...store, wishlist: [...store.wishlist, item] };
}

export function clearCart(store: Store): Store {
  return { ...store, cart: [] };
}

export function upsertProfile(store: Store, profile: Profile): Store {
  const idx = store.profiles.findIndex(p => p.id === profile.id);
  const profiles = idx >= 0
    ? store.profiles.map(p => p.id === profile.id ? profile : p)
    : [...store.profiles, profile];
  return { ...store, profiles, activeProfileId: store.activeProfileId ?? profile.id };
}

export function deleteProfile(store: Store, id: string): Store {
  const profiles = store.profiles.filter(p => p.id !== id);
  const activeProfileId = store.activeProfileId === id
    ? (profiles[0]?.id ?? null)
    : store.activeProfileId;
  return { ...store, profiles, activeProfileId };
}

export function setActiveProfile(store: Store, id: string): Store {
  return { ...store, activeProfileId: id };
}
