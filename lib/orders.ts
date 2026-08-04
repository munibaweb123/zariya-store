import "server-only";

// Ambiguous-looking characters (0/O, 1/I) excluded so codes stay readable
// when read aloud or typed back in over WhatsApp.
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 4;

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

function datePart(date: Date): string {
  const yy = String(date.getFullYear() % 100).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/**
 * Generates a human-readable order number: ZR-YYMMDD-XXXX (e.g. ZR-260803-K7QF).
 * Pure and DB-independent — does not check uniqueness itself. The `orderNumber`
 * column has a unique constraint (see prisma/schema.prisma); callers creating
 * an Order must catch a unique-constraint violation and call this again,
 * retrying up to 3 times total, per infra/02's Core Capabilities.
 */
export function generateOrderNumber(date: Date = new Date()): string {
  return `ZR-${datePart(date)}-${randomCode()}`;
}

export type OrderItemSnapshot = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
};
