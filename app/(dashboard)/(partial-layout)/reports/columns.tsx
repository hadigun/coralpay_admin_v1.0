// columns.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { USSDReport } from "./data";

export const columns: ColumnDef<USSDReport>[] = [
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
  },
  {
    accessorKey: "serviceId",
    header: "Service ID",
  },
  {
    accessorKey: "merchantName",
    header: "Merchant Name",
  },
  {
    accessorKey: "ussdCode",
    header: "USSD",
  },
  {
    accessorKey: "dateCreated",
    header: "Date Created",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: USSDReport["status"] = row.getValue("status");
      const statusColor =
        status === "Success"
          ? "bg-green-100 text-green-700"
          : status === "Failed"
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700";

      return (
        <Badge className={`rounded-md text-xs ${statusColor}`}>{status}</Badge>
      );
    },
  },
];
