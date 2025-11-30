// columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";

export type ShortCode = {
  id: string;
  ussdCode: string;
  owner: string;
  configured: boolean;
  dateCreated: string;
};

export const shortCodeColumns: ColumnDef<ShortCode>[] = [
  {
    accessorKey: "id",
    header: "Short Code ID",
  },
  {
    accessorKey: "ussdCode",
    header: "USSD Short Codes",
  },
  {
    accessorKey: "owner",
    header: "Owner",
  },
  {
    accessorKey: "configured",
    header: "Configured on Network?",
    cell: ({ row }) => (
      <span
        className={row.original.configured ? "text-green-600" : "text-red-500"}
      >
        {row.original.configured ? "YES" : "NO"}
      </span>
    ),
  },
  {
    accessorKey: "dateCreated",
    header: "Date Created",
  },
];
