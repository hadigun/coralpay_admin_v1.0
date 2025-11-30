"use client";

import { EditPenSquareIcon } from "@/components/svgs/PencilComponent";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

interface Merchant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  merchantName: string;
}

export const columns: ColumnDef<Merchant>[] = [
  {
    accessorKey: "id",
    header: "User ID",
    cell: ({ row }) => <span>{row.original.id}</span>,
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => <span>{row.original.fullName}</span>,
  },
  {
    accessorKey: "email",
    header: "Email Address",
    cell: ({ row }) => {
      const email = row.original.email;
      const maskedEmail = email.replace(/(?<=.{2}).(?=.*@)/g, "*");
      return <span>{maskedEmail}</span>;
    },
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
    cell: ({ row }) => {
      const phone = row.original.phone;
      const maskedPhone = phone.replace(/.(?=.{3})/g, "*");
      return <span>{maskedPhone}</span>;
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const { address, city } = row.original;
      return (
        <div className="flex flex-col">
          <span>{address}</span>
          <span className="text-muted-foreground text-xs">{city}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "merchantName",
    header: "Merchant Name",
    cell: ({ row }) => <span>{row.original.merchantName}</span>,
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="unstyled">
              <EditPenSquareIcon className="size-5 text-[#00328B]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 bg-white">
            <button
              onClick={() => {
                setOpen(false);
                // openEditModal(row.original); // If you have edit logic
                console.log("Edit Contact Person:", row.original.id);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm"
            >
              Edit Contact Person
            </button>
          </PopoverContent>
        </Popover>
      );
    },
  },
];
