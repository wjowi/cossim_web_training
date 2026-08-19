import React from "react";
import * as Icon from "react-feather";

export const SidebarData = [
  {
    label: "Overview",
    submenuOpen: true,
    submenuHdr: "Overview",
    submenuItems: [
      {
        label: "Dashboard",
        icon: <Icon.Home />,
        link: "/admin/dashboard",
        showSubRoute: false,
        submenu: false,
        description: "Overview & Analytics",
      },
    ],
  },
  {
    label: "Operations",
    submenuOpen: true,
    submenuHdr: "Operations",
    submenuItems: [
      {
        label: "Task Management",
        icon: <Icon.Package />,
        link: "/admin/packages",
        showSubRoute: false,
        submenu: false,
        description: "Shipment Task Management",
      },
      {
        label: "Batches",
        icon: <Icon.Package />,
        link: "/admin/batches",
        showSubRoute: false,
        submenu: false,
        description: "Handover Batch Management",
      },
      {
        label: "Distribution Centers",
        icon: <Icon.Home />,
        link: "/admin/distribution-centers",
        showSubRoute: false,
        submenu: false,
        description: "DC Management",
      },
      {
        label: "Inventory",
        icon: <Icon.Clipboard />,
        link: "/admin/inventory",
        showSubRoute: false,
        submenu: false,
        description: "DC Stock & Products",
      },
    ],
  },
  {
    label: "Vendors",
    submenuOpen: true,
    submenuHdr: "Vendors",
    submenuItems: [
      {
        label: "Vendors",
        icon: <Icon.Users />,
        link: "/admin/vendors",
        showSubRoute: false,
        submenu: false,
        description: "Vendor Management",
      },
      {
        label: "Statements",
        icon: <Icon.FileText />,
        link: "/admin/vendor-statements",
        showSubRoute: false,
        submenu: false,
        description: "Vendor Statements",
      },
      {
        label: "Payments",
        icon: <Icon.CreditCard />,
        link: "/admin/cod-payments",
        showSubRoute: false,
        submenu: false,
        description: "Vendor Payments",
      }
    ],
  },
  {
    label: "People",
    submenuOpen: true,
    submenuHdr: "People",
    submenuItems: [
      {
        label: "Users",
        icon: <Icon.Users />, 
        link: "/admin/users",
        showSubRoute: false,
        submenu: false,
        description: "User Management",
      },
      {
        label: "Sales Agents",
        icon: <Icon.UserCheck />,
        link: "/admin/agents",
        showSubRoute: false,
        submenu: false,
        description: "Agent & Referrals",
      },
      {
        label: "Sales Managers",
        icon: <Icon.Users />,
        link: "/admin/sales-managers",
        showSubRoute: false,
        submenu: false,
        description: "Manager Assignments",
      },
      {
        label: "Riders",
        icon: <Icon.Truck />, // react-feather does not have Bike, Truck is closest
        link: "/admin/riders",
        showSubRoute: false,
        submenu: false,
        description: "Delivery Team",
      }
    ],
  },
  {
    label: "Finance",
    submenuOpen: true,
    submenuHdr: "Finance",
    submenuItems: [
      {
        label: "Summary",
        icon: <Icon.Home />,
        link: "/admin/finance-summary",
        showSubRoute: false,
        submenu: false,
        description: "Financial Overview",
      },
      {
        label: "Reconciliation",
        icon: <Icon.FileText />,
        link: "/admin/reconciliation",
        showSubRoute: false,
        submenu: false,
        description: "Order Reconciliation",
      },
      {
        label: "Settlements",
        icon: <Icon.DollarSign />,
        link: "/admin/settlements",
        showSubRoute: false,
        submenu: false,
        description: "Settlement Management",
      },
      {
        label: "Shipping Rates",
        icon: <Icon.Tag />,
        link: "/admin/pricing",
        showSubRoute: false,
        submenu: false,
        description: "Comprehensive Pricing",
      },
    ],
  },
  {
    label: "Reports",
    submenuOpen: true,
    submenuHdr: "Reports",
    submenuItems: [
      {
        label: "Tracking Analytics",
        icon: <Icon.Activity />,
        link: "/admin/reports/shipment-tracking",
        showSubRoute: false,
        submenu: false,
        description: "Shipment Movement & Delays",
      },
    ],
  },
  {
    label: "Configuration",
    submenuOpen: true,
    submenuHdr: "Configuration",
    submenuItems: [
      {
        label: "Couriers",
        icon: <Icon.Truck />,
        link: "/admin/couriers",
        showSubRoute: false,
        submenu: false,
        description: "Courier Management",
      },
      {
        label: "SMS",
        icon: <Icon.MessageSquare />,
        link: "/admin/sms",
        showSubRoute: false,
        submenu: false,
        description: "Notifications",
      },
      {
        label: "Policies",
        icon: <Icon.FileText />,
        link: "/admin/policies",
        showSubRoute: false,
        submenu: false,
        description: "Terms & Privacy",
      },
      {
        label: "Profile",
        icon: <Icon.User />,
        link: "/admin/profile",
        showSubRoute: false,
        submenu: false,
        description: "Admin Profile",
      },
      {
        label: "Settings",
        icon: <Icon.Settings />,
        link: "/admin/settings",
        showSubRoute: true,
        submenu: true,
        description: "System Config",
        submenuItems: [
          {
            label: "General",
            icon: <Icon.Settings />,
            link: "/admin/settings",
            showSubRoute: false,
            submenu: false,
            description: "General Settings",
          },
          {
            label: "User Roles",
            icon: <Icon.Bell />,
            link: "/admin/settings/user-roles",
            showSubRoute: false,
            submenu: false,
            description: "User Roles Management",
          },
          {
            label: "Order Statuses",
            icon: <Icon.List />,
            link: "/admin/settings/order-statuses",
            showSubRoute: false,
            submenu: false,
            description: "Shipment Order Status Management",
          },
        ],
      },
    ],
  },
];

export const distribution_center_manager_sidebar_data = [
  {
    label: "OVERVIEW",
    submenuItems: [
      {
        label: "Overview",
        icon: <Icon.Home />,
        link: "/dc/dc-overview",
        showSubRoute: false,
        submenu: false,
        description: "Overview & Analytics",
      },
    ],
  },
  {
    label: "LOGISTICS",
    submenuItems: [
      {
        label: "Batch",
        icon: <Icon.Package />,
        showSubRoute: true,
        submenu: true,
        description: "Batch Management",
        submenuItems: [
          {
            label: "Create Batch",
            icon: <Icon.Plus />,
            link: "/dc/batch/create",
            showSubRoute: false,
            submenu: false,
            description: "Create New Batch",
          },
          {
            label: "Inbound",
            icon: <Icon.ArrowDown />,
            link: "/dc/batch/inbound",
            showSubRoute: false,
            submenu: false,
            description: "Inbound Shipments",
          },
          {
            label: "Outbound",
            icon: <Icon.ArrowUp />,
            link: "/dc/batch/outbound",
            showSubRoute: false,
            submenu: false,
            description: "Outbound Shipments",
          },
        ],
      },
      {
        label: "Packages",
        icon: <Icon.Package />,
        link: "/dc/dc-packages",
        showSubRoute: false,
        submenu: false,
        description: "Package Management",
      },
      {
        label: "Manifest",
        icon: <Icon.FileText />,
        link: "/dc/dc-manifest",
        showSubRoute: false,
        submenu: false,
        description: "Manifest Management",
      },
    ],
  },
  {
    label: "TEAM",
    submenuItems: [
      {
        label: "Riders",
        icon: <Icon.Truck />,
        link: "/dc/dc-couriers",
        showSubRoute: false,
        submenu: false,
        description: "Courier Management",
      },
    ],
  },
  {
    label: "REPORTS",
    submenuItems: [
      {
        label: "Tracking Analytics",
        icon: <Icon.Activity />,
        link: "/dc/reports/shipment-tracking",
        showSubRoute: false,
        submenu: false,
        description: "DC Movement & Delays",
      },
    ],
  },
    {
    label: "QUICK ACTIONS",
    submenuItems: [
      {
        label: "Single Scan",
        icon: <Icon.Maximize />,
        link: "/dc/dc-single-scan",
        showSubRoute: false,
        submenu: false,
        description: "Single Package Scan",
      },
      {
        label: "Batch Scan",
        icon: <Icon.Grid />,
        link: "/dc/dc-batch-scan",
        showSubRoute: false,
        submenu: false,
        description: "Batch Package Scan",
      },
    ],
  },
  {
    label: "ACCOUNT",
    submenuItems: [
      {
        label: "Profile",
        icon: <Icon.User />,
        link: "/dc/dc-profile",
        showSubRoute: false,
        submenu: false,
        description: "User Profile",
      },
      {
        label: "Logout",
        icon: <Icon.LogOut />,
        isLogout: true,
        showSubRoute: false,
        submenu: false,
        description: "Sign Out",
      },
    ],
  },
];

export const sales_agent_dashboard_sidebar_data = [
  {
    label: "OVERVIEW",
    submenuItems: [
      {
        label: "Dashboard",
        icon: <Icon.Home />,
        link: "/sales/sales-agent-dashboard",
        showSubRoute: false,
        submenu: false,
        description: "Overview & Analytics",
      },
    ],
  },
  {
    label: "OPERATIONS",
    submenuItems: [
      {
        label: "Packages",
        icon: <Icon.Package />,
        link: "/sales/sa-packages",
        showSubRoute: false,
        submenu: false,
        description: "Package Management",
      },
      {
        label: "Vendors",
        icon: <Icon.Users />,
        link: "/sales/vendors",
        showSubRoute: false,
        submenu: false,
        description: "Vendor Management",
      },
    ],
  },
  {
    label: "GROWTH",
    submenuItems: [
      {
        label: "Referrals",
        icon: <Icon.Share2 />,
        link: "/sales/sa-referral",
        showSubRoute: false,
        submenu: false,
        description: "Referral Management",
      },
    ],
  },
  {
    label: "ACCOUNT",
    submenuItems: [
      {
        label: "Profile",
        icon: <Icon.User />,
        link: "/sales/sa-profile",
        showSubRoute: false,
        submenu: false,
        description: "User Profile",
      },
      {
        label: "Logout",
        icon: <Icon.LogOut />,
        isLogout: true,
        showSubRoute: false,
        submenu: false,
        description: "Sign Out",
      },
    ],
  },
];

export const rider_dashboard_sidebar_data = [
  {
    label: "DELIVERY",
    submenuItems: [
      {
        label: "Dashboard",
        icon: <Icon.Home />,
        link: "/rider/rd-overview",
        showSubRoute: false,
        submenu: false,
        description: "Overview & Analytics",
      },
      {
        label: "My Packages",
        icon: <Icon.Package />,
        link: "/rider/rd-packages",
        showSubRoute: false,
        submenu: false,
        description: "Package Management",
      },
      {
        label: "Manifest",
        icon: <Icon.FileText />,
        link: "/rider/rd-manifest",
        showSubRoute: false,
        submenu: false,
        description: "Manifest Management",
      },
    ],
  },
  {
    label: "FINANCE",
    submenuItems: [
      {
        label: "Earnings",
        icon: <Icon.DollarSign />,
        link: "/rider/rd-earnings",
        showSubRoute: false,
        submenu: false,
        description: "Earnings Overview",
      },
    ],
  },
    {
    label: "SCANNING",
    submenuItems: [
      {
        label: "Single Scan",
        icon: <Icon.Maximize />,
        link: "/rider/rd-single-scan",
        showSubRoute: false,
        submenu: false,
        description: "Single Package Scan",
      },
      {
        label: "Batch Scan",
        icon: <Icon.Grid />,
        link: "/rider/rd-batch-scan",
        showSubRoute: false,
        submenu: false,
        description: "Batch Package Scan",
      },
    ],
  },
  {
    label: "ACCOUNT",
    submenuItems: [
      {
        label: "Profile",
        icon: <Icon.User />,
        link: "/rider/rd-profile",
        showSubRoute: false,
        submenu: false,
        description: "User Profile",
      },
      {
        label: "Logout",
        icon: <Icon.LogOut />,
        isLogout: true,
        showSubRoute: false,
        submenu: false,
        description: "Sign Out",
      },
    ],
  },
];

export const vendor_dashboard_sidebar_data = [
  {
    label: "OVERVIEW",
    submenuItems: [
      {
        label: "Dashboard",
        icon: <Icon.Home />,
        link: "/vendor/vendor-overview",
        showSubRoute: false,
        submenu: false,
        description: "Overview & Analytics",
      },
    ],
  },
  {
    label: "MANAGE",
    submenuItems: [
      {
        label: "Create Package",
        icon: <Icon.Plus />,
        link: "/vendor/vendor-create-package",
        showSubRoute: false,
        submenu: false,
        description: "Create New Package",
      },
      {
        label: "My Packages",
        icon: <Icon.Package />,
        link: "/vendor/vendor-packages",
        showSubRoute: false,
        submenu: false,
        description: "Package Management",
      },
      {
        label: "Products",
        icon: <Icon.Box />,
        link: "/vendor/vendor-products",
        showSubRoute: false,
        submenu: false,
        description: "Product Management",
      },
      {
        label: "Stores",
        icon: <Icon.Home />,
        link: "/vendor/vendor-stores",
        showSubRoute: false,
        submenu: false,
        description: "Pickup & Drop-off Stores",
      },
    ],
  },
  {
    label: "CUSTOMERS",
    submenuItems: [
      {
        label: "Users",
        icon: <Icon.UserCheck />,
        link: "/vendor/vendor-users",
        showSubRoute: false,
        submenu: false,
        description: "Manage Users",
      },
      {
        label: "Track Package",
        icon: <Icon.Search />,
        link: "/vendor/vendor-track",
        showSubRoute: false,
        submenu: false,
        description: "Track Packages",
      },
    ],
  },
  {
    label: "REPORTS",
    submenuItems: [
      {
        label: "Tracking Analytics",
        icon: <Icon.Activity />,
        link: "/vendor/reports/shipment-tracking",
        showSubRoute: false,
        submenu: false,
        description: "My Shipment Movement",
      },
    ],
  },
  {
    label: "ACCOUNT",
    submenuItems: [
      {
        label: "Profile",
        icon: <Icon.User />,
        link: "/vendor/vendor-profile",
        showSubRoute: false,
        submenu: false,
        description: "User Profile",
      },
      {
        label: "Logout",
        icon: <Icon.LogOut />,
        isLogout: true,
        showSubRoute: false,
        submenu: false,
        description: "Sign Out",
      },
    ],
  },
];
