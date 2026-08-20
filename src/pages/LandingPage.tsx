import { useEffect } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingVideoShowcase } from "@/components/landing/LandingVideoShowcase";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingAIWorkflow } from "@/components/landing/LandingAIWorkflow";
import { LandingFooter } from "@/components/landing/LandingFooter";

const LandingPage = () => {
  useEffect(() => {
    document.title = "FloorPlan Management System | AI Architectural Intelligence";
  }, []);

  const handleWatchDemo = () => {
    const el = document.getElementById("showcase");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavigateToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] selection:bg-sky-500/30 selection:text-sky-300 font-sans">
      {/* NAVBAR */}
      <LandingNavbar onNavigateToSection={handleNavigateToSection} />

      {/* MAIN CONTENT */}
      <main>
        {/* HERO SECTION */}
        <LandingHero onWatchDemo={handleWatchDemo} />

        {/* MULTIMEDIA VIDEO SHOWCASE SECTION */}
        <LandingVideoShowcase />

        {/* FEATURES GRID SECTION */}
        <LandingFeatures />

        {/* AI WORKFLOW & PIPELINE SECTION */}
        <LandingAIWorkflow />
      </main>

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;

