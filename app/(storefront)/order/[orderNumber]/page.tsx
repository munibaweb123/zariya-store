import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { OrderItemSnapshot } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { ClearCartOnConfirmation } from "@/components/order/ClearCartOnConfirmation";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer / JazzCash / Easypaisa",
};

type OrderConfirmationPageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({ where: { orderNumber } });

  if (!order) {
    notFound();
  }

  const items = order.items as unknown as OrderItemSnapshot[];

  const whatsAppMessage = [
    `Hi! Please confirm my order #${order.orderNumber}:`,
    "",
    ...items.map((item) => `${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`),
    "",
    `Total: ${formatPrice(order.total)}`,
    "",
    `Delivery to: ${order.address}, ${order.city}`,
  ].join("\n");

  return (
    <>
      <ClearCartOnConfirmation />

      <div className="mx-auto max-w-2xl px-margin-mobile py-section-mobile text-center md:px-margin-desktop md:py-section-desktop">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-maroon dark:border-maroon-dark">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-8 w-8 text-maroon dark:text-maroon-dark"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5L20 7" />
          </svg>
        </div>

        <h1 className="mt-6 font-heading text-display-lg-mobile text-charcoal dark:text-charcoal-dark md:text-display-lg">
          Shukriya! Order placed
        </h1>

        <p className="mt-2 text-body-md text-charcoal dark:text-charcoal-dark">
          Order #{order.orderNumber} · We will confirm your order on WhatsApp within a few minutes.
        </p>

        <div className="mt-8 bg-blush dark:bg-blush-dark p-6 text-left">
          <h2 className="text-label-caps text-maroon dark:text-maroon-dark">Order Summary</h2>

          <div className="mt-4 flex flex-col gap-4 border-b border-line dark:border-line-dark pb-4">
            {items.map((item) => (
              <div key={item.slug} className="flex justify-between text-body-md text-charcoal dark:text-charcoal-dark">
                <p>
                  {item.name} <span className="text-charcoal/60 dark:text-charcoal-dark/60">x{item.quantity}</span>
                </p>
                <p className="text-maroon dark:text-maroon-dark">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-gutter border-b border-line dark:border-line-dark pb-4 md:grid-cols-2">
            <div>
              <p className="text-label-caps text-charcoal/60 dark:text-charcoal-dark/60">Delivery Address</p>
              <p className="mt-2 text-body-md text-charcoal dark:text-charcoal-dark">{order.customerName}</p>
              <p className="text-body-md text-charcoal dark:text-charcoal-dark">{order.address}</p>
              <p className="text-body-md text-charcoal dark:text-charcoal-dark">
                {order.city}, {order.province}
              </p>
              {order.landmark && <p className="text-body-md text-charcoal dark:text-charcoal-dark">{order.landmark}</p>}
            </div>

            <div>
              <p className="text-label-caps text-charcoal/60 dark:text-charcoal-dark/60">Payment Method</p>
              <p className="mt-2 text-body-md text-charcoal dark:text-charcoal-dark">
                {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex justify-between text-body-md text-charcoal dark:text-charcoal-dark">
              <p>Subtotal</p>
              <p>{formatPrice(order.subtotal)}</p>
            </div>
            <div className="flex justify-between text-body-md text-charcoal dark:text-charcoal-dark">
              <p>Shipping</p>
              <p>{order.deliveryCharge === 0 ? "Free" : formatPrice(order.deliveryCharge)}</p>
            </div>
            <div className="mt-2 flex justify-between border-t border-line dark:border-line-dark pt-4 text-price-tag">
              <p className="text-charcoal dark:text-charcoal-dark">Total Amount</p>
              <p className="text-maroon dark:text-maroon-dark">{formatPrice(order.total)}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Button href={buildWhatsAppLink(whatsAppMessage)} className="w-full">
            Confirm on WhatsApp
          </Button>
          <Button variant="secondary" href="/">
            Continue Shopping
          </Button>
        </div>

        <p className="mt-8 border-t border-line dark:border-line-dark pt-8 text-label-caps text-charcoal/60 dark:text-charcoal-dark/60">
          Expected delivery: 3-5 working days nationwide via courier
        </p>
      </div>
    </>
  );
}
