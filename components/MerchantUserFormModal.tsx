"use client";

import {
  useCreateMerchantUserMutation,
  useGetMerchantRolesQuery,
  useUpdateMerchantUserMutation,
} from "@/app/queryHandler/merchants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const unifiedUserSchema = z.object({
  email: z.string().email("Enter a valid email address").optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobile: z.string().min(10, "Enter a valid mobile number"),
  roleId: z.string().optional(),
});

export type UnifiedUserForm = z.infer<typeof unifiedUserSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  userId?: string;
  initialData?: Partial<UnifiedUserForm>;
}

export const MerchantUserFormModal: React.FC<Props> = ({
  open,
  onClose,
  userId,
  initialData,
}) => {
  const isUpdate = Boolean(userId);

  const { data: rolesData, isLoading: isLoadingRoles } =
    useGetMerchantRolesQuery();
  const { mutateAsync: inviteUser } = useCreateMerchantUserMutation();
  const { mutateAsync: updateUser } = useUpdateMerchantUserMutation(
    userId ?? ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setValue,
    reset,
  } = useForm<UnifiedUserForm>({
    resolver: zodResolver(unifiedUserSchema),
    mode: "onChange",
    defaultValues: initialData ?? {},
  });

  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  const onSubmit = async (values: UnifiedUserForm) => {
    try {
      if (isUpdate) {
        if (!userId) throw new Error("Missing userId for update");

        const { email, roleId, ...updatePayload } = values;
        await updateUser({ id: userId, data: updatePayload });
      } else {
        if (!values.email || !values.roleId) {
          throw new Error("Email and roleId are required to invite a user");
        }

        const invitePayload = {
          email: values.email,
          roleId: values.roleId,
          firstName: values.firstName,
          lastName: values.lastName,
          mobile: values.mobile,
        };
        await inviteUser(invitePayload);
      }
      onClose();
      reset();
    } catch (error) {
      console.error("User operation failed:", error);
    }
  };

  const roles = rolesData?.data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-xl bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Update User Details" : "Invite New User"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 mt-4"
        >
          {/* Email field only in invite mode */}
          {!isUpdate && (
            <>
              <Input
                type="email"
                placeholder="Email Address"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </>
          )}

          {/* First & Last name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Input placeholder="First Name" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Input placeholder="Last Name" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <Input placeholder="Phone Number" {...register("mobile")} />
          {errors.mobile && (
            <p className="text-sm text-red-600">{errors.mobile.message}</p>
          )}

          {!isUpdate && (
            <>
              <Select
                onValueChange={(val) =>
                  setValue("roleId", val, { shouldDirty: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Assign Role" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {isLoadingRoles ? (
                    <SelectItem value="loading" disabled>
                      Loading roles...
                    </SelectItem>
                  ) : roles.length > 0 ? (
                    roles.map((role: any) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No roles found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="text-sm text-red-600">{errors.roleId.message}</p>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="bg-purple-100 text-purple-900"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-purple-800 text-white hover:bg-purple-900"
              disabled={isSubmitting || !isDirty}
            >
              {isUpdate ? "Save Changes" : "Invite User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
