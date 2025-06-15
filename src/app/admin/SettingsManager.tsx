"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Globe,
  DollarSign,
  Mail,
  Palette,
  Shield,
  Bell,
  Search,
} from "lucide-react";

const SellerSettingsManager = () => {
  const [settings, setSettings] = useState({
    // Platform Information
    platformName: "SellerHub",
    platformDescription: "The ultimate platform for online sellers",
    platformUrl: "https://your-seller-platform.com",
    supportEmail: "support@your-platform.com",

    // Seller Onboarding
    allowInstantApproval: true,
    requireBusinessVerification: false,
    minimumAge: 18,
    supportedCountries: "US,CA,UK,AU",

    // Commission & Fees
    commissionRate: 5,
    processingFee: 2.9,
    monthlyFee: 0,
    listingFee: 0,
    withdrawalFee: 1,

    // Email Templates
    welcomeEmailEnabled: true,
    approvalEmailEnabled: true,
    salesNotificationEnabled: true,
    monthlyReportEnabled: true,

    // Platform Appearance
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    logoUrl: "",
    faviconUrl: "",
    brandFont: "Inter",

    // SEO Settings
    metaTitle: "Sell Online - Your Seller Platform",
    metaDescription:
      "Join thousands of successful sellers on our platform. Easy setup, powerful tools, and unlimited potential.",
    metaKeywords: "sell online, e-commerce, marketplace, sellers",

    // Security
    twoFactorRequired: false,
    passwordMinLength: 8,
    sessionTimeout: 60,
    maxLoginAttempts: 5,

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: true,
  });

  const [activeTab, setActiveTab] = useState("platform");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("sellerPlatformSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem("sellerPlatformSettings", JSON.stringify(settings));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save settings. Please try again.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "platform", name: "Platform", icon: Globe },
    { id: "commission", name: "Fees & Commission", icon: DollarSign },
    { id: "email", name: "Email Settings", icon: Mail },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "seo", name: "SEO", icon: Search },
    { id: "security", name: "Security", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
  ];

  const renderPlatformSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform Name
          </label>
          <input
            type="text"
            value={settings.platformName}
            onChange={(e) => handleInputChange("platformName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Your Seller Platform"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform URL
          </label>
          <input
            type="url"
            value={settings.platformUrl}
            onChange={(e) => handleInputChange("platformUrl", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="https://your-platform.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platform Description
        </label>
        <textarea
          value={settings.platformDescription}
          onChange={(e) =>
            handleInputChange("platformDescription", e.target.value)
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Brief description of your seller platform"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Email
          </label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => handleInputChange("supportEmail", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="support@your-platform.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supported Countries (comma-separated)
          </label>
          <input
            type="text"
            value={settings.supportedCountries}
            onChange={(e) =>
              handleInputChange("supportedCountries", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="US,CA,UK,AU"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">
              Instant Seller Approval
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Allow sellers to start selling immediately
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
            <input
              type="checkbox"
              checked={settings.allowInstantApproval}
              onChange={(e) =>
                handleInputChange("allowInstantApproval", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">
              Business Verification Required
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Require business documents for approval
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
            <input
              type="checkbox"
              checked={settings.requireBusinessVerification}
              onChange={(e) =>
                handleInputChange(
                  "requireBusinessVerification",
                  e.target.checked
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderCommissionSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Commission Structure</h3>
        <p className="text-sm text-blue-700">
          Set your platform's fee structure. These fees will be displayed to
          sellers during onboarding.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commission Rate (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={settings.commissionRate}
              onChange={(e) =>
                handleInputChange("commissionRate", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="0"
              max="50"
              step="0.1"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">
              %
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Percentage taken from each sale
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Processing Fee (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={settings.processingFee}
              onChange={(e) =>
                handleInputChange("processingFee", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="0"
              max="10"
              step="0.1"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">
              %
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Credit card processing fees
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Subscription Fee ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500 text-sm">
              $
            </span>
            <input
              type="number"
              value={settings.monthlyFee}
              onChange={(e) =>
                handleInputChange("monthlyFee", parseFloat(e.target.value))
              }
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Monthly fee for sellers (0 for free)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listing Fee ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500 text-sm">
              $
            </span>
            <input
              type="number"
              value={settings.listingFee}
              onChange={(e) =>
                handleInputChange("listingFee", parseFloat(e.target.value))
              }
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Fee per product listing</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
          Fee Calculator Preview
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Sale Amount:</span>
            <span>$100.00</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Commission ({settings.commissionRate}%):</span>
            <span>-${((100 * settings.commissionRate) / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Processing Fee ({settings.processingFee}%):</span>
            <span>-${((100 * settings.processingFee) / 100).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-medium text-green-600">
            <span>Seller Receives:</span>
            <span>
              $
              {(
                100 -
                (100 * settings.commissionRate) / 100 -
                (100 * settings.processingFee) / 100
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">
          Email Configuration
        </h3>
        <p className="text-sm text-yellow-700">
          Configure automated emails sent to sellers throughout their journey on
          your platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[
          {
            key: "welcomeEmailEnabled",
            title: "Welcome Email",
            description: "Send welcome email to new sellers",
          },
          {
            key: "approvalEmailEnabled",
            title: "Approval Email",
            description: "Notify sellers when approved",
          },
          {
            key: "salesNotificationEnabled",
            title: "Sales Notifications",
            description: "Email sellers about new sales",
          },
          {
            key: "monthlyReportEnabled",
            title: "Monthly Reports",
            description: "Send monthly performance reports",
          },
        ].map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                {setting.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {setting.description}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
              <input
                type="checkbox"
                checked={
                  settings[setting.key as keyof typeof settings] as boolean
                }
                onChange={(e) =>
                  handleInputChange(setting.key, e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Brand Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) =>
                handleInputChange("primaryColor", e.target.value)
              }
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer flex-shrink-0"
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) =>
                handleInputChange("primaryColor", e.target.value)
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-0"
              placeholder="#3B82F6"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) =>
                handleInputChange("secondaryColor", e.target.value)
              }
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer flex-shrink-0"
            />
            <input
              type="text"
              value={settings.secondaryColor}
              onChange={(e) =>
                handleInputChange("secondaryColor", e.target.value)
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-0"
              placeholder="#10B981"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            value={settings.logoUrl}
            onChange={(e) => handleInputChange("logoUrl", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="https://your-platform.com/logo.png"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Font
          </label>
          <select
            value={settings.brandFont}
            onChange={(e) => handleInputChange("brandFont", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="Inter">Inter (Default)</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Poppins">Poppins</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
          Color Preview
        </h4>
        <div className="flex space-x-4">
          <div
            className="w-16 h-16 rounded-lg border flex-shrink-0"
            style={{ backgroundColor: settings.primaryColor }}
            title="Primary Color"
          ></div>
          <div
            className="w-16 h-16 rounded-lg border flex-shrink-0"
            style={{ backgroundColor: settings.secondaryColor }}
            title="Secondary Color"
          ></div>
        </div>
      </div>
    </div>
  );

  const renderSEOSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Title
        </label>
        <input
          type="text"
          value={settings.metaTitle}
          onChange={(e) => handleInputChange("metaTitle", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Your Seller Platform Title"
          maxLength={60}
        />
        <p className="text-xs text-gray-500 mt-1">
          {settings.metaTitle.length}/60 characters (recommended: 50-60)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Description
        </label>
        <textarea
          value={settings.metaDescription}
          onChange={(e) => handleInputChange("metaDescription", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Brief description for search engines"
          maxLength={160}
        />
        <p className="text-xs text-gray-500 mt-1">
          {settings.metaDescription.length}/160 characters (recommended:
          150-160)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Keywords
        </label>
        <input
          type="text"
          value={settings.metaKeywords}
          onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="sell online, e-commerce, marketplace, sellers"
        />
        <p className="text-xs text-gray-500 mt-1">
          Comma-separated keywords relevant to your platform
        </p>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Password Length
          </label>
          <input
            type="number"
            value={settings.passwordMinLength}
            onChange={(e) =>
              handleInputChange("passwordMinLength", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="6"
            max="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) =>
              handleInputChange("sessionTimeout", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="5"
            max="1440"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">
            Two-Factor Authentication
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Require 2FA for all seller accounts
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
          <input
            type="checkbox"
            checked={settings.twoFactorRequired}
            onChange={(e) =>
              handleInputChange("twoFactorRequired", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[
          {
            key: "emailNotifications",
            title: "Email Notifications",
            description: "System email notifications",
          },
          {
            key: "pushNotifications",
            title: "Push Notifications",
            description: "Browser push notifications",
          },
        ].map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                {setting.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {setting.description}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
              <input
                type="checkbox"
                checked={
                  settings[setting.key as keyof typeof settings] as boolean
                }
                onChange={(e) =>
                  handleInputChange(setting.key, e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "platform":
        return renderPlatformSettings();
      case "commission":
        return renderCommissionSettings();
      case "email":
        return renderEmailSettings();
      case "appearance":
        return renderAppearanceSettings();
      case "seo":
        return renderSEOSettings();
      case "security":
        return renderSecuritySettings();
      case "notifications":
        return renderNotificationSettings();
      default:
        return renderPlatformSettings();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Platform Settings
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Configure your seller platform settings and preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="text-sm break-words">{message.text}</div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          {/* Mobile Tab Selector */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Tab Navigation */}
          <nav className="hidden sm:flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 lg:px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5 mr-2 flex-shrink-0" />
                  <span className="hidden lg:inline">{tab.name}</span>
                  <span className="lg:hidden">{tab.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">{renderTabContent()}</div>

        {/* Save Button */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {isLoading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerSettingsManager;
