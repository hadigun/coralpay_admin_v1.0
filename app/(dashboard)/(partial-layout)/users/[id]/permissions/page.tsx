"use client";

import { useGetPermissionsQuery } from "@/app/queryHandler/permissions";
import {
  useAssignPermissionToUserMutation,
  useGetUserPermissionsQuery,
  useRemovePermissionFromUserMutation,
} from "@/app/queryHandler/users";
import BackButton from "@/components/BackButton";
import { PermissionMatrix } from "@/components/PermissionMatrix";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function RoleDetailPage() {
  const router = useRouter();
  const params = useParams();

  const rawId =
    (params?.roleId as string) ||
    (params?.userId as string) ||
    (params?.id as string);

  const { data: allPermissionsData, isLoading: loadingAllPermissions } =
    useGetPermissionsQuery();
  const { data: rolePermissionsData, isLoading: loadingRolePermissions } =
    useGetUserPermissionsQuery(rawId ?? "");
  const { mutateAsync: assignPermissions, isPending: assigning } =
    useAssignPermissionToUserMutation();
  const { mutateAsync: removePermissions, isPending: removing } =
    useRemovePermissionFromUserMutation();

  // States
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, boolean>
  >({});
  const [initialPermissions, setInitialPermissions] = useState<
    Record<string, boolean>
  >({});
  const [permissions, setPermissions] = useState<any[]>([]);

  useEffect(() => {
    if (rolePermissionsData?.data?.data) {
      const map: Record<string, boolean> = {};
      rolePermissionsData.data.data.forEach((p: any) => (map[p.id] = true));
      setSelectedPermissions(map);
      setInitialPermissions(map);
    }
  }, [rolePermissionsData]);

  useEffect(() => {
    if (allPermissionsData?.data?.data) {
      setPermissions(allPermissionsData.data.data);
    }
  }, [allPermissionsData]);

  const { toAssign, toRemove } = useMemo(() => {
    const assign: string[] = [];
    const remove: string[] = [];
    Object.entries(selectedPermissions).forEach(([id, selected]) => {
      if (selected && !initialPermissions[id]) assign.push(id);
    });
    Object.entries(initialPermissions).forEach(([id, wasSelected]) => {
      if (wasSelected && !selectedPermissions[id]) remove.push(id);
    });
    return { toAssign: assign, toRemove: remove };
  }, [selectedPermissions, initialPermissions]);

  const hasChanges = toAssign.length > 0 || toRemove.length > 0;
  const isLoading = loadingAllPermissions || loadingRolePermissions;
  const isSaving = assigning || removing;

  const handleSaveChanges = async () => {
    if (!rawId || !hasChanges) return;
    try {
      if (toRemove.length > 0)
        await removePermissions({ id: rawId, permissionIds: toRemove });
      if (toAssign.length > 0)
        await assignPermissions({ id: rawId, permissionIds: toAssign });
      setInitialPermissions({ ...selectedPermissions });
      toast.success("Changes saved successfully!");
      router.push("/roles");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save changes");
    }
  };

  const handleMatrixChange = (
    newValues: Record<string, boolean>,
    newPerms?: any[]
  ) => {
    setSelectedPermissions(newValues);
    if (newPerms) setPermissions(newPerms);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <h2 className="text-xl font-bold capitalize">Edit Role Permissions</h2>
      </div>

      <div className="flex justify-end space-x-2">
        <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving}>
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            You have unsaved changes: {toAssign.length} to assign,{" "}
            {toRemove.length} to remove
          </p>
        </div>
      )}

      <Tabs defaultValue="permissions" className="w-full">
        <TabsList>
          <TabsTrigger value="permissions">Assigned Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="permissions">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <p>Loading permissions...</p>
            </div>
          ) : (
            <PermissionMatrix
              permissions={permissions}
              value={selectedPermissions}
              onChange={handleMatrixChange}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
