import { ProductImage } from "@/components/ui/ProductImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/lib/cart/store";

type CartLineItemProps = {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLineItem({ item, onUpdateQuantity, onRemove }: CartLineItemProps) {
  return (
    <div className="flex gap-gutter border-b border-line py-6">
      <div className="w-24 flex-shrink-0 md:w-32">
        <ProductImage src={item.image} alt={item.name} />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-gutter">
          <p className="text-body-md text-charcoal">{item.name}</p>
          <p className="text-price-tag text-maroon">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <QuantityStepper quantity={item.quantity} onChange={onUpdateQuantity} />
          <button
            type="button"
            onClick={onRemove}
            className="text-label-caps text-charcoal underline hover:text-maroon"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
