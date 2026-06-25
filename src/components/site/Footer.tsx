import { useSettings } from "@/lib/site";
import { RomanianFlag } from "@/components/RomanianFlag";
import { Link } from "@tanstack/react-router";
import anpcSal from "@/assets/anpc-sal.svg.asset.json";
import anpcSol from "@/assets/anpc-sol.svg.asset.json";

export function Footer() {
  const { data: s } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="font-display text-xl font-bold">
              Porți <span className="text-primary">Din Lemn</span>
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

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="https://anpc.ro/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ANPC - Soluționarea Alternativă a Litigiilor"
              >
                <img
                  src={anpcSal.url}
                  alt="ANPC - Soluționarea Alternativă a Litigiilor"
                  width={175}
                  height={50}
                  loading="lazy"
                  className="h-[50px] w-auto rounded bg-background"
                />
              </a>
              <a
                href="https://consumer-redress.ec.europa.eu/site-relocation_en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Soluționarea Online a Litigiilor - Comisia Europeană"
              >
                <img
                  src={anpcSol.url}
                  alt="Soluționarea Online a Litigiilor - Comisia Europeană"
                  width={175}
                  height={50}
                  loading="lazy"
                  className="h-[50px] w-auto rounded bg-background"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-background/15 pt-6 text-sm text-background/80">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <p>
              © {year} {s?.company_name || "Porți Din Lemn SRL"}. Toate drepturile rezervate. ·{" "}
              <Link to="/admin" className="hover:text-primary">Admin</Link>
            </p>
            <a
              href="https://webcraft.djfunkyevents.ro/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              Site dezvoltat de Webcraft Romania
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
