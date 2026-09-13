type QuantityStepperProps = {
  quantity: number;
  onChange: (next: number) => void;
  min?: number;
};

/**
 * Controlled — no internal state, no stock-driven ceiling (the product
 * schema has no numeric stock field). Owned by frontend/04 but generic
 * enough that frontend/05's cart-line quantity edits can reuse it.
 */
export function QuantityStepper({ quantity, onChange, min = 1 }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center border border-line dark:border-line-dark">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="flex h-11 w-11 items-center justify-center text-charcoal dark:text-charcoal-dark"
      >
        −
      </button>
      <span className="w-8 text-center text-body-md text-charcoal dark:text-charcoal-dark">{quantity}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(quantity + 1)}
        className="flex h-11 w-11 items-center justify-center text-charcoal dark:text-charcoal-dark"
      >
        +
      </button>
    </div>
  );
}
