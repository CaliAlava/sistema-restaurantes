import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type CartItem,
  type OrderSummary,
  calculateOrderSummary,
} from '@restaurantes/config';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  fulfillmentType: 'delivery' | 'pickup';
  deliveryFee: number;
  tipAmount: number;
  customerNote: string;

  // Acciones
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (open: boolean) => void;
  setFulfillmentType: (type: 'delivery' | 'pickup') => void;
  setDeliveryFee: (fee: number) => void;
  setTipAmount: (amount: number) => void;
  setCustomerNote: (note: string) => void;

  // Calculador derivado
  getSummary: () => OrderSummary;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      fulfillmentType: 'delivery',
      deliveryFee: 2.5, // Tarifa base de delivery
      tipAmount: 0.0,
      customerNote: '',

      addItem: (newItem) => {
        set((state) => {
          // Si el producto no tiene modificadores, agrupamos por product_id
          const hasModifiers = newItem.selected_modifiers && newItem.selected_modifiers.length > 0;
          if (!hasModifiers) {
            const existingIndex = state.items.findIndex(
              (i) => i.product_id === newItem.product_id && (!i.selected_modifiers || i.selected_modifiers.length === 0)
            );
            if (existingIndex > -1) {
              const updatedItems = [...state.items];
              const existingItem = updatedItems[existingIndex];
              if (existingItem) {
                updatedItems[existingIndex] = {
                  ...existingItem,
                  quantity: existingItem.quantity + newItem.quantity,
                };
              }
              return { items: updatedItems, isOpen: true };
            }
          }
          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (index) => {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        }));
      },

      updateQuantity: (index, quantity) => {
        if (quantity <= 0) {
          get().removeItem(index);
          return;
        }
        set((state) => {
          const updated = [...state.items];
          const target = updated[index];
          if (target) {
            updated[index] = { ...target, quantity };
          }
          return { items: updated };
        });
      },

      clearCart: () => set({ items: [], tipAmount: 0 }),
      setIsOpen: (isOpen) => set({ isOpen }),
      setFulfillmentType: (fulfillmentType) =>
        set({
          fulfillmentType,
          deliveryFee: fulfillmentType === 'delivery' ? 2.5 : 0.0,
        }),
      setDeliveryFee: (deliveryFee) => set({ deliveryFee }),
      setTipAmount: (tipAmount) => set({ tipAmount }),
      setCustomerNote: (customerNote) => set({ customerNote }),

      getSummary: () => {
        const { items, deliveryFee, tipAmount } = get();
        return calculateOrderSummary(items, deliveryFee, tipAmount);
      },

      getTotalItemsCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: 'foodtech-cart-storage',
      partialize: (state) => ({
        items: state.items,
        fulfillmentType: state.fulfillmentType,
        deliveryFee: state.deliveryFee,
        tipAmount: state.tipAmount,
      }),
    }
  )
);
