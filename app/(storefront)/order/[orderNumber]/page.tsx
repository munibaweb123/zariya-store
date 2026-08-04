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
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-maroon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-8 w-8 text-maroon"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5L20 7" />
          </svg>
        </div>

        <h1 className="mt-6 font-heading text-display-lg-mobile text-charcoal md:text-display-lg">
          Shukriya! Order placed
        </h1>

        <p className="mt-2 text-body-md text-charcoal">
          Order #{order.orderNumber} · We will confirm your order on WhatsApp within a few minutes.
        </p>

        <div className="mt-8 bg-blush p-6 text-left">
          <h2 className="text-label-caps text-maroon">Order Summary</h2>

          <div className="mt-4 flex flex-col gap-4 border-b border-line pb-4">
            {items.map((item) => (
              <div key={item.slug} className="flex justify-between text-body-md text-charcoal">
                <p>
                  {item.name} <span className="text-charcoal/60">x{item.quantity}</span>
                </p>
                <p className="text-maroon">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-gutter border-b border-line pb-4 md:grid-cols-2">
            <div>
              <p className="text-label-caps text-charcoal/60">Delivery Address</p>
              <p className="mt-2 text-body-md text-charcoal">{order.customerName}</p>
              <p className="text-body-md text-charcoal">{order.address}</p>
              <p className="text-body-md text-charcoal">
                {order.city}, {order.province}
              </p>
              {order.landmark && <p className="text-body-md text-charcoal">{order.landmark}</p>}
            </div>

            <div>
              <p className="text-label-caps text-charcoal/60">Payment Method</p>
              <p className="mt-2 text-body-md text-charcoal">
                {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex justify-between text-body-md text-charcoal">
              <p>Subtotal</p>
              <p>{formatPrice(order.subtotal)}</p>
            </div>
            <div className="flex justify-between text-body-md text-charcoal">
              <p>Shipping</p>
              <p>{order.deliveryCharge === 0 ? "Free" : formatPrice(order.deliveryCharge)}</p>
            </div>
            <div className="mt-2 flex justify-between border-t border-line pt-4 text-price-tag">
              <p className="text-charcoal">Total Amount</p>
              <p className="text-maroon">{formatPrice(order.total)}</p>
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

        <p className="mt-8 border-t border-line pt-8 text-label-caps text-charcoal/60">
          Expected delivery: 3-5 working days nationwide via courier
        </p>
      </div>
    </>
  );
}
