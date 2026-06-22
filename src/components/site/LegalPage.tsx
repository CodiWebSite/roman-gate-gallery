import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Înapoi la site
          </Link>
        </div>
      </div>
      <article className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <div className="mt-6 space-y-4 text-muted-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground">
          {children}
        </div>
        <p className="mt-10 rounded-xl border border-border bg-cream p-4 text-sm text-muted-foreground">
          Conținutul juridic este orientativ și trebuie validat cu un consultant
          juridic înainte de publicare.
        </p>
      </article>
    </div>
  );
}
