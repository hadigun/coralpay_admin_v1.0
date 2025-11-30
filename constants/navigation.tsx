// import { LuLayoutDashboard } from "react-icons/lu";
// import {
//   PiBinaryBold,
//   PiBriefcaseBold,
//   PiChartPieSliceBold,
//   PiEqualizerBold,
//   PiReceiptBold,
//   PiTreeStructureBold,
//   PiUserListBold,
// } from "react-icons/pi";

// export const adminSidebarNavigation = [
//   {
//     name: "Dashboard",
//     path: "/dashboard",
//     icon: <LuLayoutDashboard className="size-6" />,
//   },
//   {
//     name: "Merchant Onboarding",
//     children: [
//       {
//         name: "Contact Person",
//         path: "merchants/contacts",
//       },
//       {
//         name: "Merchants",
//         path: "/merchants",
//       },
//     ],
//     icon: <PiBriefcaseBold className="size-6" />,
//   },
//   {
//     name: "Admin Setup",
//     icon: <PiUserListBold className="size-6" />,
//     children: [
//       {
//         name: "Users",
//         path: "/users",
//       },
//       {
//         name: "Roles",
//         path: "/roles",
//       },
//     ],
//   },
//   {
//     name: "Transactions",
//     path: "/transactions",
//     icon: <PiReceiptBold className="size-6" />,
//   },
//   {
//     name: "Services",
//     icon: <PiTreeStructureBold className="size-6" />,
//     children: [
//       {
//         name: "List of Services",
//         path: "/services",
//       },
//       {
//         name: "Pending Approvals",
//         path: "/pending-approvals",
//       },
//     ],
//   },

//   {
//     name: "Reports",
//     path: "/reports",
//     icon: <PiChartPieSliceBold className="size-6" />,
//   },
//   {
//     name: "Short Code",
//     icon: <PiBinaryBold className="size-6" />,
//     children: [
//       {
//         name: "Configured Short Codes",
//         path: "/configure-code",
//       },
//       {
//         name: "Short Code Requests",
//         path: "/code-requests",
//       },
//     ],
//   },
//   {
//     name: "Audit Log",
//     path: "/audit-log",
//     icon: <PiEqualizerBold className="size-6" />,
//   },
// ];

// export const userSidebarNavigation = [
//   {
//     name: "Dashboard",
//     path: "/dashboard",
//     icon: <LuLayoutDashboard className="size-6" />,
//   },
//   {
//     name: "Users Management",
//     icon: <PiUserListBold className="size-6" />,
//     children: [
//       {
//         name: "Users",
//         path: "/merchants/users",
//       },
//       {
//         name: "Roles",
//         path: "/merchants/roles",
//       },
//     ],
//   },
//   {
//     name: "Transactions",
//     path: "/transactions",
//     icon: <PiReceiptBold className="size-6" />,
//   },
//   {
//     name: "Services",
//     icon: <PiTreeStructureBold className="size-6" />,
//     children: [
//       {
//         name: "All Services",
//         path: "/services",
//       },
//       {
//         name: "Build Service",
//         path: "/services/build-service",
//       },
//     ],
//   },
//   {
//     name: "Reports",
//     path: "/reports",
//     icon: <PiChartPieSliceBold className="size-6" />,
//   },
//   {
//     name: "Short Code Requests",
//     path: "/apply-code",
//     icon: <PiBinaryBold className="size-6" />,
//   },
//   // {
//   //   name: "Audit Log",
//   //   path: "/merchants/audit-log",
//   //   icon: <PiEqualizerBold className="size-6" />,
//   // },
// ];

import { LuLayoutDashboard } from "react-icons/lu";
import {
  PiBinaryBold,
  PiBriefcaseBold,
  PiChartPieSliceBold,
  PiEqualizerBold,
  PiReceiptBold,
  PiTreeStructureBold,
  PiUserListBold,
} from "react-icons/pi";

export interface NavigationItem {
  name: string;
  path?: string;
  icon?: React.ReactNode;
  permission?: string; // Required permission to view
  children?: NavigationItem[];
}

export const adminSidebarNavigation: NavigationItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LuLayoutDashboard className="size-6" />,
    permission: "dashboard:overview:view",
  },
  {
    name: "Merchant Onboarding",
    icon: <PiBriefcaseBold className="size-6" />,
    permission: "system:merchant:view",
    children: [
      {
        name: "Contact Person",
        path: "/merchants/contacts",
        permission: "system:merchant:view",
      },
      {
        name: "Merchants",
        path: "/merchants",
        permission: "system:merchant:view",
      },
    ],
  },
  {
    name: "Admin Setup",
    icon: <PiUserListBold className="size-6" />,
    permission: "system:user:view",
    children: [
      {
        name: "Users",
        path: "/users",
        permission: "system:user:view",
      },
      {
        name: "Roles",
        path: "/roles",
        permission: "system:role:view",
      },
    ],
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: <PiReceiptBold className="size-6" />,
    permission: "dashboard:overview:view", // Add appropriate permission
  },
  {
    name: "Services",
    icon: <PiTreeStructureBold className="size-6" />,
    children: [
      {
        name: "List of Services",
        path: "/services",
      },
      {
        name: "Pending Approvals",
        path: "/pending-approvals",
      },
    ],
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <PiChartPieSliceBold className="size-6" />,
  },
  {
    name: "Short Code",
    icon: <PiBinaryBold className="size-6" />,
    children: [
      {
        name: "Configured Short Codes",
        path: "/configure-code",
      },
      {
        name: "Short Code Requests",
        path: "/code-requests",
      },
    ],
  },
  {
    name: "Audit Log",
    path: "/audit-log",
    icon: <PiEqualizerBold className="size-6" />,
    permission: "system:audit:view",
  },
];

export const merchantSidebarNavigation: NavigationItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LuLayoutDashboard className="size-6" />,
  },
  {
    name: "Users Management",
    icon: <PiUserListBold className="size-6" />,
    children: [
      {
        name: "Users",
        path: "/merchants/users",
      },
      {
        name: "Roles",
        path: "/merchants/roles",
      },
    ],
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: <PiReceiptBold className="size-6" />,
  },
  {
    name: "Services",
    icon: <PiTreeStructureBold className="size-6" />,
    children: [
      {
        name: "All Services",
        path: "/services",
      },
      {
        name: "Build Service",
        path: "/services/build-service",
      },
    ],
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <PiChartPieSliceBold className="size-6" />,
  },
  {
    name: "Short Code Requests",
    path: "/apply-code",
    icon: <PiBinaryBold className="size-6" />,
  },
];
