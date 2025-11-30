"use client";

import Header from "@/components/Header";
import { SessionManager } from "@/components/SessionManager";
import { cn } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import AuditLog from "../audit-log/page";
import ShortCodeRequestsPage from "../code-requests/page";
import MerchantPage from "../merchants/page";
import UsersPage from "../users/page";

type TabKey = "merchant" | "ussd" | "transaction" | "user" | "audit";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("merchant");
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Build tabs once; content is expressed as elements to render.
  const tabs = useMemo<
    Array<{
      key: TabKey;
      label: string;
      content: React.ReactNode;
    }>
  >(
    () => [
      {
        key: "merchant",
        label: "Merchant Report",
        content: <MerchantPage />,
      },
      {
        key: "ussd",
        label: "USSD Report",
        content: <ShortCodeRequestsPage />,
      },
      {
        key: "transaction",
        label: "Transaction Report",
        content: <SessionManager />,
      },
      {
        key: "user",
        label: "User Report",
        content: <UsersPage />,
      },
      {
        key: "audit",
        label: "Audit Trail Report",
        content: <AuditLog />,
      },
    ],
    []
  );
  return (
    <div className="">
      <Header
        children={<h1 className="text-3xl font-bold">General Reports</h1>}
      />
      <div className="flex">
        {/* Sidebar */}
        <div ref={sidebarRef} className="w-1/5 space-y-4 rounded-l-xl">
          <nav
            aria-label="Settings sections"
            className="space-y-2 text-base mt-10"
          >
            {tabs.map((t) => (
              <SidebarTabButton
                key={t.key}
                tabKey={t.key}
                isActive={activeTab === t.key}
                onSelect={() => setActiveTab(t.key)}
              >
                {t.label}
              </SidebarTabButton>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tabs.find((t) => t.key === activeTab)?.content}
        </div>
      </div>
    </div>
  );
};

function SidebarTabButton({
  tabKey,
  isActive,
  onSelect,
  children,
}: {
  tabKey: TabKey;
  isActive: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-tab={tabKey}
      onClick={onSelect}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex w-full items-center text-left py-2 rounded-md transition-colors",
        isActive ? "font-semibold text-primary" : "hover:text-primary"
      )}
    >
      <span className="ml-2">{children}</span>
    </button>
  );
}

export default ReportsPage;
