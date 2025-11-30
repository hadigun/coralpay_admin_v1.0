"use client";

import FilterModal from "@/components/FilterModal";
import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/ui/DataTable";
import { ReportFilters, applyReportFilters } from "@/lib/filter";
import { useMemo, useState } from "react";
import { columns } from "./column";
import { merchantData } from "./data";

export default function ContactPersonPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: "merchant",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  const searchableFields = ["fullName", "email"];

  type MerchantData = (typeof merchantData)[number];

  const rows = useMemo(() => {
    const filteredByReport = applyReportFilters<MerchantData>(
      merchantData,
      filters
    );

    if (searchQuery.trim() === "") {
      return filteredByReport;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    return filteredByReport.filter((entry) =>
      searchableFields.some((field) => {
        // const value = entry[field as keyof User];
        const value = entry.fullName;

        return (
          typeof value === "string" &&
          value.toLowerCase().includes(lowerCaseQuery)
        );
      })
    );
  }, [merchantData, filters, searchQuery]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Contact Person</h2>
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <SearchInput
            onSearch={setSearchQuery}
            placeholder="Search by name or email..."
          />
          <FilterModal
            reportType="merchant"
            isOpen={showFilter}
            setIsOpen={setShowFilter}
            initialFilters={filters}
            onApply={(next) => setFilters(next)}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={rows}
        searchableKeys={["fullName", "email"]}
      />
    </div>
  );
}
