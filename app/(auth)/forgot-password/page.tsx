// "use client";

// import { usePasswordResetRequestMutation } from "@/app/queryHandler/auth";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { useAppDispatch } from "@/store/hooks";
// import { setUser } from "@/store/slice/userService/userService";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { ReloadIcon } from "@radix-ui/react-icons";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { ForgotPasswordFormData } from "../../../types/index";
// import { ForgotPasswordFormSchema } from "./validations";

// const ForgotPasswordPage = () => {
//   const router = useRouter();
//   const {
//     mutate: passwordResetRequestMutation,
//     data,
//     isPending: isRequestPending,
//   } = usePasswordResetRequestMutation();
//   const dispatch = useAppDispatch();

//   const form = useForm<ForgotPasswordFormData>({
//     resolver: zodResolver(ForgotPasswordFormSchema),
//     defaultValues: {
//       email: "",
//     },
//   });

//   const onSubmit = async (data: ForgotPasswordFormData) => {
//     console.log(data);
//     passwordResetRequestMutation(data);
//     router.push("/dashboard");
//     dispatch(
//       setUser({
//         email: form.getValues("email"),
//       })
//     );
//   };
//   return (
//     <div className="flex flex-col items-center w-full">
//       <Image
//         src="/images/auth-avatar.png"
//         alt="logo"
//         width={100}
//         height={100}
//       />
//       <h1 className="text-2xl font-bold mt-4">Forgot Password?</h1>
//       <p className="text-sm text-gray-500">
//         Please enter your email to get a password reset link.
//       </p>
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="space-y-4 mt-4 w-full"
//         >
//           <FormField
//             control={form.control}
//             name="email"
//             render={({ field }) => (
//               <FormItem>
//                 <FormControl>
//                   <Input
//                     type="email"
//                     label="Email"
//                     placeholder="Enter Email Address"
//                     {...field}
//                     className="border-b w-full border-text-primary"
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <Button
//             disabled={isRequestPending}
//             className="w-full rounded-xl h-12 text-white"
//             type="submit"
//           >
//             {isRequestPending && (
//               <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
//             )}
//             Request Reset Password
//           </Button>
//         </form>
//       </Form>
//     </div>
//   );
// };

// export default ForgotPasswordPage;

"use client";

import {
  usePasswordResetRequestMutation,
  useResetPasswordMutation,
  useVerifyResetTokenMutation,
} from "@/app/queryHandler/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store/hooks";
import {
  EmailFormData,
  EmailSchema,
  ResetFormData,
  ResetSchema,
  VerifyFormData,
  VerifySchema,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReloadIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const ResetPasswordFlow = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<number>(1);
  const [sessionKey, setSessionKey] = useState<string>("");
  const [passwordResetKey, setPasswordResetKey] = useState<string>("");

  const { mutate: requestReset, isPending: requesting } =
    usePasswordResetRequestMutation();

  const { mutate: verifyCode, isPending: verifying } =
    useVerifyResetTokenMutation();

  const { mutate: resetPassword, isPending: resetting } =
    useResetPasswordMutation();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: "" },
  });

  const handleEmailSubmit = (data: EmailFormData) => {
    requestReset(data, {
      onSuccess: (res: any) => {
        setSessionKey(res?.data?.data.sessionKey || "");
        // dispatch(setUser({ email: data.email }));
        setStep(2);
      },
    });
  };

  const verifyForm = useForm<VerifyFormData>({
    resolver: zodResolver(VerifySchema),
    defaultValues: { code: "", sessionKey: sessionKey },
  });

  const handleVerifySubmit = (data: VerifyFormData) => {
    verifyCode(
      { code: data.code, sessionKey },
      {
        onSuccess: (res: any) => {
          setPasswordResetKey(res?.data?.passwordResetKey || "");
          setStep(3);
        },
      }
    );
  };

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleResetSubmit = (data: ResetFormData) => {
    resetPassword(
      { password: data.password, passwordResetKey },
      {
        onSuccess: () => {
          router.push("/login");
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <Image
        src="/images/auth-avatar.png"
        alt="logo"
        width={100}
        height={100}
      />
      <h1 className="text-2xl font-bold mt-4">
        {step === 1 && "Forgot Password?"}
        {step === 2 && "Verify Code"}
        {step === 3 && "Reset Password"}
      </h1>

      {/* Step Descriptions */}
      <p className="text-sm text-gray-500 text-center mt-1">
        {step === 1 &&
          "Please enter your email to get a password reset link or code."}
        {step === 2 &&
          "Enter the verification code and session key sent to your email."}
        {step === 3 && "Set your new password below."}
      </p>

      {/* Step 1: Request Email */}
      {step === 1 && (
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
            className="space-y-4 mt-4 w-full"
          >
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      className="border-b w-full border-text-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={requesting}
              className="w-full rounded-xl h-12 text-white"
              type="submit"
            >
              {requesting && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Request Reset
            </Button>
          </form>
        </Form>
      )}

      {/* Step 2: Verify Token */}
      {step === 2 && (
        <Form {...verifyForm}>
          <form
            onSubmit={verifyForm.handleSubmit(handleVerifySubmit)}
            className="space-y-4 mt-4 w-full"
          >
            <FormField
              control={verifyForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter verification code"
                      {...field}
                      className="border-b w-full border-text-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={verifying}
              className="w-full rounded-xl h-12 text-white"
              type="submit"
            >
              {verifying && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify Code
            </Button>
          </form>
        </Form>
      )}

      {/* Step 3: Reset Password */}
      {step === 3 && (
        <Form {...resetForm}>
          <form
            onSubmit={resetForm.handleSubmit(handleResetSubmit)}
            className="space-y-4 mt-4 w-full"
          >
            <FormField
              control={resetForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      {...field}
                      className="border-b w-full border-text-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={resetForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      {...field}
                      className="border-b w-full border-text-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={resetting}
              className="w-full rounded-xl h-12 text-white"
              type="submit"
            >
              {resetting && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset Password
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default ResetPasswordFlow;
