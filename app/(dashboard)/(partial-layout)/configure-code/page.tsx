"use client";

import FilterModal from "@/components/FilterModal";
import { DataTable } from "@/components/ui/DataTable";
import { BaseFilters } from "@/lib/filter";
import { useState } from "react";
import { shortCodeColumns } from "./columns";
import { shortCodeData } from "./data";

export default function UsersPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<BaseFilters>({});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configured Short Codes</h2>
        <FilterModal
          reportType="plain"
          isOpen={showFilter}
          setIsOpen={setShowFilter}
          initialFilters={filters}
          onApply={(next) => setFilters(next)}
        />
      </div>

      <DataTable columns={shortCodeColumns} data={shortCodeData} />
    </div>
  );
}
