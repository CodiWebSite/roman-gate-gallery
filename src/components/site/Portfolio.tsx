import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { CATEGORIES, categoryLabel, usePublishedProjects } from "@/lib/site";
import { MapPin } from "lucide-react";

export function Portfolio() {
  const { data: projects, isLoading } = usePublishedProjects();
  const [filter, setFilter] = useState<string>("all");

  const filtered = (projects ?? []).filter(
    (p) => filter === "all" || p.category === filter,
  );

  return (
    <section id="portofoliu" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Portofoliu
          </p>
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            Lucrări realizate de noi
          </h2>
        </Reveal>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Toate
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c.value} active={filter === c.value} onClick={() => setFilter(c.value)}>
              {c.label}
            </FilterChip>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-12 text-center text-muted-foreground">Se încarcă...</p>
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">Nu există lucrări în această categorie.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 80}>
                <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={p.image_url}
                      alt={p.alt_text || p.title}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                        {categoryLabel(p.category)}
                      </span>
                      {p.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {p.location}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    {p.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-gradient-warm text-primary-foreground shadow-soft"
          : "border border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
