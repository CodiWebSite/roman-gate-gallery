import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/confidentialitate")({
  head: () => ({
    meta: [
      { title: "Politică de confidențialitate · Porți Din Lemn" },
      { name: "description", content: "Politica de confidențialitate Porți Din Lemn: ce date personale colectăm, scopul și temeiul legal al prelucrării, perioada de stocare și drepturile tale conform GDPR." },
      { property: "og:title", content: "Politică de confidențialitate · Porți Din Lemn" },
      { property: "og:description", content: "Cum prelucrăm datele personale conform GDPR și care sunt drepturile tale." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://portidinlemn.ro/confidentialitate" },
    ],
    links: [{ rel: "canonical", href: "https://portidinlemn.ro/confidentialitate" }],
  }),
  component: () => (
    <LegalPage title="Politică de confidențialitate">
      <p className="text-sm">Ultima actualizare: iulie 2026</p>
      <p>
        Respectăm confidențialitatea datelor tale cu caracter personal și le
        prelucrăm în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și
        legislația română aplicabilă. Această politică explică ce date colectăm,
        de ce, pe ce temei legal și ce drepturi ai.
      </p>

      <h2>1. Operatorul de date</h2>
      <p>
        Operatorul datelor tale este firma identificată în secțiunea „Date
        firmă” din subsolul site-ului (denumire, CUI, sediu, email, telefon).
        Pentru orice solicitare privind datele personale, folosește acele date de
        contact.
      </p>

      <h2>2. Ce date colectăm</h2>
      <p>
        Colectăm datele pe care ni le furnizezi voluntar prin formularul de
        contact sau prin WhatsApp: <strong>nume, număr de telefon, localitate și
        conținutul mesajului</strong>. Site-ul nu solicită și nu stochează date
        de plată. Colectăm și date tehnice agregate prin cookie-uri de analiză,
        doar cu consimțământul tău (vezi Politica de cookies).
      </p>

      <h2>3. Scopul și temeiul legal al prelucrării</h2>
      <p>
        Prelucrăm datele pentru a răspunde solicitărilor tale și a-ți transmite o
        ofertă (temei legal: efectuarea de demersuri la cererea ta, înainte de
        încheierea unui contract, art. 6 alin. 1 lit. b GDPR). Datele de analiză
        sunt prelucrate în baza consimțământului tău (art. 6 alin. 1 lit. a
        GDPR).
      </p>

      <h2>4. Perioada de stocare</h2>
      <p>
        Păstrăm datele din solicitări doar cât este necesar pentru a-ți răspunde
        și a gestiona eventuala relație comercială, apoi le ștergem sau
        anonimizăm, cu excepția cazurilor în care legea impune păstrarea pe o
        perioadă mai lungă.
      </p>

      <h2>5. Destinatari și transfer</h2>
      <p>
        Nu vindem datele tale. Datele pot fi procesate de furnizori de servicii
        (de exemplu, găzduire web, servicii de comunicare precum WhatsApp) care
        acționează ca persoane împuternicite, cu garanții adecvate. Comunicarea
        prin WhatsApp se supune și politicii de confidențialitate a acelui
        serviciu.
      </p>

      <h2>6. Drepturile tale</h2>
      <p>
        Conform GDPR, ai dreptul de acces, rectificare, ștergere („dreptul de a
        fi uitat”), restricționarea prelucrării, portabilitatea datelor, opoziție
        și retragerea consimțământului în orice moment. Îți poți exercita aceste
        drepturi contactându-ne la datele din subsol.
      </p>

      <h2>7. Dreptul de a depune plângere</h2>
      <p>
        Dacă apreciezi că ți-au fost încălcate drepturile, te poți adresa
        Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter
        Personal (ANSPDCP), <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a>.
      </p>

      <h2>8. Securitate</h2>
      <p>
        Aplicăm măsuri tehnice și organizatorice rezonabile pentru a proteja
        datele împotriva accesului neautorizat, pierderii sau divulgării.
      </p>
    </LegalPage>
  ),
});
