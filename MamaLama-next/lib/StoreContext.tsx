'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
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
import { getOrCreateAnonymousUid } from './anonymousAuth';
import {
  upsertProfileFirestore,
  deleteProfileFirestore,
  listProfilesFirestore
} from './firestoreProfiles';
import { isFirebaseConfigured } from './firebase';

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
  const uidRef = useRef<string | null>(null);

  // 1) Hydrate immediately from localStorage so UI never waits on the network
  useEffect(() => {
    setStore(loadStore());
    setReady(true);
  }, []);

  // 2) Then, in the background, sign in anonymously and pull profiles from
  //    Firestore. Merge them with whatever's in localStorage (local wins on
  //    name/age conflicts since the user just edited them).
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    let cancelled = false;
    (async () => {
      const uid = await getOrCreateAnonymousUid();
      if (cancelled || !uid) return;
      uidRef.current = uid;

      // Pull remote profiles
      const remoteProfiles = await listProfilesFirestore(uid);
      if (cancelled || remoteProfiles.length === 0) {
        // Remote is empty — push any local profiles up so they're backed up
        const current = loadStore();
        for (const p of current.profiles) {
          upsertProfileFirestore(uid, p).catch(() => { /* ignore */ });
        }
        return;
      }

      // Merge: prefer the version with higher XP (since XP only grows)
      setStore(prev => {
        const byId = new Map<string, Profile>();
        for (const p of prev.profiles) byId.set(p.id, p);
        for (const p of remoteProfiles) {
          const existing = byId.get(p.id);
          if (!existing || p.xp >= existing.xp) byId.set(p.id, p);
        }
        const merged = Array.from(byId.values());
        return {
          ...prev,
          profiles: merged,
          activeProfileId: prev.activeProfileId ?? merged[0]?.id ?? null
        };
      });
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist to localStorage on every change (fast cache)
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
    // Fire-and-forget sync to Firestore — UI doesn't wait on it
    const uid = uidRef.current;
    if (uid) upsertProfileFirestore(uid, profile).catch(() => { /* ignore */ });
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setStore(s => deleteProfileFn(s, id));
    const uid = uidRef.current;
    if (uid) deleteProfileFirestore(uid, id).catch(() => { /* ignore */ });
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
