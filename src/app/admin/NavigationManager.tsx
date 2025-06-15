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
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Globe,
  Users,
  FileText,
  DollarSign,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Predefined seller page templates
const SELLER_PAGE_TEMPLATES = [
  {
    label: "Home",
    href: "/",
    description:
      "Main landing page showcasing your platform's value proposition",
    icon: Globe,
  },
  {
    label: "How It Works",
    href: "/how-it-works",
    description: "Step-by-step guide for new sellers to get started",
    icon: HelpCircle,
  },
  {
    label: "Pricing",
    href: "/pricing",
    description: "Pricing plans and commission structure for sellers",
    icon: DollarSign,
  },
  {
    label: "Success Stories",
    href: "/success-stories",
    description: "Testimonials and case studies from successful sellers",
    icon: MessageSquare,
  },
  {
    label: "Seller Resources",
    href: "/resources",
    description: "Tools, guides, and resources to help sellers succeed",
    icon: FileText,
  },
  {
    label: "Join Now",
    href: "/signup",
    description: "Seller registration and onboarding page",
    icon: Users,
  },
];

export default function NavigationManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: navigationItems, loading } = useSelector(
    (state: RootState) => state.navigation
  );

  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
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
    setShowTemplates(false);
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
    setShowTemplates(true);
  };

  const handleUseTemplate = (template: (typeof SELLER_PAGE_TEMPLATES)[0]) => {
    const newOrder =
      Math.max(...navigationItems.map((item) => item.order), 0) + 1;
    setFormData({
      label: template.label,
      href: template.href,
      description: template.description,
      order: newOrder,
    });
    setShowTemplates(false);
  };

  const handleSave = async () => {
    if (!formData.label || !formData.href) {
      toast.error("Page name and URL are required");
      return;
    }

    // Check for duplicate href
    const existingItem = navigationItems.find(
      (item) => item.href === formData.href && item.id !== editingItem?.id
    );
    if (existingItem) {
      toast.error("A page with this URL already exists");
      return;
    }

    const itemToSave: NavigationItem = {
      id: editingItem?.id || undefined,
      label: formData.label!,
      href: formData.href!,
      description: formData.description || "",
      order: formData.order || 0,
    };

    try {
      await dispatch(saveNavigationItem(itemToSave)).unwrap();
      toast.success(
        editingItem ? "Page updated successfully" : "Page created successfully"
      );
      handleCancel();
    } catch (error) {
      toast.error("Failed to save page");
    }
  };

  const handleDelete = async (itemId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this page? All content will be lost."
      )
    ) {
      try {
        await dispatch(deleteNavigationItem(itemId)).unwrap();
        toast.success("Page deleted successfully");
      } catch (error) {
        toast.error("Failed to delete page");
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAddingNew(false);
    setShowTemplates(false);
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

  const validateUrl = (url: string) => {
    if (!url.startsWith("/")) {
      return "/" + url;
    }
    return url;
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Seller Page Navigation
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your seller platform navigation pages
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center sm:justify-start text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Page
        </button>
      </div>

      {/* Page Templates */}
      {showTemplates && (
        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Choose a Page Template
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SELLER_PAGE_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.href}
                  onClick={() => handleUseTemplate(template)}
                  className="p-4 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center mb-2">
                    <Icon className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                    <h4 className="font-medium text-gray-900 truncate">
                      {template.label}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {template.description}
                  </p>
                  <span className="text-xs text-blue-600 block break-all">
                    {template.href}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowTemplates(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Or create a custom page
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAddingNew || editingItem) && !showTemplates && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingItem ? "Edit Page" : "Add New Page"}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Name *
                </label>
                <input
                  type="text"
                  value={formData.label || ""}
                  onChange={(e) => handleInputChange("label", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Home, About, Pricing..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page URL *
                </label>
                <input
                  type="text"
                  value={formData.href || ""}
                  onChange={(e) =>
                    handleInputChange("href", validateUrl(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="/about, /pricing, /signup..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order || 0}
                onChange={(e) =>
                  handleInputChange("order", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first in navigation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Brief description of this page's purpose..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Page
            </button>
          </div>
        </div>
      )}

      {/* Navigation Items List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Current Navigation Pages ({navigationItems.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {navigationItems.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Pages Yet</h3>
              <p className="mb-4 text-sm sm:text-base px-4">
                Start by adding your first navigation page
              </p>
              <button
                onClick={handleAddNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Add Your First Page
              </button>
            </div>
          ) : (
            [...navigationItems]
              .sort((a, b) => a.order - b.order)
              .map((item, index) => (
                <div
                  key={item.id}
                  className="px-4 sm:px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-blue-600 bg-blue-100 rounded-full flex-shrink-0">
                          {index + 1}
                        </span>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                          {item.label}
                        </h3>
                        <span className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded whitespace-nowrap">
                          {item.href}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 ml-9 break-words">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 sm:ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit page"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete page"
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

      {/* Quick Setup Guide */}
      {navigationItems.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Quick Setup Guide
          </h3>
          <p className="text-yellow-700 mb-4 text-sm sm:text-base">
            Get started quickly with these essential pages for your seller
            platform:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center text-yellow-700">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 flex-shrink-0"></div>
              <span>Home - Main landing page</span>
            </div>
            <div className="flex items-center text-yellow-700">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 flex-shrink-0"></div>
              <span>How It Works - Getting started guide</span>
            </div>
            <div className="flex items-center text-yellow-700">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 flex-shrink-0"></div>
              <span>Pricing - Commission and fees</span>
            </div>
            <div className="flex items-center text-yellow-700">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 flex-shrink-0"></div>
              <span>Join Now - Seller registration</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
