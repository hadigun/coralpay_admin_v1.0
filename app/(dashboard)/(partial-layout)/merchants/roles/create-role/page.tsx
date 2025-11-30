// "use client";

// import { useGetPermissionsQuery } from "@/app/queryHandler/permissions";
// import { useCreateRoleMutation } from "@/app/queryHandler/roles";
// import { PermissionMatrix } from "@/components/PermissionMatrix";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import * as z from "zod";

// // Form validation schema
// const createRoleSchema = z.object({
//   name: z.string().min(3, "Role name must be at least 3 characters"),
//   description: z.string().min(10, "Description must be at least 10 characters"),
//   permissionIds: z.array(z.string()).min(1, "Select at least one permission"),
// });

// type CreateRoleFormData = z.infer<typeof createRoleSchema>;

// export default function CreateRolePage() {
//   const router = useRouter();
//   const [selectedPermissions, setSelectedPermissions] = useState<
//     Record<string, boolean>
//   >({});

//   // Fetch all permissions
//   const { data: permissionsData, isPending: loadingPermissions } =
//     useGetPermissionsQuery();

//   // Create role mutation
//   const { mutateAsync: createRole, isPending: creating } =
//     useCreateRoleMutation();

//   const form = useForm<CreateRoleFormData>({
//     resolver: zodResolver(createRoleSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       permissionIds: [],
//     },
//   });

//   const permissions = permissionsData?.data || [];

//   // Get selected permission IDs from the matrix
//   const selectedPermissionIds = Object.entries(selectedPermissions)
//     .filter(([_, isSelected]) => isSelected)
//     .map(([id]) => id);

//   // Update form when permissions change
//   const handlePermissionChange = (newPermissions: Record<string, boolean>) => {
//     setSelectedPermissions(newPermissions);
//     const ids = Object.entries(newPermissions)
//       .filter(([_, isSelected]) => isSelected)
//       .map(([id]) => id);
//     form.setValue("permissionIds", ids, { shouldValidate: true });
//   };

//   const onSubmit = async (data: CreateRoleFormData) => {
//     try {
//       const payload = {
//         name: data.name,
//         description: data.description,
//         permissionIds: selectedPermissionIds,
//       };

//       await createRole(payload);

//       // Show success message
//       alert("Role created successfully!");

//       // Navigate back to roles list
//       router.push("/roles");
//     } catch (error) {
//       console.error("Failed to create role:", error);
//       alert("Failed to create role");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Create New Role</h1>
//           <p className="text-sm text-gray-500">
//             Define a new role with specific permissions
//           </p>
//         </div>
//       </div>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//           {/* Role Name */}
//           <FormField
//             control={form.control}
//             name="name"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Role Name</FormLabel>
//                 <FormControl>
//                   <Input
//                     placeholder="e.g., Admin, Manager, Support Agent"
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Description */}
//           <FormField
//             control={form.control}
//             name="description"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Description</FormLabel>
//                 <FormControl>
//                   <Textarea
//                     placeholder="Describe the purpose and responsibilities of this role..."
//                     rows={4}
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormDescription>
//                   Provide a clear description of what this role can do
//                 </FormDescription>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Permissions */}
//           <FormField
//             control={form.control}
//             name="permissionIds"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Permissions</FormLabel>
//                 <FormDescription>
//                   Select the permissions this role should have
//                   {selectedPermissionIds.length > 0 && (
//                     <span className="ml-2 text-primary font-medium">
//                       ({selectedPermissionIds.length} selected)
//                     </span>
//                   )}
//                 </FormDescription>
//                 <FormControl>
//                   {loadingPermissions ? (
//                     <div className="flex justify-center items-center py-12">
//                       <p>Loading permissions...</p>
//                     </div>
//                   ) : (
//                     <PermissionMatrix
//                       permissions={permissions}
//                       value={{}}
//                       onChange={handlePermissionChange}
//                     />
//                   )}
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Actions */}
//           <div className="flex items-center gap-4 pt-4">
//             <Button
//               type="submit"
//               disabled={creating || loadingPermissions}
//               className="min-w-[120px]"
//             >
//               {creating ? "Creating..." : "Create Role"}
//             </Button>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => router.back()}
//               disabled={creating}
//             >
//               Cancel
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// }

"use client";

import { useUserProfile } from "@/app/queryHandler/auth";
import {
  useCreateMerchantRoleMutation,
  useGetMerchantPermissionsQuery,
} from "@/app/queryHandler/merchants";
import { PermissionMatrix } from "@/components/PermissionMatrix";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Form validation schema
const createRoleSchema = z.object({
  name: z.string().min(3, "Role name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  permissionIds: z.array(z.string()).min(1, "Select at least one permission"),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

export default function CreateRolePage() {
  const { merchantId } = useUserProfile();
  const router = useRouter();
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, boolean>
  >({});

  // Fetch all permissions
  const { data: permissionsData, isLoading: loadingPermissions } =
    useGetMerchantPermissionsQuery(merchantId);

  // Create role mutation
  const { mutateAsync: createRole, isPending: creating } =
    useCreateMerchantRoleMutation(merchantId);

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
    },
  });

  const permissions = permissionsData?.data.data || [];

  // Debug log
  console.log("Permissions array:", permissions);

  // Get selected permission IDs from the matrix
  const selectedPermissionIds = Object.entries(selectedPermissions)
    .filter(([_, isSelected]) => isSelected)
    .map(([id]) => id);

  // Update form when permissions change
  const handlePermissionChange = (newPermissions: Record<string, boolean>) => {
    setSelectedPermissions(newPermissions);
    const ids = Object.entries(newPermissions)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
    form.setValue("permissionIds", ids, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateRoleFormData) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        permissionIds: selectedPermissionIds,
      };

      await createRole(payload);

      // Show success message
      toast.success("Role created successfully!");

      // Navigate back to roles list
      router.push("/merchants/roles");
    } catch (error) {
      console.error("Failed to create role:", error);
      toast.success("Failed to create role");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create New Role</h1>
          <p className="text-sm text-gray-500">
            Define a new role with specific permissions
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Admin, Manager, Support Agent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the purpose and responsibilities of this role..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a clear description of what this role can do
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Permissions */}
          <FormField
            control={form.control}
            name="permissionIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permissions</FormLabel>
                <FormDescription>
                  Select the permissions this role should have
                  {selectedPermissionIds.length > 0 && (
                    <span className="ml-2 text-primary font-medium">
                      ({selectedPermissionIds.length} selected)
                    </span>
                  )}
                </FormDescription>
                <FormControl>
                  {loadingPermissions ? (
                    <div className="flex justify-center items-center py-12">
                      <p>Loading permissions...</p>
                    </div>
                  ) : (
                    <PermissionMatrix
                      permissions={permissions}
                      value={selectedPermissions}
                      onChange={handlePermissionChange}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              disabled={creating || loadingPermissions}
              className="min-w-[120px]"
            >
              {creating ? "Creating..." : "Create Role"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={creating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
