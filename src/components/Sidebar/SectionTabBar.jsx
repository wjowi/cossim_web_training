"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/Link";
import { SidebarData } from "@/core/data/siderbar_data";

// Returns the nested subgroup (e.g. "Setup") if the active page lives inside one,
// otherwise the top-level group that directly links to the active page.
const findActiveGroup = (pathname) => {
  for (const group of SidebarData) {
    for (const item of group.submenuItems || []) {
      if (item.submenu) {
        const nestedLinks = (item.submenuItems || []).map((sub) => sub.link).filter(Boolean);
        if (nestedLinks.includes(pathname)) return item;
      } else if (item.link === pathname) {
        return group;
      }
    }
  }
  return null;
};

const SectionTabBar = () => {
  const pathname = usePathname();
  const activeGroup = findActiveGroup(pathname);
  const tabs = (activeGroup?.submenuItems || []).filter((item) => item.link);

  if (!activeGroup || tabs.length < 2) return null;

  return (
    <div className="section-tab-bar">
      <span className="section-tab-bar-label">{activeGroup.label}</span>
      <div className="section-tab-bar-tabs">
        {tabs.map((item) => (
          <Link
            key={item.label}
            to={item.link}
            className={`section-tab-bar-tab ${pathname === item.link ? "active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SectionTabBar;
