"use client";

import { cn } from "@/lib/utils";
import { setActiveItem } from "@/store/slices/navigationSlice";
import { RootState } from "@/store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export function Navigation() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const dispatch = useDispatch();

  const { items: navigationItems } = useSelector(
    (state: RootState) => state.navigation
  );

  const handleItemClick = (itemId: string) => {
    dispatch(setActiveItem(itemId));
  };

  const isActiveItem = (href: string) => {
    return pathname === href;
  };

  if (!navigationItems.length) {
    return (
      <nav className="flex items-center space-x-1">
        <div className="text-gray-500 text-sm">Loading navigation...</div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-1">
      {navigationItems.map((item) => (
        <div
          key={item.id}
          className="relative"
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link
            href={item.href}
            onClick={() => handleItemClick(item.id)}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative",
              isActiveItem(item.href)
                ? "text-blue-600 bg-blue-50"
                : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            )}
          >
            {item.label}
            {/* Active indicator */}
            {isActiveItem(item.href) && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
            )}
          </Link>

          {/* Hover tooltip */}
          {hoveredItem === item.id && item.description && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="text-sm font-medium text-gray-900 mb-1">
                {item.label}
              </div>
              <div className="text-xs text-gray-600">{item.description}</div>
              {/* Arrow */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45" />
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
