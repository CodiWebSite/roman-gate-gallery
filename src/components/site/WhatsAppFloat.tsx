import { useSettings, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function WhatsAppFloat() {
  const { data: settings } = useSettings();
  const href = whatsappLink(settings?.whatsapp_number);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Scrie-ne pe WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-elevated transition-transform hover:scale-110"
      style={{ backgroundColor: "oklch(0.6 0.16 150)" }}
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ backgroundColor: "oklch(0.6 0.16 150)" }} />
    </a>
  );
}
