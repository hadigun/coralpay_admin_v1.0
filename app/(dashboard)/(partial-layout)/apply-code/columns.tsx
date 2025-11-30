"use client";

import { formatEntryDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";

export type ShortCode = {
  id: string;
  ussd: string;
  type: "Dedicated" | "Shared";
  status: "pending" | "approved" | "declined" | "active";
  createdAt: string;
};

export const columns: ColumnDef<ShortCode>[] = [
  {
    accessorKey: "id",
    // header: ({ column }) => (
    //   <Button
    //     variant="ghost"
    //     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //   >
    //     Short Code ID
    //     <ArrowUpDown className="ml-2 h-4 w-4" />
    //   </Button>
    // ),
    header: "Short Code ID",

    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "code",
    header: "USSD Short Codes",
    cell: ({ row }) => <div className="">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "type",
    header: "Short Code Type",
    cell: ({ row }) => <div className="capitalize">{row.getValue("type")}</div>,
  },
  //   {
  //     accessorKey: "status",
  //     header: "Status",
  //     cell: ({ row }) => {
  //       const status = row.getValue("status") as ShortCode["status"];
  //       const badgeMap: Record<
  //         ShortCode["status"],
  //         {
  //           label: string;
  //           variant: "default" | "destructive" | "success" | "warning";
  //         }
  //       > = {
  //         Approved: { label: "Approved", variant: "success" },
  //         Pending: { label: "Pending", variant: "warning" },
  //         Declined: { label: "Declined", variant: "destructive" },
  //       };

  //       return (
  //         <Badge variant={badgeMap[status].variant}>
  //           {badgeMap[status].label}
  //         </Badge>
  //       );
  //     },
  //   },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      let badgeClass = "";
      let text = "";

      switch (status) {
        case "active":
          badgeClass = "bg-green-100 text-green-800 border border-green-300";
          text = "Active";
          break;
        case "approved":
          badgeClass = "bg-green-100 text-green-800 border border-green-300";
          text = "Approved";
          break;
        case "pending":
          badgeClass = "bg-yellow-100 text-yellow-800 border border-yellow-300";
          text = "Pending";
          break;
        case "declined":
          badgeClass = "bg-red-100 text-red-800 border border-red-300";
          text = "Declined";
          break;
        default:
          badgeClass = "bg-gray-100 text-gray-800 border border-gray-300";
          text = status;
      }

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
        >
          {text}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => {
      // <span>{formatEntryDate(row.getValue("createdAt"))}</span>;
      return <span>{formatEntryDate(row.original.createdAt)}</span>;
    },
  },
];
