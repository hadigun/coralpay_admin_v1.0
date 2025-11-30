import { Checkbox } from "@/components/ui/checkbox";
import { useMemo } from "react";

interface Permission {
  id: string;
  name: string;
  module: string;
  feature: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

interface PermissionMatrixProps {
  permissions: Permission[];
  value: Record<string, boolean>;
  onChange: (val: Record<string, boolean>) => void;
}

export function PermissionMatrix({
  permissions,
  value,
  onChange,
}: PermissionMatrixProps) {
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Record<string, Permission[]>> = {};

    permissions.forEach((perm) => {
      if (!groups[perm.module]) {
        groups[perm.module] = {};
      }
      if (!groups[perm.module][perm.feature]) {
        groups[perm.module][perm.feature] = [];
      }
      groups[perm.module][perm.feature].push(perm);
    });

    return groups;
  }, [permissions]);

  const allActions = useMemo(() => {
    const actionsSet = new Set<string>();
    permissions.forEach((perm) => actionsSet.add(perm.action));
    return Array.from(actionsSet).sort();
  }, [permissions]);

  const toggleSingle = (permissionId: string) => {
    const updated = {
      ...value,
      [permissionId]: !value[permissionId],
    };
    onChange(updated);
  };

  const toggleAllForRow = (rowPermissions: Permission[]) => {
    const allChecked = rowPermissions.every((perm) => value[perm.id]);
    const updated = { ...value };

    rowPermissions.forEach((perm) => {
      updated[perm.id] = !allChecked;
    });

    onChange(updated);
  };

  const isRowFullyChecked = (rowPermissions: Permission[]) => {
    return (
      rowPermissions.length > 0 &&
      rowPermissions.every((perm) => value[perm.id])
    );
  };

  const findPermissionForAction = (
    rowPermissions: Permission[],
    action: string
  ): Permission | undefined => {
    return rowPermissions.find((perm) => perm.action === action);
  };

  const formatRowLabel = (module: string, feature: string) => {
    const moduleMap: Record<string, string> = {
      system: "System",
      dashboard: "Dashboard",
      customer: "Customer",
      business: "Business",
      support: "Support",
      merchant: "Merchant",
    };

    const featureMap: Record<string, string> = {
      merchant: "Merchant List",
      user: "Admin Setup",
      role: "Roles",
      audit: "Audit Log",
      overview: "Overview",
      airtime: "Airtime",
      data: "Data",
      manage: "Management",
      complaint: "Complaints",
      configuration: "Configuration",
    };

    const moduleName = moduleMap[module] || module;
    const featureName = featureMap[feature] || feature;

    return `${moduleName} - ${featureName}`;
  };

  // Format action name for display
  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      view: "View",
      create: "Create",
      modify: "Edit",
      delete: "Delete",
      activate: "Activate",
      deactivate: "Deactivate",
      assign: "Assign",
      reply: "Reply",
      close: "Close",
      manage: "Manage",
    };

    return (
      actionMap[action] || action.charAt(0).toUpperCase() + action.slice(1)
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full text-sm border border-[#F9F9F9]">
        <thead>
          <tr className="bg-white h-12">
            <th className="p-4 text-left">
              <Checkbox className="mr-6 pt-4" disabled />
              Assign Permissions
            </th>
            {allActions.map((action) => (
              <th key={action} className="p-2 text-center">
                {formatAction(action)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedPermissions).map(([module, features]) =>
            Object.entries(features).map(([feature, perms], featureIndex) => {
              const rowIndex =
                Object.keys(groupedPermissions)
                  .slice(0, Object.keys(groupedPermissions).indexOf(module))
                  .reduce(
                    (acc, m) => acc + Object.keys(groupedPermissions[m]).length,
                    0
                  ) + featureIndex;

              return (
                <tr
                  key={`${module}-${feature}`}
                  className={`h-12 transition ${
                    rowIndex % 2 === 0 ? "bg-[#FAFCFF]" : "bg-[#FFFFFF]"
                  }`}
                >
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isRowFullyChecked(perms)}
                        onCheckedChange={() => toggleAllForRow(perms)}
                        className="mr-6"
                        // For indeterminate state (some checked, not all)
                        // Only if some (but not all) permissions are checked
                        {...(perms.some((p) => value[p.id]) &&
                          !isRowFullyChecked(perms) && {
                            "data-state": "indeterminate",
                          })}
                      />
                      {formatRowLabel(module, feature)}
                    </div>
                  </td>
                  {allActions.map((action) => {
                    const permission = findPermissionForAction(perms, action);
                    return (
                      <td key={action} className="p-2 text-center">
                        {permission ? (
                          <Checkbox
                            checked={value[permission.id] || false}
                            onCheckedChange={() => toggleSingle(permission.id)}
                          />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
