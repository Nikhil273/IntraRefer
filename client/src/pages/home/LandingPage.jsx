import Hero from "./Hero";
import Stats from "./Stats";
import Features from "./Features";
import Pricing from "./Pricing";
import Testimonials from "./Testimonials";
import CTA from "./CTA";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Stats />
      <Features />
      <Pricing />
      <Testimonials />
      <CTA />
    </div>
  );
};

export default LandingPage;
