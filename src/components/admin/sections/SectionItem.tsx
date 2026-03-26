"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface SectionItemProps {
  section: any;
  onEdit: (section: any) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export function SectionItem({ section, onEdit, onToggle, onDelete }: SectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 bg-white border rounded-xl mb-3 shadow-sm hover:shadow-md transition-shadow ${
        !section.isActive ? "bg-gray-50 border-dashed" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Section Info */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${!section.isActive ? "text-gray-500" : "text-gray-900"}`}>
              {section.name}
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 rounded uppercase">
              {section.type}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Order: {section.order} • {section.isActive ? "Visible" : "Hidden"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle Visibility */}
        <button
          onClick={() => onToggle(section.id, !section.isActive)}
          className={`p-2 rounded-lg transition-colors ${
            section.isActive 
              ? "text-green-600 hover:bg-green-50" 
              : "text-gray-400 hover:bg-gray-100"
          }`}
          title={section.isActive ? "Hide Section" : "Show Section"}
        >
          {section.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>

        {/* Edit Button */}
        <button
          onClick={() => onEdit(section)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit Content"
        >
          <Pencil className="w-5 h-5" />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(section.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Section"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
