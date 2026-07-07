import { Reveal } from "@/components/Reveal";
import { Hammer, TreePine, ShieldCheck, Mountain, Layers } from "lucide-react";

const POINTS = [
  { icon: Hammer, title: "Lucru manual", text: "Fiecare poartă este făcută cu drag, cu mândrie și dor de lucru fain." },
  { icon: Mountain, title: "Lemn și piatră", text: "Îmbinăm lemn masiv cu placaj din piatră, pentru o lucrare frumoasă și trainică." },
  { icon: Layers, title: "Structură solidă", text: "Rezistență din beton armat, cadru metalic la foaie și stâlpi — nu se lasă niciun milimetru." },
  { icon: TreePine, title: "Acoperiș din lemn", text: "Lemn masiv pentru corpul porții și pentru acoperiș, finisat natural." },
  { icon: ShieldCheck, title: "Trainic în timp", text: "Construim să fie bine, trainic și plăcut, pentru generații." },
];

export function About() {
  return (
    <section id="despre" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Intro */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Despre noi
            </p>
            <h2 className="text-balance font-display text-3xl font-bold sm:text-5xl">
              Porți mândre românești
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-balance text-lg leading-relaxed text-muted-foreground">
              Bun venit! Construim porți cu puțină mândrie și cu drag de lucru bun
              și frumos. Să fie trainic și bine plăcut. În gânduri suntem Români,
              în trăiri tot așa, în simțiri la fel, în cuget și inimi așijderea.
              Și ne este de ajuns.
            </p>
          </Reveal>
        </div>

        {/* Pull quote */}
        <Reveal delay={150}>
          <blockquote className="mx-auto mt-12 max-w-2xl border-l-4 border-primary pl-6 text-left">
            <p className="text-balance font-display text-xl italic leading-relaxed text-foreground sm:text-2xl">
              „Poarta este delimitarea casei de restul înconjurător, o emblemă a
              ceea ce înseamnă proprietatea. O poartă poate să aibă personalitate.”
            </p>
          </blockquote>
        </Reveal>

        {/* Two columns: text + points */}
        <div className="mt-16 grid items-start gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="space-y-5 text-muted-foreground">
              <p>
                Am construit câteva modele de porți, toate cu drag și dor de lucru
                fain, bun și Românesc. Dacă vă place un model, vă așteptăm. Dacă
                aveți dumneavoastră unul, vorbim. Putem și vrem să facem să fie bine.
              </p>
              <p>
                Porțile au structură de rezistență din beton armat, iar la exterior
                le placăm cu piatră. Folosim lemn masiv pentru o parte din corpul
                porții și pentru acoperiș, îmbinând lemnul și piatra într-o lucrare
                frumoasă și trainică.
              </p>
              <p>
                Foaia de poartă are cadru metalic, la fel și stâlpii, pentru a fi
                siguri că nu se va lăsa niciun milimetru.
              </p>
              <p className="font-medium text-foreground">
                Mai sunt multe de spus. Dacă aveți plăcerea, vorbim. Mulțumim de vizită.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4">
            {POINTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-warm text-primary-foreground">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
