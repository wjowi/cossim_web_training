"use client"
import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronDown } from "react-feather";
import { useLocation } from "@/hooks/useLocation";
import ClientScrollbars from "../ClientScrollbars";
import { SidebarData } from "@/core/data/siderbar_data";
import SidebarItem from "./SidebarItem";

const HOVER_CLOSE_DELAY = 350;

const flattenLinks = (items = []) =>
  items.flatMap((item) => [item.link, ...flattenLinks(item.submenuItems)]).filter(Boolean);

const Sidebar = () => {
  const Location = useLocation();
  const [openGroup, setOpenGroup] = useState("");
  const [expandedSubgroup, setExpandedSubgroup] = useState("");
  const [flyoutTop, setFlyoutTop] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const flyoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const closeMobileSidebar = () => {
    if (window.innerWidth <= 991) {
      document.querySelector(".main-wrapper")?.classList.remove("slide-nav");
      document.querySelector(".sidebar-overlay")?.classList.remove("opened");
    }
  };

  const cancelScheduledClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const closeFlyout = useCallback(() => {
    cancelScheduledClose();
    setOpenGroup("");
    setExpandedSubgroup("");
  }, []);

  const toggleSubgroup = (label) => {
    setExpandedSubgroup((prev) => (prev === label ? "" : label));
  };

  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimeoutRef.current = setTimeout(() => setOpenGroup(""), HOVER_CLOSE_DELAY);
  };

  const openFlyout = (label, headerEl) => {
    cancelScheduledClose();
    if (headerEl) {
      const rect = headerEl.getBoundingClientRect();
      setFlyoutTop(Math.min(rect.top, window.innerHeight - 80));
    }
    setOpenGroup(label);
  };

  const handleHeaderClick = (label, headerEl) => {
    if (openGroup === label) {
      closeFlyout();
    } else {
      openFlyout(label, headerEl);
    }
  };

  // Only schedule a close if the cursor isn't headed straight into the flyout
  // (or another header, which will re-open immediately on its own mouseenter).
  const handleHeaderLeave = (event) => {
    const related = event.relatedTarget;
    if (related && flyoutRef.current?.contains(related)) return;
    scheduleClose();
  };

  // Same idea in reverse: leaving the flyout toward a header shouldn't flicker closed.
  const handleFlyoutLeave = (event) => {
    const related = event.relatedTarget;
    if (related?.closest?.(".submenu-hdr-toggle")) return;
    scheduleClose();
  };

  // Close the flyout on route change
  useEffect(() => {
    closeFlyout();
  }, [Location.pathname, closeFlyout]);

  // Close the flyout when clicking outside it (and outside the header that opened it)
  useEffect(() => {
    if (!openGroup) return undefined;

    const handleClickOutside = (event) => {
      if (flyoutRef.current && flyoutRef.current.contains(event.target)) return;
      if (event.target.closest(".submenu-hdr-toggle")) return;
      closeFlyout();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openGroup, closeFlyout]);

  useEffect(() => () => cancelScheduledClose(), []);

  const openGroupData = SidebarData.find((group) => group.label === openGroup);

  // Auto-expand a nested subgroup (e.g. Setup) if it contains the active page
  useEffect(() => {
    if (!openGroupData) return;
    const activeSubgroup = openGroupData.submenuItems?.find(
      (item) => item.submenu && flattenLinks(item.submenuItems).includes(Location.pathname)
    );
    setExpandedSubgroup(activeSubgroup?.label || "");
  }, [openGroupData, Location.pathname]);

  return (
    <div>
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <ClientScrollbars style={{ height: 'calc(100vh - 66px)' }}>
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu">
              <ul>
                {SidebarData?.map((mainLabel) => {
                  const isCollapsible = mainLabel?.collapsible !== false;
                  const groupLinks = (mainLabel?.submenuItems || [])
                    .map((item) => item?.link)
                    .filter(Boolean);
                  const isGroupActive = groupLinks.includes(Location.pathname);

                  return (
                    <li
                      className="submenu-open"
                      key={mainLabel?.label}
                      onMouseEnter={(event) => isCollapsible && openFlyout(mainLabel?.label, event.currentTarget.querySelector(".submenu-hdr"))}
                      onMouseLeave={isCollapsible ? handleHeaderLeave : undefined}
                    >
                      {isCollapsible ? (
                        <h6
                          className={`submenu-hdr submenu-hdr-toggle ${openGroup === mainLabel?.label ? "open" : ""} ${isGroupActive ? "active-group" : ""}`}
                          onClick={(event) => handleHeaderClick(mainLabel?.label, event.currentTarget)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleHeaderClick(mainLabel?.label, event.currentTarget);
                            }
                          }}
                        >
                          {mainLabel?.icon && (
                            <span className="sidebar-icon">{mainLabel.icon}</span>
                          )}
                          <span className="sidebar-label">{mainLabel?.label}</span>
                          <span className="submenu-hdr-arrow" aria-hidden="true" />
                        </h6>
                      ) : (
                        <>
                          <h6 className="submenu-hdr">{mainLabel?.label}</h6>
                          <ul>
                            {mainLabel?.submenuItems?.map((item, i) => (
                              <li className="submenu" key={i}>
                                <SidebarItem
                                  to={item?.link}
                                  icon={item?.icon}
                                  label={item?.label}
                                  isActive={item?.link === Location.pathname}
                                  onClick={closeMobileSidebar}
                                />
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </ClientScrollbars>
      </div>

      {/* Flyout panel: shows a collapsible group's items without pushing the sidebar list around */}
      {openGroupData && (
        <div
          className="sidebar-flyout"
          style={{ top: flyoutTop }}
          ref={flyoutRef}
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={handleFlyoutLeave}
        >
          <div className="sidebar-flyout-header">
            <span className="sidebar-flyout-header-title">
              {openGroupData.icon}
              {openGroupData.label}
            </span>
            <button
              type="button"
              className="sidebar-flyout-close"
              onClick={closeFlyout}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="sidebar-flyout-body">
            {openGroupData.submenuItems?.map((item) => {
              if (item.submenu) {
                const isExpanded = expandedSubgroup === item.label;
                const isSubgroupActive = flattenLinks(item.submenuItems).includes(Location.pathname);

                return (
                  <div className="sidebar-flyout-subgroup" key={item.label}>
                    <button
                      type="button"
                      className={`sidebar-flyout-subgroup-toggle ${isExpanded ? "open" : ""} ${isSubgroupActive ? "active" : ""}`}
                      onClick={() => toggleSubgroup(item.label)}
                    >
                      {item.icon && <span className="sidebar-icon">{item.icon}</span>}
                      <span className="sidebar-label">{item.label}</span>
                      <ChevronDown size={14} className="sidebar-flyout-subgroup-chevron" />
                    </button>
                    {isExpanded && (
                      <div className="sidebar-flyout-subgroup-body">
                        {item.submenuItems?.map((subItem) => (
                          <SidebarItem
                            key={subItem.label}
                            to={subItem.link}
                            icon={subItem.icon}
                            label={subItem.label}
                            isActive={subItem.link === Location.pathname}
                            extraClass="sidebar-flyout-item sidebar-flyout-item-nested"
                            onClick={() => {
                              closeFlyout();
                              closeMobileSidebar();
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <SidebarItem
                  key={item.label}
                  to={item.link}
                  icon={item.icon}
                  label={item.label}
                  isActive={item.link === Location.pathname}
                  extraClass="sidebar-flyout-item"
                  onClick={() => {
                    closeFlyout();
                    closeMobileSidebar();
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
