import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Produto, CartItem } from './types';

interface CartState {
  items: CartItem[];
  addItem: (produto: Produto, quantidade?: number) => void;
  removeItem: (produtoId: string) => void;
  updateQuantity: (produtoId: string, quantidade: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (produto, quantidade = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.produto.id === produto.id);
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.produto.id === produto.id
                  ? { ...item, quantidade: item.quantidade + quantidade }
                  : item
              )
            };
          }
          
          return {
            items: [...state.items, { produto, quantidade }]
          };
        });
      },
      
      removeItem: (produtoId) => {
        set((state) => ({
          items: state.items.filter(item => item.produto.id !== produtoId)
        }));
      },
      
      updateQuantity: (produtoId, quantidade) => {
        if (quantidade <= 0) {
          get().removeItem(produtoId);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.produto.id === produtoId
              ? { ...item, quantidade }
              : item
          )
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const preco = item.produto.precoPromocional || item.produto.precoSite;
          return total + (preco * item.quantidade);
        }, 0);
      },
      
      getTotal: () => {
        return get().getSubtotal();
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantidade, 0);
      }
    }),
    {
      name: 'autopecas-cart'
    }
  )
);
