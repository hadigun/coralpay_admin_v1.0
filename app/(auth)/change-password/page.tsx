"use client";

import { useLoginMutation } from "@/app/queryHandler/auth";
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
import { ChangePasswordFormData } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ChangePasswordFormSchema } from "./validations";

const LoginPage = () => {
  const router = useRouter();
  const { mutate: loginMutation, data } = useLoginMutation();
  const dispatch = useAppDispatch();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordFormSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    console.log(data);
    router.push("/change-password");
  };
  return (
    <div className="flex flex-col items-center w-full">
      <Image
        src="/images/auth-avatar.png"
        alt="logo"
        width={100}
        height={100}
      />
      <h1 className="text-2xl font-bold mt-4">Welcome</h1>
      <p className="text-sm text-gray-500">
        Login to easily mangage your USSD Platform
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 mt-4 w-full"
        >
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    label="New Password"
                    placeholder="Enter your Password"
                    className="border-b w-full border-text-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    label="Confirm Password"
                    placeholder="Enter your Password"
                    className="border-b w-full border-text-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full rounded-xl h-12 text-white" type="submit">
            Login
          </Button>
          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-base text-primary justify-end
              "
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LoginPage;
