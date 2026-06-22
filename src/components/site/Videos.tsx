import { Reveal } from "@/components/Reveal";
import { usePublishedVideos } from "@/lib/site";

export function Videos() {
  const { data: videos, isLoading } = usePublishedVideos();
  const list = videos ?? [];
  const featured = list.find((v) => v.featured) ?? list[0];
  const rest = list.filter((v) => v.id !== featured?.id);

  if (!isLoading && list.length === 0) return null;

  return (
    <section id="video" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Video
          </p>
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            Vezi-ne la lucru
          </h2>
        </Reveal>

        {isLoading ? (
          <p className="mt-12 text-center text-muted-foreground">Se încarcă...</p>
        ) : (
          <div className="mt-10 space-y-8">
            {featured && (
              <Reveal>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  <div className="aspect-video bg-black">
                    <video
                      controls
                      preload="none"
                      poster={featured.thumbnail_url || undefined}
                      className="h-full w-full"
                    >
                      <source src={featured.video_url} />
                    </video>
                  </div>
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
                      <div className="aspect-video bg-black">
                        <video
                          controls
                          preload="none"
                          poster={v.thumbnail_url || undefined}
                          className="h-full w-full"
                        >
                          <source src={v.video_url} />
                        </video>
                      </div>
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
    </section>
  );
}
