import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/confidentialitate")({
  head: () => ({ meta: [{ title: "Politică de confidențialitate · PortiDinLemn" }] }),
  component: () => (
    <LegalPage title="Politică de confidențialitate">
      <p>
        Respectăm confidențialitatea datelor dumneavoastră cu caracter personal,
        în conformitate cu Regulamentul (UE) 2016/679 (GDPR).
      </p>
      <h2>1. Date colectate</h2>
      <p>
        Colectăm datele pe care ni le furnizați prin formularul de contact
        (nume, telefon, localitate, mesaj) pentru a vă putea trimite o ofertă.
      </p>
      <h2>2. Scopul prelucrării</h2>
      <p>Datele sunt folosite exclusiv pentru a răspunde solicitărilor dumneavoastră.</p>
      <h2>3. Drepturile dumneavoastră</h2>
      <p>
        Aveți dreptul de acces, rectificare, ștergere și opoziție privind datele
        personale. Ne puteți contacta pentru exercitarea acestor drepturi.
      </p>
    </LegalPage>
  ),
});
