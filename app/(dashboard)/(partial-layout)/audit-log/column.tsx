"use client";

import { formatEntryDate } from "@/lib/utils";
import { AuditLogEntry } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<AuditLogEntry>[] = [
  {
    accessorKey: "firstName",
    header: "Full Name",
    cell: ({ row }) => {
      const firstName = row.original.user.firstName;
      const lastName = row.original.user.lastName;
      return (
        <span>
          {firstName} {lastName}
        </span>
      );
    },
  },

  {
    header: "Timestamp",
    accessorKey: "timestamp",
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {formatEntryDate(row.original.createdAt)}
        </span>
      );
    },
  },
  {
    header: "Action",
    accessorKey: "action",
    cell: ({ row }) => (
      <span className="capitalize text-sm font-medium text-blue-600">
        {row.original.action}
      </span>
    ),
  },
  {
    header: "Description",
    accessorKey: "description",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.description}</span>
    ),
  },
  {
    header: "IP Address",
    accessorKey: "ipAddress",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">{row.original.ipAddress}</span>
    ),
  },
];
