"use client";

import {
  createContext,
  useContext,
  useOptimistic,
  useTransition,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/lib/db/store-schema";

export type CartItemWithProduct = CartItem & { product: Product };

interface CartContextType {
  items: CartItemWithProduct[];
  itemCount: number;
  total: number;
  isPending: boolean;
  addItem: (productId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
  initialItems: CartItemWithProduct[];
  addToCartAction: (productId: string) => Promise<void>;
  updateQuantityAction: (itemId: string, quantity: number) => Promise<void>;
  removeFromCartAction: (itemId: string) => Promise<void>;
}

export function CartProvider({
  children,
  initialItems,
  addToCartAction,
  updateQuantityAction,
  removeFromCartAction,
}: CartProviderProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticItems, setOptimisticItems] = useOptimistic(initialItems);

  const itemCount = optimisticItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = optimisticItems.reduce(
    (sum, item) => sum + item.product.priceInCents * item.quantity,
    0
  );

  const addItem = async (productId: string) => {
    startTransition(async () => {
      await addToCartAction(productId);
    });
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    startTransition(async () => {
      if (quantity <= 0) {
        setOptimisticItems((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        setOptimisticItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      }
      await updateQuantityAction(itemId, quantity);
    });
  };

  const removeItem = async (itemId: string) => {
    startTransition(async () => {
      setOptimisticItems((prev) => prev.filter((item) => item.id !== itemId));
      await removeFromCartAction(itemId);
    });
  };

  return (
    <CartContext.Provider
      value={{
        items: optimisticItems,
        itemCount,
        total,
        isPending,
        addItem,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
