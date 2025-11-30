"use client";

import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Menu } from "lucide-react";
import { ReactNode, useState } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  // useSessionCheck();
  console.log("useSessionCheck");

  return (
    <div className="relative w-full flex flex-col overflow-hidden bg-[#FDFDFE] text-text-primary">
      {/* Simple top bar with hamburger (mobile/tablet only) */}
      <div className="flex items-center justify-end h-14 px-4 bg-white lg:hidden">
        <button
          // ref={triggerRef}
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center justify-center rounded-md px-3 py-2"
          aria-label="Open sidebar"
        >
          <Menu className="size-7" />
        </button>
      </div>

      <div className="flex w-full h-screen relative">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {/* <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            // headerTitle="HalalNest Merchant"
            // sidebar={true}
          /> */}
          {children}
          <Toaster position="bottom-right" />
        </main>
      </div>
    </div>
  );
};

export default Layout;

// "use client";

// import Sidebar from "@/components/Sidebar";
// import { Toaster } from "@/components/ui/sonner";
// import { Menu } from "lucide-react";
// import { ReactNode, useRef, useState } from "react";

// const Layout = ({ children }: { children: ReactNode }) => {
//   const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

//   // This ref is passed to Sidebar so it can exclude the trigger from "outside click"
//   const triggerRef = useRef<HTMLButtonElement>(null);

//   return (
//     <div className="relative w-full flex flex-col overflow-hidden bg-[#FDFDFE] text-text-primary min-h-screen">
//       {/* Simple top bar with hamburger (mobile/tablet only) */}
//       <div className="flex items-center justify-end h-14 px-4 bg-white lg:hidden">
//         <button
//           ref={triggerRef}
//           onClick={() => setSidebarOpen(true)}
//           className="inline-flex items-center justify-center rounded-md px-3 py-2"
//           aria-label="Open sidebar"
//         >
//           <Menu className="size-10" />
//         </button>
//       </div>

//       <div className="flex w-full flex-1 relative">
//         {/* Sidebar (receives triggerRef) */}
//         <Sidebar
//           sidebarOpen={sidebarOpen}
//           setSidebarOpen={setSidebarOpen}
//           // triggerRef={triggerRef}
//         />

//         {/* Main content */}
//         <main className="flex-1 overflow-x-hidden overflow-y-auto">
//           <div className="flex-1 h-full px-4 py-6 mx-auto max-w-screen-2xl md:px-8 md:py-14 2xl:px-10">
//             {children}
//           </div>
//           <Toaster position="bottom-right" />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;
