import AudienceSwitcher from "@/components/landing/audience-switcher";
import FeatureGrid from "@/components/landing/feature-grid";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import Navbar from "@/components/landing/navbar";
import WorkflowSection from "@/components/landing/workflow-section";
import CTASection from "@/components/landing/cta-section";

export default function Home() {
  return (
    <main className="relative overflow-hidden pt-20 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,29,72,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(190,18,60,0.06),transparent_28%),linear-gradient(180deg,rgba(127,29,29,0.03),transparent_42%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        <Navbar />

        <div className="flex flex-1 flex-col gap-6 py-6 lg:gap-8 lg:py-8">
          <Hero />
          <FeatureGrid />
          <AudienceSwitcher />
          <WorkflowSection />
          <CTASection />
          <Footer />
        </div>
      </div>
    </main>
  );
}

