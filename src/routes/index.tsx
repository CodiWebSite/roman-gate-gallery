import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Services } from "@/components/site/Services";
import { Portfolio } from "@/components/site/Portfolio";
import { RealWorks } from "@/components/site/RealWorks";
import { Videos } from "@/components/site/Videos";
import { Process } from "@/components/site/Process";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

const title = "Porți Din Lemn | Porți din lemn și stejar în România";
const description =
  "Porți mândre românești din lemn masiv și stejar. Portofoliu, servicii de execuție, montaj și recondiționare porți din lemn.";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Porți Din Lemn",
  description,
  image: "/images/hero.jpg",
  slogan: "Porți mândre românești",
  address: {
    "@type": "PostalAddress",
    addressCountry: "RO",
  },
  makesOffer: [
    "Porți din lemn masiv",
    "Porți din stejar",
    "Porți rustice tradiționale",
    "Porți moderne din lemn",
    "Recondiționare porți",
    "Montaj și consultanță",
  ].map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s } })),
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/images/hero.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/images/hero.jpg" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(jsonLd) },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Videos />
        <Process />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
