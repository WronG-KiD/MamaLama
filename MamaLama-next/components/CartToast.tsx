'use client';

import { useUI } from '@/lib/UIContext';

export default function CartToast() {
  const { toastMsg, toastShow } = useUI();
  return (
    <div className={`cart-toast ${toastShow ? 'show' : ''}`}>
      {toastMsg}
    </div>
  );
}
