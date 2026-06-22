import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { id: "acasa", label: "Acasă" },
  { id: "despre", label: "Despre" },
  { id: "servicii", label: "Servicii" },
  { id: "portofoliu", label: "Portofoliu" },
  { id: "video", label: "Video" },
  { id: "proces", label: "Proces" },
  { id: "contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 shadow-soft backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={() => go("acasa")}
          className={`font-display text-xl font-bold tracking-tight sm:text-2xl ${
            scrolled ? "text-foreground" : "text-primary-foreground"
          }`}
        >
          Porti<span className="text-primary">DinLemn</span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                scrolled ? "text-foreground" : "text-primary-foreground/90"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className={`lg:hidden ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Meniu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className="block w-full rounded-md px-3 py-3 text-left text-base font-medium text-foreground hover:bg-secondary"
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
