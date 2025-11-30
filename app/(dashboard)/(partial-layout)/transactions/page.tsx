"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { PiFadersHorizontal } from "react-icons/pi";

import FilterModal from "@/components/FilterModal";
import {
  applyReportFilters,
  type FilterOptions,
  type ReportFilters,
} from "@/lib/filter";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { downloadCSV, downloadPDF } from "@/lib/table-export-utils";
import { financialTransactionColumns, ussdTransactionColumns } from "./columns";
import { financialTransactions, ussdTransactions } from "./data";

const createSearchPredicate = <T,>(fields: (keyof T)[], query: string) => {
  const q = query.toLowerCase().trim();
  if (!q) return () => true;
  return (row: T) =>
    fields.some((field) => {
      const value = row[field];
      return typeof value === "string" && value.toLowerCase().includes(q);
    });
};

export default function TransactionsPage() {
  const [tab, setTab] = useState<"ussd" | "financial">("ussd");
  const [open, setOpen] = useState(false);

  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({
    ussd: "",
    financial: "",
  });

  const currentSearchQuery = searchQueries[tab] || "";

  const handleSearchChange = (value: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [tab]: value,
    }));
  };

  const handleTabChange = (value: string) => {
    const newTab = value as "ussd" | "financial";
    setTab(newTab);
    setSearchQueries((prev) => ({
      ...prev,
      [newTab]: "",
    }));
  };

  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState<ReportFilters>({
    reportType: "transaction",
  });

  type USSRow = (typeof ussdTransactions)[number];
  type FinRow = (typeof financialTransactions)[number];

  const ussdOpts = useMemo<FilterOptions<USSRow>>(
    () => ({
      dateKeys: ["date"],
      typeKeys: ["ussd", "type"],
      dateFormat: "DMY",
    }),
    []
  );

  const finOpts = useMemo<FilterOptions<FinRow>>(
    () => ({
      dateKeys: ["date"],
      typeKeys: ["type"],
      dateFormat: "DMY",
    }),
    []
  );

  const getUSSDSearchPredicate = (query: string) =>
    createSearchPredicate<USSRow>(["serviceId", "merchantName"], query);

  const getFinancialSearchPredicate = (query: string) =>
    createSearchPredicate<FinRow>(["merchantName"], query);

  const ussdRows = useMemo(() => {
    const base = applyReportFilters<USSRow>(ussdTransactions, filters);
    return base.filter(getUSSDSearchPredicate(searchQueries.ussd));
  }, [filters, searchQueries.ussd, ussdOpts]);

  const financialRows = useMemo(() => {
    const base = applyReportFilters<FinRow>(
      financialTransactions,
      filters,
      finOpts
    );
    return base.filter(getFinancialSearchPredicate(searchQueries.financial));
  }, [filters, searchQueries.financial, finOpts]);

  // Exports respect current tab + filters + search
  const currentRows = tab === "ussd" ? ussdRows : financialRows;
  const handleExportCSV = () =>
    downloadCSV(currentRows as Record<string, any>[]);
  const handleExportPDF = () =>
    downloadPDF(currentRows as Record<string, any>[]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex gap-2 flex-col sm:flex-row">
          <Input
            placeholder={
              tab === "ussd"
                ? "Search by Session ID, Merchant, or Phone"
                : "Search by Reference ID, Merchant, or Customer"
            }
            value={currentSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-[300px]"
          />
          <button
            onClick={() => setShowFilter(true)}
            className="bg-[#FAF8FB] text-black px-4 py-2 rounded-xl w-fit flex items-center gap-2"
          >
            <PiFadersHorizontal className="inline" />
            Filter
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button className="px-8" onClick={() => setOpen(true)}>
              Export
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 bg-white">
            <div className="flex flex-col gap-2">
              <Button onClick={handleExportCSV} variant={"ghost"}>
                Export CSV
              </Button>
              <Button onClick={handleExportPDF} variant={"ghost"}>
                Export PDF
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* <div className="flex gap-2">
          <Button onClick={handleExportCSV}>Export CSV</Button>
          <Button onClick={handleExportPDF}>Export PDF</Button>
        </div> */}
      </div>

      <Tabs
        value={tab}
        onValueChange={handleTabChange}
        className="space-y-4 rounded-lg"
      >
        <TabsList className="w-fit bg-[#f4f4f5]">
          <TabsTrigger
            value="ussd"
            className="data-[state=active]:bg-white data-[state=active]:text-primary"
          >
            USSD Sessions
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="data-[state=active]:bg-white data-[state=active]:text-primary"
          >
            Financial Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ussd">
          <DataTable columns={ussdTransactionColumns} data={ussdRows} />
        </TabsContent>

        <TabsContent value="financial">
          <DataTable
            columns={financialTransactionColumns}
            data={financialRows}
          />
        </TabsContent>
      </Tabs>

      <FilterModal
        reportType="transaction"
        isOpen={!!showFilter}
        setIsOpen={setShowFilter}
        initialFilters={filters}
        onApply={(next) => setFilters(next)}
        typeOptions={["Card", "Transfer", "Wallet"]}
        showTriggerButton={false}
      />
    </div>
  );
}
