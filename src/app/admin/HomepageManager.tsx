// src/app/admin/HomepageManager.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Eye,
  EyeOff,
  Edit3,
  Plus,
  Trash2,
  Image,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  GripVertical,
  Home,
  Star,
  DollarSign,
  MessageSquare,
  HelpCircle,
  Users,
} from "lucide-react";
import { ref, onValue, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

interface HomepageSection {
  id: string;
  type:
    | "hero"
    | "success_stories"
    | "how_it_works"
    | "features"
    | "pricing_teaser"
    | "why_choose_us"
    | "final_cta"
    | "footer";
  title: string;
  order: number;
  isVisible: boolean;
  content: any; // Will vary based on type
}

interface HomepageContent {
  sections: HomepageSection[];
  lastUpdated: string;
}

const DEFAULT_HOMEPAGE_SECTIONS = [
  {
    id: "hero",
    type: "hero" as const,
    title: "Hero Section",
    order: 1,
    isVisible: true,
    content: {
      title: "Launch Your Online Store Today",
      subtitle: "Transform your business dreams into reality",
      description:
        "Join 50,000+ successful entrepreneurs who've built their e-commerce empire with zero investment. Start selling online and reach millions of customers worldwide.",
      buttonText: "Start Your Store FREE",
      buttonLink: "/register",
      backgroundImage: "",
      stats: [
        { label: "Active Sellers", value: "50K+" },
        { label: "Products Sold", value: "2M+" },
        { label: "Revenue Generated", value: "₹100Cr+" },
        { label: "Uptime", value: "99.9%" },
      ],
    },
  },
  {
    id: "success_stories",
    type: "success_stories" as const,
    title: "Success Stories",
    order: 2,
    isVisible: true,
    content: {
      title: "Real Stories",
      subtitle: "Real Success",
      description:
        "See how ordinary people built extraordinary e-commerce businesses",
      stories: [
        {
          id: "1",
          name: "Rajesh Kumar",
          role: "Electronics Seller, Mumbai",
          quote:
            "From ₹0 to ₹5 lakhs monthly revenue in just 6 months. This platform changed my life!",
          avatar: "👨‍💼",
          rating: 5,
        },
        {
          id: "2",
          name: "Priya Sharma",
          role: "Fashion Boutique, Delhi",
          quote:
            "Started my fashion store from home. Now I have a team of 10 people!",
          avatar: "👩‍💼",
          rating: 5,
        },
        {
          id: "3",
          name: "Amit Patel",
          role: "Handmade Crafts, Ahmedabad",
          quote:
            "College student to successful entrepreneur. Earning more than my friends' salaries!",
          avatar: "👨‍🎓",
          rating: 5,
        },
      ],
    },
  },
  {
    id: "how_it_works",
    type: "how_it_works" as const,
    title: "How It Works",
    order: 3,
    isVisible: true,
    content: {
      title: "Start Selling",
      subtitle: "In 3 Simple Steps",
      description:
        "No technical knowledge required. Get your store up and running in minutes.",
      steps: [
        {
          id: "1",
          number: 1,
          title: "Register & Setup",
          description:
            "Create your account and set up your store in under 10 minutes. Choose from beautiful templates and customize your brand.",
          icon: "⚡",
        },
        {
          id: "2",
          number: 2,
          title: "Add Products",
          description:
            "Upload your products with high-quality images and descriptions. Set competitive prices and manage your inventory effortlessly.",
          icon: "📦",
        },
        {
          id: "3",
          number: 3,
          title: "Start Earning",
          description:
            "Go live and start receiving orders! We handle payments, provide analytics, and support you every step of the way.",
          icon: "💰",
        },
      ],
    },
  },
  {
    id: "pricing_teaser",
    type: "pricing_teaser" as const,
    title: "Pricing Teaser",
    order: 4,
    isVisible: true,
    content: {
      title: "No Hidden Fees",
      subtitle: "Pay Only When You Sell",
      description:
        "Start for free and pay only a small commission on successful sales. No setup fees, no monthly charges, no surprises.",
      setupCost: {
        value: "₹0",
        label: "Setup Cost",
        description:
          "Launch your store without any upfront investment. Everything you need to start is completely free.",
      },
      commission: {
        value: "5%",
        label: "Commission Only",
        description:
          "Pay only when you make a sale. Our success is tied to your success. No monthly fees, ever.",
      },
    },
  },
  {
    id: "why_choose_us",
    type: "why_choose_us" as const,
    title: "Why Choose Us",
    order: 5,
    isVisible: true,
    content: {
      title: "Built for",
      subtitle: "E-commerce Success",
      description:
        "Everything you need to build, grow, and scale your online business",
      features: [
        {
          id: "1",
          title: "Quick Launch",
          description:
            "Get your store live in under 10 minutes with our one-click setup",
          icon: "🚀",
        },
        {
          id: "2",
          title: "Secure Payments",
          description:
            "Accept all payment methods with bank-level security and instant settlements",
          icon: "💳",
        },
        {
          id: "3",
          title: "Mobile Ready",
          description:
            "Your store works perfectly on all devices with app-like experience",
          icon: "📱",
        },
        {
          id: "4",
          title: "Smart Analytics",
          description:
            "Track sales, customers, and growth with real-time business insights",
          icon: "📊",
        },
      ],
    },
  },
  {
    id: "final_cta",
    type: "final_cta" as const,
    title: "Final Call to Action",
    order: 6,
    isVisible: true,
    content: {
      title: "Ready to Join the E-commerce Revolution?",
      description:
        "Over 50,000 entrepreneurs have already transformed their lives. Your success story starts today.",
      primaryButton: {
        text: "🚀 Start Your Store FREE",
        link: "/register",
      },
      secondaryButton: {
        text: "See How It Works",
        link: "/how-it-works",
      },
      trustIndicators: [
        { label: "Free to Start", value: "100%" },
        { label: "Expert Support", value: "24/7" },
        { label: "Setup Time", value: "10min" },
      ],
    },
  },
  {
    id: "footer",
    type: "footer" as const,
    title: "Footer",
    order: 7,
    isVisible: true,
    content: {
      companyInfo: {
        name: "Surf Seller",
        description:
          "Join thousands of successful sellers who've transformed their lives through online selling.",
        tagline: "E-commerce Platform",
      },
      ctaSection: {
        title: "Ready to Start Your E-commerce Journey?",
        description:
          "Join thousands of successful sellers who've transformed their lives through online selling.",
        primaryButton: {
          text: "🚀 Start Selling FREE",
          link: "/register",
        },
        secondaryButton: {
          text: "Learn How It Works",
          link: "/how-it-works",
        },
      },
      linkSections: {
        "Get Started": [
          {
            label: "🚀 Start Selling Free",
            href: "/register",
            highlight: true,
          },
          { label: "How It Works", href: "/how-it-works" },
          { label: "Pricing & Commission", href: "/pricing" },
          {
            label: "Vendor Login",
            href: "https://surf.mt/vendor.php?dispatch=auth.login_form&return_url=vendor.php",
            external: true,
          },
        ],
        "Selling Tools": [
          { label: "Store Builder", href: "/features" },
          { label: "Inventory Management", href: "/inventory" },
          { label: "Sales Analytics", href: "/analytics" },
          { label: "Marketing Tools", href: "/marketing" },
        ],
        "Support & Resources": [
          { label: "Help Center", href: "/help" },
          { label: "Contact Support", href: "/contact" },
          { label: "Seller Guide", href: "/seller-guide" },
          { label: "Success Stories", href: "/success-stories" },
        ],
        Company: [
          { label: "About Us", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: "Seller Blog", href: "/blog" },
          { label: "Press & Media", href: "/press" },
        ],
        Legal: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Seller Agreement", href: "/seller-agreement" },
          { label: "Cookie Policy", href: "/cookies" },
        ],
      },
      socialLinks: [
        { platform: "Facebook", url: "#" },
        { platform: "Twitter", url: "#" },
        { platform: "Instagram", url: "#" },
        { platform: "LinkedIn", url: "#" },
        { platform: "YouTube", url: "#" },
      ],
      contactInfo: {
        email: "support@surfseller.com",
        phone: "+91 98765 43210",
      },
      successMetrics: {
        title: "Our E-commerce Success Story",
        metrics: [
          { label: "Active Sellers", value: "50K+" },
          { label: "Revenue Generated", value: "₹100Cr+" },
          { label: "Products Sold", value: "2M+" },
          { label: "Customer Satisfaction Rate", value: "99.9%" },
        ],
      },
      copyright:
        "© 2024 Surf Seller. All rights reserved. Made with ❤️ for entrepreneurs.",
    },
  },
];

export default function HomepageManager() {
  const [homepageContent, setHomepageContent] = useState<HomepageContent>({
    sections: DEFAULT_HOMEPAGE_SECTIONS,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!realtimeDb) {
      setLoading(false);
      return;
    }

    const homepageRef = ref(realtimeDb, "homepage_content");
    const unsubscribe = onValue(homepageRef, (snapshot) => {
      if (snapshot.exists()) {
        setHomepageContent(snapshot.val());
      } else {
        // Initialize with default content
        setHomepageContent({
          sections: DEFAULT_HOMEPAGE_SECTIONS,
          lastUpdated: new Date().toISOString(),
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!realtimeDb) {
      showMessage("error", "Firebase not configured");
      return;
    }

    setSaving(true);
    try {
      const updatedContent = {
        ...homepageContent,
        lastUpdated: new Date().toISOString(),
      };

      await set(ref(realtimeDb, "homepage_content"), updatedContent);
      setHomepageContent(updatedContent);
      showMessage("success", "Homepage content saved successfully!");
    } catch (error) {
      console.error("Error saving homepage content:", error);
      showMessage("error", "Failed to save homepage content");
    } finally {
      setSaving(false);
    }
  };

  const updateSectionContent = (sectionId: string, updates: any) => {
    setHomepageContent((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    }));
  };

  const toggleSectionVisibility = (sectionId: string) => {
    updateSectionContent(sectionId, {
      isVisible: !homepageContent.sections.find((s) => s.id === sectionId)
        ?.isVisible,
    });
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "hero":
        return <Home className="w-5 h-5" />;
      case "success_stories":
        return <Star className="w-5 h-5" />;
      case "how_it_works":
        return <HelpCircle className="w-5 h-5" />;
      case "pricing_teaser":
        return <DollarSign className="w-5 h-5" />;
      case "why_choose_us":
        return <CheckCircle className="w-5 h-5" />;
      case "final_cta":
        return <ExternalLink className="w-5 h-5" />;
      case "footer":
        return <Users className="w-5 h-5" />;
      default:
        return <Edit3 className="w-5 h-5" />;
    }
  };

  const renderSectionEditor = (section: HomepageSection) => {
    switch (section.type) {
      case "hero":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Title
                </label>
                <input
                  type="text"
                  value={section.content.title || ""}
                  onChange={(e) =>
                    updateSectionContent(section.id, {
                      content: { ...section.content, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={section.content.subtitle || ""}
                  onChange={(e) =>
                    updateSectionContent(section.id, {
                      content: { ...section.content, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={section.content.description || ""}
                onChange={(e) =>
                  updateSectionContent(section.id, {
                    content: {
                      ...section.content,
                      description: e.target.value,
                    },
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={section.content.buttonText || ""}
                  onChange={(e) =>
                    updateSectionContent(section.id, {
                      content: {
                        ...section.content,
                        buttonText: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Link
                </label>
                <input
                  type="text"
                  value={section.content.buttonLink || ""}
                  onChange={(e) =>
                    updateSectionContent(section.id, {
                      content: {
                        ...section.content,
                        buttonLink: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stats (JSON format)
              </label>
              <textarea
                value={JSON.stringify(section.content.stats || [], null, 2)}
                onChange={(e) => {
                  try {
                    const stats = JSON.parse(e.target.value);
                    updateSectionContent(section.id, {
                      content: { ...section.content, stats },
                    });
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                placeholder='[{"label": "Active Sellers", "value": "50K+"}]'
              />
            </div>
          </div>
        );

      case "success_stories":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={section.content.title || ""}
                  onChange={(e) =>
                    updateSectionContent(section.id, {
                      content: { ...section.content, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={section.content.subtitle || ""}
                  onChange={(e) =>
                    updateSectionContent(section.id, {
                      content: { ...section.content, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Success Stories (JSON format)
              </label>
              <textarea
                value={JSON.stringify(section.content.stories || [], null, 2)}
                onChange={(e) => {
                  try {
                    const stories = JSON.parse(e.target.value);
                    updateSectionContent(section.id, {
                      content: { ...section.content, stories },
                    });
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                placeholder='[{"id": "1", "name": "John Doe", "role": "Seller", "quote": "Great platform!", "avatar": "👨‍💼", "rating": 5}]'
              />
            </div>
          </div>
        );

      case "footer":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={section.content.companyInfo?.name || ""}
                  onChange={(e) =>
                    updateSectionContent(section.id, {
                      content: {
                        ...section.content,
                        companyInfo: {
                          ...section.content.companyInfo,
                          name: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Tagline
                </label>
                <input
                  type="text"
                  value={section.content.companyInfo?.tagline || ""}
                  onChange={(e) =>
                    updateSectionContent(section.id, {
                      content: {
                        ...section.content,
                        companyInfo: {
                          ...section.content.companyInfo,
                          tagline: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={section.content.contactInfo?.email || ""}
                onChange={(e) =>
                  updateSectionContent(section.id, {
                    content: {
                      ...section.content,
                      contactInfo: {
                        ...section.content.contactInfo,
                        email: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Links (JSON format)
              </label>
              <textarea
                value={JSON.stringify(
                  section.content.linkSections || {},
                  null,
                  2
                )}
                onChange={(e) => {
                  try {
                    const linkSections = JSON.parse(e.target.value);
                    updateSectionContent(section.id, {
                      content: { ...section.content, linkSections },
                    });
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                placeholder='{"Section Name": [{"label": "Link", "href": "/path"}]}'
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (JSON format)
              </label>
              <textarea
                value={JSON.stringify(section.content || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const content = JSON.parse(e.target.value);
                    updateSectionContent(section.id, { content });
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading homepage content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Homepage Content Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Manage the content for your seller landing page homepage
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="https://surf-seller-pagee-k6qrdpo71-vellankivasudeva-gmailcoms-projects.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Live Site
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {homepageContent.sections.length}
          </div>
          <div className="text-sm text-gray-600">Total Sections</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {homepageContent.sections.filter((s) => s.isVisible).length}
          </div>
          <div className="text-sm text-gray-600">Visible Sections</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-600">
            {homepageContent.lastUpdated
              ? new Date(homepageContent.lastUpdated).toLocaleDateString()
              : "Never"}
          </div>
          <div className="text-sm text-gray-600">Last Updated</div>
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Homepage Sections
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure the content for each section of your homepage
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {homepageContent.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div key={section.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    {getSectionIcon(section.type)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {section.type.replace("_", " ")} section
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleSectionVisibility(section.id)}
                      className={`p-2 rounded ${
                        section.isVisible
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                      title={
                        section.isVisible ? "Hide section" : "Show section"
                      }
                    >
                      {section.isVisible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === section.id ? null : section.id
                        )
                      }
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit section"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedSection === section.id && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Edit {section.title}
                    </h4>
                    {renderSectionEditor(section)}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          How to Use Homepage Manager
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• Click the edit icon next to any section to modify its content</p>
          <p>• Use the eye icon to show/hide sections on your live site</p>
          <p>
            • For complex sections like Success Stories, edit the JSON content
            carefully
          </p>
          <p>• Always click "Save Changes" after making modifications</p>
          <p>• Use "Preview Live Site" to see your changes in action</p>
        </div>
      </div>
    </div>
  );
}
