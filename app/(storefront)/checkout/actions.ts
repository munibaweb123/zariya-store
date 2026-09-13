"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber, type OrderItemSnapshot } from "@/lib/orders";
import { calculateDeliveryCharge } from "@/lib/delivery";
import { provinceForCity } from "@/lib/checkout/cities";
import { checkoutSchema } from "@/lib/checkout/schema";

export type CheckoutFormState = {
  errors: Partial<Record<"customerName" | "phone" | "address" | "city" | "paymentMethod", string>>;
  formError?: string;
};

const MAX_ORDER_NUMBER_ATTEMPTS = 3;

export async function createOrder(
  items: OrderItemSnapshot[],
  _prevState: CheckoutFormState,
  formData: FormData,
): Promise<CheckoutFormState> {
  // Cart contents are re-validated server-side, never trusted from the
  // client — an empty items array is rejected outright, and subtotal/total
  // are recomputed below from these items rather than accepted as numbers.
  if (!items || items.length === 0) {
    return { errors: {}, formError: "Your cart is empty." };
  }

  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    landmark: formData.get("landmark"),
    paymentMethod: formData.get("paymentMethod"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    const errors: CheckoutFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        field === "customerName" ||
        field === "phone" ||
        field === "address" ||
        field === "city" ||
        field === "paymentMethod"
      ) {
        errors[field] = issue.message;
      }
    }
    return { errors };
  }

  const input = parsed.data;
  const province = provinceForCity(input.city);
  if (!province) {
    return { errors: { city: "Select a city from the list" } };
  }

  // Never trust a client-supplied total — recompute from the item snapshot.
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = calculateDeliveryCharge(subtotal);
  const total = subtotal + deliveryCharge;

  const orderData = {
    customerName: input.customerName,
    phone: `+92${input.phone}`,
    address: input.address,
    city: input.city,
    province,
    landmark: input.landmark ?? null,
    paymentMethod: input.paymentMethod,
    notes: input.notes ?? null,
    items: items as unknown as Prisma.InputJsonValue,
    subtotal,
    deliveryCharge,
    total,
  };

  let orderNumber: string | null = null;
  for (let attempt = 0; attempt < MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
    const candidate = generateOrderNumber();
    try {
      await prisma.order.create({ data: { ...orderData, orderNumber: candidate } });
      orderNumber = candidate;
      break;
    } catch (error) {
      const isCollision =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isCollision || attempt === MAX_ORDER_NUMBER_ATTEMPTS - 1) {
        return { errors: {}, formError: "Something went wrong placing your order. Please try again." };
      }
    }
  }

  if (!orderNumber) {
    return { errors: {}, formError: "Something went wrong placing your order. Please try again." };
  }

  redirect(`/order/${orderNumber}`);
}
