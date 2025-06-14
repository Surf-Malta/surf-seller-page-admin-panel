"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function HeroSection() {
  const { pageContent, loading } = useSelector(
    (state: RootState) => state.content
  );

  if (loading) {
    return (
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-blue-400 rounded mb-4"></div>
              <div className="h-6 bg-blue-400 rounded mb-6"></div>
              <div className="h-4 bg-blue-400 rounded mb-8"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const heroContent = pageContent?.hero;

  if (!heroContent) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {heroContent.title}
          </h1>
          <h2 className="text-xl md:text-2xl font-light mb-6 text-blue-100">
            {heroContent.subtitle}
          </h2>
          <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            {heroContent.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              {heroContent.primaryButtonText}
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              {heroContent.secondaryButtonText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
