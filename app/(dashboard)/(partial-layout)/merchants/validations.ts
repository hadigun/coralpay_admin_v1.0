import * as z from "zod";

export const MerchantFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Merchant name must be at least 2 characters." }),
  email: z
    .string()
    .email({ message: "Must be a valid merchant email address." }),
  mobile: z
    .string()
    .min(4, { message: "Mobile number must be at least 4 digits." }),

  // Nested Admin Info
  adminInfo: z.object({
    firstName: z.string().min(1, { message: "Admin first name is required." }),
    lastName: z.string().min(1, { message: "Admin last name is required." }),
    email: z.email({ message: "Must be a valid admin email address." }),
    mobile: z
      .string()
      .min(4, { message: "Admin mobile number must be at least 4 digits." }),
  }),

  // Nested Ad Config
  adConfig: z.object({
    serverAddress: z.url({ message: "Server address must be a valid URL." }),
  }),
});
