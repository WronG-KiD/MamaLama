'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { Store, Product, Tier, Profile } from '@/types';
import {
  loadStore, saveStore,
  addToCart as addToCartFn,
  removeFromCart as removeFromCartFn,
  setCartQty as setCartQtyFn,
  toggleWishlist as toggleWishlistFn,
  clearCart as clearCartFn,
  upsertProfile as upsertProfileFn,
  deleteProfile as deleteProfileFn,
  setActiveProfile as setActiveProfileFn
} from './store';

interface StoreContextValue {
  store: Store;
  ready: boolean;
  addToCart: (product: Product & { tier?: Tier }, qty?: number) => void;
  removeFromCart: (cartId: string) => void;
  setCartQty: (cartId: string, qty: number) => void;
  toggleWishlist: (product: Product & { tier?: Tier }) => void;
  clearCart: () => void;
  upsertProfile: (profile: Profile) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>({
    cart: [], wishlist: [], profiles: [], activeProfileId: null
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStore(loadStore());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveStore(store);
  }, [store, ready]);

  const addToCart = useCallback((product: Product & { tier?: Tier }, qty = 1) => {
    setStore(s => addToCartFn(s, product, qty));
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setStore(s => removeFromCartFn(s, cartId));
  }, []);

  const setCartQty = useCallback((cartId: string, qty: number) => {
    setStore(s => setCartQtyFn(s, cartId, qty));
  }, []);

  const toggleWishlist = useCallback((product: Product & { tier?: Tier }) => {
    setStore(s => toggleWishlistFn(s, product));
  }, []);

  const clearCart = useCallback(() => {
    setStore(s => clearCartFn(s));
  }, []);

  const upsertProfile = useCallback((profile: Profile) => {
    setStore(s => upsertProfileFn(s, profile));
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setStore(s => deleteProfileFn(s, id));
  }, []);

  const setActiveProfile = useCallback((id: string) => {
    setStore(s => setActiveProfileFn(s, id));
  }, []);

  return (
    <StoreContext.Provider value={{
      store, ready,
      addToCart, removeFromCart, setCartQty,
      toggleWishlist, clearCart,
      upsertProfile, deleteProfile, setActiveProfile
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
