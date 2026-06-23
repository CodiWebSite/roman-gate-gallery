import { useState } from "react";
import { Play, X } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { usePublishedVideos } from "@/lib/site";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [active, setActive] = useState<SiteVideo | null>(null);

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
      onClick={() => setActive(video)}
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

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-4xl border-border bg-card p-0">
          {active && (
            <>
              <DialogTitle className="sr-only">{active.title}</DialogTitle>
              <DialogDescription className="sr-only">
                {active.description || `Video: ${active.title}`}
              </DialogDescription>
              <DialogClose
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-card transition-colors hover:bg-background"
                aria-label="Închide"
              >
                <X className="h-5 w-5" />
              </DialogClose>
              <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-black">
                <video
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
