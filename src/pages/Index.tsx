import { useTenant } from "@/contexts/TenantProvider";

// Global homepage (existing UI – unchanged)
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PricingPreview from "@/components/home/PricingPreview";
import CTASection from "@/components/home/CTASection";

// Tenant website (theme)
import Theme1Layout from "@/themes/coaching/theme1/Theme1Layout";
import Theme1Hero from "@/themes/coaching/theme1/Theme1Hero";
import Theme1Stats from "@/themes/coaching/theme1/Theme1Stats";
import Theme1CoursesPreview from "@/themes/coaching/theme1/Theme1CoursesPreview";
import Theme1Testimonials from "@/themes/coaching/theme1/Theme1Testimonials";
import Theme1CTA from "@/themes/coaching/theme1/Theme1CTA";

const Index = () => {
  const { isTenantDomain, loading, tenant } = useTenant();

  // ⏳ Wait for tenant to load
  if (isTenantDomain && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  // ❌ Invalid tenant slug
  if (isTenantDomain && !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-semibold">
          Coaching website not found
        </h1>
      </div>
    );
  }

  // 🟦 TENANT WEBSITE
  if (isTenantDomain && tenant) {
    return (
      <Theme1Layout>
        <Theme1Hero />
        <Theme1Stats />
        <Theme1CoursesPreview />
        <Theme1Testimonials />
        <Theme1CTA />
      </Theme1Layout>
    );
  }

  // 🟢 GLOBAL HOMEPAGE (univ.live)
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
