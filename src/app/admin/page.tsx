"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Layout,
  Zap,
  Sparkles,
  Eye,
  Globe,
  Activity,
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AdminDashboard() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/sections`);
        if (response.data.success) {
          setSections(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  // Calculate real metrics
  const activeSections = sections.filter(s => s.isActive).length;
  const totalBlocks = sections.reduce((acc, s) => acc + (s.content?.blocks?.length || 0), 0);
  const customLayouts = sections.filter(s => s.type === 'custom-layout').length;

  const stats = [
    {
      name: "Sections Live",
      value: activeSections,
      icon: Layout,
      color: "from-blue-500 to-indigo-600",
      description: "Visible on landing page",
    },
    {
      name: "Studio Elements",
      value: totalBlocks,
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      description: "Interactive blocks used",
    },
    {
      name: "Custom Designs",
      value: customLayouts,
      icon: Sparkles,
      color: "from-amber-400 to-orange-600",
      description: "Bespoke studio layouts",
    },
    {
      name: "Total Canvas",
      value: sections.length,
      icon: Sparkles,
      color: "from-cyan-500 to-blue-600",
      description: "Total created sections",
    },
  ];

  const quickActions = [
    {
      title: "Launch Surf Studio",
      description: "Pixel-perfect visual design canvas for your single-page site",
      href: "/admin/sections",
      icon: Sparkles,
      color: "bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-700 border-indigo-200",
      buttonColor: "bg-indigo-600 hover:bg-indigo-700",
      secondaryIcon: Zap,
    },
    {
      title: "Live Preview",
      description: "View your creative site live in real-time",
      href: "https://sell.surf.mt",
      icon: Eye,
      color: "bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
      external: true,
    },
  ];

  const recentActivity = [
    {
      action: "Surf Studio v6.0 deployed",
      time: "Just now",
      color: "bg-indigo-500",
    },
    {
      action: "Absolute positioning enabled",
      time: "2 mins ago",
      color: "bg-blue-500",
    },
    {
      action: "CORS whitelist updated",
      time: "5 mins ago",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Creative Studio Dashboard
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Manage your high-fidelity design blocks and creative canvas.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-gray-100 h-32" />
          ))
        ) : (
          stats.map((stat) => (
            <div
              key={stat.name}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden relative"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.03] -mr-8 -mt-8 rounded-full`} />
              <div className="flex items-center relative gap-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} flex-shrink-0 shadow-lg shadow-blue-500/10`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {stat.name}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-gray-900 tracking-tight">
                      {stat.value}
                    </p>
                    {stat.name === "Sections Live" && (
                      <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-8 text-indigo-600">
          <Zap className="w-6 h-6 fill-current" />
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Quick Design Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {quickActions.map((action) => (
            <div
              key={action.title}
              className={`group flex flex-col p-8 border rounded-3xl transition-all hover:shadow-2xl hover:scale-[1.02] ${action.color} border-transparent hover:border-white/50 relative overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white shadow-sm">
                  <action.icon className="w-8 h-8 text-indigo-600" />
                </div>
                {action.secondaryIcon && (
                  <action.secondaryIcon className="w-6 h-6 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-md text-gray-600 mb-8 leading-relaxed max-w-sm">
                  {action.description}
                </p>
              </div>

              {action.external ? (
                <a
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center px-8 py-4 text-md font-black text-white rounded-2xl transition-all shadow-xl ${action.buttonColor} active:scale-95`}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                  <Globe className="w-5 h-5 ml-2 opacity-50" />
                </a>
              ) : (
                <Link
                  href={action.href}
                  className={`inline-flex items-center justify-center px-8 py-4 text-md font-black text-white rounded-2xl transition-all shadow-xl ${action.buttonColor} active:scale-95`}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Launch Studio
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
