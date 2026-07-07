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

const SITE_URL = "https://portidinlemn.ro";
const title = "Porți din lemn masiv și stejar | Modele porți tradiționale";
const description =
  "Porți din lemn masiv și stejar lucrate manual: porți mari, masive, tradiționale și cu acoperiș. Vezi modele de porți, portofoliu real și cere ofertă rapid pe WhatsApp.";
const ogImage = `${SITE_URL}/images/hero.jpg`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": SITE_URL,
  name: "Porți Din Lemn",
  description,
  url: SITE_URL,
  image: ogImage,
  slogan: "Porți mândre românești",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressCountry: "RO",
  },
  areaServed: { "@type": "Country", name: "România" },
  makesOffer: [
    "Porți din lemn masiv",
    "Porți din stejar",
    "Porți mari și masive",
    "Porți tradiționale rustice",
    "Porți cu acoperiș",
    "Modele de porți din lemn moderne",
    "Recondiționare porți din lemn",
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
        <RealWorks />
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
