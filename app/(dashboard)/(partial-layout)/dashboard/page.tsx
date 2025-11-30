"use client";

import { useUserProfile } from "@/app/queryHandler/auth";
import { useGetMerchantStatsQuery } from "@/app/queryHandler/stats";
import Header from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import UsersGroupIcon from "@/components/svgs/UserGroupIcon";
import { Bell } from "lucide-react";
import { useMemo } from "react";

import ShortCodeRequestsWidget from "../code-requests/ShortCodeRequestsWidget";
export default function DashboardOverview() {
  const { data } = useGetMerchantStatsQuery();
  const { user, fullName } = useUserProfile();

  const merchantStats = useMemo(() => {
    if (!data) return null;
    return data.data.data?.current;
  }, [data]);

  const metrics = useMemo(
    () => [
      {
        label: "Total Number of Merchants",
        value: merchantStats?.total || 0,
        percentage: "0.00%",
        background: "bg-green-50",
        iconColor: "text-green-600",
        icon: <UsersGroupIcon className="w-5 h-5" />,
      },
      {
        label: "Active Merchants",
        value: merchantStats?.active || 0,
        percentage: "0.00%",
        background: "bg-red-50",
        iconColor: "text-red-600",
        icon: <UsersGroupIcon className="w-5 h-5" />,
      },
      {
        label: "Inactive Merchants",
        value: merchantStats?.inactive || 0,
        percentage: "0.00%",
        background: "bg-purple-50",
        iconColor: "text-purple-600",
        icon: <UsersGroupIcon className="w-5 h-5" />,
      },
    ],
    [merchantStats]
  );

  return (
    <>
      <Header
        children={
          <>
            <h1 className="text-3xl font-bold">Hello, {fullName}</h1>
            <h1 className="text-3xl font-bold">Hello, {fullName}</h1>
            <div className="flex items-center justify-between mt-2">
              <p className="font-medium text-base">
                Welcome and Let’s do some work today!
              </p>
              <div className="md:flex items-center gap-2 hidden">
                <Bell className="w-5 h-5" />
              </div>
            </div>
          </>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => (
          <MetricCard
            key={idx}
            label={metric.label}
            value={metric.value}
            percentage={metric.percentage}
            background={metric.background}
            iconColor={metric.iconColor}
            icon={metric.icon}
          />
        ))}
      </div>
      <div className="space-y-6 mt-8">
        {/* Header row */}

        <ShortCodeRequestsWidget
          id="dashboard"
          dashboard={true}
          status="pending"
        />
      </div>
    </>
  );
}
