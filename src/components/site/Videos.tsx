import { useState, useEffect, useCallback } from "react";
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { usePublishedVideos } from "@/lib/site";

type SiteVideo = {
  id: string;
  title: string;
  description?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  featured?: boolean | null;
};

export function Videos() {
  const { data: videos, isLoading } = usePublishedVideos();
  const list = videos ?? [];
  const featured = list.find((v) => v.featured) ?? list[0];
  const rest = list.filter((v) => v.id !== featured?.id);
  const ordered: SiteVideo[] = featured ? [featured, ...rest] : list;

  const [index, setIndex] = useState<number | null>(null);
  const active = index !== null ? ordered[index] : null;

  const open = (v: SiteVideo) => setIndex(ordered.findIndex((o) => o.id === v.id));
  const close = () => setIndex(null);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + ordered.length) % ordered.length)),
    [ordered.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % ordered.length)),
    [ordered.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft" && ordered.length > 1) prev();
      if (e.key === "ArrowRight" && ordered.length > 1) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, ordered.length, prev, next]);

  if (!isLoading && list.length === 0) return null;

  const Thumbnail = ({
    video,
    rounded = "rounded-2xl",
  }: {
    video: SiteVideo;
    rounded?: string;
  }) => (
    <button
      type="button"
      onClick={() => open(video)}
      aria-label={`Redă video: ${video.title}`}
      className={`group relative block aspect-video w-full overflow-hidden ${rounded} bg-black`}
    >
      {video.thumbnail_url ? (
        <img
          src={video.thumbnail_url}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card transition-transform group-hover:scale-110">
          <Play className="ml-1 h-7 w-7 fill-current" />
        </span>
      </span>
    </button>
  );

  return (
    <section id="video" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Video
          </p>
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            La noi în atelier
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            În clip vezi cum lucrăm porțile din lemn: de la alegerea scândurilor
            și tăierea pe măsură, până la montaj și finisajul final. Apasă pe
            imagine ca să pornești filmarea.
          </p>
        </Reveal>

        {isLoading ? (
          <p className="mt-12 text-center text-muted-foreground">Se încarcă...</p>
        ) : (
          <div className="mt-10 space-y-8">
            {featured && (
              <Reveal>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  <Thumbnail video={featured} rounded="rounded-none" />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold">{featured.title}</h3>
                    {featured.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{featured.description}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            )}

            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((v, i) => (
                  <Reveal key={v.id} delay={(i % 3) * 80}>
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                      <Thumbnail video={v} rounded="rounded-none" />
                      <div className="p-4">
                        <h3 className="font-semibold">{v.title}</h3>
                        {v.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Video ${active.title}`}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Închide"
            className="absolute right-4 top-4 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-colors hover:bg-white"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative flex w-full max-w-4xl flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {ordered.length > 1 && (
              <div className="mb-3 text-center text-sm text-white/70">
                {index! + 1} / {ordered.length}
              </div>
            )}

            <div className="relative flex items-center justify-center">
              {ordered.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  aria-label="Video anterior"
                  className="absolute left-2 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-transform hover:scale-110 hover:bg-white sm:-left-16"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
              )}

              <div className="w-full overflow-hidden rounded-xl bg-card shadow-card">
                <div className="aspect-video w-full bg-black">
                  <video
                    key={active.id}
                    controls
                    autoPlay
                    preload="auto"
                    poster={active.thumbnail_url || undefined}
                    className="h-full w-full"
                  >
                    <source src={active.video_url} />
                  </video>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{active.title}</h3>
                  {active.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{active.description}</p>
                  )}
                </div>
              </div>

              {ordered.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  aria-label="Video următor"
                  className="absolute right-2 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-transform hover:scale-110 hover:bg-white sm:-right-16"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              )}
            </div>

            {ordered.length > 1 && (
              <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-1">
                {ordered.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                    aria-label={`Vezi video: ${v.title}`}
                    className={`relative aspect-video h-14 flex-shrink-0 overflow-hidden rounded-md bg-black transition-all ${
                      i === index ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt={v.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        <Play className="h-4 w-4 fill-current text-white" />
                      </span>
                    )}
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
