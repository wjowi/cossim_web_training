"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "react-feather";
import Link from "@/components/Link";
import { SidebarData } from "@/core/data/siderbar_data";

// Only fires for a nested subgroup (e.g. Setup) — never for a top-level
// group's own direct items, which use the top tab bar instead.
const findActiveSubgroup = (pathname) => {
  for (const group of SidebarData) {
    for (const item of group.submenuItems || []) {
      if (!item.submenu) continue;
      const nestedLinks = (item.submenuItems || []).map((sub) => sub.link).filter(Boolean);
      if (item.link === pathname || nestedLinks.includes(pathname)) return item;
    }
  }
  return null;
};

const ContextSidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const activeGroup = findActiveSubgroup(pathname);
  const items = (activeGroup?.submenuItems || []).filter((item) => item.link);
  const isVisible = Boolean(activeGroup) && items.length >= 2;

  // Reset the collapse state when switching to a different group
  useEffect(() => {
    setCollapsed(false);
  }, [activeGroup?.label]);

  // Shift the page content over while this panel is showing (mirrors the mini-sidebar pattern)
  useEffect(() => {
    document.body.classList.toggle("has-context-sidebar", isVisible);
    return () => document.body.classList.remove("has-context-sidebar");
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="context-sidebar">
      <button
        type="button"
        className="context-sidebar-header"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        {activeGroup.icon && <span className="context-sidebar-icon">{activeGroup.icon}</span>}
        <span className="context-sidebar-title">
          <span className="context-sidebar-label">{activeGroup.label}</span>
          <small className="context-sidebar-count">{items.length} items</small>
        </span>
        <ChevronDown size={16} className={collapsed ? "collapsed" : ""} />
      </button>
      {!collapsed && (
        <div className="context-sidebar-body">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.link}
              className={`context-sidebar-item ${pathname === item.link ? "active" : ""}`}
            >
              {item.icon && <span className="context-sidebar-item-icon">{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContextSidebar;
