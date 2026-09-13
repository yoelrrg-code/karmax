/**
 * Utilidades centralizadas para cálculo de precios con descuentos de cliente y ofertas de catálogo.
 */

export interface PricingComputation {
  regularPrice: number | null;
  finalPrice: number | null;
  discountPercentage: number;
  hasDiscount: boolean;
}

export function parsePriceNumber(priceVal?: string | number | null): number {
  if (priceVal === undefined || priceVal === null) return 0;
  if (typeof priceVal === "number") return priceVal;
  const clean = String(priceVal).replace(/[^0-9.]/g, "");
  return Number(clean) || 0;
}

export function computeProductPricing({
  regularPrice,
  salePrice,
  userDiscountPercentage,
}: {
  regularPrice?: string | number | null;
  salePrice?: string | number | null;
  userDiscountPercentage?: number | null;
}): PricingComputation {
  const regNum = parsePriceNumber(regularPrice);
  const saleNum = parsePriceNumber(salePrice);
  const discountPct = Number(userDiscountPercentage || 0);

  // 1. Si el cliente logueado tiene un porcentaje de descuento asignado (> 0)
  if (discountPct > 0) {
    const baseNum = regNum > 0 ? regNum : saleNum;
    if (baseNum > 0) {
      const discounted = Number((baseNum * (1 - discountPct / 100)).toFixed(2));
      return {
        regularPrice: baseNum,
        finalPrice: discounted,
        discountPercentage: discountPct,
        hasDiscount: true,
      };
    }
  }

  // 2. Si el producto tiene una oferta de catálogo activa (sale_price < regular_price)
  if (saleNum > 0 && regNum > 0 && saleNum < regNum) {
    const calculatedPct = Math.round(((regNum - saleNum) / regNum) * 100);
    return {
      regularPrice: regNum,
      finalPrice: saleNum,
      discountPercentage: calculatedPct,
      hasDiscount: true,
    };
  }

  // 3. Precio estándar sin descuento
  const standardPrice = regNum > 0 ? regNum : (saleNum > 0 ? saleNum : null);
  return {
    regularPrice: standardPrice,
    finalPrice: standardPrice,
    discountPercentage: 0,
    hasDiscount: false,
  };
}
