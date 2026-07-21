"use client";

import { useState } from "react";
import AudienceSwitcher from "@/components/landing/audience-switcher";
import FeatureGrid from "@/components/landing/feature-grid";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import Navbar from "@/components/landing/navbar";
import WorkflowSection from "@/components/landing/workflow-section";
import CTASection from "@/components/landing/cta-section";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <main className="relative overflow-hidden pt-16 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.06),transparent_30%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.04),transparent_28%),linear-gradient(180deg,rgba(255,255,255,1),rgba(255,255,255,1))]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        <Navbar walletConnected={walletConnected} setWalletConnected={setWalletConnected} />

        <div className="flex flex-1 flex-col gap-5 py-2 lg:gap-6 lg:py-3">
          <Hero walletConnected={walletConnected} setWalletConnected={setWalletConnected} />
          <FeatureGrid />
          <AudienceSwitcher walletConnected={walletConnected} setWalletConnected={setWalletConnected} />
          <WorkflowSection />
          <CTASection />
          <Footer />
        </div>
      </div>
    </main>
  );
}

