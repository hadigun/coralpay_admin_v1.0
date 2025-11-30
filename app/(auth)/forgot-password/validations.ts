import * as z from "zod";

export const ForgotPasswordFormSchema = z.object({
  email: z.string().trim().min(1, { message: "Email is required" }),
});
