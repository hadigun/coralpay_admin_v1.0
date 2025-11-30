"use client";

import { useSystemAuditLogsQuery } from "@/app/queryHandler/audit";
import FilterModal from "@/components/FilterModal";
import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/ui/DataTable";
import { ReportFilters } from "@/lib/filter";
import { useMemo, useState } from "react";
import { columns } from "./column";

const AuditLog = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [baseFilters, setBaseFilters] = useState<ReportFilters>({
    reportType: "audit",
    rangeFrom: undefined,
    rangeTo: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [searchQuery, setSearchQuery] = useState<string>("");

  const queryFilters = useMemo(
    () => ({
      ...baseFilters,
      page: page,
      limit: limit,
    }),
    [baseFilters, page, limit]
  );

  // Use the combined object for the API call
  const { data, isLoading, isError, error } =
    useSystemAuditLogsQuery(queryFilters);
  const total = data?.data?.pagination?.total ?? 0;

  const searchableFields = ["userName", "ip", "action", "role"];

  const rows = useMemo(() => {
    if (!data?.data?.data) return [];
    const auditLogs = data.data.data;

    // Optional client-side search filter
    if (!searchQuery.trim()) return auditLogs;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return auditLogs.filter((entry: any) =>
      searchableFields.some((field) => {
        const value = entry[field];
        return (
          typeof value === "string" &&
          value.toLowerCase().includes(lowerCaseQuery)
        );
      })
    );
  }, [data, searchQuery]);

  // Handler for applying other filters (from FilterModal)
  const handleApplyFilters = (nextFilters: ReportFilters) => {
    // 1. Extract the base filters, ignoring any stale page/limit properties
    const {
      page: ignoredPage,
      limit: ignoredLimit,
      ...newBaseFilters
    } = nextFilters;

    // 2. Set the new base filters (triggers queryFilters memo update)
    setBaseFilters(newBaseFilters);

    // 3. Reset the page to 1 when new filters are applied (triggers queryFilters memo update)
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-900">Audit Log</h1>
        <div className="flex gap-4 items-center">
          <SearchInput
            onSearch={setSearchQuery}
            placeholder="Search audit logs..."
          />
          <FilterModal
            reportType="audit"
            isOpen={showFilter}
            setIsOpen={setShowFilter}
            // Pass the currently used filters for display initialization
            initialFilters={queryFilters}
            onApply={handleApplyFilters}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading logs...</div>
        ) : rows.length > 0 ? (
          <DataTable
            columns={columns}
            data={rows}
            totalCount={total}
            page={page}
            limit={limit}
            // These setters update state, which updates the queryFilters memo, which refetches the data.
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1); // Crucial: Reset to page 1 when changing the limit
            }}
          />
        ) : (
          <div className="text-center">No audit logs found.</div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
