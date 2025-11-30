// "use client";

// import { useUserProfile } from "@/app/queryHandler/auth";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// export function ProfileForm() {
//   const { firstName, lastName, email, mobile } = useUserProfile();
//   console.log(firstName, lastName, email, mobile);
//   return (
//     <div className="space-y-8">
//       <h2 className="text-lg font-semibold mb-8">Settings</h2>

//       <div className="flex items-center justify-between">
//         <div className="bg-[#D5C6DC] h-20 w-20 rounded-full"></div>
//         <Button className="bg-[#D5C6DC] text-primary font-semibold">
//           Change Photo
//         </Button>
//       </div>
//       <form className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-1">
//             <label className="block text-sm font-medium">First Name</label>
//             <Input value={firstName} />
//           </div>
//           <div className="space-y-1">
//             <label className="block text-sm font-medium">Last Name</label>
//             <Input value={lastName} />
//           </div>
//         </div>
//         <div className="space-y-1">
//           <label className="block text-sm font-medium">Role</label>
//           <Input disabled value="Super Admin" />
//         </div>
//         <div className="space-y-1">
//           <label className="block text-sm font-medium">Phone Number</label>
//           <Input value={mobile} />
//         </div>
//         <div className="space-y-1">
//           <label className="block text-sm font-medium">Email Address</label>
//           <Input value={email} />
//         </div>
//         <div className="flex justify-end gap-2 mt-4">
//           <Button className="bg-[#D5C6DC] text-primary font-semibold">
//             Cancel
//           </Button>
//           <Button>Save Changes</Button>
//         </div>
//       </form>
//     </div>
//   );
// }

"use client";

import {
  useUserProfile /*, useUpdateProfileMutation */,
} from "@/app/queryHandler/auth";
import { useUpdateMerchantUserMutation } from "@/app/queryHandler/merchants";
import { useUpdateUserMutation } from "@/app/queryHandler/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ✅ Define validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  mobile: z.string().min(3, "Phone number is too short"),
  roleName: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const {
    isLoading,
    firstName,
    lastName,
    email,
    mobile,
    roleName,
    id,
    isMerchant,
  } = useUserProfile();
  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateUserMutation();
  const { mutateAsync: updateMerchantProfile, isPending: isSavingMerchant } =
    useUpdateMerchantUserMutation(id);

  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ✅ Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      roleName,
    },
  });

  // ✅ Populate defaults once profile data loads
  useEffect(() => {
    if (!isLoading) {
      reset({
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        email: email ?? "",
        mobile: mobile ?? "",
        roleName,
      });
    }
  }, [isLoading, firstName, lastName, email, mobile, roleName, reset]);

  // ✅ File selection & preview
  // const onFilePick = () => fileRef.current?.click();

  // const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   const url = URL.createObjectURL(file);
  //   setPhotoFile(file);
  //   setPhotoPreviewUrl(url);
  // };

  // ✅ Cancel — reset to initial
  const onCancel = () => {
    reset();
    // setPhotoFile(null);
    // setPhotoPreviewUrl(null);
  };

  const onSubmit = async (values: ProfileFormData) => {
    try {
      const payload = new FormData();
      payload.append("firstName", values.firstName);
      payload.append("lastName", values.lastName);
      // payload.append("email", values.email);
      payload.append("mobile", values.mobile);
      // if (photoFile) payload.append("avatar", photoFile);

      if (!isMerchant) {
        await updateProfile({ id, data: payload });
      } else {
        await updateMerchantProfile(payload);
      }
      console.log("Profile saved:", Object.fromEntries(payload.entries()));

      reset(values);
      // setPhotoFile(null);
      // if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      // toast.success("Profile updated");
    } catch (error) {
      console.error("Update failed:", error);
      // toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-lg font-semibold mb-8">Settings</h2>

        <div className="flex items-center justify-between">
          <Skeleton className="h-20 w-20 rounded-full bg-gray-300/60" />
          <Skeleton className="h-10 w-36 bg-gray-300/60" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32 bg-gray-300/60" />
              <Skeleton className="h-10 w-full bg-gray-300/60" />
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-4">
            <Skeleton className="h-10 w-24 bg-gray-300/60" />
            <Skeleton className="h-10 w-32 bg-gray-300/60" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold mb-8">Settings</h2>

      <div className="flex items-center justify-between">
        <div className="relative">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-[#D5C6DC] ring-2 ring-offset-2 ring-transparent">
            {photoPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreviewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full" />
            )}
          </div>
        </div>
        {/* <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          <Button
            type="button"
            className="bg-[#D5C6DC] text-primary font-semibold"
            onClick={onFilePick}
          >
            Change Photo
          </Button>
        </div> */}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium">First Name</label>
            <Input {...register("firstName")} placeholder="Enter first name" />
            {errors.firstName && (
              <p className="text-red-600 text-xs">{errors.firstName.message}</p>
            )}
            <Input {...register("firstName")} placeholder="Enter first name" />
            {errors.firstName && (
              <p className="text-red-600 text-xs">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Last Name</label>
            <Input {...register("lastName")} placeholder="Enter last name" />
            {errors.lastName && (
              <p className="text-red-600 text-xs">{errors.lastName.message}</p>
            )}
            <Input {...register("lastName")} placeholder="Enter last name" />
            {errors.lastName && (
              <p className="text-red-600 text-xs">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Role</label>
          <Input disabled {...register("roleName")} />
          <Input disabled {...register("roleName")} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Phone Number</label>
          <Input {...register("mobile")} placeholder="Enter phone number" />
          {errors.mobile && (
            <p className="text-red-600 text-xs">{errors.mobile.message}</p>
          )}
          <Input {...register("mobile")} placeholder="Enter phone number" />
          {errors.mobile && (
            <p className="text-red-600 text-xs">{errors.mobile.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Email Address</label>
          <Input
            type="email"
            {...register("email")}
            placeholder="Enter email"
          />
          {errors.email && (
            <p className="text-red-600 text-xs">{errors.email.message}</p>
          )}
          <Input
            type="email"
            {...register("email")}
            placeholder="Enter email"
          />
          {errors.email && (
            <p className="text-red-600 text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            className="bg-[#D5C6DC] text-primary font-semibold"
            onClick={onCancel}
            disabled={!isDirty}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            // disabled={!isDirty || !isValid /* || isSaving */}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
