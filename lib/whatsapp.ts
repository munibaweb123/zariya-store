// Same pattern as components/layout/Footer.tsx's independent
// WHATSAPP_SUPPORT_URL constant (infra/01-owned, not touched here).
const STORE_WHATSAPP_NUMBER = "923420024683";

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
