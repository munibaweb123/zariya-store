"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart/useCart";

type PurchaseActionsProps = {
  slug: string;
  name: string;
  image: string;
  price: number;
  inStock: boolean;
};

/**
 * Holds the local quantity used by both actions, so ordering 3 via either
 * path is consistent. "price" here is already the effective price (sale
 * price when applicable) — computed once by the page, not recomputed here.
 */
export function PurchaseActions({ slug, name, image, price, inStock }: PurchaseActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  if (!inStock) {
    return (
      <div className="flex flex-col gap-4">
        <Button disabled className="opacity-50">
          Out of Stock
        </Button>
      </div>
    );
  }

  const whatsAppMessage = `Hi! I'd like to order:\n\n${name}\nQuantity: ${quantity}\nPrice: ${formatPrice(price)}`;

  return (
    <div className="flex flex-col gap-4">
      <QuantityStepper quantity={quantity} onChange={setQuantity} />
      <Button onClick={() => addItem({ slug, name, image, price, quantity })}>
        Add to Cart
      </Button>
      <Button variant="secondary" href={buildWhatsAppLink(whatsAppMessage)}>
        Order on WhatsApp
      </Button>
    </div>
  );
}
