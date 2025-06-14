"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Menu,
  Edit3,
  GripVertical,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { ref, onValue, set, push } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  description: string;
  order: number;
}

interface ContentSection {
  id: string;
  title: string;
  type: "hero" | "features" | "pricing" | "navigation";
  content: any;
  isVisible: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  price?: string;
}

interface PageContent {
  headings: ContentHeading[];
}

interface ContentHeading {
  id: string;
  title: string;
  order: number;
  content: string;
  isVisible: boolean;
}

interface NavItemContent {
  [navItemId: string]: PageContent;
}

export default function ContentManager() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [navItemsContent, setNavItemsContent] = useState<NavItemContent>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeNavItem, setActiveNavItem] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNavItems, setExpandedNavItems] = useState<Set<string>>(
    new Set()
  );

  // Fetch navigation items from Firebase Realtime Database
  useEffect(() => {
    const navItemsRef = ref(realtimeDb, "navigation_items");

    const unsubscribe = onValue(navItemsRef, (snapshot) => {
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
    });

    return () => unsubscribe();
  }, []);

  // Fetch nav items content from Firebase
  useEffect(() => {
    const contentRef = ref(realtimeDb, "nav_items_content");

    const unsubscribe = onValue(contentRef, (snapshot) => {
      if (snapshot.exists()) {
        setNavItemsContent(snapshot.val());
      } else {
        setNavItemsContent({});
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Initialize sections with navigation and other existing sections
    const mockSections: ContentSection[] = [
      {
        id: "navigation",
        title: "Navigation Content",
        type: "navigation",
        content: {},
        isVisible: true,
      },
      {
        id: "hero",
        title: "Hero Section",
        type: "hero",
        content: {
          title: "Become a Seller on Our Platform",
          subtitle:
            "Start selling your products and reach millions of customers",
          ctaText: "Start Selling Now",
        },
        isVisible: true,
      },
      {
        id: "features",
        title: "Features Section",
        type: "features",
        content: {
          title: "Why Choose Our Platform?",
          items: [
            {
              id: "1",
              title: "Easy Setup",
              description: "Get your store up and running in minutes",
            },
            {
              id: "2",
              title: "Global Reach",
              description: "Access customers worldwide",
            },
          ],
        },
        isVisible: true,
      },
      {
        id: "pricing",
        title: "Pricing Plans",
        type: "pricing",
        content: {
          title: "Choose Your Plan",
          items: [
            {
              id: "1",
              title: "Basic",
              price: "$9.99/month",
              description: "Perfect for small businesses",
            },
            {
              id: "2",
              title: "Pro",
              price: "$29.99/month",
              description: "Advanced features for growing businesses",
            },
          ],
        },
        isVisible: true,
      },
    ];

    setSections(mockSections);
  }, []);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Save nav items content to Firebase
      await set(ref(realtimeDb, "nav_items_content"), navItemsContent);
      alert("Content saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Failed to save content. Please try again.");
    }
    setIsSaving(false);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, isVisible: !section.isVisible }
          : section
      )
    );
  };

  const updateSectionContent = (sectionId: string, newContent: any) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, content: newContent } : section
      )
    );
  };

  // Content heading functions for navigation items
  const addHeading = (navId: string) => {
    const currentContent = navItemsContent[navId] || { headings: [] };

    const newHeading: ContentHeading = {
      id: `heading-${Date.now()}`,
      title: "New Heading",
      order: currentContent.headings.length + 1,
      content: "Add your content here...",
      isVisible: true,
    };

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

    const updatedHeadings = currentContent.headings.map((heading) =>
      heading.id === headingId ? { ...heading, ...updates } : heading
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

  const addNewItem = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: "New Item",
      description: "Add description here",
    };

    const updatedContent = {
      ...section.content,
      items: [...(section.content.items || []), newItem],
    };

    updateSectionContent(sectionId, updatedContent);
  };

  const removeItem = (sectionId: string, itemId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const updatedContent = {
      ...section.content,
      items:
        section.content.items?.filter(
          (item: ContentItem) => item.id !== itemId
        ) || [],
    };

    updateSectionContent(sectionId, updatedContent);
  };

  const updateItem = (
    sectionId: string,
    itemId: string,
    field: string,
    value: any
  ) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const updatedContent = {
      ...section.content,
      items:
        section.content.items?.map((item: ContentItem) =>
          item.id === itemId ? { ...item, [field]: value } : item
        ) || [],
    };

    updateSectionContent(sectionId, updatedContent);
  };

  const renderNavigationEditor = () => {
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
                <strong>Label:</strong> {navItem.label}
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
                Page Content
              </h4>
              <button
                onClick={() => addHeading(activeNavItem)}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Heading
              </button>
            </div>

            {navContent.headings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  No Content Added Yet
                </h3>
                <p className="mb-4">
                  Start by adding headings and content for this page
                </p>
                <button
                  onClick={() => addHeading(activeNavItem)}
                  className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Heading
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {navContent.headings
                  ?.sort((a, b) => a.order - b.order)
                  .map((heading) => (
                    <div
                      key={heading.id}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <h5 className="font-medium text-gray-900">
                            Heading {heading.order}
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Heading Title
                          </label>
                          <input
                            type="text"
                            value={heading.title}
                            onChange={(e) =>
                              updateHeading(activeNavItem, heading.id, {
                                title: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                          </label>
                          <textarea
                            value={heading.content}
                            onChange={(e) =>
                              updateHeading(activeNavItem, heading.id, {
                                content: e.target.value,
                              })
                            }
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your content here..."
                          />
                        </div>
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
            Navigation Items ({navigationItems.length})
          </h3>
          <p className="text-sm text-gray-500">
            Select a navigation item to manage its content
          </p>
        </div>

        {navigationItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Menu className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              No Navigation Items Found
            </h3>
            <p>Navigation items will appear here when added to your database</p>
          </div>
        ) : (
          <div className="space-y-3">
            {navigationItems.map((navItem) => {
              const contentCount =
                navItemsContent[navItem.id]?.headings?.length || 0;

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
                          <h4 className="font-medium text-gray-900">
                            {navItem.label}
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
                          <p className="text-sm text-gray-600">
                            <strong>Order:</strong> {navItem.order}
                          </p>
                          {contentCount > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-700">
                                Content Sections:
                              </p>
                              {navItemsContent[navItem.id]?.headings
                                ?.sort((a, b) => a.order - b.order)
                                .map((heading) => (
                                  <div
                                    key={heading.id}
                                    className="text-xs text-gray-500 flex items-center space-x-2"
                                  >
                                    <span>• {heading.title}</span>
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

  const renderSectionEditor = (section: ContentSection) => {
    if (section.type === "navigation") {
      return renderNavigationEditor();
    }

    if (section.type === "hero") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={section.content.title || ""}
              onChange={(e) =>
                updateSectionContent(section.id, {
                  ...section.content,
                  title: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <textarea
              value={section.content.subtitle || ""}
              onChange={(e) =>
                updateSectionContent(section.id, {
                  ...section.content,
                  subtitle: e.target.value,
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={section.content.ctaText || ""}
              onChange={(e) =>
                updateSectionContent(section.id, {
                  ...section.content,
                  ctaText: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Title
          </label>
          <input
            type="text"
            value={section.content.title || ""}
            onChange={(e) =>
              updateSectionContent(section.id, {
                ...section.content,
                title: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Items</h4>
            <button
              onClick={() => addNewItem(section.id)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {section.content.items?.map((item: ContentItem) => (
              <div
                key={item.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Item {item.id}</h5>
                  <button
                    onClick={() => removeItem(section.id, item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) =>
                        updateItem(section.id, item.id, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {section.type === "pricing" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="text"
                        value={item.price || ""}
                        onChange={(e) =>
                          updateItem(
                            section.id,
                            item.id,
                            "price",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={item.description || ""}
                      onChange={(e) =>
                        updateItem(
                          section.id,
                          item.id,
                          "description",
                          e.target.value
                        )
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Content Management System
          </h1>
          <p className="text-gray-600 mt-2">
            Manage content for your navigation pages and website sections
          </p>
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sections List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Content Sections
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  } ${
                    section.type === "navigation"
                      ? "border-l-4 border-l-purple-500"
                      : ""
                  }`}
                  onClick={() => {
                    setActiveSection(section.id);
                    setActiveNavItem(null);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {section.type === "navigation" && (
                      <Menu className="w-4 h-4 text-purple-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {section.title}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {section.type}
                        {section.type === "navigation" &&
                          ` (${navigationItems.length} pages)`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSectionVisibility(section.id);
                    }}
                    className={`p-1 rounded ${
                      section.isVisible ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {section.isVisible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeSection
                    ? activeNavItem
                      ? `Content Editor: ${
                          navigationItems.find((n) => n.id === activeNavItem)
                            ?.label
                        }`
                      : sections.find((s) => s.id === activeSection)?.title ||
                        "Edit Section"
                    : "Select a Section"}
                </h2>
                {activeNavItem && (
                  <button
                    onClick={() => setActiveNavItem(null)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Back to Navigation List
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {activeSection ? (
                renderSectionEditor(
                  sections.find((s) => s.id === activeSection)!
                )
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <h3 className="text-lg font-medium mb-2">
                    No Section Selected
                  </h3>
                  <p>Choose a section from the left panel to start editing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
