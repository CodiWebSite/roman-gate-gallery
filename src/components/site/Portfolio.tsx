import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { usePublishedProjects, usePublishedSketches, type ProjectSketch } from "@/lib/site";
import { MapPin, Ruler, X, ChevronLeft, ChevronRight } from "lucide-react";

export function Portfolio() {
  const { data: projects, isLoading } = usePublishedProjects();
  const { data: sketchMap } = usePublishedSketches();

  const [openSketches, setOpenSketches] = useState<ProjectSketch[] | null>(null);
  const [openTitle, setOpenTitle] = useState("");
  const [index, setIndex] = useState(0);

  const openGallery = (sketches: ProjectSketch[], title: string) => {
    setOpenSketches(sketches);
    setOpenTitle(title);
    setIndex(0);
  };
  const close = () => setOpenSketches(null);
  const prev = () =>
    setIndex((i) => (openSketches ? (i - 1 + openSketches.length) % openSketches.length : 0));
  const next = () =>
    setIndex((i) => (openSketches ? (i + 1) % openSketches.length : 0));

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

        {isLoading ? (
          <p className="mt-12 text-center text-muted-foreground">Se încarcă...</p>
        ) : (projects ?? []).length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">Nicio lucrare momentan.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(projects ?? []).map((p, i) => {
              const sketches = sketchMap?.[p.id] ?? [];
              return (
                <Reveal key={p.id} delay={(i % 3) * 80}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
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
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-2 flex items-center justify-end gap-2">
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
                      {sketches.length > 0 && (
                        <button
                          type="button"
                          onClick={() => openGallery(sketches, p.title)}
                          className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                        >
                          <Ruler className="h-4 w-4" />
                          Vezi schița{sketches.length > 1 ? `e (${sketches.length})` : ""}
                        </button>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {openSketches && openSketches.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Schițe ${openTitle}`}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Închide"
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative flex max-h-full w-full max-w-4xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 text-center text-white">
              <p className="text-base font-semibold">{openTitle} — schiță cu dimensiuni</p>
              {openSketches.length > 1 && (
                <p className="text-sm text-white/70">
                  {index + 1} / {openSketches.length}
                </p>
              )}
            </div>

            <div className="relative flex w-full items-center justify-center">
              {openSketches.length > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Schița anterioară"
                  className="absolute left-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              <img
                src={openSketches[index].image_url}
                alt={openSketches[index].alt_text || `Schiță ${openTitle}`}
                className="max-h-[78vh] w-auto max-w-full rounded-lg bg-white object-contain"
              />

              {openSketches.length > 1 && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Schița următoare"
                  className="absolute right-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {openSketches.length > 1 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {openSketches.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Schița ${i + 1}`}
                    className={`h-14 w-14 overflow-hidden rounded-md border-2 transition-colors ${
                      i === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={s.image_url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
