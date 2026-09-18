import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { cachedGet } from "@/lib/axios";
import SkeletonLoader from "@/components/SkeletonLoader";
// searchParams is available as a prop in server components

const Services = dynamic(() => import("@/components/Services"), {
  ssr: true,
  loading: () => <SkeletonLoader height="h-[600px]" />
});
const Portfolio = dynamic(() => import("@/components/Portfolio"), {
  ssr: true,
  loading: () => <SkeletonLoader height="h-[800px]" />
});
const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  ssr: true,
  loading: () => <SkeletonLoader height="h-[700px]" />
});
const Process = dynamic(() => import("@/components/Process"), {
  ssr: true,
  loading: () => <SkeletonLoader height="h-[700px]" />
});
const FAQ = dynamic(() => import("@/components/FAQ"), {
  ssr: true,
  loading: () => <SkeletonLoader height="h-[600px]" />
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: true,
  loading: () => <SkeletonLoader height="h-[400px]" />
});

import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // GLOBAL ERROR SIMULATION FOR TESTING
  if (searchParams?.simulate_error === "global") {
    throw new Error("Simulated Global Page Error for testing error.tsx!");
  }

  return (
    <main className="relative bg-background min-h-screen">
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Hero />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Services />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Portfolio />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Testimonials />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Process />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <FAQ />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </main>
  );
}
