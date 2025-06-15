"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  BarChart3,
  Navigation,
  FileText,
  Users,
  Activity,
  Globe,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { items: navigationItems } = useSelector(
    (state: RootState) => state.navigation
  );

  // Calculate content statistics
  const totalPages = navigationItems.length;
  const hasHomePage = navigationItems.some((item) => item.href === "/");
  const hasPricingPage = navigationItems.some(
    (item) => item.href === "/pricing"
  );
  const hasSignupPage = navigationItems.some((item) => item.href === "/signup");

  const stats = [
    {
      name: "Navigation Pages",
      value: totalPages,
      icon: Navigation,
      color: "bg-blue-500",
      description: "Total pages in navigation",
    },
    {
      name: "Content Sections",
      value: "0", // This would be calculated from actual content
      icon: FileText,
      color: "bg-green-500",
      description: "Across all pages",
    },
    {
      name: "Setup Progress",
      value: `${Math.round((totalPages / 6) * 100)}%`,
      icon: Activity,
      color: "bg-purple-500",
      description: "Recommended 6 pages",
    },
    {
      name: "Live Status",
      value: hasHomePage ? "Active" : "Setup",
      icon: Globe,
      color: hasHomePage ? "bg-green-500" : "bg-orange-500",
      description: hasHomePage ? "Site is live" : "Needs setup",
    },
  ];

  const quickActions = [
    {
      title: "Manage Pages",
      description: "Add, edit, or remove navigation pages",
      href: "/admin/navigation",
      icon: Navigation,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Edit Content",
      description: "Update page content and sections",
      href: "/admin/content",
      icon: FileText,
      color: "bg-green-50 text-green-700 border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Preview Site",
      description: "View your live seller platform",
      href: "https://surf-seller-page.vercel.app",
      icon: Eye,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      external: true,
    },
  ];

  const setupChecklist = [
    {
      title: "Create Home Page",
      completed: hasHomePage,
      description: "Main landing page for your seller platform",
    },
    {
      title: "Add Pricing Page",
      completed: hasPricingPage,
      description: "Show commission structure and plans",
    },
    {
      title: "Setup Registration",
      completed: hasSignupPage,
      description: "Enable seller sign-up page",
    },
    {
      title: "Add Content Sections",
      completed: false, // Would check actual content
      description: "Create hero, features, and testimonial sections",
    },
    {
      title: "Configure Settings",
      completed: false,
      description: "Setup site metadata and configurations",
    },
  ];

  const recentActivity = [
    {
      action: "Navigation system initialized",
      time: "Just now",
      color: "bg-blue-500",
    },
    {
      action: "Admin panel accessed",
      time: "2 mins ago",
      color: "bg-green-500",
    },
    {
      action: "Database connection established",
      time: "5 mins ago",
      color: "bg-purple-500",
    },
  ];

  const completedTasks = setupChecklist.filter((task) => task.completed).length;
  const setupProgress = Math.round(
    (completedTasks / setupChecklist.length) * 100
  );

  // Create sorted copies of navigation items to avoid mutation
  const sortedNavigationItems = [...navigationItems].sort(
    (a, b) => a.order - b.order
  );
  const displayedNavigationItems = sortedNavigationItems.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Seller Platform Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Manage your seller landing page content and navigation
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div
                className={`p-2 sm:p-3 rounded-lg ${stat.color} flex-shrink-0`}
              >
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  {stat.name}
                </p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Setup Progress */}
      {setupProgress < 100 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 sm:p-6 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-lg font-semibold text-blue-900">
              Setup Progress
            </h2>
            <span className="text-sm font-medium text-blue-700">
              {setupProgress}% Complete
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${setupProgress}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {setupChecklist.map((task, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    task.completed ? "text-green-600" : "text-gray-300"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      task.completed ? "text-green-800" : "text-blue-800"
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-blue-600 break-words">
                    {task.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <div
              key={action.title}
              className={`p-4 border rounded-lg transition-all hover:shadow-md ${action.color}`}
            >
              <div className="flex items-start mb-3">
                <action.icon className="w-6 h-6 sm:w-8 sm:h-8 mr-3 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm sm:text-base">
                    {action.title}
                  </h3>
                  <p className="text-xs sm:text-sm opacity-75 break-words">
                    {action.description}
                  </p>
                </div>
              </div>
              {action.external ? (
                <a
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-white rounded-md transition-colors ${action.buttonColor} w-full justify-center sm:w-auto`}
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  View Site
                </a>
              ) : (
                <Link
                  href={action.href}
                  className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-white rounded-md transition-colors ${action.buttonColor} w-full justify-center sm:w-auto`}
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Open
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Pages */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">
              Current Pages
            </h2>
            <Link
              href="/admin/navigation"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Manage All
            </Link>
          </div>

          {navigationItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Navigation className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Pages Yet</h3>
              <p className="mb-4 text-sm px-4">
                Start by creating your first navigation page
              </p>
              <Link
                href="/admin/navigation"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Page
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedNavigationItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {item.label}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 break-all">
                      {item.href}
                    </p>
                  </div>
                  <Link
                    href="/admin/content"
                    className="text-blue-600 hover:text-blue-700 ml-2 flex-shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              ))}
              {navigationItems.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  And {navigationItems.length - 5} more pages...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center text-sm">
                <div
                  className={`w-2 h-2 ${activity.color} rounded-full mr-3 flex-shrink-0`}
                ></div>
                <span className="text-gray-600 flex-1 min-w-0 break-words">
                  {activity.action}
                </span>
                <span className="text-gray-400 ml-2 flex-shrink-0 text-xs sm:text-sm">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      {totalPages === 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Getting Started with Your Seller Platform
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                1
              </div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                Create Pages
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Add navigation pages for your seller platform
              </p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                2
              </div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                Add Content
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Create compelling content sections for each page
              </p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                3
              </div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                Customize
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Adjust settings and appearance to match your brand
              </p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                4
              </div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                Launch
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Preview and publish your seller platform
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
