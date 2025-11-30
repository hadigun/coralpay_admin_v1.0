import * as z from "zod";

export const LoginFormSchema = z.object({
  email: z.string().trim().min(1, { message: "Email is required" }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});
