import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Politică cookies · Porți Din Lemn" },
      { name: "description", content: "Politica de cookies Porți Din Lemn: ce sunt cookie-urile, cum le folosim pentru funcționarea site-ului și analiză și cum le poți gestiona din browser." },
      { property: "og:title", content: "Politică cookies · Porți Din Lemn" },
      { property: "og:description", content: "Ce cookie-uri folosim și cum le poți controla din browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://portidinlemn.ro/cookies" },
    ],
    links: [{ rel: "canonical", href: "https://portidinlemn.ro/cookies" }],
  }),
  component: () => (
    <LegalPage title="Politică cookies">
      <p>
        Acest site poate folosi cookie-uri pentru a îmbunătăți experiența de
        navigare și pentru analiză.
      </p>
      <h2>1. Ce sunt cookie-urile</h2>
      <p>
        Cookie-urile sunt fișiere mici stocate pe dispozitivul dumneavoastră
        atunci când vizitați un site web.
      </p>
      <h2>2. Cum le folosim</h2>
      <p>
        Folosim cookie-uri strict necesare pentru funcționarea site-ului și,
        opțional, cookie-uri de analiză.
      </p>
      <h2>3. Gestionarea cookie-urilor</h2>
      <p>
        Puteți controla și șterge cookie-urile din setările browserului
        dumneavoastră.
      </p>
    </LegalPage>
  ),
});
