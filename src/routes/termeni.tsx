import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/termeni")({
  head: () => ({
    meta: [
      { title: "Termeni și condiții · Porți Din Lemn" },
      { name: "description", content: "Termenii și condițiile de utilizare a site-ului Porți Din Lemn: servicii de execuție și montaj, comenzi, plăți și garanție pentru porți din lemn." },
      { property: "og:title", content: "Termeni și condiții · Porți Din Lemn" },
      { property: "og:description", content: "Termenii și condițiile de utilizare a site-ului și serviciilor Porți Din Lemn." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://portidinlemn.ro/termeni" },
    ],
    links: [{ rel: "canonical", href: "https://portidinlemn.ro/termeni" }],
  }),
  component: () => (
    <LegalPage title="Termeni și condiții">
      <p>
        Acești termeni reglementează utilizarea site-ului Porți Din Lemn și a
        serviciilor oferite. Prin accesarea site-ului, sunteți de acord cu
        prezentele condiții.
      </p>
      <h2>1. Servicii</h2>
      <p>
        Oferim servicii de proiectare, execuție, montaj și recondiționare a
        porților din lemn. Ofertele sunt personalizate în funcție de cerințe.
      </p>
      <h2>2. Comenzi și plăți</h2>
      <p>
        Condițiile de comandă, avans și plată se stabilesc individual prin
        contract sau ofertă scrisă.
      </p>
      <h2>3. Garanție</h2>
      <p>
        Produsele beneficiază de garanție conform legislației în vigoare și
        condițiilor specificate în contract.
      </p>
      <h2>4. Contact</h2>
      <p>Pentru întrebări, ne puteți contacta prin datele afișate pe site.</p>
    </LegalPage>
  ),
});
