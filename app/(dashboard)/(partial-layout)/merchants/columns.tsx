// import EditPenSquareIcon from "@/components/svgs/PencilComponent";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { formatEntryDate } from "@/lib/utils";
// import { ColumnDef } from "@tanstack/react-table";

// export type Merchant = {
//   id: string;
//   merchant: string;
//   contactPerson: string;
//   createdAt: string;
//   status: "active" | "inactive";
// };

// export const columns = (
//   onRowClick: (id: string) => void
// ): ColumnDef<Merchant>[] => [
//   {
//     accessorKey: "id",
//     header: "Merchant ID",
//     cell: ({ row }) => (
//       <span
//         className="cursor-pointer font-medium"
//         onClick={() => onRowClick(row.original.id)}
//       >
//         {row.getValue("id")}
//       </span>
//     ),
//   },
//   {
//     accessorKey: "name",
//     header: "Merchants",
//     cell: ({ row }) => (
//       <span
//         className="cursor-pointer"
//         onClick={() => onRowClick(row.original.id)}
//       >
//         {row.getValue("name")}
//       </span>
//     ),
//   },
//   {
//     accessorKey: "email",
//     header: "Contact Person",
//   },
//   {
//     accessorKey: "createdAt",
//     header: "Date Created",
//     cell: ({ row }) => {
//       // <span>{formatEntryDate(row.getValue("createdAt"))}</span>;
//       return <span>{formatEntryDate(row.original.createdAt)}</span>;
//     },
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => {
//       const status = row.getValue("status") as "active" | "inactive";
//       return (
//         <Badge
//           className={`${
//             status === "active"
//               ? "bg-green-100 text-green-800"
//               : "bg-gray-200 text-gray-600"
//           } px-2 py-1 rounded-full text-xs`}
//         >
//           {status}
//         </Badge>
//       );
//     },
//   },
//   {
//     id: "action",
//     header: "Action",
//     cell: () => (
//       <Button variant="ghost" size="icon">
//         <EditPenSquareIcon className="size-5 text-[#00328B]" />
//       </Button>
//     ),
//   },
// ];

"use client";

import EditPenSquareIcon from "@/components/svgs/PencilComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatEntryDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type Merchant = {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  createdAt: string;
  status: "active" | "inactive";
};

export type MerchantActionType = "assign" | "remove" | "view";

/**
 * Generates column definitions for the Merchant table.
 */
export const createMerchantColumns = (
  onAction: (merchant: Merchant, action: MerchantActionType) => void,
  onRowClick: (id: string) => void,
  router: AppRouterInstance
): ColumnDef<Merchant>[] => [
  {
    accessorKey: "id",
    header: "Merchant ID",
    cell: ({ row }) => (
      <span
        className="font-medium cursor-pointer text-blue-700 hover:underline"
        onClick={() => onRowClick(row.original.id)}
      >
        {row.getValue("id")}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Merchant Name",
    cell: ({ row }) => (
      <span
        className="cursor-pointer hover:underline"
        onClick={() => onRowClick(row.original.id)}
      >
        {row.getValue("name")}
      </span>
    ),
  },

  {
    accessorKey: "email",
    header: "Email Address",
    cell: ({ row }) => {
      const email = row.getValue("email") as string | undefined;
      if (!email) return <span>—</span>;
      const maskedEmail = email.replace(/(.{4}).+(@.*)/, "$1***$2");
      return <span>{maskedEmail}</span>;
    },
  },
  {
    accessorKey: "mobile",
    header: "Mobile Number",
    cell: ({ row }) => {
      const mobile = row.getValue("mobile") as string | undefined;
      if (!mobile) return <span>—</span>;
      const maskedMobile = mobile.replace(/(.{3}).+(.{2})/, "$1****$2");
      return <span>{maskedMobile}</span>;
    },
  },

  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      const formatted = formatEntryDate(createdAt);
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Merchant["status"];
      const badgeColor =
        status === "active"
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800";

      return (
        <Badge className={`${badgeColor} px-3 py-1 rounded-full text-xs`}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "action",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => {
      const merchant = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" aria-label={`Actions for ${merchant.name}`}>
              <EditPenSquareIcon className="size-5 text-[#00328B]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onAction(merchant, "assign")}
              className="cursor-pointer"
            >
              Assign Permission
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction(merchant, "remove")}
              className="cursor-pointer text-red-600 focus:text-red-700"
            >
              Remove Permission
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction(merchant, "view")}
              className="cursor-pointer"
            >
              View Permissions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
