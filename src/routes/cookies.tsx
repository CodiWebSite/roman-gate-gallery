import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Politică cookies · Porți Din Lemn" },
      { name: "description", content: "Politica de cookies Porți Din Lemn: ce sunt cookie-urile, ce tipuri folosim (necesare și de analiză), temeiul legal și cum îți poți retrage consimțământul." },
      { property: "og:title", content: "Politică cookies · Porți Din Lemn" },
      { property: "og:description", content: "Ce cookie-uri folosim, temeiul legal și cum le poți controla." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://portidinlemn.ro/cookies" },
    ],
    links: [{ rel: "canonical", href: "https://portidinlemn.ro/cookies" }],
  }),
  component: () => (
    <LegalPage title="Politică de cookies">
      <p className="text-sm">Ultima actualizare: iulie 2026</p>
      <p>
        Această politică explică modul în care Porți Din Lemn („noi”, „site-ul”)
        utilizează cookie-uri și tehnologii similare atunci când vizitezi
        <strong> portidinlemn.ro</strong>. Politica respectă Regulamentul (UE)
        2016/679 (GDPR) și Legea nr. 506/2004 privind prelucrarea datelor cu
        caracter personal în sectorul comunicațiilor electronice.
      </p>

      <h2>1. Ce sunt cookie-urile</h2>
      <p>
        Cookie-urile sunt fișiere text de mici dimensiuni stocate pe
        dispozitivul tău (calculator, telefon, tabletă) atunci când vizitezi un
        site web. Ele permit site-ului să rețină acțiunile și preferințele tale
        pe o anumită perioadă de timp. Folosim și tehnologii similare, precum
        stocarea locală a browserului (localStorage), în aceleași scopuri.
      </p>

      <h2>2. Tipuri de cookie-uri pe care le folosim</h2>
      <p>
        <strong>a) Cookie-uri strict necesare.</strong> Sunt esențiale pentru
        funcționarea site-ului (de exemplu, reținerea opțiunii tale privind
        cookie-urile, funcții de securitate, autentificarea zonei de
        administrare). Acestea nu pot fi dezactivate din bannerul de consimțământ
        și nu necesită acordul tău, conform legii.
      </p>
      <p>
        <strong>b) Cookie-uri de analiză/statistică.</strong> Ne ajută să
        înțelegem, în formă agregată și anonimizată, câți vizitatori avem și cum
        este folosit site-ul, pentru a-l îmbunătăți. Acestea se activează
        <strong> doar dacă îți exprimi consimțământul</strong> prin bannerul de
        cookie-uri.
      </p>

      <h2>3. Temeiul legal</h2>
      <p>
        Cookie-urile strict necesare sunt folosite în baza interesului legitim
        de a asigura funcționarea site-ului. Cookie-urile opționale (de analiză)
        sunt folosite exclusiv în baza consimțământului tău, pe care îl poți
        acorda sau refuza liber și pe care îl poți retrage oricând.
      </p>

      <h2>4. Consimțământul și retragerea lui</h2>
      <p>
        La prima vizită îți afișăm un banner prin care poți accepta toate
        cookie-urile sau respinge cookie-urile opționale. Îți poți schimba
        oricând opțiunea ștergând cookie-urile și datele site-ului din setările
        browserului, moment în care bannerul va reapărea la următoarea vizită.
      </p>

      <h2>5. Cum gestionezi cookie-urile din browser</h2>
      <p>
        Majoritatea browserelor îți permit să blochezi sau să ștergi
        cookie-urile din setări. Găsești instrucțiuni în secțiunea de ajutor a
        browserului tău (Chrome, Firefox, Safari, Edge etc.). Reține că
        dezactivarea cookie-urilor strict necesare poate afecta funcționarea
        site-ului.
      </p>

      <h2>6. Contact</h2>
      <p>
        Pentru orice întrebare legată de cookie-uri sau prelucrarea datelor, ne
        poți contacta folosind datele afișate în secțiunea „Date firmă” din
        subsolul site-ului.
      </p>
    </LegalPage>
  ),
});
