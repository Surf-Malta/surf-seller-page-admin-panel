"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit3,
  GripVertical,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  FileText,
  Image,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
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

// Demo content templates for seller page
const CONTENT_TEMPLATES = {
  hero: {
    title: "Start Selling Today",
    content:
      "Join thousands of successful sellers on our platform. Easy setup, powerful tools, and unlimited potential.",
    buttonText: "Get Started",
    buttonLink: "/signup",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
  },
  feature: {
    title: "Powerful Selling Tools",
    content:
      "Access advanced analytics, inventory management, and customer insights to grow your business.",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
  },
  pricing: {
    title: "Simple Pricing",
    content:
      "Choose the plan that fits your business needs. No hidden fees, cancel anytime.",
    price: "$29/month",
    features: [
      "Unlimited listings",
      "Advanced analytics",
      "Priority support",
      "Custom storefront",
    ],
  },
  testimonial: {
    title: "What Our Sellers Say",
    content:
      '"This platform transformed my business. Sales increased by 300% in just 3 months!" - Sarah Johnson, Fashion Seller',
    imageUrl:
      "https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=400",
  },
  faq: {
    title: "How do I get started?",
    content:
      "Getting started is easy! Simply sign up, verify your account, and you can start listing your products immediately. Our team will guide you through the setup process.",
  },
  text: {
    title: "New Section",
    content: "Add your content here...",
  },
};

export default function ContentManager() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [navItemsContent, setNavItemsContent] = useState<NavItemContent>({});
  const [activeNavItem, setActiveNavItem] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNavItems, setExpandedNavItems] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper function to clean data before saving to Firebase
  const cleanDataForFirebase = (data: any): any => {
    if (data === null || data === undefined) {
      return null;
    }

    if (Array.isArray(data)) {
      return data.map(cleanDataForFirebase).filter((item) => item !== null);
    }

    if (typeof data === "object") {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(data)) {
        const cleanedValue = cleanDataForFirebase(value);
        // Only include the property if it's not null/undefined and not an empty string
        if (
          cleanedValue !== null &&
          cleanedValue !== undefined &&
          cleanedValue !== ""
        ) {
          cleaned[key] = cleanedValue;
        }
      }
      return cleaned;
    }

    return data;
  };

  // Check Firebase connection
  useEffect(() => {
    if (!realtimeDb) {
      setError(
        "Firebase is not properly configured. Please check your environment variables."
      );
      setIsLoading(false);
      return;
    }
  }, []);

  // Fetch navigation items from Firebase
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
              .map((key) => ({
                id: key,
                ...data[key],
              }))
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
          setError(
            "Failed to load navigation items. Please check your Firebase configuration."
          );
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up navigation listener:", error);
      setError(
        "Failed to connect to Firebase. Please check your configuration."
      );
      setIsLoading(false);
    }
  }, []);

  // Fetch nav items content from Firebase
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

  const showMessage = (message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSaveChanges = async () => {
    if (!realtimeDb) {
      showMessage(
        "Firebase is not configured properly. Cannot save changes.",
        "error"
      );
      return;
    }

    setIsSaving(true);
    try {
      // Clean the data before saving to remove undefined values
      const cleanedContent = cleanDataForFirebase(navItemsContent);
      console.log("Saving cleaned content:", cleanedContent);

      await set(ref(realtimeDb, "nav_items_content"), cleanedContent);
      showMessage("Content saved successfully!", "success");
    } catch (error) {
      console.error("Error saving content:", error);
      showMessage(
        `Failed to save content: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
    }
    setIsSaving(false);
  };

  const addHeading = (navId: string, type: ContentHeading["type"] = "text") => {
    const currentContent = navItemsContent[navId] || { headings: [] };
    const template = CONTENT_TEMPLATES[type] || CONTENT_TEMPLATES.text;

    // Create the new heading with only defined values
    const newHeading: ContentHeading = {
      id: `heading-${Date.now()}`,
      title: template.title || "New Heading",
      order: currentContent.headings.length + 1,
      content: template.content || "Add your content here...",
      isVisible: true,
      type,
    };

    // Only add optional properties if they exist in the template
    if (template.buttonText) newHeading.buttonText = template.buttonText;
    if (template.buttonLink) newHeading.buttonLink = template.buttonLink;
    if (template.imageUrl) newHeading.imageUrl = template.imageUrl;
    if (template.price) newHeading.price = template.price;
    if (template.features && template.features.length > 0)
      newHeading.features = template.features;

    const updatedContent = {
      ...currentContent,
      headings: [...currentContent.headings, newHeading],
    };

    setNavItemsContent((prev) => ({
      ...prev,
      [navId]: updatedContent,
    }));
  };

  const updateHeading = (
    navId: string,
    headingId: string,
    updates: Partial<ContentHeading>
  ) => {
    const currentContent = navItemsContent[navId] || { headings: [] };
    const updatedHeadings = currentContent.headings.map((heading) => {
      if (heading.id === headingId) {
        const updatedHeading = { ...heading, ...updates };

        // Clean up undefined/empty values
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
  };

  const deleteHeading = (navId: string, headingId: string) => {
    const currentContent = navItemsContent[navId] || { headings: [] };
    const updatedHeadings = currentContent.headings.filter(
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
  };

  const toggleNavItemExpansion = (navId: string) => {
    const newExpanded = new Set(expandedNavItems);
    if (newExpanded.has(navId)) {
      newExpanded.delete(navId);
    } else {
      newExpanded.add(navId);
    }
    setExpandedNavItems(newExpanded);
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

  // Error display component
  if (error && isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-900">
                Configuration Error
              </h3>
              <p className="text-red-700 mt-1">{error}</p>
              <div className="mt-4 text-sm text-red-600">
                <p>
                  <strong>Please check:</strong>
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    Your .env.local file contains all required Firebase
                    variables
                  </li>
                  <li>Firebase project is properly configured</li>
                  <li>Realtime Database is enabled in your Firebase project</li>
                  <li>Database rules allow read/write access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContentEditor = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">
            Loading navigation items...
          </span>
        </div>
      );
    }

    if (activeNavItem) {
      const navItem = navigationItems.find((item) => item.id === activeNavItem);
      const navContent = navItemsContent[activeNavItem] || { headings: [] };

      if (!navItem) return null;

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              Editing Content For:
            </h3>
            <div className="text-sm text-blue-800">
              <p>
                <strong>Page:</strong> {navItem.label}
              </p>
              <p>
                <strong>URL:</strong> {navItem.href}
              </p>
              <p>
                <strong>Description:</strong> {navItem.description}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Page Content Sections
              </h4>
              <div className="flex space-x-2">
                <div className="relative">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addHeading(
                          activeNavItem,
                          e.target.value as ContentHeading["type"]
                        );
                        e.target.value = ""; // Reset select
                      }
                    }}
                    className="appearance-none bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Add Section Type
                    </option>
                    <option value="hero">🏆 Hero Section</option>
                    <option value="feature">⚡ Feature Section</option>
                    <option value="pricing">💰 Pricing Section</option>
                    <option value="testimonial">💬 Testimonial</option>
                    <option value="faq">❓ FAQ Section</option>
                    <option value="text">📝 Text Section</option>
                  </select>
                </div>
              </div>
            </div>

            {navContent.headings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  No Content Sections Yet
                </h3>
                <p className="mb-4">
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
                {[...navContent.headings]
                  .sort((a, b) => a.order - b.order)
                  .map((heading) => (
                    <div
                      key={heading.id}
                      className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="text-lg">
                            {getContentTypeIcon(heading.type)}
                          </span>
                          <h5 className="font-medium text-gray-900 capitalize">
                            {heading.type} Section #{heading.order}
                          </h5>
                        </div>
                        <div className="flex items-center space-x-2">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your content here..."
                          />
                        </div>

                        {heading.type === "pricing" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    features: features,
                                  });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Feature 1, Feature 2, Feature 3"
                              />
                            </div>
                          </div>
                        )}

                        {(heading.type === "hero" ||
                          heading.type === "feature") && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Get Started"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                <LinkIcon className="w-4 h-4 inline mr-1" />
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="/signup"
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
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Navigation Pages ({navigationItems.length})
          </h3>
          <p className="text-sm text-gray-500">
            Select a page to manage its content sections
          </p>
        </div>

        {navigationItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              No Navigation Pages Found
            </h3>
            <p>
              Navigation pages will appear here when added through the
              Navigation Manager
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {navigationItems.map((navItem) => {
              const contentCount =
                navItemsContent[navItem.id]?.headings?.length || 0;
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleNavItemExpansion(navItem.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedNavItems.has(navItem.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center">
                            {navItem.label}
                            {hasHeroSection && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Has Hero
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{navItem.href}</span>
                            <span>•</span>
                            <span>{contentCount} content sections</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setActiveNavItem(navItem.id)}
                          className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit Content
                        </button>
                      </div>
                    </div>

                    {expandedNavItems.has(navItem.id) && (
                      <div className="mt-4 pl-7 border-l-2 border-gray-100">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>Description:</strong> {navItem.description}
                          </p>
                          {contentCount > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-700">
                                Content Sections:
                              </p>
                              {[...navItemsContent[navItem.id]?.headings]
                                ?.sort((a, b) => a.order - b.order)
                                .map((heading) => (
                                  <div
                                    key={heading.id}
                                    className="text-xs text-gray-500 flex items-center space-x-2"
                                  >
                                    <span>
                                      {getContentTypeIcon(heading.type)}
                                    </span>
                                    <span>{heading.title}</span>
                                    <span className="capitalize text-blue-600">
                                      ({heading.type})
                                    </span>
                                    {heading.isVisible ? (
                                      <Eye className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <EyeOff className="w-3 h-3 text-gray-400" />
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Seller Page Content Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage content sections for your seller landing pages
          </p>
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving || !realtimeDb}
          className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeNavItem
                ? `Editing: ${
                    navigationItems.find((n) => n.id === activeNavItem)?.label
                  }`
                : "Select a Page to Edit"}
            </h2>
            {activeNavItem && (
              <button
                onClick={() => setActiveNavItem(null)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back to Page List
              </button>
            )}
          </div>
        </div>
        <div className="p-6">{renderContentEditor()}</div>
      </div>
    </div>
  );
}
