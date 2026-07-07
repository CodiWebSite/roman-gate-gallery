import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { smoothScrollToElement } from "@/lib/smooth-scroll";
import { useSettings, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const NAV = [
  { id: "acasa", label: "Acasă" },
  { id: "despre", label: "Despre" },
  { id: "servicii", label: "Servicii" },
  { id: "portofoliu", label: "Modele 3D" },
  { id: "lucrari-reale", label: "Lucrări reale" },
  { id: "video", label: "Video" },
  { id: "proces", label: "Proces" },
  { id: "contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("acasa");
  const { data: settings } = useSettings();
  const href = whatsappLink(settings?.whatsapp_number);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracking
  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(
      Boolean,
    ) as HTMLElement[];
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll + close on Escape when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    smoothScrollToElement(document.getElementById(id));
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-border/40 bg-background/90 shadow-soft backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => go("acasa")}
          className={`flex min-w-0 items-center gap-2 font-display text-xl font-bold tracking-tight transition-colors sm:text-2xl ${
            scrolled || open ? "text-foreground" : "text-primary-foreground"
          }`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-warm text-base text-primary-foreground shadow-soft">
            🚪
          </span>
          <span className="truncate">
            Porți{" "}
            <span className={scrolled || open ? "text-primary" : "text-ro-yellow"}>
              Din Lemn
            </span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const isActive = active === item.id;
            const baseColor = scrolled ? "text-foreground" : "text-primary-foreground";
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? scrolled
                      ? "text-primary"
                      : "text-ro-yellow"
                    : `${baseColor} hover:text-primary`
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-current" />
                )}
              </button>
            );
          })}
        </nav>

        {/* CTA + burger */}
        <div className="flex items-center gap-2">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-105 lg:inline-flex"
            style={{ backgroundColor: "oklch(0.6 0.16 150)" }}
          >
            <WhatsAppIcon className="h-4 w-4" />
            Cere ofertă
          </a>

          <button
            className={`grid h-10 w-10 place-items-center rounded-full transition-colors lg:hidden ${
              scrolled || open
                ? "text-foreground hover:bg-secondary"
                : "bg-background/15 text-primary-foreground backdrop-blur-sm"
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Meniu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 top-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-foreground/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Panel */}
        <nav
          className={`absolute right-0 top-0 flex h-[100dvh] w-[86%] max-w-[360px] flex-col bg-background shadow-elevated transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="font-display text-lg font-bold">
              Porți <span className="text-primary">Din Lemn</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Închide meniul"
              className="grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary active:scale-95"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV.map((item, i) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  style={{
                    transitionDelay: open ? `${80 + i * 35}ms` : "0ms",
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-base font-medium transition-all duration-300 ease-out active:scale-[0.98] ${
                    open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                  } ${
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {item.label}
                  {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-border p-4">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: "oklch(0.6 0.16 150)" }}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Cere ofertă pe WhatsApp
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
