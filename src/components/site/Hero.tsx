import { useEffect, useRef } from "react";
import { useSettings, whatsappLink } from "@/lib/site";
import { smoothScrollToElement } from "@/lib/smooth-scroll";
import { RomanianFlag } from "@/components/RomanianFlag";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const { data: settings } = useSettings();
  const href = whatsappLink(settings?.whatsapp_number);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // React doesn't reliably apply the `muted` attribute to the DOM,
    // which blocks autoplay. Force it, then start playback.
    el.muted = true;
    el.defaultMuted = true;
    const tryPlay = () => el.play().catch(() => {});
    tryPlay();
  }, []);

  return (
    <section id="acasa" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/hero.jpg"
        aria-label="Poartă din lemn de stejar într-o curte tradițională românească"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero-h264.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-28 text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-background/10 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm">
          Meșteșug românesc autentic
        </p>
        <h1 className="text-balance font-display text-5xl font-bold text-primary-foreground sm:text-7xl">
          Porți din lemn masiv/stejar&nbsp;
        </h1>
        <p className="mt-4 flex items-center justify-center gap-2.5 text-balance text-xl font-medium text-primary-foreground/95 sm:text-2xl">
          Porți mândre românești <RomanianFlag />
        </p>
        <p className="mx-auto mt-5 max-w-xl text-balance text-base text-primary-foreground/85 sm:text-lg">
          Porți din lemn masiv, lucrate manual, cu durabilitate și eleganță
          pentru curți tradiționale și moderne.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-elevated transition-transform hover:scale-105 sm:w-auto"
            style={{ backgroundColor: "oklch(0.6 0.16 150)" }}
          >
            <WhatsAppIcon className="h-5 w-5" />
            Cere ofertă pe WhatsApp
          </a>
          <button
            onClick={() => smoothScrollToElement(document.getElementById("portofoliu"))}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary-foreground/40 bg-background/10 px-7 py-3.5 text-base font-semibold text-primary-foreground backdrop-blur-sm transition-colors hover:bg-background/20 sm:w-auto"
          >
            Vezi portofoliul <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
