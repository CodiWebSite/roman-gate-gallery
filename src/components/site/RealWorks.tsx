import { useState, useRef, useEffect, useCallback } from "react";
import { Reveal } from "@/components/Reveal";
import { usePublishedProjects, usePublishedPhotos } from "@/lib/site";
import { MapPin, Images, X, ChevronLeft, ChevronRight } from "lucide-react";

type GalleryImage = { id: string; image_url: string; alt_text: string | null };

export function RealWorks() {
  const { data: allProjects, isLoading } = usePublishedProjects();
  const { data: photoMap } = usePublishedPhotos();
  const projects = (allProjects ?? []).filter((p) => p.kind === "real");

  const [images, setImages] = useState<GalleryImage[] | null>(null);
  const [openTitle, setOpenTitle] = useState("");
  const [index, setIndex] = useState(0);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  const openGallery = (imgs: GalleryImage[], title: string) => {
    setImages(imgs);
    setOpenTitle(title);
    setIndex(0);
    setScale(1);
    setPan({ x: 0, y: 0 });
  };
  const close = () => {
    setImages(null);
    setScale(1);
    setPan({ x: 0, y: 0 });
  };
  const prev = () => {
    setIndex((i) => (images ? (i - 1 + images.length) % images.length : 0));
    setScale(1);
    setPan({ x: 0, y: 0 });
  };
  const next = () => {
    setIndex((i) => (images ? (i + 1) % images.length : 0));
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleZoom = () => {
    setScale((s) => (s === 1 ? 2.5 : 1));
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (scale === 1) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    dragStart.current = { x: e.clientX, y: e.clientY };
  }, [scale]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || scale === 1) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, [dragging, scale]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const moved =
      Math.abs(e.clientX - dragStart.current.x) > 4 ||
      Math.abs(e.clientY - dragStart.current.y) > 4;
    setDragging(false);
    if (!moved) toggleZoom();
  }, [dragging]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) setScale((s) => Math.min(s + 0.4, 4));
    else
      setScale((s) => {
        const ns = Math.max(s - 0.4, 1);
        if (ns === 1) setPan({ x: 0, y: 0 });
        return ns;
      });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!images) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images]);

  if (!isLoading && projects.length === 0) return null;

  return (
    <section id="lucrari-reale" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Portofoliu
          </p>
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            Lucrări realizate de noi
          </h2>
          <p className="mt-4 text-muted-foreground">
            Poze reale ale porților montate la clienții noștri — lucrări finalizate,
            din lemn masiv, exact așa cum arată la fața locului.
          </p>
        </Reveal>

        {isLoading ? (
          <p className="mt-12 text-center text-muted-foreground">Se încarcă...</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => {
              const extraPhotos = photoMap?.[p.id] ?? [];
              const allPhotos: GalleryImage[] = [
                { id: `cover-${p.id}`, image_url: p.image_url, alt_text: p.alt_text },
                ...extraPhotos,
              ];
              return (
                <Reveal key={p.id} delay={(i % 3) * 80}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                    <button
                      type="button"
                      onClick={() => openGallery(allPhotos, p.title)}
                      className="relative aspect-[4/3] overflow-hidden"
                      aria-label={`Vezi pozele pentru ${p.title}`}
                    >
                      <img
                        src={p.image_url}
                        alt={p.alt_text || p.title}
                        loading="lazy"
                        width={1024}
                        height={768}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {extraPhotos.length > 0 && (
                        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                          <Images className="h-3.5 w-3.5" /> {allPhotos.length}
                        </span>
                      )}
                    </button>
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
                      {extraPhotos.length > 0 && (
                        <button
                          type="button"
                          onClick={() => openGallery(allPhotos, p.title)}
                          className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                        >
                          <Images className="h-4 w-4" />
                          Vezi pozele ({allPhotos.length})
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

      {images && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Galerie ${openTitle}`}
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
            className="relative flex max-h-full w-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 text-center text-white">
              <p className="text-base font-semibold">{openTitle}</p>
              {images.length > 1 && (
                <p className="text-sm text-white/70">
                  {index + 1} / {images.length}
                </p>
              )}
            </div>

            <div className="relative flex w-full items-center justify-center">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  aria-label="Imaginea anterioară"
                  className="absolute left-3 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-transform hover:scale-110 hover:bg-white"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
              )}

              <div
                className="relative flex max-h-[70vh] w-full items-center justify-center overflow-hidden rounded-xl"
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{ cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in" }}
              >
                <img
                  src={images[index].image_url}
                  alt={images[index].alt_text || openTitle}
                  className="max-h-[70vh] w-auto select-none object-contain transition-transform"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                  }}
                  draggable={false}
                />
              </div>

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  aria-label="Imaginea următoare"
                  className="absolute right-3 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-transform hover:scale-110 hover:bg-white"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
