"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";

interface SectionEditorProps {
  section: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, content: any) => void;
}

export function SectionEditor({ section, isOpen, onClose, onSave }: SectionEditorProps) {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (section) {
      setContent(JSON.stringify(section.content, null, 2));
      setError(null);
    }
  }, [section]);

  if (!isOpen || !section) return null;

  const handleSave = () => {
    try {
      const parsedContent = JSON.parse(content);
      onSave(section.id, parsedContent);
      onClose();
    } catch (e) {
      setError("Invalid JSON format. Please check your syntax.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Slide-over */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit {section.name}</h2>
            <p className="text-sm text-gray-500 uppercase tracking-wider mt-0.5">{section.type} content</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content JSON
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full h-[calc(100vh-250px)] p-4 font-mono text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <h4 className="text-xs font-bold text-blue-800 uppercase mb-1">Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
              <li>Use valid JSON syntax (double quotes for keys/values).</li>
              <li>Changing keys might break the UI in the seller page.</li>
              <li>Press "Save Changes" to apply.</li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
