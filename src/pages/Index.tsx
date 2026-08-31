import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollStory } from "@/components/home/ScrollStory";
import { ProductBenefits } from "@/components/home/ProductBenefits";
import { ProductDesigns } from "@/components/home/ProductDesigns";
import { CTA } from "@/components/home/CTA";
import { Testimonials } from "@/components/home/Testimonials";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="SmartCard — NFC Business Cards & Digital Bio-Link Profiles"
        description="Programmable NFC cards paired with a hosted bio-link profile. One tap shares your links, contact, and portfolio — no app required."
        path="/"
      />
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* Eager (not lazy): it's the first paint of the page, so any code-split
            round-trip would show as a visible delay on slower connections. */}
        <ScrollStory />
        <ProductBenefits />
        <ProductDesigns />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
