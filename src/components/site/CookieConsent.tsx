import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "pdl_cookie_consent_v1";

type ConsentValue = "accepted" | "rejected";

export function getCookieConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Show only after hydration to avoid SSR mismatch
    if (getCookieConsent() === null) setVisible(true);
  }, []);

  const decide = (value: ConsentValue) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
      window.dispatchEvent(new CustomEvent("cookie-consent", { detail: value }));
    } catch {
      /* ignore storage errors */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Notificare cookie-uri"
      className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Acest site folosește cookie-uri</p>
            <p className="mt-1">
              Folosim cookie-uri strict necesare pentru funcționarea site-ului și,
              cu acordul tău, cookie-uri de analiză pentru a înțelege cum este
              folosit site-ul. Poți accepta sau respinge cookie-urile opționale.
              Detalii în{" "}
              <Link to="/cookies" className="text-primary underline hover:no-underline">
                Politica de cookies
              </Link>{" "}
              și{" "}
              <Link to="/confidentialitate" className="text-primary underline hover:no-underline">
                Politica de confidențialitate
              </Link>
              .
            </p>

            {showDetails && (
              <div className="mt-4 space-y-3 rounded-xl border border-border bg-cream p-4">
                <div>
                  <p className="font-medium text-foreground">Cookie-uri strict necesare</p>
                  <p className="mt-0.5">
                    Esențiale pentru funcționarea site-ului (ex. sesiune, securitate).
                    Sunt întotdeauna active și nu necesită consimțământ.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Cookie-uri de analiză</p>
                  <p className="mt-0.5">
                    Ne ajută să măsurăm traficul și performanța, în formă agregată.
                    Se activează doar dacă le accepți.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={() => decide("accepted")}
                className="rounded-full bg-gradient-warm px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
              >
                Accept toate
              </button>
              <button
                onClick={() => decide("rejected")}
                className="rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Respinge cele opționale
              </button>
              <button
                onClick={() => setShowDetails((v) => !v)}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground underline hover:text-foreground"
              >
                {showDetails ? "Ascunde detalii" : "Detalii"}
              </button>
            </div>
          </div>

          <button
            onClick={() => decide("rejected")}
            aria-label="Închide și respinge cookie-urile opționale"
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
