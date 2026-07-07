import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/termeni")({
  head: () => ({
    meta: [
      { title: "Termeni și condiții · Porți Din Lemn" },
      { name: "description", content: "Termenii și condițiile de utilizare a site-ului Porți Din Lemn: servicii de execuție și montaj, oferte, comenzi, plăți, garanție, dreptul de retragere și soluționarea litigiilor." },
      { property: "og:title", content: "Termeni și condiții · Porți Din Lemn" },
      { property: "og:description", content: "Termenii și condițiile de utilizare a site-ului și serviciilor Porți Din Lemn." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://portidinlemn.ro/termeni" },
    ],
    links: [{ rel: "canonical", href: "https://portidinlemn.ro/termeni" }],
  }),
  component: () => (
    <LegalPage title="Termeni și condiții">
      <p className="text-sm">Ultima actualizare: iulie 2026</p>
      <p>
        Acești termeni reglementează utilizarea site-ului portidinlemn.ro și a
        serviciilor oferite de firma identificată în secțiunea „Date firmă” din
        subsolul site-ului. Prin accesarea și utilizarea site-ului, ești de acord
        cu prezentele condiții.
      </p>

      <h2>1. Prezentarea serviciilor</h2>
      <p>
        Oferim servicii de proiectare, execuție, montaj și recondiționare a
        porților din lemn masiv și stejar. Site-ul are rol de prezentare;
        ofertele sunt personalizate în funcție de cerințele fiecărui client și nu
        constituie o vânzare online directă.
      </p>

      <h2>2. Oferte și comenzi</h2>
      <p>
        Solicitările transmise prin formularul de contact sau WhatsApp reprezintă
        o cerere de ofertă și nu creează automat obligații contractuale.
        Condițiile comerciale ferme (preț, termen, specificații) se stabilesc
        individual, prin ofertă scrisă și/sau contract.
      </p>

      <h2>3. Prețuri și plăți</h2>
      <p>
        Prețurile produselor și serviciilor se comunică în oferta personalizată.
        Condițiile de avans și plată se stabilesc prin contract sau ofertă
        acceptată de ambele părți.
      </p>

      <h2>4. Garanție și conformitate</h2>
      <p>
        Produsele beneficiază de garanție conform legislației în vigoare, în
        special OUG nr. 140/2021 privind conformitatea produselor, și conform
        condițiilor specificate în contract. Fiind produse realizate la comandă,
        pe baza specificațiilor clientului, se aplică prevederile legale
        corespunzătoare bunurilor personalizate.
      </p>

      <h2>5. Dreptul de retragere</h2>
      <p>
        Pentru contractele la distanță, consumatorii beneficiază, ca regulă
        generală, de dreptul de retragere în 14 zile conform OUG nr. 34/2014.
        Acest drept nu se aplică bunurilor confecționate după specificațiile
        clientului sau personalizate în mod clar, aspect ce va fi comunicat
        înainte de plasarea comenzii.
      </p>

      <h2>6. Proprietate intelectuală</h2>
      <p>
        Conținutul site-ului (texte, imagini, elemente grafice, siglă) este
        proprietatea firmei sau a partenerilor săi și nu poate fi reprodus fără
        acord prealabil scris.
      </p>

      <h2>7. Limitarea răspunderii</h2>
      <p>
        Depunem eforturi pentru acuratețea informațiilor de pe site, însă acestea
        pot fi actualizate periodic. Nu răspundem pentru eventuale erori de
        conținut care nu au caracter contractual.
      </p>

      <h2>8. Soluționarea litigiilor</h2>
      <p>
        Eventualele neînțelegeri se soluționează pe cale amiabilă. Consumatorii
        se pot adresa Autorității Naționale pentru Protecția Consumatorilor
        (ANPC, <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer">anpc.ro</a>)
        sau pot folosi platforma europeană de soluționare online a litigiilor
        (SOL). Legăturile către aceste instrumente sunt disponibile în subsolul
        site-ului.
      </p>

      <h2>9. Contact</h2>
      <p>
        Pentru întrebări legate de acești termeni, ne poți contacta folosind
        datele afișate în subsolul site-ului.
      </p>
    </LegalPage>
  ),
});
