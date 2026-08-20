"use client"
import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from "react-feather";
import { useLocation } from "@/hooks/useLocation";
import ClientScrollbars from "../ClientScrollbars";
import { SidebarData } from "@/core/data/siderbar_data";
import SidebarItem from "./SidebarItem";
import Link from "@/components/Link";

const HOVER_CLOSE_DELAY = 350;

const flattenLinks = (items = []) =>
  items.flatMap((item) => [item.link, ...flattenLinks(item.submenuItems)]).filter(Boolean);

const Sidebar = () => {
  const Location = useLocation();
  const [openGroup, setOpenGroup] = useState("");
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
  }, []);

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

  // Only schedule a close if the cursor isn't headed straight into the flyout.
  const handleHeaderLeave = (event) => {
    const related = event.relatedTarget;
    if (related && flyoutRef.current?.contains(related)) return;
    scheduleClose();
  };

  const handleFlyoutLeave = (event) => {
    const related = event.relatedTarget;
    if (related?.closest?.(".submenu-hdr-toggle")) return;
    scheduleClose();
  };

  // Close the flyout on route change
  useEffect(() => {
    closeFlyout();
  }, [Location.pathname, closeFlyout]);

  // Close when clicking outside the flyout and outside the header that opened it
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

  return (
    <div>
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <ClientScrollbars style={{ height: 'calc(100vh - 66px)' }}>
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu">
              <ul>
                {SidebarData?.map((mainLabel) => {
                  const isCollapsible = mainLabel?.collapsible !== false;
                  const groupLinks = flattenLinks(mainLabel?.submenuItems);
                  const isGroupActive = groupLinks.includes(Location.pathname);
                  const defaultLink = mainLabel?.submenuItems?.[0]?.link || "#";

                  return (
                    <li
                      className="submenu-open"
                      key={mainLabel?.label}
                      onMouseEnter={(event) => isCollapsible && openFlyout(mainLabel?.label, event.currentTarget.querySelector(".submenu-hdr"))}
                      onMouseLeave={isCollapsible ? handleHeaderLeave : undefined}
                    >
                      {isCollapsible ? (
                        <Link
                          to={defaultLink}
                          className={`submenu-hdr submenu-hdr-toggle ${openGroup === mainLabel?.label ? "open" : ""} ${isGroupActive ? "active-group" : ""}`}
                          onClick={closeFlyout}
                        >
                          {mainLabel?.icon && (
                            <span className="sidebar-icon">{mainLabel.icon}</span>
                          )}
                          <span className="sidebar-label">{mainLabel?.label}</span>
                          <span className="submenu-hdr-arrow" aria-hidden="true" />
                        </Link>
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

      {/* Flyout panel: quick hover access to a group's items without navigating away */}
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
            {openGroupData.submenuItems?.map((item) => (
              <SidebarItem
                key={item.label}
                to={item.link}
                icon={item.icon}
                label={item.label}
                isActive={
                  item.link === Location.pathname ||
                  (item.submenu && flattenLinks(item.submenuItems).includes(Location.pathname))
                }
                extraClass="sidebar-flyout-item"
                onClick={() => {
                  closeFlyout();
                  closeMobileSidebar();
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
