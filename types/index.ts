import { LoginFormSchema } from "@/app/(auth)/login/validations";
// import { ResetPasswordFormSchema } from "@/app/(auth)/reset-password/validations";
import { ChangePasswordFormSchema } from "@/app/(auth)/change-password/validations";
import { ForgotPasswordFormSchema } from "@/app/(auth)/forgot-password/validations";
import { store } from "@/store";
import * as z from "zod";

import { MerchantFormSchema } from "@/app/(dashboard)/(partial-layout)/merchants/validations";
import {
  type MenuNode,
  MenuNodeType,
} from "@mobiresoft-coral/ussd-shared-core";

export type {
  DisplayToolType,
  EventToolType,
  InputToolType,
  LogicToolType,
  Plugin,
  PluginToolType,
  RouterPlugin,
  ToolType,
} from "@mobiresoft-coral/ussd-shared-core";

const UserSchema = z.object({
  id: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.string(),
  isAuthenticated: z.boolean(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mobile: z.string(),
  status: z.string(),
  role: z.string(),
  isMerchant: z.boolean(),
  merchant: z.string(),
});

export interface AuditLogEntry {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  action: string;
  description: string;
  ipAddress: string;
}

export type ShortCodeType = "dedicated" | "shared";
export type ShortCodeStatus =
  | "pending"
  | "approved"
  | "declined"
  | "active"
  | "suspended"
  | "released";

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  rangeFrom?: string; // ISO date string
  rangeTo?: string;
  rangeField?: string;
  q?: string;
}

export interface ShortCodeFilters extends BaseQueryParams {
  type?: ShortCodeType;
  status?: ShortCodeStatus;
  // assigned?: boolean;
  merchantId?: string;
  configured?: boolean;
}

export interface CreateShortCodeInput {
  type: ShortCodeType;
  // organizationName?: string;
  authorizationDocumentUrl?: string;
  code?: string; // optional for SHARED
  // authorizationLetter?: File | Blob;
}

export interface DecisionInput {
  actionReason: string;
}

export const EmailSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const VerifySchema = z.object({
  code: z.string(),
  sessionKey: z.string(),
});

export const ResetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/\d/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetFormData = z.infer<typeof ResetSchema>;
export type EmailFormData = z.infer<typeof EmailSchema>;
export type VerifyFormData = z.infer<typeof VerifySchema>;
export type User = z.infer<typeof UserSchema>;
export type LoginFormData = z.infer<typeof LoginFormSchema>;
export type ChangePasswordFormData = z.infer<typeof ChangePasswordFormSchema>;
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordFormSchema>;
export type MerchantFormData = z.infer<typeof MerchantFormSchema>;
// export type ResetPasswordFormData = z.infer<typeof ResetPasswordFormSchema>;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { MenuNodeType as NodeType };

export type NodeData = MenuNode;

export type EdgeData = Record<string, unknown>;

export interface KeyValuePair {
  key: string;
  value: string;
  id: string;
}

export type SimulatorConfig = {
  open: boolean;
  startNodeId?: string;
};

// Smart Input types
export type {
  EnvironmentSuggestionsProps,
  SmartInputBaseProps,
  SmartInputProps,
  SmartInputRendererProps,
  SmartInputState,
  SuggestionItem,
  SuggestionTrigger,
  TextSegment,
  VariableStyle,
} from "./smart-input";
