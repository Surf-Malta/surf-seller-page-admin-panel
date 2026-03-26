"use client";

import React from "react";
import { 
  X, 
  Layout, 
  Hash, 
  ListChecks, 
  Zap, 
  Smartphone, 
  MessageSquare, 
  HelpCircle, 
  MousePointer2,
  Navigation
} from "lucide-react";

interface SectionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
}

const SECTION_TEMPLATES = [
  {
    type: "hero",
    name: "Hero Section",
    description: "Main headline, value proposition, and primary call-to-action.",
    icon: Layout,
    color: "bg-blue-500",
  },
  {
    type: "stats",
    name: "Stats Strip",
    description: "Display key metrics, active sellers, or performance data.",
    icon: Hash,
    color: "bg-emerald-500",
  },
  {
    type: "how-it-works",
    name: "How It Works",
    description: "Step-by-step guide for new users or processes.",
    icon: ListChecks,
    color: "bg-purple-500",
  },
  {
    type: "features",
    name: "Features Grid",
    description: "Showcase the best modules and tools your platform offers.",
    icon: Zap,
    color: "bg-amber-500",
  },
  {
    type: "mobile-app",
    name: "Mobile App",
    description: "Promote mobile features with a phone mockup and notifications.",
    icon: Smartphone,
    color: "bg-indigo-500",
  },
  {
    type: "testimonials",
    name: "Testimonials",
    description: "Social proof with customer quotes and star ratings.",
    icon: MessageSquare,
    color: "bg-pink-500",
  },
  {
    type: "faq",
    name: "FAQ Section",
    description: "Answer common questions in an accordion format.",
    icon: HelpCircle,
    color: "bg-gray-500",
  },
  {
    type: "get-started",
    name: "Call to Action",
    description: "Final push for users to register or get started.",
    icon: MousePointer2,
    color: "bg-orange-500",
  },
  {
    type: "footer",
    name: "Footer Section",
    description: "Navigation links, social media, and contact information.",
    icon: Navigation,
    color: "bg-slate-700",
  },
  {
    type: "custom-layout",
    name: "Custom Layout",
    description: "Design your own UI by adding and arranging modular content blocks.",
    icon: Layout,
    color: "bg-gradient-to-br from-indigo-500 to-purple-600",
  },
];

export function SectionPicker({ isOpen, onClose, onSelect }: SectionPickerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Section</h2>
            <p className="text-sm text-gray-500 mt-1">Choose a template to add to your landing page.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTION_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.type}
                  onClick={() => onSelect(template.type)}
                  className="flex flex-col text-left group p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all active:scale-[0.98]"
                >
                  <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center mb-4 text-white shadow-sm ring-4 ring-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {template.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
