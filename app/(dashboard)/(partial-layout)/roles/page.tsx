"use client";

import { useGetAllRolesQuery } from "@/app/queryHandler/roles";
import { RoleCard } from "@/components/RoleCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function RolesPage() {
  const router = useRouter();
  const { data, isLoading } = useGetAllRolesQuery();

  const roles = useMemo(() => {
    return data?.data?.data || [];
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Roles</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all custom roles. Each role defines access levels
            and permissions across the admin portal.
          </p>
        </div>
        <Button onClick={() => router.push("/roles/create-role")}>
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {!isLoading ? (
          roles.map((role: any) => (
            <RoleCard
              key={role.id}
              id={role.id}
              title={role.name}
              description={role.description}
            />
          ))
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
