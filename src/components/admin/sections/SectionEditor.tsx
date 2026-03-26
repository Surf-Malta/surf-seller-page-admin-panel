"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";

interface SectionEditorProps {
  section: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, content: any) => void;
}

const FORM_CONFIG: Record<string, any[]> = {
  hero: [
    { name: "badge", label: "Badge Text", type: "text" },
    { name: "title", label: "Hero Title", type: "textarea" },
    { name: "subtitle", label: "Hero Subtitle", type: "textarea" },
    { name: "primaryCta", label: "Primary Button Text", type: "text" },
    { name: "secondaryCta", label: "Secondary Button Text", type: "text" },
    { name: "features", label: "Quick Features List", type: "list" },
    {
      name: "mainCard",
      label: "Main Image Card",
      type: "object",
      fields: [
        { name: "title", label: "Card Title", type: "text" },
        { name: "subtitle", label: "Card Subtitle", type: "textarea" },
        { name: "imageUrl", label: "Card Image URL", type: "image" },
      ],
    },
    {
      name: "revenueCard",
      label: "Revenue Stat Card",
      type: "object",
      fields: [
        { name: "title", label: "Card Title", type: "text" },
        { name: "value", label: "Revenue Value", type: "text" },
        { name: "change", label: "Growth Percentage", type: "text" },
        { name: "orders", label: "Orders Count", type: "text" },
        { name: "customers", label: "Customers Count", type: "text" },
      ],
    },
    {
      name: "maltaCard",
      label: "Malta Info Card",
      type: "object",
      fields: [
        { name: "title", label: "Card Title", type: "text" },
        { name: "subtitle", label: "Card Subtitle", type: "textarea" },
        { name: "imageUrl", label: "Card Image URL", type: "image" },
      ],
    },
    {
      name: "notifications",
      label: "Floating Notifications",
      type: "objectList",
      fields: [
        { name: "type", label: "Type (join | order)", type: "text" },
        { name: "title", label: "Notification Title", type: "text" },
        { name: "subtitle", label: "Notification Subtitle", type: "text" },
        { name: "imageUrl", label: "Profile/Icon URL", type: "image" },
      ],
    },
  ],
  stats: [
    {
      name: "stats",
      label: "Statistics",
      type: "objectList",
      fields: [
        { name: "label", label: "Label", type: "text" },
        { name: "value", label: "Value", type: "text" },
        { name: "iconName", label: "Icon Name (Users, Package, Star, Shield)", type: "text" },
      ],
    },
  ],
  "how-it-works": [
    { name: "badge", label: "Badge", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "subtitle", label: "Subtitle", type: "textarea" },
    {
      name: "steps",
      label: "Implementation Steps",
      type: "objectList",
      fields: [
        { name: "num", label: "Step #", type: "text" },
        { name: "title", label: "Step Title", type: "text" },
        { name: "desc", label: "Description", type: "textarea" },
      ],
    },
  ],
  features: [
    { name: "badge", label: "Badge", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "subtitle", label: "Subtitle", type: "textarea" },
    {
      name: "features",
      label: "Feature Blocks",
      type: "objectList",
      fields: [
        { name: "title", label: "Feature Title", type: "text" },
        { name: "content", label: "Feature Description", type: "textarea" },
        { name: "list", label: "Detail Points", type: "list" },
        { name: "imageUrl", label: "Icon/Image URL", type: "image" },
      ],
    },
  ],
  "mobile-app": [
    { name: "badge", label: "Badge", type: "text" },
    { name: "title", label: "Title", type: "textarea" },
    { name: "subtitle", label: "Subtitle", type: "textarea" },
    {
      name: "features",
      label: "App Highlights",
      type: "objectList",
      fields: [
        { name: "text", label: "Feature Text", type: "text" },
        { name: "iconName", label: "Icon (Bell, BarChart3, Zap)", type: "text" },
      ],
    },
    {
      name: "mockup",
      label: "Phone UI Simulation",
      type: "object",
      fields: [
        { name: "greeting", label: "Top Greeting", type: "text" },
        { name: "title", label: "Dashboard Title", type: "text" },
        { name: "revenueTitle", label: "Revenue Label", type: "text" },
        { name: "revenueValue", label: "Revenue Amount", type: "text" },
        { name: "revenueChange", label: "Revenue Trend", type: "text" },
        { name: "notificationTitle", label: "Alert Title", type: "text" },
        { name: "notificationSubtitle", label: "Alert Details", type: "text" },
        { name: "appBgImage", label: "App Screen Background", type: "image" },
      ],
    },
    {
      name: "floatingNotification",
      label: "Floating App Notification",
      type: "object",
      fields: [
        { name: "title", label: "Title", type: "text" },
        { name: "subtitle", label: "Subtitle", type: "text" },
      ],
    },
  ],
  testimonials: [
    { name: "badge", label: "Badge", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "subtitle", label: "Subtitle", type: "textarea" },
    {
      name: "testimonials",
      label: "Customer Reviews",
      type: "objectList",
      fields: [
        { name: "name", label: "Name", type: "text" },
        { name: "title", label: "Company/Role", type: "text" },
        { name: "quote", label: "Review Text", type: "textarea" },
        { name: "avatar", label: "Photo URL", type: "image" },
        { name: "stars", label: "Rating (1-5)", type: "number" },
      ],
    },
  ],
  faq: [
    { name: "badge", label: "Badge", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "subtitle", label: "Subtitle", type: "textarea" },
    {
      name: "questions",
      label: "FAQ Items",
      type: "objectList",
      fields: [
        { name: "question", label: "Question", type: "text" },
        { name: "answer", label: "Answer", type: "textarea" },
        { name: "category", label: "Category", type: "text" },
      ],
    },
  ],
  "get-started": [
    { name: "title", label: "Main Title", type: "text" },
    { name: "subtitle", label: "Subtitle", type: "textarea" },
    { name: "primaryCta", label: "Call to Action", type: "text" },
    { name: "footerNote", label: "Footer Disclaimer", type: "text" },
  ],
  footer: [
    {
      name: "columns",
      label: "Link Columns",
      type: "objectList",
      fields: [
        { name: "title", label: "Column Title", type: "text" },
        {
          name: "links",
          label: "Links",
          type: "objectList",
          fields: [
            { name: "label", label: "Link Label", type: "text" },
            { name: "href", label: "Link URL", type: "text" },
          ],
        },
      ],
    },
    {
      name: "socialLinks",
      label: "Social Media",
      type: "objectList",
      fields: [
        { name: "platform", label: "Platform Name", type: "text" },
        { name: "href", label: "Profile URL", type: "text" },
      ],
    },
    {
      name: "contact",
      label: "Contact Info",
      type: "object",
      fields: [
        { name: "email", label: "Support Email", type: "text" },
        { name: "phone", label: "Support Phone", type: "text" },
      ],
    },
    { name: "copyright", label: "Copyright Text", type: "text" },
  ],
};

export function SectionEditor({ section, isOpen, onClose, onSave }: SectionEditorProps) {
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    if (section) {
      setFormData(section.content || {});
    }
  }, [section]);

  if (!isOpen || !section) return null;

  const updateField = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(section.id, formData);
    onClose();
  };

  const renderInput = (field: any, value: any, onChange: (val: any) => void) => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        );
      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm resize-y"
          />
        );
      case "image":
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
            {value && (
              <div className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[10px] text-white font-bold uppercase">Preview</span>
                </div>
              </div>
            )}
          </div>
        );
      case "list":
        const list = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {list.map((item: string, idx: number) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newList = [...list];
                    newList[idx] = e.target.value;
                    onChange(newList);
                  }}
                  className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <button
                  onClick={() => onChange(list.filter((_, i) => i !== idx))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange([...list, ""])}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 p-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        );
      case "object":
        const obj = value || {};
        return (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            {field.fields.map((f: any) => (
              <div key={f.name}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                  {f.label}
                </label>
                {renderInput(f, obj[f.name], (val) => {
                  onChange({ ...obj, [f.name]: val });
                })}
              </div>
            ))}
          </div>
        );
      case "objectList":
        const items = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-4">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative group">
                <button
                  onClick={() => onChange(items.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-3">
                  {field.fields.map((f: any) => (
                    <div key={f.name}>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                        {f.label}
                      </label>
                      {renderInput(f, item[f.name], (val) => {
                        const newItems = [...items];
                        newItems[idx] = { ...newItems[idx], [f.name]: val };
                        onChange(newItems);
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newItem = {};
                field.fields.forEach((f: any) => {
                  (newItem as any)[f.name] = f.type === "number" ? 0 : f.type === "list" ? [] : "";
                });
                onChange([...items, newItem]);
              }}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all font-medium"
            >
              <Plus className="w-4 h-4" /> Add New {field.label.slice(0, -1)}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const fields = FORM_CONFIG[section.type] || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all"
        onClick={onClose}
      />
      
      {/* Slide-over */}
      <div className="relative w-full max-w-xl h-full bg-[#fcfcfd] shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="px-8 py-7 bg-white border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
              Edit {section.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded tracking-wider border border-blue-100">
                {section.type}
               </span>
               <span className="text-[11px] text-gray-400 font-medium">Design System v2.0</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
          {fields.map((field) => (
            <div key={field.name} className="animate-fade-in-up">
              <label className="block text-[12px] font-bold text-[#1e293b] uppercase tracking-wider mb-2.5">
                {field.label}
              </label>
              {renderInput(field, formData[field.name], (val) => updateField(field.name, val))}
            </div>
          ))}
          
          <div className="mt-12 p-5 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-blue-100 rounded-2xl">
            <h4 className="flex items-center gap-2 text-[11px] font-bold text-blue-800 uppercase tracking-widest mb-2">
              <Plus className="w-3 h-3" /> Live Preview Tip
            </h4>
            <p className="text-[12px] text-blue-700/80 leading-relaxed font-medium">
              Changes saved here will reflect immediately on the Surf Seller landing page. Ensure images are high-quality URLs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t border-gray-100 flex items-center justify-end gap-3 shadow-[0_-4_20px_-10px_rgba(0,0,0,0.05)]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2.5 px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            Publish Changes
          </button>
        </div>
      </div>
    </div>
  );
}
