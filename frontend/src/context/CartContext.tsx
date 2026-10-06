'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  itemCount: number;
  subtotal: number;
  totalWeightKg: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('localhaat_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('localhaat_cart');
      }
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('localhaat_cart', JSON.stringify(newItems));
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existingIndex = items.findIndex((i) => i.product._id === product._id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...items, { product, quantity }];
    }
    saveCart(updated);
  };

  const removeFromCart = (productId: string) => {
    saveCart(items.filter((i) => i.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    saveCart(
      items.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    saveCart([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + (i.product.discountPrice || i.product.price) * i.quantity,
    0
  );
  const totalWeightKg = items.reduce(
    (sum, i) => sum + (i.product.weightKg || 1) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setCartItems: saveCart,
        itemCount,
        subtotal,
        totalWeightKg,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
