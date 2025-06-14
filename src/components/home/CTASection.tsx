"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function CTASection() {
  const { pageContent, loading } = useSelector(
    (state: RootState) => state.content
  );

  if (loading) {
    return (
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-blue-400 rounded mb-4"></div>
            <div className="h-4 bg-blue-400 rounded mb-8"></div>
            <div className="h-12 bg-blue-400 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  const ctaContent = pageContent?.cta;

  if (!ctaContent) {
    return null;
  }

  return (
    <section className={`py-20 ${ctaContent.backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {ctaContent.title}
        </h2>
        <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
          {ctaContent.description}
        </p>
        <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
          {ctaContent.buttonText}
        </button>
      </div>
    </section>
  );
}
