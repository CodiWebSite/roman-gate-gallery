import { useSettings } from "@/lib/site";
import { RomanianFlag } from "@/components/RomanianFlag";
import { Link } from "@tanstack/react-router";

export function Footer() {
  const { data: s } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="font-display text-xl font-bold">
              Porti<span className="text-primary">DinLemn</span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-background/70">
              Porți mândre românești <RomanianFlag />
            </p>
            <p className="mt-4 text-sm text-background/70">
              Porți din lemn masiv și stejar, lucrate manual, cu durabilitate și
              estetică tradițională românească.
            </p>
          </div>

          <div className="text-sm">
            <h3 className="mb-3 font-display text-base font-semibold text-background">
              Date firmă
            </h3>
            <ul className="space-y-1 text-background/70">
              <li>Denumire: {s?.company_name || "[Nume firmă SRL/PFA]"}</li>
              <li>CUI: {s?.company_cui || "[CUI]"}</li>
              <li>Nr. Reg. Comerțului: {s?.company_reg || "[Jxx/xxx/xxxx]"}</li>
              <li>Sediu social: {s?.company_address || "[Adresă]"}</li>
              <li>Email: {s?.company_email || "[email]"}</li>
              <li>Telefon: {s?.company_phone || "[telefon]"}</li>
            </ul>
          </div>

          <div className="text-sm">
            <h3 className="mb-3 font-display text-base font-semibold text-background">
              Informații legale
            </h3>
            <ul className="space-y-1.5 text-background/70">
              <li><Link to="/termeni" className="hover:text-primary">Termeni și condiții</Link></li>
              <li><Link to="/confidentialitate" className="hover:text-primary">Politică de confidențialitate</Link></li>
              <li><Link to="/cookies" className="hover:text-primary">Politică cookies</Link></li>
            </ul>

            <a
              href="https://reclamatiisal.anpc.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex h-[50px] w-[250px] items-center justify-center gap-2 rounded-md border border-background/20 bg-background/10 text-xs font-semibold text-background"
              aria-label="Soluționarea Alternativă a Litigiilor - ANPC"
            >
              <span className="rounded bg-primary px-1.5 py-0.5 text-primary-foreground">SAL</span>
              Soluționarea Alternativă a Litigiilor · ANPC
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-background/15 pt-6 text-xs text-background/55">
          <p>
            Conținutul juridic este orientativ și trebuie validat cu un
            consultant juridic înainte de publicare.
          </p>
          <p className="mt-3">
            © {year} {s?.company_name || "PortiDinLemn SRL"}. Toate drepturile rezervate. ·{" "}
            <Link to="/admin" className="hover:text-primary">Admin</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
