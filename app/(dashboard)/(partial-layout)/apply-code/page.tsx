"use client";

import { useUserProfile } from "@/app/queryHandler/auth";
import { useGetMerchantShortCodesQuery } from "@/app/queryHandler/short-codes";
import FilterModal from "@/components/FilterModal";
import { ApplyShortCodeDialog } from "@/components/short-code-application/ShortCodeApplication";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import { ReportFilters } from "@/lib/filter";
import { useMemo, useState } from "react";
import { columns } from "./columns";

export default function ShortCodePage() {
  const [open, setOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { merchantId } = useUserProfile();

  // State for non-paging filters (date range, sort order, etc.)
  const [baseFilters, setBaseFilters] = useState<ReportFilters>({
    reportType: "ussd",
    rangeFrom: undefined,
    rangeTo: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const queryFilters = useMemo(
    () => ({
      ...baseFilters,
      page: page,
      limit: limit,
    }),
    [baseFilters, page, limit]
  );

  const ussdFilters =
    queryFilters?.reportType === "ussd" ? (queryFilters as any) : undefined;
  const { data, isLoading } = useGetMerchantShortCodesQuery(
    merchantId,
    ussdFilters
  );
  const total = data?.data?.pagination?.total ?? 0;

  const shortCodeData = useMemo(() => {
    return data?.data?.data || [];
  }, [data]); // Current short code being processed

  const handleApplyFilters = (nextFilters: ReportFilters) => {
    const {
      page: ignoredPage,
      limit: ignoredLimit,
      ...newBaseFilters
    } = nextFilters;

    setBaseFilters(newBaseFilters);

    setPage(1);
  };

  return (
    <div className="container py-10">
      <div className="mb-4 flex justify-between items-center">
        <p className="text-xl font-semibold">Short Code</p>
        <div className="flex flex-col gap-2 md:flex-row md:gap-4">
          <FilterModal
            reportType="ussd"
            isOpen={showFilter}
            setIsOpen={setShowFilter}
            initialFilters={queryFilters}
            onApply={handleApplyFilters}
          />
          <Button onClick={() => setOpen(true)}>Apply for short code</Button>
        </div>
      </div>

      <p className="text-sm mb-4 text-muted-foreground">
        Requests awaiting your review. Approve to move them forward or decline
        with a reason.
      </p>

      <div className="">
        {/* <DataTable columns={columns} data={shortCodeTableData} /> */}
        <div className="">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              Loading requests...
            </div>
          ) : shortCodeData.length > 0 ? (
            <DataTable
              columns={columns}
              data={shortCodeData}
              totalCount={total}
              page={page}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          ) : (
            <div className="text-center">No requests found.</div>
          )}
        </div>
      </div>

      <ApplyShortCodeDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
