import { useState } from "react";
import { Menu, X } from "lucide-react";
import { smoothScrollToElement } from "@/lib/smooth-scroll";

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
  const [open, setOpen] = useState(false);

  const go = (id: string) => {
    setOpen(false);
    smoothScrollToElement(document.getElementById(id));
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/30 bg-background/85 shadow-soft backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={() => go("acasa")}
          className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          Porți <span className="text-primary">Din Lemn</span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/50 hover:text-primary"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className="text-foreground lg:hidden"
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
