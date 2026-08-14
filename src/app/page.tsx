'use client';

import React, { useState, useEffect } from 'react';
import LandingNavbar from '@/components/layout/LandingNavbar';
import LandingFooter from '@/components/layout/LandingFooter';
import Hero from '@/components/features/landing/hero';
import FeatureGrid from '@/components/features/landing/feature-grid';
import AudienceSwitcher from '@/components/features/landing/audience-switcher';
import WorkflowSection from '@/components/features/landing/workflow-section';
import DoctorsShowcase from '@/components/features/landing/doctors-showcase';
import CTASection from '@/components/features/landing/cta-section';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const callback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(callback, observerOptions);
    const targets = document.querySelectorAll('.reveal-on-scroll, .reveal-left, .reveal-right, .reveal-scale');

    targets.forEach((target) => observer.observe(target));

    return () => {
      targets.forEach((target) => observer.unobserve(target));
    };
  }, []);

  return (
    <main className="relative overflow-hidden pt-16 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.06),transparent_30%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.04),transparent_28%),linear-gradient(180deg,rgba(255,255,255,1),rgba(255,255,255,1))]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        <LandingNavbar walletConnected={walletConnected} setWalletConnected={setWalletConnected} />

        <div className="flex flex-1 flex-col gap-5 py-2 lg:gap-6 lg:py-3">
          <Hero walletConnected={walletConnected} setWalletConnected={setWalletConnected} />
          <FeatureGrid />
          <AudienceSwitcher />
          <WorkflowSection />
          <DoctorsShowcase />
          <CTASection />
          <LandingFooter />
        </div>
      </div>
    </main>
  );
}
