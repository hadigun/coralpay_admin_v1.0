"use client";

import { useUserProfile } from "@/app/queryHandler/auth";
import {
  useDeleteMerchantRoleMutation,
  useUpdateMerchantRoleMutation,
} from "@/app/queryHandler/merchants";
import {
  useDeleteRoleMutation,
  useUpdateRoleMutation,
} from "@/app/queryHandler/roles";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/plain-input";
import { Textarea } from "./ui/textarea";

const updateRoleSchema = z.object({
  name: z.string().min(3, "Role name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

export function RoleCard({
  id,
  title,
  description,
  isMerchantRole,
}: {
  id: string;
  title?: string;
  description?: string;
  isMerchantRole?: boolean;
}) {
  const router = useRouter();
  const { merchantId } = useUserProfile();

  const { mutateAsync: deleteRole } = useDeleteRoleMutation();
  const { mutateAsync: updateRole, isPending: updating } =
    useUpdateRoleMutation();
  const { mutate: deleteMerchantRole } = useDeleteMerchantRoleMutation();
  const { mutateAsync: updateMerchantRole, isPending: updatingMerchant } =
    useUpdateMerchantRoleMutation(id);

  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: title || "",
      description: description || "",
    },
  });

  const handleDelete = () => {
    if (isMerchantRole) {
      deleteMerchantRole(id);
    }
    deleteRole(id);
  };

  const onSubmit = async (data: UpdateRoleFormData) => {
    // await updateRole({ id, data });
    // setIsOpen(false);
    if (isMerchantRole) {
      await updateMerchantRole(data);
    } else {
      await updateRole({ id, data });
    }
    setIsOpen(false);
  };

  return (
    <>
      {" "}
      <div className="border p-4 rounded-lg relative bg-white shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {description || "No description available."}
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() =>
                router.push(
                  isMerchantRole ? `/merchants/roles/${id}` : `/roles/${id}`
                )
              }
            >
              View permissions & accounts
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* <DropdownMenuItem onClick={() => router.push(`/roles/${id}`)}>
                Edit Permissions
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => setIsOpen(true)}>
                Edit Role
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500" onClick={handleDelete}>
                Delete Role
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="items-center">
            <DialogTitle className="text-center">Edit Role</DialogTitle>
            <DialogDescription className="text-center"></DialogDescription>
          </DialogHeader>
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

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={updating}
                  className="min-w-[120px]"
                >
                  {updating ? "Updating..." : "Update Role"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
