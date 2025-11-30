import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";

export type FinancialTransaction = {
  id: string;
  type: string;
  merchantName: string;
  date: string;
  status: "Pending" | "Successful" | "Failed";
};

export const financialTransactionColumns: ColumnDef<FinancialTransaction>[] = [
  {
    accessorKey: "id",
    header: "Transaction ID",
  },
  {
    accessorKey: "type",
    header: "Transaction Type",
  },
  {
    accessorKey: "merchantName",
    header: "Merchant Name",
  },
  {
    accessorKey: "date",
    header: "Date Created",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as FinancialTransaction["status"];
      const styles =
        status === "Successful"
          ? "bg-green-100 text-green-800"
          : status === "Pending"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700";
      return (
        <Badge className={`${styles} px-2 py-1 rounded-full text-xs`}>
          {status}
        </Badge>
      );
    },
  },
];

export type USSDTransaction = {
  id: string;
  serviceId: string;
  merchantName: string;
  ussd: string;
  date: string;
  status: "Pending" | "Successful" | "Failed";
};

export const ussdTransactionColumns: ColumnDef<USSDTransaction>[] = [
  {
    accessorKey: "id",
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
    accessorKey: "ussd",
    header: "USSD",
  },
  {
    accessorKey: "date",
    header: "Date Created",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as USSDTransaction["status"];
      const styles =
        status === "Successful"
          ? "bg-green-100 text-green-800"
          : status === "Pending"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700";
      return (
        <Badge className={`${styles} px-2 py-1 rounded-full text-xs`}>
          {status}
        </Badge>
      );
    },
  },
];
