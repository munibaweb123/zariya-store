// Placeholder store number, same pattern as components/layout/Footer.tsx's
// independent WHATSAPP_SUPPORT_URL constant (infra/01-owned, not touched
// here). Update both once a real number exists.
const STORE_WHATSAPP_NUMBER = "923000000000";

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
