// "use client";

// import { useGetMerchantsQuery } from "@/app/queryHandler/merchants"; // 🚀 New: Import API Query Hook
// import FilterModal from "@/components/FilterModal";
// import SearchInput from "@/components/SearchInput"; // 🚀 New: Search Input for API Search
// import { Button } from "@/components/ui/button";
// import { DataTable } from "@/components/ui/DataTable";
// import { ReportFilters } from "@/lib/filter";
// import { useRouter } from "next/navigation";
// import { useMemo, useState } from "react";
// import { columns } from "./columns"; // Assuming Merchant type is defined here

// export default function MerchantPage() {
//   const router = useRouter();

//   // State for pagination and search
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [searchQuery, setSearchQuery] = useState<string>("");

//   // State for non-paging filters (date range, status, sort order, etc.)
//   const [baseFilters, setBaseFilters] = useState<ReportFilters>({
//     reportType: "merchant",
//     rangeFrom: undefined,
//     rangeTo: undefined,
//     sortBy: "createdAt",
//     sortOrder: "desc",
//     status: undefined,
//   });

//   // Filter Modal state
//   const [showFilter, setShowFilter] = useState(false);

//   const queryFilters = useMemo(
//     () => ({
//       ...baseFilters,
//       page: page,
//       limit: limit,
//       // search: searchQuery, // Pass search to the API
//     }),
//     [baseFilters, page, limit, searchQuery]
//   );

//   const merchantApiFilters = queryFilters as any;

//   const {
//     data: merchantData,
//     isLoading,
//   } = useGetMerchantsQuery(merchantApiFilters);

//   const total = merchantData?.data?.pagination?.total ?? 0;

//   const rows = useMemo(() => {
//     return merchantData?.data?.data || [];
//   }, [merchantData]);

//   const handleRowClick = (merchantId: string) => {
//     router.push(`/merchants/${merchantId}`);
//   };

//   const handleApplyFilters = (nextFilters: ReportFilters) => {
//     // 1. Extract the base filters, ignoring any stale page/limit/search properties
//     const {
//       page: ignoredPage,
//       limit: ignoredLimit,
//       ...newBaseFilters
//     } = nextFilters;

//     setBaseFilters(newBaseFilters);
//     setPage(1);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-semibold">Merchants</h1>
//         <div className="flex gap-4 items-center">
//           {/* 🚀 New: Search Input */}
//           <SearchInput
//             onSearch={(q) => {
//               setSearchQuery(q);
//               setPage(1); // Reset page on new search
//             }}
//             placeholder="Search by ID, merchant, contact person"
//           />
//           <FilterModal
//             reportType="merchant"
//             isOpen={showFilter}
//             setIsOpen={setShowFilter}
//             // Pass the currently used queryFilters for display initialization
//             initialFilters={queryFilters}
//             onApply={handleApplyFilters}
//           />
//           <Button onClick={() => router.push("/merchants/create-merchant")}>
//             Create Merchant
//           </Button>
//         </div>
//       </div>

//       <div className="">
//         {isLoading ? (
//           <div className="p-6 text-center text-gray-500">
//             Loading merchants...
//           </div>
//         ) : rows.length > 0 ? (
//           <DataTable
//             columns={columns(handleRowClick)}
//             data={rows}
//             // 🚀 Server Pagination Props
//             totalCount={total}
//             page={page}
//             limit={limit}
//             onPageChange={setPage}
//             onLimitChange={(newLimit) => {
//               setLimit(newLimit);
//               setPage(1);
//             }}
//             // Client-side search is no longer needed
//           />
//         ) : (
//           <div className="text-center">No merchants found.</div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useGetMerchantsQuery } from "@/app/queryHandler/merchants";
import FilterModal from "@/components/FilterModal";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import { ReportFilters } from "@/lib/filter";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createMerchantColumns } from "./columns";

export default function MerchantPage() {
  const router = useRouter();

  // Pagination and search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Base filters
  const [baseFilters, setBaseFilters] = useState<ReportFilters>({
    reportType: "merchant",
    rangeFrom: undefined,
    rangeTo: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: undefined,
  });

  const [showFilter, setShowFilter] = useState(false);

  const queryFilters = useMemo(
    () => ({
      ...baseFilters,
      page,
      limit,
      search: searchQuery || undefined,
    }),
    [baseFilters, page, limit, searchQuery]
  );

  const { data: merchantData, isLoading } = useGetMerchantsQuery(
    queryFilters as any
  );

  // const { mutateAsync: assignPermission, isPending: assigning } =
  //   useAssignPermissionToMerchantRoleMutation();
  // const { mutateAsync: removePermission, isPending: removing } =
  //   useRemovePermissionFromMerchantRoleMutation?.() || {
  //     mutateAsync: async () => {},
  //     isPending: false,
  //   };

  const total = merchantData?.data?.pagination?.total ?? 0;
  const rows = useMemo(() => merchantData?.data?.data || [], [merchantData]);

  const handleApplyFilters = (nextFilters: ReportFilters) => {
    const { page: _page, limit: _limit, ...newBaseFilters } = nextFilters;
    setBaseFilters(newBaseFilters);
    setPage(1);
  };

  // ✅ Action handler for assigning/removing permissions
  const handleMerchantAction = async (
    merchant: any,
    action: "assign" | "remove" | "view"
  ) => {
    try {
      // if (action === "assign") {
      //   await assignPermission({ merchantId: merchant.id });
      //   toast.success(`Permission assigned to ${merchant.merchant}`);
      // } else if (action === "remove") {
      //   await removePermission({ merchantId: merchant.id });
      //   toast.success(`Permission removed from ${merchant.merchant}`);
      // } else
      if (action === "view") {
        router.push(`/merchants/${merchant.id}/permissions`);
      }
    } catch (err) {
      console.error("Action failed:", err);
      toast.error("Operation failed. Please try again.");
    }
  };

  // ✅ Row click navigation
  const handleRowClick = (merchantId: string) => {
    router.push(`/merchants/${merchantId}`);
  };

  const columns = useMemo(
    () => createMerchantColumns(handleMerchantAction, handleRowClick, router),
    [handleMerchantAction, router]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Merchants</h1>
        <div className="flex gap-4 items-center">
          <SearchInput
            onSearch={(q) => {
              setSearchQuery(q);
              setPage(1);
            }}
            placeholder="Search by merchant or contact person"
          />
          <FilterModal
            reportType="merchant"
            isOpen={showFilter}
            setIsOpen={setShowFilter}
            initialFilters={queryFilters}
            onApply={handleApplyFilters}
          />
          <Button onClick={() => router.push("/create-merchant")}>
            Create Merchant
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 text-center text-gray-500">
          Loading merchants...
        </div>
      ) : rows.length > 0 ? (
        <DataTable
          columns={columns}
          data={rows}
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
        <div className="text-center">No merchants found.</div>
      )}
    </div>
  );
}
