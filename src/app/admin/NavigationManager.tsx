"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  saveNavigationItem,
  deleteNavigationItem,
  listenForNavigationChanges,
} from "@/store/slices/navigationSlice";
import { NavigationItem } from "@/types/navigation";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

export default function NavigationManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: navigationItems, loading } = useSelector(
    (state: RootState) => state.navigation
  );

  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<NavigationItem>>({
    label: "",
    href: "",
    description: "",
    order: 0,
  });

  useEffect(() => {
    dispatch(listenForNavigationChanges());
  }, [dispatch]);

  const handleEdit = (item: NavigationItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    const newOrder =
      Math.max(...navigationItems.map((item) => item.order), 0) + 1;
    setFormData({
      label: "",
      href: "",
      description: "",
      order: newOrder,
    });
    setEditingItem(null);
    setIsAddingNew(true);
  };

  const handleSave = async () => {
    if (!formData.label || !formData.href) {
      toast.error("Label and href are required");
      return;
    }

    const itemToSave: NavigationItem = {
      id: editingItem?.id || undefined, // Let Firebase generate ID if new
      label: formData.label!,
      href: formData.href!,
      description: formData.description || "",
      order: formData.order || 0,
    };

    try {
      await dispatch(saveNavigationItem(itemToSave)).unwrap();
      toast.success(
        editingItem ? "Navigation item updated" : "Navigation item created"
      );
      handleCancel();
    } catch (error) {
      toast.error("Failed to save navigation item");
    }
  };

  const handleDelete = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this navigation item?")) {
      try {
        await dispatch(deleteNavigationItem(itemId)).unwrap();
        toast.success("Navigation item deleted");
      } catch (error) {
        toast.error("Failed to delete navigation item");
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAddingNew(false);
    setFormData({
      label: "",
      href: "",
      description: "",
      order: 0,
    });
  };

  const handleInputChange = (
    field: keyof NavigationItem,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading && navigationItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Navigation Management
          </h1>
          <p className="text-gray-600">Manage your website navigation items</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Navigation Item
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingItem) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingItem ? "Edit Navigation Item" : "Add New Navigation Item"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label *
              </label>
              <input
                type="text"
                value={formData.label || ""}
                onChange={(e) => handleInputChange("label", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Home, About, Services..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL/Href *
              </label>
              <input
                type="text"
                value={formData.href || ""}
                onChange={(e) => handleInputChange("href", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/about, /services..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <input
                type="number"
                value={formData.order || 0}
                onChange={(e) =>
                  handleInputChange("order", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description for tooltip..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Navigation Items List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Current Navigation Items
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {navigationItems.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No navigation items found. Add your first navigation item to get
              started.
            </div>
          ) : (
            [...navigationItems]
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">
                          #{item.order}
                        </span>
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.label}
                        </h3>
                        <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {item.href}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
