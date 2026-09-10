"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { QuoteCartItem, CatalogProductItem } from "@/types";

export interface QuoteNotification {
  visible: boolean;
  type: "added" | "removed";
  productName?: string;
}

interface QuoteContextType {
  items: QuoteCartItem[];
  addItem: (
    product: Pick<CatalogProductItem, "id" | "name" | "slug" | "sku" | "imageUrl" | "regularPrice" | "salePrice">,
    presentation?: string,
    quantityDelta?: number
  ) => void;
  updateQuantity: (productId: number, presentation: string, quantity: number) => void;
  removeItem: (productId: number, presentation: string) => void;
  clearQuote: () => void;
  getItemQuantity: (productId: number, presentation?: string) => number;
  totalItemsCount: number;
  subtotal: number;
  tax: number;
  total: number;
  comments: string;
  setComments: (val: string) => void;
  quoteNumber: string;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  notification: QuoteNotification;
  dismissNotification: () => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "karmax_quote_items_v1";
const LOCAL_STORAGE_QUOTE_NUM = "karmax_quote_number_v1";

export const QuoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<QuoteCartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedItems) return JSON.parse(savedItems);
      } catch (e) {
        console.warn("Could not load quote from localStorage:", e);
      }
    }
    return [];
  });
  const [comments, setComments] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quoteNumber] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const savedNum = localStorage.getItem(LOCAL_STORAGE_QUOTE_NUM);
        if (savedNum) return savedNum;
      } catch (e) {
        console.warn("Could not load quote number from localStorage:", e);
      }
    }
    return "0003735";
  });
  const [notification, setNotification] = useState<QuoteNotification>({
    visible: false,
    type: "added",
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Save to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save quote to localStorage:", e);
    }
  }, [items]);


  const showNotification = useCallback((type: "added" | "removed", productName?: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setNotification({
      visible: true,
      type,
      productName,
    });
    timerRef.current = setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 4500);
  }, []);

  const dismissNotification = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  const parsePrice = (priceStr?: string | null): number => {
    if (!priceStr) return 0;
    const clean = priceStr.replace(/[^0-9.]/g, "");
    return Number(clean) || 0;
  };

  const addItem = useCallback(
    (
      product: Pick<CatalogProductItem, "id" | "name" | "slug" | "sku" | "imageUrl" | "regularPrice" | "salePrice">,
      presentation = "Estándar",
      quantityDelta = 1
    ) => {
      const unitPrice =
        product.salePrice && Number(product.salePrice) > 0
          ? parsePrice(product.salePrice)
          : parsePrice(product.regularPrice) || 49.0;

      setItems((prev) => {
        const index = prev.findIndex(
          (it) => it.productId === product.id && it.presentation === presentation
        );

        if (index > -1) {
          const updated = [...prev];
          const newQty = updated[index].quantity + quantityDelta;
          if (newQty <= 0) {
            updated.splice(index, 1);
            showNotification("removed", product.name);
          } else {
            updated[index] = {
              ...updated[index],
              quantity: newQty,
            };
            showNotification(quantityDelta > 0 ? "added" : "removed", product.name);
          }
          return updated;
        } else if (quantityDelta > 0) {
          showNotification("added", product.name);
          return [
            ...prev,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              sku: product.sku || `KMX-${product.id}`,
              imageUrl: product.imageUrl,
              presentation,
              unitPrice,
              quantity: quantityDelta,
            },
          ];
        }
        return prev;
      });
    },
    [showNotification]
  );

  const updateQuantity = useCallback(
    (productId: number, presentation: string, quantity: number) => {
      setItems((prev) => {
        const index = prev.findIndex(
          (it) => it.productId === productId && it.presentation === presentation
        );
        if (index === -1) return prev;

        const currentItem = prev[index];
        if (quantity <= 0) {
          const next = prev.filter((_, idx) => idx !== index);
          showNotification("removed", currentItem.name);
          return next;
        }

        const next = [...prev];
        const isIncrease = quantity > currentItem.quantity;
        next[index] = {
          ...currentItem,
          quantity,
        };
        showNotification(isIncrease ? "added" : "removed", currentItem.name);
        return next;
      });
    },
    [showNotification]
  );

  const removeItem = useCallback(
    (productId: number, presentation: string) => {
      setItems((prev) => {
        const item = prev.find(
          (it) => it.productId === productId && it.presentation === presentation
        );
        const next = prev.filter(
          (it) => !(it.productId === productId && it.presentation === presentation)
        );
        if (item) {
          showNotification("removed", item.name);
        }
        return next;
      });
    },
    [showNotification]
  );

  const clearQuote = useCallback(() => {
    setItems([]);
    setComments("");
  }, []);

  const getItemQuantity = useCallback(
    (productId: number, presentation?: string): number => {
      if (presentation) {
        const item = items.find(
          (it) => it.productId === productId && it.presentation === presentation
        );
        return item ? item.quantity : 0;
      }
      return items
        .filter((it) => it.productId === productId)
        .reduce((sum, it) => sum + it.quantity, 0);
    },
    [items]
  );

  const totalItemsCount = useMemo(() => {
    return items.reduce((sum, it) => sum + it.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  }, [items]);

  const tax = useMemo(() => {
    return subtotal * 0.16;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <QuoteContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearQuote,
        getItemQuantity,
        totalItemsCount,
        subtotal,
        tax,
        total,
        comments,
        setComments,
        quoteNumber,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        notification,
        dismissNotification,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return context;
};
