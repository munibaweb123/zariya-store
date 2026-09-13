export const FREE_DELIVERY_THRESHOLD = 3000;
export const FLAT_DELIVERY_CHARGE = 250;

export function calculateDeliveryCharge(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_CHARGE;
}
