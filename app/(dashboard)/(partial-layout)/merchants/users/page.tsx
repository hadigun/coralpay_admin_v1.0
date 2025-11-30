"use client";

import {
  useActivateMerchantUserMutation,
  useDeactivateMerchantUserMutation,
  useGetMerchantUsersQuery,
  useSuspendMerchantUserMutation,
} from "@/app/queryHandler/merchants";
import FilterModal from "@/components/FilterModal";
import { MerchantUserFormModal } from "@/components/MerchantUserFormModal";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import { ReportFilters } from "@/lib/filter";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createUserColumns } from "./columns";

export default function UsersPage() {
  const router = useRouter();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [baseFilters, setBaseFilters] = useState<ReportFilters>({
    reportType: "user",
    rangeFrom: undefined,
    rangeTo: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  const queryFilters = useMemo(
    () => ({
      ...baseFilters,
      page,
      limit,
    }),
    [baseFilters, page, limit]
  );

  const userFilters =
    queryFilters?.reportType === "user" ? (queryFilters as any) : undefined;

  const { data, isLoading } = useGetMerchantUsersQuery(userFilters);
  const { mutateAsync: activateUser } = useActivateMerchantUserMutation();
  const { mutateAsync: deactivateUser } = useDeactivateMerchantUserMutation();
  const { mutateAsync: suspendUser } = useSuspendMerchantUserMutation();

  const total = data?.data?.pagination?.total ?? 0;
  const searchableFields = ["firstName", "lastName", "email"];

  const rows = useMemo(() => {
    if (!data?.data?.data) return [];
    const users = data.data.data;

    if (!searchQuery.trim()) return users;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return users.filter((entry: any) =>
      searchableFields.some((field) => {
        const value = entry[field];
        return (
          typeof value === "string" &&
          value.toLowerCase().includes(lowerCaseQuery)
        );
      })
    );
  }, [data, searchQuery]);

  const handleApplyFilters = (nextFilters: ReportFilters) => {
    const { page: _page, limit: _limit, ...rest } = nextFilters;
    setBaseFilters(rest);
    setPage(1);
  };

  const handleUserAction = (user: any, action: any) => {
    try {
      if (action === "activate") {
        activateUser(user.id);
      } else if (action === "deactivate") {
        deactivateUser(user.id);
      } else if (action === "delete") {
        suspendUser(user.id);
      } else {
        // Handle or ignore other actions (e.g. "viewPermissions")
        console.warn("Unhandled user action:", action, "for user:", user?.id);
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  // ✅ Pass router into columns safely
  const columns = useMemo(
    () => createUserColumns(handleUserAction, router),
    [handleUserAction, router]
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Users</h2>

      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <SearchInput
            onSearch={setSearchQuery}
            placeholder="Search by name or email..."
          />
          <FilterModal
            reportType="user"
            isOpen={showFilter}
            setIsOpen={setShowFilter}
            initialFilters={queryFilters}
            onApply={handleApplyFilters}
          />
        </div>
        <Button
          onClick={() => setInviteModalOpen(true)}
          className="bg-primary text-white"
        >
          Invite User
        </Button>
      </div>

      <div>
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading users...</div>
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
          <div className="text-center">No users found.</div>
        )}
      </div>

      <MerchantUserFormModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  );
}
