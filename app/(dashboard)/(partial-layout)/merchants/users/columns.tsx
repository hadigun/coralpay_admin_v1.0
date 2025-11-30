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

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  createdAt: string;
  status: "active" | "inactive" | "pending";
};

// ✅ Callback action type
export type UserActionType =
  | "activate"
  | "deactivate"
  | "delete"
  | "viewPermissions";

export const createUserColumns = (
  onAction: (user: User, action: UserActionType) => void,
  router: AppRouterInstance
): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: "User ID",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "firstName",
    header: "Full Name",
    cell: ({ row }) => {
      const firstName = row.getValue("firstName") as string;
      const lastName = row.original.lastName;
      return (
        <span>
          {firstName} {lastName}
        </span>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email Address",
    cell: ({ row }) => {
      const email: string = row.getValue("email");
      const maskedEmail = email.replace(/(.{4}).+(@.*)/, "$1***$2");
      return <span>{maskedEmail}</span>;
    },
  },
  {
    accessorKey: "role.name",
    header: "Role",
    cell: ({ row }) => row.original.role?.name || "—",
  },
  {
    accessorKey: "createdAt",
    header: "Last Active",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      const lastActive = formatEntryDate(createdAt);
      return <span>{lastActive}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as User["status"];
      const badgeColor =
        status === "active"
          ? "bg-green-100 text-green-800"
          : status === "inactive"
          ? "bg-gray-100 text-gray-800"
          : "bg-yellow-100 text-yellow-800";

      return (
        <Badge
          className={`${badgeColor} px-3 py-1 rounded-full text-xs capitalize`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "action",
    header: () => <span>Action</span>,
    enableSorting: false,
    cell: ({ row }) => {
      const user = row.original;
      const isActive = user.status === "active";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              aria-label={`Actions for ${user.firstName} ${user.lastName}`}
            >
              <EditPenSquareIcon className="size-5 text-[#00328B]" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() =>
                onAction(user, isActive ? "deactivate" : "activate")
              }
              className="cursor-pointer"
            >
              {isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onAction(user, "delete")}
              className="cursor-pointer text-red-600 focus:text-red-700"
            >
              Delete
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                router.push(`/merchants/users/${user.id}/permissions`)
              }
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
