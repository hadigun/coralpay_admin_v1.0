// "use client";

// import { format } from "date-fns";
// import { CalendarIcon, ChevronDown } from "lucide-react";
// import React, { useEffect, useMemo, useState } from "react";
// import { PiFadersHorizontal } from "react-icons/pi";

// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { AUDIT_ACTIONS } from "@/lib/auditActions";
// import {
//   isValidDateRangeDates,
//   ReportFilters,
//   ReportType,
//   STATUS_OPTIONS,
//   toISODate,
// } from "@/lib/filter";
// import { cn } from "@/lib/utils";

// type FilterModalProps = {
//   reportType: ReportType;
//   isOpen: boolean;
//   setIsOpen: (v: boolean) => void;
//   initialFilters?: Partial<ReportFilters>;
//   onApply: (filters: ReportFilters) => void;
//   onClose?: () => void;
//   typeOptions?: string[];
//   showTriggerButton?: boolean;
// };

// const DEFAULT_TYPE_OPTIONS = ["Card", "Transfer", "Wallet"];

// const FilterModal: React.FC<FilterModalProps> = ({
//   reportType,
//   isOpen,
//   setIsOpen,
//   initialFilters,
//   onApply,
//   onClose,
//   typeOptions = DEFAULT_TYPE_OPTIONS,
//   showTriggerButton = true,
// }) => {
//   const [startDate, setStartDate] = useState<Date | undefined>();
//   const [endDate, setEndDate] = useState<Date | undefined>();
//   const [statuses, setStatuses] = useState<string[]>([]);
//   const [transactionType, setTransactionType] = useState<string[]>([]);
//   const [userId, setUserId] = useState("");
//   const [merchantId, setMerchantId] = useState("");
//   const [action, setAction] = useState("");
//   const [sortBy, setSortBy] = useState("createdAt");
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

//   const [startOpen, setStartOpen] = useState(false);
//   const [endOpen, setEndOpen] = useState(false);

//   useEffect(() => {
//     if (initialFilters) {
//       const s = (initialFilters as any)?.rangeFrom;
//       const e = (initialFilters as any)?.rangeTo;
//       setStartDate(s ? new Date(s) : undefined);
//       setEndDate(e ? new Date(e) : undefined);
//       setStatuses((initialFilters as any)?.status || []);
//       setTransactionType((initialFilters as any)?.transactionType || []);
//       setUserId((initialFilters as any)?.userId || "");
//       setMerchantId((initialFilters as any)?.merchantId || "");
//       setAction((initialFilters as any)?.action || "");
//       setSortBy((initialFilters as any)?.sortBy || "createdAt");
//       setSortOrder((initialFilters as any)?.sortOrder || "desc");
//     }
//   }, [isOpen, initialFilters]);

//   const statusOptions = useMemo(
//     () => STATUS_OPTIONS[reportType] || [],
//     [reportType]
//   );

//   const invalidRange = !isValidDateRangeDates(startDate, endDate);

//   const handleApply = () => {
//     if (invalidRange) return;

//     const filters: ReportFilters = {
//       reportType,
//       rangeFrom: toISODate(startDate),
//       rangeTo: toISODate(endDate),
//       sortBy,
//       sortOrder,
//     };

//     if (reportType === "audit") {
//       Object.assign(filters, {
//         userId: userId || undefined,
//         action: action || undefined,
//       });
//     } else if (reportType === "transaction" || reportType === "ussd") {
//       Object.assign(filters, {
//         status: statuses.length ? statuses : undefined,
//         transactionType: transactionType.length ? transactionType : undefined,
//         userId: userId || undefined,
//         merchantId: merchantId || undefined,
//       });
//     } else if (reportType === "merchant") {
//       Object.assign(filters, {
//         merchantId: merchantId || undefined,
//         status: statuses.length ? statuses : undefined,
//       });
//     }

//     onApply(filters);
//     setIsOpen(false);
//     onClose?.();
//   };

//   const handleReset = () => {
//     setStartDate(undefined);
//     setEndDate(undefined);
//     setStatuses([]);
//     setTransactionType([]);
//     setUserId("");
//     setMerchantId("");
//     setAction("");
//     setSortBy("createdAt");
//     setSortOrder("desc");
//   };

//   const toggle = (
//     setter: React.Dispatch<React.SetStateAction<string[]>>,
//     value: string
//   ) => {
//     setter((prev) =>
//       prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
//     );
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       {showTriggerButton && (
//         <DialogTrigger asChild>
//           <button className="bg-[#FAF8FB] text-black px-4 py-2 flex items-center justify-center rounded-xl">
//             <PiFadersHorizontal className="inline mr-2" />
//             Filter
//             <ChevronDown className="ml-2 h-4 w-4" />
//           </button>
//         </DialogTrigger>
//       )}

//       <DialogContent className="max-w-md bg-white">
//         <DialogHeader>
//           <DialogTitle className="text-lg font-semibold">Filter</DialogTitle>
//           <DialogDescription>Set filter criteria.</DialogDescription>
//         </DialogHeader>

//         <div className="space-y-5">
//           {/* Date range */}
//           <div className="grid grid-cols-2 gap-2 w-full">
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Start Date
//               </label>
//               <Popover open={startOpen} onOpenChange={setStartOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "w-full justify-start text-left font-normal",
//                       !startDate && "text-muted-foreground",
//                       invalidRange && "border-red-500"
//                     )}
//                   >
//                     {startDate ? format(startDate, "PPP") : "Pick a start date"}
//                     <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0" align="start">
//                   <Calendar
//                     mode="single"
//                     selected={startDate}
//                     disabled={endDate ? { after: endDate } : undefined}
//                     onSelect={(date) => {
//                       setStartDate(date || undefined);
//                       setStartOpen(false);
//                     }}
//                     captionLayout="dropdown"
//                     fromYear={1900}
//                     toYear={new Date().getFullYear()}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">End Date</label>
//               <Popover open={endOpen} onOpenChange={setEndOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "w-full justify-start text-left font-normal",
//                       !endDate && "text-muted-foreground",
//                       invalidRange && "border-red-500"
//                     )}
//                   >
//                     {endDate ? format(endDate, "PPP") : "Pick an end date"}
//                     <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0" align="start">
//                   <Calendar
//                     mode="single"
//                     selected={endDate}
//                     disabled={startDate ? { before: startDate } : undefined}
//                     onSelect={(date) => {
//                       setEndDate(date || undefined);
//                       setEndOpen(false);
//                     }}
//                     captionLayout="dropdown"
//                     fromYear={1900}
//                     toYear={new Date().getFullYear()}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>
//           </div>

//           {invalidRange && (
//             <p className="text-sm text-red-600">
//               Start date must be earlier than or equal to End date.
//             </p>
//           )}

//           {/* AUDIT FILTERS */}
//           {reportType === "audit" && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   User ID
//                 </label>
//                 <input
//                   type="text"
//                   value={userId}
//                   onChange={(e) => setUserId(e.target.value)}
//                   placeholder="Enter User ID"
//                   className="w-full border rounded p-2 text-sm"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Action</label>
//                 <select
//                   className="w-full border rounded p-2 text-sm"
//                   value={action}
//                   onChange={(e) => setAction(e.target.value)}
//                 >
//                   <option value="">All Actions</option>
//                   {AUDIT_ACTIONS.map((a) => (
//                     <option key={a.value} value={a.value}>
//                       {a.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </>
//           )}

//           {/* MERCHANT FILTERS */}
//           {(reportType === "transaction" ||
//             reportType === "ussd" ||
//             reportType === "merchant") && (
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Merchant ID
//               </label>
//               <input
//                 type="text"
//                 value={merchantId}
//                 onChange={(e) => setMerchantId(e.target.value)}
//                 placeholder="Enter Merchant ID"
//                 className="w-full border rounded p-2 text-sm"
//               />
//             </div>
//           )}

//           {/* Status */}
//           {reportType !== "audit" && statusOptions.length > 0 && (
//             <div>
//               <label className="block text-sm font-medium mb-2">Status</label>
//               <div className="grid grid-cols-2 gap-2">
//                 {statusOptions.map((opt) => (
//                   <label
//                     key={opt.value}
//                     className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={statuses.includes(opt.value)}
//                       onChange={() => toggle(setStatuses, opt.value)}
//                       className="accent-purple-700"
//                     />
//                     <span className="text-sm">{opt.label}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Transaction Type */}
//           {(reportType === "transaction" || reportType === "ussd") && (
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Transaction Type
//               </label>
//               <div className="flex gap-2 flex-wrap">
//                 {typeOptions.map((t) => (
//                   <label
//                     key={t}
//                     className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={transactionType.includes(t)}
//                       onChange={() => toggle(setTransactionType, t)}
//                       className="accent-purple-700"
//                     />
//                     <span className="text-sm">{t}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Sort Controls */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block text-sm font-medium mb-1">Sort By</label>
//               <select
//                 className="w-full border rounded p-2 text-sm"
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//               >
//                 <option value="createdAt">Date Created</option>
//                 <option value="status">Status</option>
//                 <option value="amount">Amount</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Sort Order
//               </label>
//               <select
//                 className="w-full border rounded p-2 text-sm"
//                 value={sortOrder}
//                 onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
//               >
//                 <option value="asc">Ascending</option>
//                 <option value="desc">Descending</option>
//               </select>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex justify-between pt-2">
//             <Button
//               className="bg-gray-100 text-gray-800 px-4 py-2 hover:bg-gray-200"
//               onClick={handleReset}
//             >
//               Reset
//             </Button>

//             <div className="flex gap-2">
//               <Button
//                 className="bg-purple-100 text-purple-800 px-4 py-2 hover:bg-purple-200"
//                 onClick={() => {
//                   setIsOpen(false);
//                   onClose?.();
//                 }}
//               >
//                 Cancel
//               </Button>

//               <Button
//                 onClick={handleApply}
//                 className={cn(
//                   "px-4 py-2 text-white",
//                   invalidRange && "bg-purple-300 cursor-not-allowed"
//                 )}
//                 disabled={invalidRange}
//               >
//                 Apply Filter
//               </Button>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default FilterModal;

"use client";

import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { PiFadersHorizontal } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AUDIT_ACTIONS } from "@/lib/auditActions";
import {
  isValidDateRangeDates,
  ReportFilters,
  ReportType,
  STATUS_OPTIONS,
  toISODate,
} from "@/lib/filter";
import { cn } from "@/lib/utils";

type FilterModalProps = {
  reportType: ReportType;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  initialFilters?: Partial<ReportFilters>;
  onApply: (filters: ReportFilters) => void;
  onClose?: () => void;
  typeOptions?: string[];
  showTriggerButton?: boolean;
};

const DEFAULT_TYPE_OPTIONS = ["Card", "Transfer", "Wallet"];

const FilterModal: React.FC<FilterModalProps> = ({
  reportType,
  isOpen,
  setIsOpen,
  initialFilters,
  onApply,
  onClose,
  typeOptions = DEFAULT_TYPE_OPTIONS,
  showTriggerButton = true,
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>(); // UPDATED: Change state to single string for single selection
  const [status, setStatus] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [action, setAction] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  useEffect(() => {
    if (initialFilters) {
      const s = (initialFilters as any)?.rangeFrom;
      const e = (initialFilters as any)?.rangeTo;
      setStartDate(s ? new Date(s) : undefined);
      setEndDate(e ? new Date(e) : undefined); // UPDATED: Extract status from array (if it was an array) or use the single string
      const initialStatus = (initialFilters as any)?.status;
      if (Array.isArray(initialStatus) && initialStatus.length > 0) {
        setStatus(initialStatus[0]);
      } else if (typeof initialStatus === "string") {
        setStatus(initialStatus);
      } else {
        setStatus("");
      }
      setTransactionType((initialFilters as any)?.transactionType || []);
      setUserId((initialFilters as any)?.userId || "");
      setMerchantId((initialFilters as any)?.merchantId || "");
      setAction((initialFilters as any)?.action || "");
      setSortBy((initialFilters as any)?.sortBy || "createdAt");
      setSortOrder((initialFilters as any)?.sortOrder || "desc");
    }
  }, [isOpen, initialFilters]);

  const statusOptions = useMemo(
    () => STATUS_OPTIONS[reportType] || [],
    [reportType]
  );

  const invalidRange = !isValidDateRangeDates(startDate, endDate);

  const handleApply = () => {
    if (invalidRange) return;

    const filters: ReportFilters = {
      reportType,
      rangeFrom: toISODate(startDate),
      rangeTo: toISODate(endDate),
      sortBy,
      sortOrder,
    };

    if (reportType === "audit") {
      Object.assign(filters, {
        userId: userId || undefined,
        action: action || undefined,
      });
    } else if (reportType === "transaction" || reportType === "ussd") {
      Object.assign(filters, {
        // UPDATED: Status is now a single string, wrap it in an array if present
        status: status ? status : undefined,
        // transactionType: transactionType.length ? transactionType : undefined,
        userId: userId || undefined,
        merchantId: merchantId || undefined,
      });
    } else if (reportType === "merchant") {
      Object.assign(filters, {
        merchantId: merchantId || undefined, // UPDATED: Status is now a single string, wrap it in an array if present
        status: status || undefined,
      });
    } else if (reportType === "user") {
      Object.assign(filters, {
        status: status || undefined,
      });
    }

    onApply(filters);
    setIsOpen(false);
    onClose?.();
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined); // UPDATED: Reset status to an empty string
    setStatus("");
    setTransactionType([]);
    setUserId("");
    setMerchantId("");
    setAction("");
    setSortBy("createdAt");
    setSortOrder("desc");
  }; // The toggle function is no longer needed for 'status' as we use a direct setter/radio

  const toggleTransactionType = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {showTriggerButton && (
        <DialogTrigger asChild>
          <button className="bg-[#FAF8FB] text-black px-4 py-2 flex items-center justify-center rounded-xl">
            <PiFadersHorizontal className="inline mr-2" />
            Filter <ChevronDown className="ml-2 h-4 w-4" />
          </button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Filter</DialogTitle>
          <DialogDescription>Set filter criteria.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <Popover open={startOpen} onOpenChange={setStartOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                      invalidRange && "border-red-500"
                    )}
                  >
                    {startDate ? format(startDate, "PPP") : "Pick a start date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    disabled={endDate ? { after: endDate } : undefined}
                    onSelect={(date) => {
                      setStartDate(date || undefined);
                      setStartOpen(false);
                    }}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Popover open={endOpen} onOpenChange={setEndOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                      invalidRange && "border-red-500"
                    )}
                  >
                    {endDate ? format(endDate, "PPP") : "Pick an end date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    disabled={startDate ? { before: startDate } : undefined}
                    onSelect={(date) => {
                      setEndDate(date || undefined);
                      setEndOpen(false);
                    }}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {invalidRange && (
            <p className="text-sm text-red-600">
              Start date must be earlier than or equal to End date.
            </p>
          )}
          {/* AUDIT FILTERS */}
          {reportType === "audit" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter User ID"
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <select
                  className="w-full border rounded p-2 text-sm"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  <option value="">All Actions</option>
                  {AUDIT_ACTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {/* MERCHANT FILTERS */}
          {(reportType === "transaction" ||
            reportType === "ussd" ||
            reportType === "merchant") && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Merchant ID
              </label>
              <input
                type="text"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                placeholder="Enter Merchant ID"
                className="w-full border rounded p-2 text-sm"
              />
            </div>
          )}
          {/* Status */}
          {reportType !== "audit" && statusOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
                  >
                    <input // UPDATED: Change to radio button
                      type="radio" // UPDATED: Radio buttons use 'name' attribute to group
                      name="report_status" // UPDATED: Check against single status state
                      checked={status === opt.value} // UPDATED: Directly set the single status value
                      onChange={() => setStatus(opt.value)}
                      className="accent-purple-700"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* Transaction Type */}
          {reportType === "transaction" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Transaction Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {typeOptions.map((t) => (
                  <label
                    key={t}
                    className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={transactionType.includes(t)}
                      onChange={() =>
                        toggleTransactionType(setTransactionType, t)
                      }
                      className="accent-purple-700"
                    />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* Sort Controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                className="w-full border rounded p-2 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Date Created</option>
                <option value="status">Status</option>
                <option value="amount">Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Sort Order
              </label>
              <select
                className="w-full border rounded p-2 text-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-between pt-2">
            <Button
              className="bg-gray-100 text-gray-800 px-4 py-2 hover:bg-gray-200"
              onClick={handleReset}
            >
              Reset
            </Button>
            <div className="flex gap-2">
              <Button
                className="bg-purple-100 text-purple-800 px-4 py-2 hover:bg-purple-200"
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                className={cn(
                  "px-4 py-2 text-white",
                  invalidRange && "bg-purple-300 cursor-not-allowed"
                )}
                disabled={invalidRange}
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
