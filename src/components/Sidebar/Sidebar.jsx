"use client"
import React, { useState, useEffect } from "react";
import { useLocation } from "@/hooks/useLocation";
import ClientScrollbars from "../ClientScrollbars";
import { SidebarData } from "@/core/data/siderbar_data";
import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  const Location = useLocation();
  const [openGroup, setOpenGroup] = useState("");
  const [hoveredGroup, setHoveredGroup] = useState("");
  const [subOpen, setSubopen] = useState("");
  const [subsidebar, setSubsidebar] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const closeMobileSidebar = () => {
    if (window.innerWidth <= 991) {
      document.querySelector(".main-wrapper")?.classList.remove("slide-nav");
      document.querySelector(".sidebar-overlay")?.classList.remove("opened");
    }
  };

  const toggleGroup = (label) => {
    setOpenGroup((prev) => (prev === label ? "" : label));
  };

  const toggleSidebar = (title) => {
    if (title === subOpen) {
      setSubopen("");
    } else {
      setSubopen(title);
    }
  };

  const toggleSubsidebar = (subitem) => {
    if (subitem === subsidebar) {
      setSubsidebar("");
    } else {
      setSubsidebar(subitem);
    }
  };

  // Auto-expand active group + submenu on page load
  useEffect(() => {
    SidebarData.forEach((mainLabel) => {
      const groupLinks = [];
      mainLabel?.submenuItems?.forEach((title) => {
        if (title?.link) groupLinks.push(title.link);
        title?.submenuItems?.forEach((item) => {
          if (item?.link) groupLinks.push(item.link);
          item?.submenuItems?.forEach((sub) => {
            if (sub?.link) groupLinks.push(sub.link);
          });
        });
      });
      if (groupLinks.includes(Location.pathname)) {
        setOpenGroup(mainLabel?.label);
      }

      mainLabel?.submenuItems?.forEach((title) => {
        if (title?.links?.includes(Location.pathname)) {
          setSubopen(title?.label);
        }
        title?.submenuItems?.forEach((item) => {
          if (item?.submenuItems?.map((link) => link?.link).includes(Location.pathname)) {
            setSubsidebar(item?.label);
          }
        });
      });
    });
  }, [Location.pathname]);

  return (
    <div>
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <ClientScrollbars style={{ height: 'calc(100vh - 66px)' }}>
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu">
              <ul>
                {SidebarData?.map((mainLabel) => {
                  const isCollapsible = mainLabel?.collapsible !== false;
                  const isOpen =
                    !isCollapsible ||
                    openGroup === mainLabel?.label ||
                    hoveredGroup === mainLabel?.label;

                  return (
                  <li
                    className="submenu-open"
                    key={mainLabel?.label}
                    onMouseEnter={() => isCollapsible && setHoveredGroup(mainLabel?.label)}
                    onMouseLeave={() => isCollapsible && setHoveredGroup("")}
                  >
                    {isCollapsible ? (
                      <h6
                        className={`submenu-hdr submenu-hdr-toggle ${isOpen ? "open" : ""}`}
                        onClick={() => toggleGroup(mainLabel?.label)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleGroup(mainLabel?.label);
                          }
                        }}
                      >
                        {mainLabel?.label}
                        <span className="submenu-hdr-arrow" aria-hidden="true" />
                      </h6>
                    ) : (
                      <h6 className="submenu-hdr">{mainLabel?.label}</h6>
                    )}

                    <ul style={{ display: isOpen ? "block" : "none" }}>
                      {mainLabel?.submenuItems?.map((title, i) => {
                        // Build array of all possible links for this menu item
                        let link_array = [title?.link]; // Include the parent link
                        title?.submenuItems?.map((link) => {
                          if (link?.link) {
                            link_array.push(link.link);
                          }
                          if (link?.submenu && link?.submenuItems) {
                            link?.submenuItems?.map((item) => {
                              if (item?.link) {
                                link_array.push(item.link);
                              }
                            });
                          }
                          return link_array;
                        });

                        title.links = [...new Set(link_array.filter(Boolean))];

                        return (
                          <li className="submenu" key={i}>
                            <SidebarItem
                              to={title?.link}
                              icon={title?.icon}
                              label={title?.label}
                              onClick={() => {
                                toggleSidebar(title?.label);
                                if (!title?.submenu) closeMobileSidebar();
                              }}
                              isSubdrop={subOpen === title?.label}
                              isActive={title?.links?.includes(Location.pathname)}
                              hasSubmenu={title?.submenu}
                            />
                            <ul
                              style={{
                                display: subOpen === title?.label ? "block" : "none",
                                animation: subOpen === title?.label ? 'slideDown 0.3s ease-out' : ''
                              }}
                            >
                              {title?.submenuItems?.map((item, titleIndex) => (
                                <li className="submenu submenu-two" key={titleIndex}>
                                  <SidebarItem
                                    to={item?.link}
                                    label={item?.label}
                                    isActive={
                                      item?.submenuItems?.map((link) => link?.link).includes(Location.pathname) || item?.link === Location.pathname
                                    }
                                    onClick={() => {
                                      toggleSubsidebar(item?.label);
                                      if (!item?.submenu) closeMobileSidebar();
                                    }}
                                    hasSubmenu={item?.submenu}
                                  />
                                  <ul
                                    style={{
                                      display: subsidebar === item?.label ? "block" : "none",
                                      animation: subsidebar === item?.label ? 'slideDown 0.2s ease-out' : ''
                                    }}
                                  >
                                    {item?.submenuItems?.map((items, titleIndex2) => (
                                      <li key={titleIndex2}>
                                        <SidebarItem
                                          to={items?.link}
                                          label={items?.label}
                                          isActive={
                                            subsidebar === items?.label || items?.submenuItems?.map((link) => link.link).includes(Location.pathname) || items?.link === Location.pathname
                                          }
                                          extraClass={subsidebar === items?.label ? "submenu-two subdrop" : "submenu-two"}
                                          onClick={closeMobileSidebar}
                                        />
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </ClientScrollbars>
      </div>
    </div>
  );
};

export default Sidebar;
