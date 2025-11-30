"use client";

import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  dateCreated: string;
  lastActive: string;
}

const connectedUsers: User[] = [
  {
    id: "ADM-12346",
    name: "Nadine Schroeder",
    email: "Nad***ine",
    dateCreated: "01/01/2025 ",
    lastActive: "01/01/2025 ",
  },
  {
    id: "ADM-12345",
    name: "Miranda Tarp",
    email: "Adr***m",
    dateCreated: "01/01/2025 ",
    lastActive: "01/01/2025 ",
  },
  {
    id: "ADM-12344",
    name: "Neil Sweronwald",
    email: "Nei***m",
    dateCreated: "01/01/2025 ",
    lastActive: "01/01/2025 ",
  },
  {
    id: "ADM-12343",
    name: "Chad Sauer",
    email: "Nad***com",
    dateCreated: "01/01/2025 ",
    lastActive: "01/01/2025 ",
  },
];

export function ConnectedAccounts() {
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "User ID",
      },
      {
        accessorKey: "name",
        header: "Full Name",
      },
      {
        accessorKey: "email",
        header: "Email Address",
      },
      {
        accessorKey: "dateCreated",
        header: "Date Created",
      },
      {
        accessorKey: "lastActive",
        header: "Last Active",
      },
    ],
    []
  );

  return (
    <div className="mt-4">
      <DataTable columns={columns} data={connectedUsers} />
    </div>
  );
}
