'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import type { Tier } from '@/types';

interface UIContextValue {
  // Product story modal
  storyTier: Tier | null;
  openProductStory: (tier: Tier) => void;
  closeProductStory: () => void;

  // Cart toast
  toastMsg: string;
  toastShow: boolean;
  showToast: (msg: string) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [storyTier, setStoryTier] = useState<Tier | null>(null);
  const [toastMsg, setToastMsg] = useState('Added to cart 🛒');
  const [toastShow, setToastShow] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const openProductStory = useCallback((tier: Tier) => setStoryTier(tier), []);
  const closeProductStory = useCallback(() => setStoryTier(null), []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastShow(true);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastShow(false), 1800);
  }, []);

  return (
    <UIContext.Provider value={{
      storyTier, openProductStory, closeProductStory,
      toastMsg, toastShow, showToast
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
