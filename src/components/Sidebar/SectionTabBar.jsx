"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/Link";
import { SidebarData } from "@/core/data/siderbar_data";

const flattenLinks = (items = []) =>
  items.flatMap((item) => [item.link, ...flattenLinks(item.submenuItems)]).filter(Boolean);

// Always resolves to the top-level group, even if the active page is nested
// inside a subgroup (e.g. Setup) — so the tab bar stays put (Setup, Profile,
// SMS, Policies) no matter which Setup page you're on.
const findActiveGroup = (pathname) =>
  SidebarData.find((group) => flattenLinks(group.submenuItems).includes(pathname)) || null;

const isTabActive = (item, pathname) => {
  if (item.submenu) {
    return item.link === pathname || flattenLinks(item.submenuItems).includes(pathname);
  }
  return item.link === pathname;
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
            className={`section-tab-bar-tab ${isTabActive(item, pathname) ? "active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SectionTabBar;
