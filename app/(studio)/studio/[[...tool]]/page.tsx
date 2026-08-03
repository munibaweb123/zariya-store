import { StudioClient } from "@/components/studio/StudioClient";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <StudioClient />;
}
