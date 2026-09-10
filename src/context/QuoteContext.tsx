"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { QuoteCartItem, CatalogProductItem } from "@/types";
import { useAuth } from "./AuthContext";

export interface QuoteNotification {
  visible: boolean;
  type: "added" | "removed";
  productName?: string;
}

export interface SavedQuotePayload {
  id: number;
  quoteNumber?: string | null;
  notes?: string | null;
  subtotal?: string | number | null;
  tax?: string | number | null;
  total?: string | number | null;
  items?: Array<{
    productId?: number | null;
    productName: string;
    presentation?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    quantity: number;
    unitPrice: string | number;
    totalPrice?: string | number;
  }>;
}

interface QuoteContextType {
  items: QuoteCartItem[];
  addItem: (
    product: Pick<CatalogProductItem, "id" | "name" | "slug" | "sku" | "imageUrl" | "regularPrice" | "salePrice">,
    presentation?: string,
    quantityDelta?: number,
    customUnitPrice?: number | string
  ) => void;
  updateQuantity: (productId: number, presentation: string, quantity: number) => void;
  removeItem: (productId: number, presentation: string) => void;
  clearQuote: () => void;
  loadSavedQuote: (savedQuote: SavedQuotePayload) => void;
  savedQuoteId: number | null;
  setSavedQuoteId: (id: number | null) => void;
  getItemQuantity: (productId: number, presentation?: string) => number;
  totalItemsCount: number;
  subtotal: number;
  tax: number;
  total: number;
  comments: string;
  setComments: (val: string) => void;
  quoteNumber: string;
  setQuoteNumber: (val: string) => void;
  refreshQuoteNumber: () => Promise<string>;
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
  const { user } = useAuth();
  const [savedQuoteId, setSavedQuoteId] = useState<number | null>(null);
  const savedQuoteIdRef = useRef<number | null>(null);

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
  const [quoteNumber, setQuoteNumber] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedNum = localStorage.getItem(LOCAL_STORAGE_QUOTE_NUM);
        if (savedNum) return savedNum;
      } catch {
        // ignore
      }
    }
    return "0000001";
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

  const parsePrice = (priceVal?: string | number | null): number => {
    if (priceVal === undefined || priceVal === null) return 0;
    if (typeof priceVal === "number") return priceVal;
    const clean = priceVal.replace(/[^0-9.]/g, "");
    return Number(clean) || 0;
  };

  const addItem = useCallback(
    (
      product: Pick<CatalogProductItem, "id" | "name" | "slug" | "sku" | "imageUrl" | "regularPrice" | "salePrice">,
      presentation = "Estándar",
      quantityDelta = 1,
      customUnitPrice?: number | string
    ) => {
      const basePrice =
        product.salePrice && Number(product.salePrice) > 0
          ? parsePrice(product.salePrice)
          : parsePrice(product.regularPrice) || 49.0;
      const unitPrice =
        customUnitPrice !== undefined && customUnitPrice !== null
          ? parsePrice(customUnitPrice)
          : basePrice;

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
              ...(customUnitPrice !== undefined && customUnitPrice !== null ? { unitPrice } : {}),
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

  const refreshQuoteNumber = useCallback(async () => {
    try {
      const res = await fetch("/api/quotes/next-number");
      if (res.ok) {
        const data = await res.json();
        if (data.nextQuoteNumber) {
          setQuoteNumber(data.nextQuoteNumber);
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_QUOTE_NUM, data.nextQuoteNumber);
          }
          return data.nextQuoteNumber as string;
        }
      }
    } catch (err) {
      console.warn("Could not fetch next quote number:", err);
    }
    return "0000001";
  }, []);

  const loadSavedQuote = useCallback((quote: SavedQuotePayload) => {
    if (!quote) return;
    setSavedQuoteId(quote.id);
    savedQuoteIdRef.current = quote.id;
    if (quote.quoteNumber) {
      setQuoteNumber(quote.quoteNumber);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LOCAL_STORAGE_QUOTE_NUM, quote.quoteNumber);
        } catch {
          // ignore
        }
      }
    }
    if (quote.notes) {
      setComments(quote.notes);
    }
    if (Array.isArray(quote.items)) {
      const mappedItems: QuoteCartItem[] = quote.items.map((it) => ({
        productId: it.productId || 0,
        slug: "",
        name: it.productName,
        sku: it.sku || null,
        imageUrl: it.imageUrl || null,
        presentation: it.presentation || "Estándar",
        unitPrice: Number(it.unitPrice) || 0,
        quantity: Number(it.quantity) || 1,
      }));
      setItems(mappedItems);
    }
  }, []);

  const clearQuote = useCallback(() => {
    setItems([]);
    setComments("");
    setSavedQuoteId(null);
    savedQuoteIdRef.current = null;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(LOCAL_STORAGE_QUOTE_NUM);
      } catch {
        // ignore
      }
    }
    refreshQuoteNumber();
  }, [refreshQuoteNumber]);

  // Sincronizar cotización guardada al iniciar sesión o limpiar al cerrar sesión
  const prevUserIdRef = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const currentUserId = user?.id || null;
    if (prevUserIdRef.current === currentUserId) return;
    const previousId = prevUserIdRef.current;
    prevUserIdRef.current = currentUserId;

    if (currentUserId) {
      // Usuario inició sesión: buscar si tiene cotización guardada
      let ignore = false;
      fetch("/api/quotes/saved")
        .then((res) => res.json())
        .then((data) => {
          if (!ignore && data.savedQuote) {
            loadSavedQuote(data.savedQuote);
          }
        })
        .catch((err) => console.warn("Error loading saved quote for user:", err));

      return () => {
        ignore = true;
      };
    } else if (currentUserId === null && previousId !== undefined) {
      // Usuario cerró sesión: limpiar cotización
      clearQuote();
    }
  }, [user, loadSavedQuote, clearQuote]);

  const getItemQuantity = useCallback(
    (productId: number, presentation?: string): number => {
      const targetId = Number(productId);
      if (presentation) {
        const item = items.find(
          (it) =>
            Number(it.productId) === targetId &&
            (it.presentation?.trim().toLowerCase() === presentation.trim().toLowerCase() ||
             (!it.presentation && presentation === "Estándar") ||
             (it.presentation === "Estándar" && !presentation))
        );
        return item ? item.quantity : 0;
      }
      return items
        .filter((it) => Number(it.productId) === targetId)
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

  useEffect(() => {
    let ignore = false;
    async function fetchInitialNumber() {
      if (savedQuoteIdRef.current) return;
      try {
        const res = await fetch("/api/quotes/next-number");
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.nextQuoteNumber && !savedQuoteIdRef.current) {
            setQuoteNumber(data.nextQuoteNumber);
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_STORAGE_QUOTE_NUM, data.nextQuoteNumber);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch initial quote number:", err);
      }
    }
    fetchInitialNumber();
    return () => {
      ignore = true;
    };
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <QuoteContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearQuote,
        loadSavedQuote,
        savedQuoteId,
        setSavedQuoteId,
        getItemQuantity,
        totalItemsCount,
        subtotal,
        tax,
        total,
        comments,
        setComments,
        quoteNumber,
        setQuoteNumber,
        refreshQuoteNumber,
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
