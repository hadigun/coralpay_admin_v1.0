"use client";

import { EditPenSquareIcon } from "@/components/svgs/PencilComponent";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";

export type Availability = "Available" | "Not Available";
export type RequestStatus = "Pending" | "Approved" | "Declined";

export interface ShortCodeRequest {
  id: string;
  ussd: string;
  shortCodeType: "Dedicated" | "Shared";
  availability: Availability;
  status: RequestStatus;
  createdAt: string;
  editable?: boolean;
}

export const availabilityBadge = (av: Availability) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
  return av === "Available" ? (
    <span className={`${base} bg-green-100 text-green-700`}>Available</span>
  ) : (
    <span className={`${base} bg-red-100 text-red-700`}>Not Available</span>
  );
};

export const statusBadge = (st: RequestStatus) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
  if (st === "Approved")
    return (
      <span className={`${base} bg-emerald-100 text-emerald-700`}>
        Approved
      </span>
    );
  if (st === "Declined")
    return (
      <span className={`${base} bg-rose-100 text-rose-700`}>Declined</span>
    );
  return (
    <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>
  );
};

export function makeColumns(
  onAction: (row: ShortCodeRequest, action: "accept" | "reject") => void
): ColumnDef<ShortCodeRequest>[] {
  return [
    {
      header: () => <span className="">Short Code ID</span>,
      accessorKey: "id",
      cell: ({ getValue }) => (
        <span className="text-gray-900">{getValue<string>()}</span>
      ),
    },
    {
      header: () => <span className="">USSD Short Codes</span>,
      accessorKey: "ussd",
      cell: ({ getValue }) => (
        <span className="text-gray-900">{getValue<string>()}</span>
      ),
    },
    {
      header: () => <span className="">Short Code Type</span>,
      accessorKey: "shortCodeType",
      cell: ({ getValue }) => (
        <span className="text-gray-900">{getValue<string>()}</span>
      ),
    },
    {
      header: () => <span className="">Availability</span>,
      accessorKey: "availability",
      cell: ({ getValue }) => availabilityBadge(getValue<Availability>()),
      enableSorting: false,
    },
    {
      header: () => <span className="">Status</span>,
      accessorKey: "status",
      cell: ({ getValue }) => statusBadge(getValue<RequestStatus>()),
      enableSorting: false,
    },
    {
      id: "action",
      header: () => <span className="">Action</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const r = row.original;
        const disabled = r.status === "Approved" || r.editable === false;

        // if (disabled) {
        //   return (
        //     <span
        //       className="text-gray-300 opacity-60 cursor-not-allowed"
        //       aria-disabled
        //       title="Approved"
        //     >
        //       <PenSquareIcon className="size-5 text-gray-700" />
        //     </span>
        //   );
        // }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="unstyled" aria-label={`Actions for ${r.id}`}>
                <EditPenSquareIcon className="size-5 text-[#00328B]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => onAction(r, "accept")}
                className="cursor-pointer"
              >
                <Check className="mr-2 h-4 w-4" />
                Accept
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction(r, "reject")}
                className="cursor-pointer"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
