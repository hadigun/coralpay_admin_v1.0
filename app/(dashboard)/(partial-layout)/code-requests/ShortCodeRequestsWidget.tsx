"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  useApproveShortCodeMutation,
  useDeclineShortCodeMutation,
  useGetShortCodesQuery,
} from "@/app/queryHandler/short-codes";
import FilterModal from "@/components/FilterModal";
import { ReportFilters, USSDFilters } from "@/lib/filter";
import { ShortCodeRequest, makeColumns } from "./columns";

type DeclineStep = "closed" | "confirm" | "reason" | "success";
type ApproveStep = "closed" | "confirm" | "reason" | "success"; // "reason" will now be correctly used

const purple = "bg-[#4B006E] hover:bg-[#3e005c]";

export type ShortCodeWidgetProps = {
  id?: string;
  dashboard: boolean;
  status?: "pending" | "approved" | "declined" | "";
};

export default function ShortCodeRequestsWidget({
  id,
  dashboard,
  status,
}: ShortCodeWidgetProps) {
  const params = { id, dashboard, status };
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // State for non-paging filters (date range, sort order, etc.)
  const [baseFilters, setBaseFilters] = useState<ReportFilters>({
    reportType: "ussd",
    rangeFrom: undefined,
    rangeTo: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: params?.status as unknown as USSDFilters["status"],
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
  const { data, isLoading } = useGetShortCodesQuery(ussdFilters);
  const total = data?.data?.pagination?.total ?? 0;

  const { mutate: approveMutation } = useApproveShortCodeMutation();
  const { mutate: declineMutation } = useDeclineShortCodeMutation();

  const shortCodeData = useMemo(() => {
    return data?.data?.data || [];
  }, [data]); // Current short code being processed

  const [currentShortCode, setCurrentShortCode] =
    React.useState<ShortCodeRequest | null>(null); // Decline flow

  const [declineStep, setDeclineStep] = React.useState<DeclineStep>("closed");
  const [declineReason, setDeclineReason] = React.useState(""); // Approve flow

  const [approveStep, setApproveStep] = React.useState<ApproveStep>("closed");
  const [approveReason, setApproveReason] = React.useState(""); // Optional reason for approval // Loading states

  const [isProcessing, setIsProcessing] =
    React.useState(false); /** Handle actions from columns dropdown */

  const handleAction = React.useCallback(
    (row: ShortCodeRequest, action: "accept" | "reject") => {
      if (!row.id) return;
      setCurrentShortCode(row);

      if (action === "accept") {
        setApproveReason(""); // Reset reason
        setApproveStep("confirm");
      } else {
        setDeclineReason(""); // Reset reason
        setDeclineStep("confirm");
      }
    },
    []
  );

  const columns = React.useMemo(
    () => makeColumns(handleAction),
    [handleAction]
  ); /** -------- Approve Flow -------- */ // NEW: Transition from "confirm" to "reason" step

  const goToApproveReason = () => setApproveStep("reason");

  const confirmApprove = async () => {
    if (!currentShortCode) return;

    setIsProcessing(true);
    try {
      approveMutation({
        id: currentShortCode.id,
        data: { actionReason: approveReason.trim() },
      });

      setApproveStep("success");
    } catch (error) {
      toast.error("Failed to approve short code");
      setApproveStep("closed");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeApprove = () => {
    setApproveStep("closed");
    setApproveReason("");
    setCurrentShortCode(null);
  }; /** -------- Decline Flow -------- */

  const goToReason = () => setDeclineStep("reason"); // This is correct, goes from confirm to reason

  const confirmDecline = async () => {
    if (!currentShortCode || !declineReason.trim()) return;

    setIsProcessing(true);
    try {
      declineMutation({
        id: currentShortCode.id,
        data: { actionReason: declineReason.trim() },
      });

      setDeclineStep("success");
    } catch (error) {
      toast.error("Failed to decline short code");
      setDeclineStep("closed");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeDecline = () => {
    setDeclineStep("closed");
    setCurrentShortCode(null);
    setDeclineReason("");
  };

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
    <div className="space-y-6">
      {params?.dashboard ? (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold">
                Recent Pending Requests
              </h2>
              <span className="text-base font-semibold text-gray-800">
                {shortCodeData.length}
              </span>
            </div>

            <FilterModal
              reportType="ussd"
              isOpen={showFilter}
              setIsOpen={setShowFilter}
              initialFilters={queryFilters}
              onApply={handleApplyFilters}
            />
          </div>
        </>
      ) : (
        <>
          <header className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Short Code Requests
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Review and manage short code requests. Use the action menu to
                approve or decline each request.
              </p>
            </div>
          </header>

          <div className="flex items-end justify-end">
            <FilterModal
              reportType="ussd"
              isOpen={showFilter}
              setIsOpen={setShowFilter}
              initialFilters={queryFilters}
              onApply={handleApplyFilters}
            />
          </div>
        </>
      )}

      {/* <div className="[&>div>table>tbody>tr:nth-child(odd)]:bg-[#FBFCFF]">
        <DataTable<ShortCodeRequest, any>
          columns={columns}
          data={shortCodeData || []} // getRowId={(row) => row.id}
        />
      </div> */}
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
      {/* --------------------------------------- */}
      {/* -------- APPROVE FLOW DIALOGS --------- */}
      {/* --------------------------------------- */}
      {/* -------- Approve – Confirm -------- */}
      <Dialog open={approveStep === "confirm"} onOpenChange={closeApprove}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="items-center">
            <div className="grid place-items-center mt-2">
              <div className="h-10 w-10 rounded-full bg-purple-100 grid place-items-center">
                <span className="text-purple-700 text-lg">i</span>
              </div>
            </div>

            <DialogTitle className="text-center">
              Proceeding with Approval?
            </DialogTitle>

            <DialogDescription className="text-center">
              This action will mark this request as approved and notify the
              Merchant. You may add an optional reason.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button
              variant="secondary"
              onClick={closeApprove}
              disabled={isProcessing}
            >
              Cancel
            </Button>

            <Button
              className={purple}
              onClick={goToApproveReason} // ⬅️ FIX: Transition to the reason dialog
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Yes, Proceed"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* -------- Approve – Reason (NEWLY ADDED/CORRECTED FLOW) -------- */}

      <Dialog open={approveStep === "reason"} onOpenChange={closeApprove}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add an optional reason for approval</DialogTitle>

            <DialogDescription>
              This reason will be recorded and shared with the merchant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason (Optional)</label>

            <Textarea
              placeholder="Enter your reason (e.g., 'Approved as per policy update 3.1')"
              value={approveReason}
              onChange={(e) => setApproveReason(e.target.value)}
              className="min-h-28"
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="secondary"
              onClick={() => setApproveStep("confirm")} // Go back to confirm step
              disabled={isProcessing}
            >
              Back
            </Button>

            <Button
              className={purple}
              onClick={confirmApprove} // ⬅️ FIX: Now calls mutation with reason
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm Approval"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* -------- Approve – Success -------- */}
      <Dialog open={approveStep === "success"} onOpenChange={closeApprove}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="items-center">
            <div className="grid place-items-center mt-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 grid place-items-center">
                <span className="text-blue-700 text-lg">✓</span>
              </div>
            </div>

            <DialogTitle className="text-center">
              Request Approved Successfully
            </DialogTitle>

            <DialogDescription className="text-center">
              Approval confirmed. Merchant will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <Button className={`w-full ${purple}`} onClick={closeApprove}>
              Okay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* --------------------------------------- */}
      {/* -------- DECLINE FLOW DIALOGS --------- */}
      {/* --------------------------------------- */}
      {/* -------- Decline – Confirm -------- */}
      <Dialog open={declineStep === "confirm"} onOpenChange={closeDecline}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="items-center">
            <div className="grid place-items-center mt-2">
              <div className="h-10 w-10 rounded-full bg-purple-100 grid place-items-center">
                <span className="text-purple-700 text-lg">i</span>
              </div>
            </div>

            <DialogTitle className="text-center">
              Are You Sure You Want to Decline This?
            </DialogTitle>

            <DialogDescription className="text-center">
              This request will be marked as declined and the requester will be
              notified. This action can't be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="secondary" onClick={closeDecline}>
              Cancel
            </Button>

            <Button className={purple} onClick={goToReason}>
              Yes, Proceed
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* -------- Decline – Reason (CORRECTLY PLACED) -------- */}
      <Dialog open={declineStep === "reason"} onOpenChange={closeDecline}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Provide your reason for declining.</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>

            <Textarea
              placeholder="Enter your reason"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="min-h-28"
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="secondary"
              onClick={() => setDeclineStep("confirm")} // Go back to confirm step
              disabled={isProcessing}
            >
              Back
            </Button>

            <Button
              className={`${purple} ${
                !declineReason.trim() ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={confirmDecline}
              disabled={isProcessing || !declineReason.trim()}
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* -------- Decline – Success -------- */}
      <Dialog open={declineStep === "success"} onOpenChange={closeDecline}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="items-center">
            <div className="grid place-items-center mt-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 grid place-items-center">
                <span className="text-blue-700 text-lg">✓</span>
              </div>
            </div>

            <DialogTitle className="text-center">
              Request Declined Successfully
            </DialogTitle>

            <DialogDescription className="text-center">
              The request has been marked as declined and removed from the
              active queue. The Merchant will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <Button className={`w-full ${purple}`} onClick={closeDecline}>
              Okay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
