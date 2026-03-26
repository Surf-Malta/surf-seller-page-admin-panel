"use client";

import React, { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import axios from "axios";
import { toast } from "react-hot-toast";
import { SectionItem } from "@/components/admin/sections/SectionItem";
import { SectionEditor } from "@/components/admin/sections/SectionEditor";
import { Plus, RefreshCw, Layout } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function SectionsManager() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/sections`);
      if (response.data.success) {
        setSections(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      toast.error("Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Update orders in the backend
        const orders = newArray.map((item, index) => ({
          id: item.id,
          order: index + 1
        }));
        
        updateOrders(orders);
        
        return newArray.map((item, index) => ({ ...item, order: index + 1 }));
      });
    }
  };

  const updateOrders = async (orders: { id: string; order: number }[]) => {
    try {
      await axios.put(`${API_URL}/api/sections/reorder`, { orders });
      toast.success("Order updated");
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const handleToggleVisibility = async (id: string, isActive: boolean) => {
    try {
      const response = await axios.put(`${API_URL}/api/sections/${id}`, { isActive });
      if (response.data.success) {
        setSections(sections.map(s => s.id === id ? { ...s, isActive } : s));
        toast.success(isActive ? "Section visible" : "Section hidden");
      }
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    
    try {
      await axios.delete(`${API_URL}/api/sections/${id}`);
      setSections(sections.filter(s => s.id !== id));
      toast.success("Section deleted");
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  const handleEditContent = (section: any) => {
    setEditingSection(section);
    setIsEditorOpen(true);
  };

  const handleSaveContent = async (id: string, content: any) => {
    try {
      const response = await axios.put(`${API_URL}/api/sections/${id}`, { content });
      if (response.data.success) {
        setSections(sections.map(s => s.id === id ? { ...s, content } : s));
        toast.success("Content updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Page Sections</h1>
          <p className="text-gray-500 mt-1">Reorder, toggle, and edit landing page content.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchSections}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95">
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      </div>

      {loading && sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-2xl">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading sections...</p>
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-2xl">
          <Layout className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No sections found.</p>
          <button className="mt-4 text-blue-600 hover:underline text-sm font-bold">
            Create your first section
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {sections.map((section) => (
                <SectionItem
                  key={section.id}
                  section={section}
                  onEdit={handleEditContent}
                  onToggle={handleToggleVisibility}
                  onDelete={handleDeleteSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <SectionEditor
        section={editingSection}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveContent}
      />
    </div>
  );
}
