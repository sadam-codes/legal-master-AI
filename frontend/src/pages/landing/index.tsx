import Hero from "../landing/components/Hero";
import Services from "../landing/components/Services";
import About from "../landing/components/About";
import Testimonials from "../landing/components/Testimonials";
import Pricing from "../landing/components/Pricing";
import CTA from "../landing/components/CTA";
import { Layout } from "../../components/layout/Layout";

export default function LandingPage() {
  return (
    <Layout>
      <div className="min-h-screen mx-4 sm:mx-8 md:mx-12 lg:mx-20 overflow-x-hidden">
        <Hero />
        <Services />
        <About />
        <Pricing />
        <Testimonials />
        <CTA />
      </div>
    </Layout>
  );
}
