"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Navigation,
  FileText,
  Settings,
  Menu,
  X,
  ExternalLink,
  Users,
  DollarSign,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close sidebar on route change
    setSidebarOpen(false);
  }, [pathname]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      description: "Overview and quick actions",
    },
    {
      name: "Pages",
      href: "/admin/navigation",
      icon: Navigation,
      description: "Manage navigation pages",
    },
    {
      name: "Content",
      href: "/admin/content",
      icon: FileText,
      description: "Edit page content sections",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      description: "Platform configuration",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-2" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Seller Admin</h1>
              <p className="text-xs text-gray-500">Platform Management</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 ${
                    isActive(item.href)
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <div>
                  <div>{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Platform Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="px-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Platform
              </h3>
            </div>
            <div className="space-y-1">
              <Link
                href="https://surf-seller-page.vercel.app"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
                <span>View Live Site</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 px-3">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Quick Stats
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-blue-800">
                  <span>Pages Created:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between text-blue-800">
                  <span>Content Sections:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between text-blue-800">
                  <span>Setup Progress:</span>
                  <span className="font-medium">0%</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
                <span>Seller Platform</span>
                <span>/</span>
                <span className="font-medium text-gray-900">
                  {navigation.find((item) => isActive(item.href))?.name ||
                    "Dashboard"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Status indicator */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System Online</span>
              </div>

              {/* Last updated */}
              <span className="hidden md:block text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Seller Platform Admin v1.0
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Need help?</span>
              <a
                href="mailto:support@your-platform.com"
                className="text-blue-600 hover:text-blue-700"
              >
                Contact Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
