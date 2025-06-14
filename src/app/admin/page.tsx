"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { BarChart3, Navigation, FileText, Users, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { items: navigationItems } = useSelector(
    (state: RootState) => state.navigation
  );
  const { pageContent } = useSelector((state: RootState) => state.content);

  const stats = [
    {
      name: "Navigation Items",
      value: navigationItems.length,
      icon: Navigation,
      color: "bg-blue-500",
    },
    {
      name: "Content Sections",
      value: pageContent ? 3 : 0,
      icon: FileText,
      color: "bg-green-500",
    },
    {
      name: "Active Features",
      value: pageContent?.features.features.length || 0,
      icon: Activity,
      color: "bg-purple-500",
    },
    {
      name: "Total Views",
      value: "2.4k",
      icon: Users,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Manage your website content and navigation
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/navigation"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Navigation className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Navigation</h3>
            <p className="text-sm text-gray-600">
              Add, edit, or remove navigation items
            </p>
          </a>
          <a
            href="/admin/content"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-medium text-gray-900">Edit Content</h3>
            <p className="text-sm text-gray-600">
              Update page content and sections
            </p>
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="font-medium text-gray-900">View Site</h3>
            <p className="text-sm text-gray-600">Preview your live website</p>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Navigation items loaded</span>
            <span className="ml-auto text-gray-400">Just now</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Page content synchronized</span>
            <span className="ml-auto text-gray-400">2 mins ago</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Admin panel accessed</span>
            <span className="ml-auto text-gray-400">5 mins ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
