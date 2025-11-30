// import { Role } from "@/app/(dashboard)/(partial-layout)/audit-log/data"

// export type ReportType = "merchant" | "ussd" | "transaction" | "user" | "audit" | "plain"

// /* =========================
//    Filter Type Definitions
//    ========================= */
// export interface BaseFilters {
// 	/** "YYYY-MM-DD" */
// 	startDate?: string
// 	/** "YYYY-MM-DD" */
// 	endDate?: string
// }

// export interface MerchantFilters extends BaseFilters {
// 	status?: Array<"active" | "inactive" | "pending">
// }
// export interface USSDFilters extends BaseFilters {
// 	// Some USSD datasets also have "pending"; include it to be safe
// 	status?: Array<"active" | "inactive" | "pending">
// 	/** e.g., session/operation type if you support it */
// 	types?: string[]
// }
// export interface TransactionFilters extends BaseFilters {
// 	// Include pending since many data sets have it
// 	status?: Array<"successful" | "failed" | "pending">
// 	/** e.g., "Card" | "Transfer" | "Wallet" */
// 	types?: string[]
// }
// export interface UserFilters extends BaseFilters {
// 	status?: Array<"active" | "inactive">
// }
// export interface AuditFilters extends BaseFilters {
// 	role?: Role // single-select
// }

// export type ReportFilters =
// 	| ({ reportType: "merchant" } & MerchantFilters)
// 	| ({ reportType: "ussd" } & USSDFilters)
// 	| ({ reportType: "transaction" } & TransactionFilters)
// 	| ({ reportType: "user" } & UserFilters)
// 	| ({ reportType: "audit" } & AuditFilters)

// /* ==================================
//    Status dictionaries (for UI)
//    ================================== */
// export const STATUS_OPTIONS: Record<ReportType, { value: string; label: string }[]> = {
// 	merchant: [
// 		{ value: "active", label: "Active" },
// 		{ value: "inactive", label: "Inactive" },
// 		{ value: "pending", label: "Pending" },
// 	],
// 	ussd: [
// 		{ value: "active", label: "Active" },
// 		{ value: "inactive", label: "Inactive" },
// 		{ value: "pending", label: "Pending" },
// 	],
// 	transaction: [
// 		{ value: "successful", label: "Successful" },
// 		{ value: "failed", label: "Failed" },
// 		{ value: "pending", label: "Pending" },
// 	],
// 	user: [
// 		{ value: "active", label: "Active" },
// 		{ value: "inactive", label: "Inactive" },
// 	],
// 	audit: [], // audit uses roles
// 	plain: [], // plain text
// }

// /* ======================
//    Date Helper Utilities
//    ====================== */

// /** Normalize a Date to "YYYY-MM-DD" in UTC, avoiding timezone drift. */
// export const toISODate = (d?: Date) =>
// 	d
// 		? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10)
// 		: undefined

// /** Parse "YYYY-MM-DD" (UTC midnight) or full ISO to Date; returns undefined if invalid. */
// export function parseDateStrict(d?: string): Date | undefined {
// 	if (!d) return undefined
// 	if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(`${d}T00:00:00.000Z`)
// 	const dt = new Date(d)
// 	return isNaN(dt.getTime()) ? undefined : dt
// }

// /** Inclusive end-of-day (UTC) for a given ISO date string or Date. */
// export function endOfDayInclusive(d: string | Date): Date {
// 	const base = d instanceof Date ? d : new Date(d)
// 	const e = new Date(base)
// 	e.setUTCHours(23, 59, 59, 999)
// 	return e
// }

// /** Validation: Start ≤ End (or no constraint if one/both are undefined). */
// export function isValidDateRange(startISO?: string, endISO?: string): boolean {
// 	const s = parseDateStrict(startISO)
// 	const e = parseDateStrict(endISO)
// 	if (!s || !e) return true
// 	return s.getTime() <= e.getTime()
// }

// /** Same validation for Date objects (useful inside modal components). */
// export function isValidDateRangeDates(start?: Date, end?: Date): boolean {
// 	if (!start || !end) return true
// 	return start.getTime() <= end.getTime()
// }

// /* =========================================
//    Robust Date Resolution from Row Objects
//    ========================================= */

// export type DateFormatOrder = "DMY" | "MDY" | "YMD"

// export interface FilterOptions<T> {
// 	/** Custom getter for the date value (string | number | Date | Timestamp-like | undefined) */
// 	dateAccessor?: (row: T) => unknown
// 	/** Ordered list of candidate keys (supports dot paths) to look up if no accessor provided */
// 	dateKeys?: string[]
// 	/** How to interpret slash-formatted dates like 01/09/2025 (default "DMY" for NG conventions) */
// 	dateFormat?: DateFormatOrder

// 	/** NEW: Where to read a "type" value (e.g., ["type"] or ["ussd"]) */
// 	typeKeys?: string[]
// }

// /** Default candidate field names (ordered). Extend as needed. */
// export const DATE_FIELD_CANDIDATES = [
// 	"createdAt",
// 	"timestamp",
// 	"dateCreated",
// 	"date",
// 	"lastActive",
// 	"updatedAt",
// 	"created_at",
// 	"updated_at",
// ] as const

// /** Safe nested getter supporting dot paths (e.g., "meta.stats.createdAt"). */
// function getByPath(obj: any, path: string): unknown {
// 	if (!obj) return undefined
// 	const parts = path.split(".")
// 	let cur: any = obj
// 	for (const p of parts) {
// 		if (cur == null) return undefined
// 		cur = cur[p]
// 	}
// 	return cur
// }

// function getStringByPath(obj: any, path: string): string | undefined {
// 	const v = getByPath(obj, path)
// 	if (typeof v === "string") return v
// 	if (v != null) return String(v)
// 	return undefined
// }

// /** Parse slash-formatted dates according to an explicit order (DMY/MDY/YMD). */
// function parseSlashDate(input: string, order: DateFormatOrder = "DMY"): Date | undefined {
// 	const m = input.match(/^(\d{1,4})\/(\d{1,2})\/(\d{1,4})$/)
// 	if (!m) return undefined
// 	let d: number, mth: number, y: number

// 	const a = Number(m[1])
// 	const b = Number(m[2])
// 	const c = Number(m[3])

// 	switch (order) {
// 		case "DMY":
// 			d = a
// 			mth = b
// 			y = c
// 			break
// 		case "MDY":
// 			d = b
// 			mth = a
// 			y = c
// 			break
// 		case "YMD":
// 			d = c
// 			mth = b
// 			y = a
// 			break
// 	}

// 	if (!(y >= 1000 && y <= 9999)) return undefined
// 	if (!(mth >= 1 && mth <= 12)) return undefined

// 	const daysInMonth = new Date(Date.UTC(y, mth, 0)).getUTCDate()
// 	if (!(d >= 1 && d <= daysInMonth)) return undefined

// 	const dt = new Date(Date.UTC(y, mth - 1, d))
// 	return isNaN(dt.getTime()) ? undefined : dt
// }

// /** Convert many date shapes to a Date, honouring preferred slash order (slash FIRST). */
// function coerceToDateWithOrder(input: unknown, order: DateFormatOrder = "DMY"): Date | undefined {
// 	if (input == null) return undefined

// 	if (input instanceof Date) {
// 		return isNaN(input.getTime()) ? undefined : input
// 	}

// 	if (typeof input === "number") {
// 		const ms = input < 1_000_000_000_000 ? input * 1000 : input
// 		const d = new Date(ms)
// 		return isNaN(d.getTime()) ? undefined : d
// 	}

// 	if (typeof input === "string") {
// 		// 1) Slash forms FIRST, to avoid native MDY misread
// 		if (/^\d{1,4}\/\d{1,2}\/\d{1,4}$/.test(input)) {
// 			const dSlash = parseSlashDate(input, order)
// 			if (dSlash) return dSlash
// 			return undefined // malformed slash date -> reject
// 		}

// 		// 2) ISO-like strings (safe for native Date)
// 		if (/^\d{4}-\d{2}-\d{2}/.test(input) || /\d{2}:\d{2}/.test(input)) {
// 			const dIso = new Date(input)
// 			if (!isNaN(dIso.getTime())) return dIso
// 		}

// 		// 3) Numeric strings as epoch
// 		const num = Number(input)
// 		if (!Number.isNaN(num)) {
// 			const ms = num < 1_000_000_000_000 ? num * 1000 : num
// 			const dNum = new Date(ms)
// 			return isNaN(dNum.getTime()) ? undefined : dNum
// 		}

// 		return undefined
// 	}

// 	if (typeof input === "object") {
// 		const any = input as any
// 		if (typeof any.toDate === "function") {
// 			const d = any.toDate()
// 			return d instanceof Date && !isNaN(d.getTime()) ? d : undefined
// 		}
// 		if (typeof any.seconds === "number") {
// 			const ns = typeof any.nanoseconds === "number" ? any.nanoseconds : 0
// 			const d = new Date(any.seconds * 1000 + ns / 1e6)
// 			return isNaN(d.getTime()) ? undefined : d
// 		}
// 	}

// 	return undefined
// }

// /** Resolve the row's Date using accessor or the first matching key from candidates. */
// export function resolveRowDate<T>(row: T, options?: FilterOptions<T>): Date | undefined {
// 	const order = options?.dateFormat ?? "DMY" // default for Lagos/Nigeria context
// 	if (options?.dateAccessor) {
// 		return coerceToDateWithOrder(options.dateAccessor(row), order)
// 	}
// 	const keys = options?.dateKeys?.length
// 		? options.dateKeys
// 		: (DATE_FIELD_CANDIDATES as readonly string[])
// 	for (const key of keys) {
// 		const v = getByPath(row as any, key)
// 		const d = coerceToDateWithOrder(v, order)
// 		if (d) return d
// 	}
// 	return undefined
// }

// /* ================
//    Type Resolution
//    ================ */

// function resolveRowType<T>(row: T, options?: FilterOptions<T>): string | undefined {
// 	const keys = options?.typeKeys ?? []
// 	for (const k of keys) {
// 		const v = getStringByPath(row as any, k)
// 		if (v && v.trim().length) return v
// 	}
// 	return undefined
// }

// export function matchTypes<T>(row: T, selected?: string[], options?: FilterOptions<T>): boolean {
// 	if (!selected || selected.length === 0) return true
// 	const rowType = resolveRowType(row, options)
// 	if (!rowType) return false
// 	const norm = (s: string) => s.trim().toLowerCase()
// 	const wanted = new Set(selected.map(norm))
// 	return wanted.has(norm(rowType))
// }

// /* ===========================
//    Core Match/Predict Functions
//    =========================== */

// /** Inclusive date range match using row date resolution (handles undefineds gracefully). */
// export function matchRowDateRange<T>(
// 	row: T,
// 	startISO?: string,
// 	endISO?: string,
// 	options?: FilterOptions<T>
// ): boolean {
// 	if (!startISO && !endISO) return true

// 	const d = resolveRowDate(row, options)
// 	if (!d || isNaN(d.getTime())) return false

// 	const s = parseDateStrict(startISO)
// 	const e = parseDateStrict(endISO)

// 	if (s && d < s) return false
// 	if (e && d > endOfDayInclusive(e)) return false
// 	return true
// }

// /** Multi-select status match (case-insensitive; whitespace tolerant). */
// export function matchStatuses(rowStatus?: string, selected?: string[]): boolean {
// 	if (!selected || selected.length === 0) return true
// 	if (!rowStatus) return false

// 	const norm = (s: string) => s.trim().toLowerCase()

// 	const row = norm(rowStatus)
// 	const wanted = new Set(selected.map(norm))

// 	// Optional aliasing (if you have synonyms, map them here)
// 	// const alias: Record<string, string> = { success: "successful", fail: "failed" };
// 	// const rowCanonical = alias[row] ?? row;

// 	return wanted.has(row /* or rowCanonical */)
// }

// /** Single-select role match. */
// export function matchRole(rowRole?: Role | string, selected?: Role): boolean {
// 	if (!selected) return true
// 	return rowRole === selected
// }

// /* ==========================================
//    Per-report Filters (generic row contracts)
//    ========================================== */

// export type WithStatus = { status?: string }
// export type WithRole = { role?: Role | string }

// export function filterMerchants<T extends WithStatus>(
// 	rows: T[],
// 	f: MerchantFilters,
// 	options?: FilterOptions<T>
// ): T[] {
// 	return rows.filter(
// 		(r) =>
// 			matchRowDateRange(r, f.startDate, f.endDate, options) && matchStatuses(r.status, f.status)
// 	)
// }

// export function filterUSSD<T extends WithStatus>(
// 	rows: T[],
// 	f: USSDFilters,
// 	options?: FilterOptions<T>
// ): T[] {
// 	return rows.filter(
// 		(r) =>
// 			matchRowDateRange(r, f.startDate, f.endDate, options) &&
// 			matchStatuses(r.status, f.status) &&
// 			matchTypes(r, f.types, options)
// 	)
// }

// export function filterTransactions<T extends WithStatus>(
// 	rows: T[],
// 	f: TransactionFilters,
// 	options?: FilterOptions<T>
// ): T[] {
// 	return rows.filter(
// 		(r) =>
// 			matchRowDateRange(r, f.startDate, f.endDate, options) &&
// 			matchStatuses(r.status, f.status) &&
// 			matchTypes(r, f.types, options)
// 	)
// }

// export function filterUsers<T extends WithStatus>(
// 	rows: T[],
// 	f: UserFilters,
// 	options?: FilterOptions<T>
// ): T[] {
// 	return rows.filter(
// 		(r) =>
// 			matchRowDateRange(r, f.startDate, f.endDate, options) && matchStatuses(r.status, f.status)
// 	)
// }

// export function filterAudit<T extends WithRole>(
// 	rows: T[],
// 	f: AuditFilters,
// 	options?: FilterOptions<T>
// ): T[] {
// 	return rows.filter(
// 		(r) => matchRowDateRange(r, f.startDate, f.endDate, options) && matchRole(r.role, f.role)
// 	)
// }

// /* ==============================
//    Single Dispatcher (all reports)
//    ============================== */

// /** Apply filters for any report type against an already-fetched dataset. */
// export function applyReportFilters<T>(
// 	rows: T[],
// 	filters: ReportFilters,
// 	options?: FilterOptions<T>
// ): T[] {
// 	switch (filters.reportType) {
// 		case "merchant":
// 			return filterMerchants(rows as any[], filters, options as any)
// 		case "ussd":
// 			return filterUSSD(rows as any[], filters, options as any)
// 		case "transaction":
// 			return filterTransactions(rows as any[], filters, options as any)
// 		case "user":
// 			return filterUsers(rows as any[], filters, options as any)
// 		case "audit":
// 			return filterAudit(rows as any[], filters, options as any)
// 		default:
// 			return rows
// 	}
// }

// /* ==================================================
//    Optional: Predicate builder (for direct .filter())
//    ================================================== */
// export function buildFilterPredicate<T>(filters: ReportFilters, options?: FilterOptions<T>) {
// 	return (row: any) => {
// 		switch (filters.reportType) {
// 			case "merchant":
// 				return (
// 					matchRowDateRange(row, filters.startDate, filters.endDate, options) &&
// 					matchStatuses(row?.status, filters.status)
// 				)
// 			case "ussd":
// 				return (
// 					matchRowDateRange(row, filters.startDate, filters.endDate, options) &&
// 					matchStatuses(row?.status, filters.status) &&
// 					matchTypes(row, (filters as any).types, options)
// 				)
// 			case "transaction":
// 				return (
// 					matchRowDateRange(row, filters.startDate, filters.endDate, options) &&
// 					matchStatuses(row?.status, filters.status) &&
// 					matchTypes(row, (filters as any).types, options)
// 				)
// 			case "user":
// 				return (
// 					matchRowDateRange(row, filters.startDate, filters.endDate, options) &&
// 					matchStatuses(row?.status, filters.status)
// 				)
// 			case "audit":
// 				return (
// 					matchRowDateRange(row, filters.startDate, filters.endDate, options) &&
// 					matchRole(row?.role, (filters as any).role)
// 				)
// 			default:
// 				return true
// 		}
// 	}
// }

import { Role } from "@/app/(dashboard)/(partial-layout)/audit-log/data";

export type ReportType =
  | "merchant"
  | "ussd"
  | "shortcode"
  | "transaction"
  | "user"
  | "audit"
  | "plain";

/* =========================
   Filter Type Definitions
   ========================= */
export interface BaseFilters {
  /** "YYYY-MM-DD" */
  rangeFrom?: string;
  /** "YYYY-MM-DD" */
  rangeTo?: string;
  /** Sorting field */
  sortBy?: string;
  /** Sorting direction */
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface MerchantFilters extends BaseFilters {
  status?: Array<"active" | "inactive" | "pending">;
  merchantId?: string;
}

export interface USSDFilters extends BaseFilters {
  status?: "active" | "inactive" | "pending" | "approved" | "declined";
  merchantId?: string;
  type?: "shared" | "dedicated";
}

export interface ShortCodeFilters extends BaseFilters {
  status?: "active" | "pending" | "declined";
  merchantId?: string;
  type?: "shared" | "dedicated";
}

export interface TransactionFilters extends BaseFilters {
  status?: "successful" | "failed" | "pending";
  transactionType?: string[];
  merchantId?: string;
  userId?: string;
}

export interface UserFilters extends BaseFilters {
  status?: "active" | "inactive" | "pending";
  userId?: string;
}

export interface AuditFilters extends BaseFilters {
  role?: Role;
  userId?: string;
  action?: string;
}

export type ReportFilters =
  | ({ reportType: "merchant" } & MerchantFilters)
  | ({ reportType: "ussd" } & USSDFilters)
  | ({ reportType: "shortcode" } & ShortCodeFilters)
  | ({ reportType: "transaction" } & TransactionFilters)
  | ({ reportType: "user" } & UserFilters)
  | ({ reportType: "audit" } & AuditFilters)
  | ({ reportType: "plain" } & BaseFilters);

/* ==================================
   Status dictionaries (for UI)
   ================================== */
export const STATUS_OPTIONS: Record<
  ReportType,
  { value: string; label: string }[]
> = {
  merchant: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
  ],
  ussd: [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "declined", label: "Declined" },
    { value: "active", label: "Active" },
  ],
  transaction: [
    { value: "successful", label: "Successful" },
    { value: "failed", label: "Failed" },
    { value: "pending", label: "Pending" },
  ],
  user: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
  shortcode: [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "declined", label: "Declined" },
  ],
  audit: [],
  plain: [],
};

/* ======================
   Date Helper Utilities
   ====================== */
export const toISODate = (d?: Date) =>
  d
    ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
        .toISOString()
        .slice(0, 10)
    : undefined;

export function parseDateStrict(d?: string): Date | undefined {
  if (!d) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(`${d}T00:00:00.000Z`);
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? undefined : dt;
}

export function endOfDayInclusive(d: string | Date): Date {
  const base = d instanceof Date ? d : new Date(d);
  const e = new Date(base);
  e.setUTCHours(23, 59, 59, 999);
  return e;
}

export function isValidDateRange(startISO?: string, endISO?: string): boolean {
  const s = parseDateStrict(startISO);
  const e = parseDateStrict(endISO);
  if (!s || !e) return true;
  return s.getTime() <= e.getTime();
}

export function isValidDateRangeDates(start?: Date, end?: Date): boolean {
  if (!start || !end) return true;
  return start.getTime() <= end.getTime();
}

/* ===========================
   Match / Filter Utilities
   =========================== */
export type WithStatus = { status?: string };
export type WithRole = { role?: Role | string };

export function matchStatuses(
  rowStatus?: string,
  selected?: string[]
): boolean {
  if (!selected || selected.length === 0) return true;
  if (!rowStatus) return false;

  const norm = (s: string) => s.trim().toLowerCase();
  const row = norm(rowStatus);
  const wanted = new Set(selected.map(norm));

  return wanted.has(row);
}

export function matchRole(rowRole?: Role | string, selected?: Role): boolean {
  if (!selected) return true;
  return rowRole === selected;
}

export function matchRowDateRange<T>(
  row: T,
  startISO?: string,
  endISO?: string,
  key: keyof T = "createdAt" as keyof T
): boolean {
  if (!startISO && !endISO) return true;
  const raw = row[key];
  if (!raw) return false;

  const d = parseDateStrict(String(raw));
  if (!d) return false;

  const s = parseDateStrict(startISO);
  const e = parseDateStrict(endISO);

  if (s && d < s) return false;
  if (e && d > endOfDayInclusive(e)) return false;
  return true;
}

/* ===========================
   Filtering by Report Type
   =========================== */
export function filterMerchants<T extends WithStatus>(
  rows: T[],
  f: MerchantFilters
): T[] {
  return rows?.filter(
    (r) =>
      matchRowDateRange(r, f.rangeFrom, f.rangeTo) &&
      matchStatuses(r.status, f.status)
  );
}

export function filterUSSD<T extends WithStatus>(
  rows: T[],
  f: USSDFilters
): T[] {
  return rows.filter(
    (r) =>
      matchRowDateRange(r, f.rangeFrom, f.rangeTo) &&
      // matchStatuses(r.status, f.status)
      (!f.status ||
        (r.status != null &&
          r.status.trim().toLowerCase() === f.status.trim().toLowerCase()))
  );
}

export function filterTransactions<T extends WithStatus>(
  rows: T[],
  f: TransactionFilters
): T[] {
  return rows.filter(
    (r) =>
      matchRowDateRange(r, f.rangeFrom, f.rangeTo) &&
      // matchStatuses(r.status, f.status)
      (!f.status ||
        (r.status != null &&
          r.status.trim().toLowerCase() === f.status.trim().toLowerCase()))
  );
}

export function filterUsers<T extends WithStatus>(
  rows: T[],
  f: UserFilters
): T[] {
  return rows.filter(
    (r) =>
      matchRowDateRange(r, f.rangeFrom, f.rangeTo) &&
      // single-select status (string) comparison, case-insensitive and whitespace-tolerant
      (!f.status ||
        (r.status != null &&
          r.status.trim().toLowerCase() === f.status.trim().toLowerCase()))
  );
}

export function filterAudit<T extends WithRole>(
  rows: T[],
  f: AuditFilters
): T[] {
  return rows.filter(
    (r) =>
      matchRowDateRange(r, f.rangeFrom, f.rangeTo) && matchRole(r.role, f.role)
  );
}

/* ===========================
   Dispatcher
   =========================== */
export function applyReportFilters<T>(rows: T[], filters: ReportFilters): T[] {
  switch (filters.reportType) {
    case "merchant":
      return filterMerchants(rows as any[], filters);
    case "ussd":
      return filterUSSD(rows as any[], filters);
    case "transaction":
      return filterTransactions(rows as any[], filters);
    case "user":
      return filterUsers(rows as any[], filters);
    case "audit":
      return filterAudit(rows as any[], filters);
    default:
      return rows;
  }
}
