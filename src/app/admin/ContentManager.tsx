"use client";

import { useState, useEffect, useRef } from "react";
import {
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit3,
  GripVertical,
  RefreshCw,
  FileText,
  Image,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Monitor,
  Smartphone,
  Tablet,
  X,
  Maximize2,
  Minimize2,
  Move,
  RotateCcw,
} from "lucide-react";
import { ref, onValue, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  description: string;
  order: number;
}

interface ContentHeading {
  id: string;
  title: string;
  order: number;
  content: string;
  isVisible: boolean;
  type: "text" | "hero" | "feature" | "pricing" | "testimonial" | "faq";
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  price?: string;
  features?: string[];
}

interface PageContent {
  headings: ContentHeading[];
}

interface NavItemContent {
  [navItemId: string]: PageContent;
}

// Page-specific content templates
const PAGE_CONTENT_TEMPLATES = {
  "/": {
    availableTypes: ["hero", "feature", "testimonial", "pricing"],
    templates: {
      hero: {
        title: "Start Your Online Business Today",
        content:
          "Join thousands of successful sellers on our platform. Easy setup, powerful tools, and unlimited potential.",
        buttonText: "Get Started Now",
        buttonLink: "/register",
        imageUrl:
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
      },
      feature: {
        title: "Zero Investment Required",
        content:
          "Start selling immediately without any upfront costs or hidden fees.",
        imageUrl:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
      },
      testimonial: {
        title: "Sarah Johnson - Fashion Seller",
        content:
          "This platform transformed my business. Sales increased by 300% in just 3 months!",
        imageUrl:
          "https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=400",
      },
      pricing: {
        title: "Basic Plan",
        content: "Perfect for new sellers starting their journey",
        price: "Free",
        features: ["Unlimited listings", "Basic analytics", "Email support"],
      },
    },
  },
  "/how-it-works": {
    availableTypes: ["hero", "text", "feature"],
    templates: {
      hero: {
        title: "How Our Platform Works",
        content: "Simple steps to start your selling journey",
        buttonText: "Start Now",
        buttonLink: "/register",
      },
      text: {
        title: "Step-by-Step Process",
        content:
          "Getting started is easier than you think. Follow these simple steps to become a successful seller on our platform.",
      },
      feature: {
        title: "Easy Setup",
        content:
          "Create your seller account in under 5 minutes with our streamlined onboarding process.",
      },
    },
  },
  "/pricing": {
    availableTypes: ["hero", "pricing", "faq"],
    templates: {
      hero: {
        title: "Simple, Transparent Pricing",
        content:
          "Choose the plan that fits your business needs with no hidden fees.",
      },
      pricing: {
        title: "Pro Plan",
        content: "Advanced features for growing businesses",
        price: "$29/month",
        features: [
          "Unlimited listings",
          "Advanced analytics",
          "Priority support",
          "Custom branding",
        ],
      },
      faq: {
        title: "What payment methods do you accept?",
        content:
          "We accept all major credit cards, PayPal, and bank transfers for your convenience.",
      },
    },
  },
};

export default function RealTimeContentManager() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [navItemsContent, setNavItemsContent] = useState<NavItemContent>({});
  const [activeNavItem, setActiveNavItem] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Preview states
  const [previewMode, setPreviewMode] = useState<"split" | "popup" | "hidden">(
    "split"
  );
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [splitRatio, setSplitRatio] = useState(50); // Percentage for editor width
  const [isDragging, setIsDragging] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const splitRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save functionality
  const triggerAutoSave = () => {
    if (!autoSave) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSaveChanges(true); // Silent save
    }, 2000); // Save 2 seconds after last change
  };

  // Mouse handlers for split dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !splitRef.current) return;

    const rect = splitRef.current.getBoundingClientRect();
    const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitRatio(Math.max(20, Math.min(80, newRatio))); // Limit between 20% and 80%
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  // Firebase setup (same as before)
  useEffect(() => {
    if (!realtimeDb) {
      setError("Firebase is not properly configured.");
      setIsLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!realtimeDb) return;

    try {
      const navItemsRef = ref(realtimeDb, "navigation_items");
      const unsubscribe = onValue(
        navItemsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const navItems: NavigationItem[] = Object.keys(data)
              .map((key) => ({ id: key, ...data[key] }))
              .sort((a, b) => a.order - b.order);
            setNavigationItems(navItems);
          } else {
            setNavigationItems([]);
          }
          setIsLoading(false);
          setError(null);
        },
        (error) => {
          console.error("Error fetching navigation items:", error);
          setError("Failed to load navigation items.");
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up navigation listener:", error);
      setError("Failed to connect to Firebase.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!realtimeDb) return;

    try {
      const contentRef = ref(realtimeDb, "nav_items_content");
      const unsubscribe = onValue(
        contentRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setNavItemsContent(snapshot.val());
          } else {
            setNavItemsContent({});
          }
        },
        (error) => {
          console.error("Error fetching content:", error);
          setError("Failed to load content data.");
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up content listener:", error);
      setError("Failed to connect to Firebase for content data.");
    }
  }, []);

  // Helper functions
  const showMessage = (message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const getAvailableContentTypes = (navItemHref: string) => {
    const pageConfig =
      PAGE_CONTENT_TEMPLATES[
        navItemHref as keyof typeof PAGE_CONTENT_TEMPLATES
      ];
    return pageConfig ? pageConfig.availableTypes : ["text", "hero", "feature"];
  };

  const getContentTemplate = (navItemHref: string, type: string) => {
    const pageConfig =
      PAGE_CONTENT_TEMPLATES[
        navItemHref as keyof typeof PAGE_CONTENT_TEMPLATES
      ];
    if (
      pageConfig &&
      pageConfig.templates[type as keyof typeof pageConfig.templates]
    ) {
      return pageConfig.templates[type as keyof typeof pageConfig.templates];
    }

    const fallbackTemplates = {
      hero: { title: "Welcome", content: "Add your content here..." },
      feature: { title: "Feature", content: "Describe your feature..." },
      pricing: { title: "Plan", content: "Describe your plan...", price: "$0" },
      testimonial: { title: "Customer", content: "Add testimonial..." },
      faq: { title: "Question?", content: "Answer here..." },
      text: { title: "Section", content: "Add your content..." },
    };

    return (
      fallbackTemplates[type as keyof typeof fallbackTemplates] ||
      fallbackTemplates.text
    );
  };

  const addHeading = (navId: string, type: ContentHeading["type"] = "text") => {
    const navItem = navigationItems.find((item) => item.id === navId);
    const template = getContentTemplate(navItem?.href || "", type);
    const currentContent = navItemsContent[navId] || { headings: [] };
    const currentHeadings = currentContent.headings || [];

    const newHeading: ContentHeading = {
      id: `heading-${Date.now()}`,
      title: template.title || "New Heading",
      order: currentHeadings.length + 1,
      content: template.content || "Add your content here...",
      isVisible: true,
      type,
    };

    if (template.buttonText) newHeading.buttonText = template.buttonText;
    if (template.buttonLink) newHeading.buttonLink = template.buttonLink;
    if (template.imageUrl) newHeading.imageUrl = template.imageUrl;
    if (template.price) newHeading.price = template.price;
    if (template.features && template.features.length > 0)
      newHeading.features = template.features;

    const updatedContent = {
      ...currentContent,
      headings: [...currentHeadings, newHeading],
    };

    setNavItemsContent((prev) => ({
      ...prev,
      [navId]: updatedContent,
    }));

    triggerAutoSave();
  };

  const updateHeading = (
    navId: string,
    headingId: string,
    updates: Partial<ContentHeading>
  ) => {
    const currentContent = navItemsContent[navId] || { headings: [] };
    const currentHeadings = currentContent.headings || [];
    const updatedHeadings = currentHeadings.map((heading) => {
      if (heading.id === headingId) {
        const updatedHeading = { ...heading, ...updates };
        Object.keys(updatedHeading).forEach((key) => {
          const value = (updatedHeading as any)[key];
          if (value === undefined || value === null || value === "") {
            delete (updatedHeading as any)[key];
          }
        });
        return updatedHeading;
      }
      return heading;
    });

    const updatedContent = {
      ...currentContent,
      headings: updatedHeadings,
    };

    setNavItemsContent((prev) => ({
      ...prev,
      [navId]: updatedContent,
    }));

    triggerAutoSave();
  };

  const deleteHeading = (navId: string, headingId: string) => {
    const currentContent = navItemsContent[navId] || { headings: [] };
    const currentHeadings = currentContent.headings || [];
    const updatedHeadings = currentHeadings.filter(
      (heading) => heading.id !== headingId
    );

    const updatedContent = {
      ...currentContent,
      headings: updatedHeadings,
    };

    setNavItemsContent((prev) => ({
      ...prev,
      [navId]: updatedContent,
    }));

    triggerAutoSave();
  };

  const handleSaveChanges = async (silent = false) => {
    if (!realtimeDb) {
      if (!silent)
        showMessage(
          "Firebase is not configured properly. Cannot save changes.",
          "error"
        );
      return;
    }

    setIsSaving(true);
    try {
      const cleanedContent = JSON.parse(JSON.stringify(navItemsContent));
      await set(ref(realtimeDb, "nav_items_content"), cleanedContent);
      setLastSaved(new Date());

      if (!silent) {
        showMessage("Content saved successfully!", "success");
      }

      // Refresh iframe to show changes
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    } catch (error) {
      console.error("Error saving content:", error);
      if (!silent) {
        showMessage(
          `Failed to save content: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          "error"
        );
      }
    }
    setIsSaving(false);
  };

  const getContentTypeIcon = (type: ContentHeading["type"]) => {
    switch (type) {
      case "hero":
        return "🏆";
      case "feature":
        return "⚡";
      case "pricing":
        return "💰";
      case "testimonial":
        return "💬";
      case "faq":
        return "❓";
      default:
        return "📝";
    }
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading navigation items...</span>
      </div>
    );
  }

  if (error && isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h3 className="text-lg font-medium text-red-900 mb-1">
                Configuration Error
              </h3>
              <p className="text-red-700 text-sm sm:text-base break-words">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render function
  const renderPageList = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h3 className="text-lg font-medium text-gray-900">
          Navigation Pages ({navigationItems.length})
        </h3>
        <p className="text-sm text-gray-500">Select a page to edit content</p>
      </div>

      {navigationItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">
            No Navigation Pages Found
          </h3>
          <p className="text-sm sm:text-base px-4">
            Navigation pages will appear here when added through the Navigation
            Manager
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {navigationItems.map((navItem) => {
            const contentCount =
              navItemsContent[navItem.id]?.headings?.length || 0;
            const availableTypes = getAvailableContentTypes(navItem.href);
            const hasHeroSection =
              navItemsContent[navItem.id]?.headings?.some(
                (h) => h.type === "hero"
              ) || false;

            return (
              <div
                key={navItem.id}
                className="border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
              >
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 flex flex-wrap items-center gap-2">
                        <span className="truncate">{navItem.label}</span>
                        {hasHeroSection && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded whitespace-nowrap">
                            Has Hero
                          </span>
                        )}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500 mt-1 space-y-1 sm:space-y-0">
                        <span className="truncate">{navItem.href}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">
                          {contentCount} content sections
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs break-all sm:break-normal">
                          Types: {availableTypes.join(", ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setActiveNavItem(navItem.id);
                          setPreviewMode("split");
                        }}
                        className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="hidden sm:inline">
                          Edit with Live Preview
                        </span>
                        <span className="sm:hidden">Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderContentEditor = () => {
    if (!activeNavItem) return renderPageList();

    const navItem = navigationItems.find((item) => item.id === activeNavItem);
    const navContent = navItemsContent[activeNavItem] || { headings: [] };
    const currentHeadings = navContent.headings || [];
    const availableTypes = getAvailableContentTypes(navItem?.href || "");

    if (!navItem) {
      return (
        <div className="text-center py-8 text-red-500">
          <p>Navigation item not found. Please try again.</p>
          <button
            onClick={() => setActiveNavItem(null)}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Back to List
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="min-w-0">
              <h3 className="font-medium text-blue-900 mb-2">
                Editing Content For: {navItem.label}
              </h3>
              <div className="text-sm text-blue-800">
                <p className="break-all">
                  <strong>URL:</strong> {navItem.href} •{" "}
                  <strong>Available Types:</strong> {availableTypes.join(", ")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveNavItem(null)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
            >
              ← Back to Pages
            </button>
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
            <h4 className="text-lg font-medium text-gray-900">
              Content Sections
            </h4>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addHeading(
                    activeNavItem,
                    e.target.value as ContentHeading["type"]
                  );
                  e.target.value = "";
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Add Section
              </option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {getContentTypeIcon(type)}{" "}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {currentHeadings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium mb-2">
                No Content Sections Yet
              </h3>
              <p className="mb-4 px-4">
                Start by adding content sections for this page
              </p>
              <button
                onClick={() => addHeading(activeNavItem, "hero")}
                className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Hero Section
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentHeadings
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((heading) => (
                  <div
                    key={heading.id}
                    className="p-4 sm:p-6 border border-gray-200 rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 min-w-0">
                        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-lg flex-shrink-0">
                          {getContentTypeIcon(heading.type)}
                        </span>
                        <h5 className="font-medium text-gray-900 capitalize truncate">
                          {heading.type} Section #{heading.order || 1}
                        </h5>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            updateHeading(activeNavItem, heading.id, {
                              isVisible: !heading.isVisible,
                            })
                          }
                          className={`p-1 rounded ${
                            heading.isVisible
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {heading.isVisible ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            deleteHeading(activeNavItem, heading.id)
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={heading.title || ""}
                            onChange={(e) =>
                              updateHeading(activeNavItem, heading.id, {
                                title: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        {(heading.type === "hero" ||
                          heading.type === "feature" ||
                          heading.type === "testimonial") && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <Image className="w-4 h-4 inline mr-1" />
                              Image URL
                            </label>
                            <input
                              type="url"
                              value={heading.imageUrl || ""}
                              onChange={(e) =>
                                updateHeading(activeNavItem, heading.id, {
                                  imageUrl: e.target.value || undefined,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          value={heading.content || ""}
                          onChange={(e) =>
                            updateHeading(activeNavItem, heading.id, {
                              content: e.target.value,
                            })
                          }
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Enter your content here..."
                        />
                      </div>

                      {heading.type === "pricing" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price
                            </label>
                            <input
                              type="text"
                              value={heading.price || ""}
                              onChange={(e) =>
                                updateHeading(activeNavItem, heading.id, {
                                  price: e.target.value || undefined,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="$29/month"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Features (comma-separated)
                            </label>
                            <input
                              type="text"
                              value={heading.features?.join(", ") || ""}
                              onChange={(e) => {
                                const value = e.target.value.trim();
                                const features = value
                                  ? value
                                      .split(",")
                                      .map((f) => f.trim())
                                      .filter((f) => f)
                                  : undefined;
                                updateHeading(activeNavItem, heading.id, {
                                  features,
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Feature 1, Feature 2, Feature 3"
                            />
                          </div>
                        </div>
                      )}

                      {(heading.type === "hero" ||
                        heading.type === "feature") && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Button Text
                            </label>
                            <input
                              type="text"
                              value={heading.buttonText || ""}
                              onChange={(e) =>
                                updateHeading(activeNavItem, heading.id, {
                                  buttonText: e.target.value || undefined,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Get Started"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <ExternalLink className="w-4 h-4 inline mr-1" />
                              Button Link
                            </label>
                            <input
                              type="text"
                              value={heading.buttonLink || ""}
                              onChange={(e) =>
                                updateHeading(activeNavItem, heading.id, {
                                  buttonLink: e.target.value || undefined,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="/register"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreviewPanel = () => {
    const currentNavItem = navigationItems.find(
      (item) => item.id === activeNavItem
    );
    const previewUrl = `https://surf-seller-pagee-k6qrdpo71-vellankivasudeva-gmailcoms-projects.vercel.app/${currentNavItem?.href || "/"}`;

    // Get responsive dimensions based on device type
    const getPreviewDimensions = () => {
      switch (previewDevice) {
        case "mobile":
          return {
            width: "375px",
            height: "667px",
            scale: window.innerWidth < 768 ? "0.7" : "1",
          };
        case "tablet":
          return {
            width: "768px",
            height: "1024px",
            scale:
              window.innerWidth < 1024
                ? "0.6"
                : window.innerWidth < 1280
                ? "0.8"
                : "1",
          };
        default: // desktop
          return {
            width: "100%",
            height: "100%",
            scale: "1",
          };
      }
    };

    const dimensions = getPreviewDimensions();

    return (
      <div className="flex flex-col h-full bg-gray-100 min-w-0">
        {/* Preview Header */}
        <div className="bg-white border-b p-2 sm:p-3 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            {/* Header Left */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                Live Preview
              </h3>
              <div className="hidden lg:flex items-center space-x-1 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="truncate">localhost:3001</span>
              </div>
              {/* Current device indicator on mobile */}
              <div className="sm:hidden text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">
                {previewDevice}
              </div>
            </div>

            {/* Header Right - Controls */}
            <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
              {/* Device switcher */}
              <div className="flex bg-gray-100 rounded p-1">
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 sm:p-2 rounded transition-all ${
                    previewDevice === "mobile"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-1.5 sm:p-2 rounded transition-all ${
                    previewDevice === "tablet"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 sm:p-2 rounded transition-all ${
                    previewDevice === "desktop"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={refreshPreview}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Refresh preview"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </button>

                <button
                  onClick={() => window.open(previewUrl, "_blank")}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </button>

                <button
                  onClick={() => setPreviewMode("hidden")}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors lg:hidden"
                  title="Hide preview"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Device info bar */}
          <div className="hidden sm:flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Device: {previewDevice}</span>
              {previewDevice !== "desktop" && (
                <>
                  <span>•</span>
                  <span>
                    {dimensions.width} × {dimensions.height}
                  </span>
                  {dimensions.scale !== "1" && (
                    <>
                      <span>•</span>
                      <span>
                        Scale: {Math.round(parseFloat(dimensions.scale) * 100)}%
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Preview Content Container */}
        <div
          className="flex-1 overflow-auto bg-gray-50 p-2 sm:p-4"
          style={{ minHeight: 0 }}
        >
          <div className="h-full flex items-center justify-center">
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 relative"
              style={{
                width: previewDevice === "desktop" ? "100%" : dimensions.width,
                height:
                  previewDevice === "desktop" ? "100%" : dimensions.height,
                maxWidth: "100%",
                maxHeight: "100%",
                transform: `scale(${dimensions.scale})`,
                transformOrigin: "center center",
              }}
            >
              {/* Browser Chrome */}
              <div className="bg-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 flex items-center space-x-2 border-b flex-shrink-0">
                {/* Traffic lights */}
                <div className="flex space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                </div>

                {/* Address bar */}
                <div className="flex-1 bg-white rounded px-2 sm:px-3 py-1 min-w-0">
                  <div className="text-xs sm:text-sm text-gray-600 font-mono truncate">
                    {previewUrl}
                  </div>
                </div>

                {/* Browser icons */}
                <div className="hidden sm:flex items-center space-x-1">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                </div>
              </div>

              {/* Website Iframe */}
              <div
                className="relative bg-white"
                style={{
                  height:
                    previewDevice === "desktop"
                      ? "calc(100% - 36px)"
                      : `calc(${dimensions.height} - 36px)`,
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Website Preview"
                  style={{
                    pointerEvents:
                      previewDevice === "desktop" ? "auto" : "auto",
                  }}
                  onLoad={() => {
                    // Inject responsive meta tag for mobile preview
                    if (iframeRef.current && previewDevice === "mobile") {
                      try {
                        const iframeDoc = iframeRef.current.contentDocument;
                        if (iframeDoc) {
                          let viewport = iframeDoc.querySelector(
                            'meta[name="viewport"]'
                          );
                          if (!viewport) {
                            viewport = iframeDoc.createElement("meta");
                            viewport.setAttribute("name", "viewport");
                            iframeDoc.head.appendChild(viewport);
                          }
                          viewport.setAttribute(
                            "content",
                            "width=device-width, initial-scale=1.0"
                          );
                        }
                      } catch (e) {
                        // Cross-origin restrictions might prevent this
                        console.log("Could not inject viewport meta tag");
                      }
                    }
                  }}
                />

                {/* Loading overlay */}
                <div
                  className="absolute inset-0 bg-gray-100 flex items-center justify-center"
                  style={{ display: "none" }}
                  id="preview-loading"
                >
                  <div className="flex items-center space-x-2 text-gray-500">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading preview...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile device info footer */}
        <div className="sm:hidden bg-white border-t px-3 py-2 flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{previewDevice} Preview</span>
          <span>
            {previewDevice !== "desktop" &&
              `${dimensions.width} × ${dimensions.height}`}
          </span>
        </div>
      </div>
    );
  };

  // Main layout
  if (previewMode === "split" && activeNavItem) {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

    return (
      <div className="h-screen flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b p-3 sm:p-4 flex-shrink-0">
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            {/* Left side - Title and controls */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Real-Time Content Editor
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="rounded"
                  />
                  <span className="whitespace-nowrap">Auto-save</span>
                </label>
                {lastSaved && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Preview toggle for mobile/tablet */}
              <div className="lg:hidden">
                <button
                  onClick={() =>
                    setPreviewMode(previewMode === "split" ? "popup" : "split")
                  }
                  className="flex items-center justify-center w-full sm:w-auto px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {previewMode === "split" ? "Show Preview" : "Hide Preview"}
                </button>
              </div>

              {/* Save button */}
              <button
                onClick={() => handleSaveChanges()}
                disabled={isSaving}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {isMobile || previewMode === "popup" ? (
            // Mobile/Tablet: Stacked layout with modal preview
            <div className="h-full flex flex-col">
              {/* Editor */}
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-4 sm:p-6">{renderContentEditor()}</div>
              </div>

              {/* Preview Modal for mobile */}
              {previewMode === "popup" && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Live Preview</h2>
                      <button
                        onClick={() => setPreviewMode("split")}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {renderPreviewPanel()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Desktop: Split view
            <div ref={splitRef} className="flex h-full">
              {/* Editor Panel */}
              <div
                className="bg-white border-r overflow-y-auto flex-shrink-0"
                style={{ width: `${splitRatio}%` }}
              >
                <div className="p-6">{renderContentEditor()}</div>
              </div>

              {/* Draggable Divider */}
              <div
                className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex items-center justify-center group relative"
                onMouseDown={handleMouseDown}
              >
                <div className="w-4 h-8 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <GripVertical className="w-3 h-3 text-white" />
                </div>

                {/* Split ratio indicator */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {Math.round(splitRatio)}% / {Math.round(100 - splitRatio)}%
                </div>
              </div>

              {/* Preview Panel */}
              <div
                className="bg-gray-50 overflow-hidden"
                style={{ width: `${100 - splitRatio}%` }}
              >
                {renderPreviewPanel()}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Actions */}
        <div className="lg:hidden bg-white border-t p-3 flex-shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const currentNavItem = navigationItems.find(
                  (item) => item.id === activeNavItem
                );
                const previewUrl = `https://surf-seller-pagee-k6qrdpo71-vellankivasudeva-gmailcoms-projects.vercel.app${
                  currentNavItem?.href || "/"
                }`;
                window.open(previewUrl, "_blank");
              }}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Preview
            </button>

            <button
              onClick={() => setPreviewMode("popup")}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Preview Modal
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
              <span className="text-green-800 text-sm break-words">
                {successMessage}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
              <span className="text-red-800 text-sm break-words">{error}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default single panel view
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Real-Time Content Manager
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Edit content with live preview and real-time updates
          </p>
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving || !realtimeDb}
          className="flex items-center px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
            <span className="text-green-800 text-sm">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <span className="text-red-800 text-sm break-words">{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {activeNavItem
              ? `Editing: ${
                  navigationItems.find((n) => n.id === activeNavItem)?.label
                }`
              : "Select a Page to Edit"}
          </h2>
        </div>
        <div className="p-4 sm:p-6">{renderContentEditor()}</div>
      </div>
    </div>
  );
}
