// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MoreVertical } from "lucide-react";

// interface ShortCodeCardProps {
//   merchant: string;
//   status: "Available" | "Not Available";
//   type: "Dedicated" | "Shared";
//   onApprove: () => void;
//   onDecline: () => void;
// }

// export function ShortCodeCard({
//   merchant,
//   status,
//   type,
//   onApprove,
//   onDecline,
// }: ShortCodeCardProps) {
//   return (
//     <div className="border rounded-lg p-4 shadow-md relative">
//       <div className="flex justify-between items-start">
//         <div>
//           <h4 className="font-semibold">Merchant Name</h4>
//           <p className="text-sm">
//             Requests for{" "}
//             <span className="text-indigo-600 font-bold">*312#</span>
//           </p>
//           <p
//             className={`text-sm font-medium ${
//               status === "Available" ? "text-green-600" : "text-red-500"
//             }`}
//           >
//             {status}
//           </p>
//           <p className="text-xs text-muted-foreground">
//             Short Code type:{" "}
//             <span className="font-medium text-purple-600">{type}</span>
//           </p>
//         </div>
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" size="icon">
//               <MoreVertical />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent>
//             <DropdownMenuItem onClick={onApprove}>
//               Approve Request
//             </DropdownMenuItem>
//             <DropdownMenuItem onClick={onDecline}>
//               Decline Request
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </div>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BadgeCheck, MoreVertical, XCircle } from "lucide-react";

interface ShortCodeCardProps {
  merchant: string;
  status: "Available" | "Not Available";
  type: "Dedicated" | "Shared";
  onApprove: () => void;
  onDecline: () => void;
}

export function ShortCodeCard({
  merchant,
  status,
  type,
  onApprove,
  onDecline,
}: ShortCodeCardProps) {
  const isAvailable = status === "Available";
  const isDedicated = type === "Dedicated";

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white space-y-2 relative">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold">Merchant Name</p>
          <p className="text-sm text-muted-foreground">
            Requests for <span className="text-primary font-bold">*312#</span>
          </p>

          {/* Status */}
          <div className="flex items-center text-sm mt-1">
            {isAvailable ? (
              <span className="text-green-600 flex items-center gap-1">
                <BadgeCheck size={16} /> Available
              </span>
            ) : (
              <span className="text-red-500 flex items-center gap-1">
                <XCircle size={16} /> Not Available
              </span>
            )}
          </div>

          {/* Short Code Type */}
          <p className="text-xs mt-1">
            Short Code type{" "}
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                isDedicated
                  ? "bg-purple-100 text-purple-700"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {type}
            </span>
          </p>
        </div>

        {/* Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onApprove}>
              Approve Request
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDecline}>
              Decline Request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
