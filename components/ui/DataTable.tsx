// "use client";

// import {
//   ColumnDef,
//   FilterFn,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   SortingState,
//   useReactTable,
//   VisibilityState,
// } from "@tanstack/react-table";
// import * as React from "react";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import Pagination from "../Pagination/Pagination";

// interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[];
//   data: TData[];
//   searchableKeys?: (keyof TData)[];
//   searchPlaceholder?: string;
//   exportable?: boolean;
//   extraElement?: React.ReactNode;
// }

// export function DataTable<TData extends Record<string, any>, TValue>({
//   columns,
//   data,
//   searchableKeys = [],
//   searchPlaceholder = "Search by name...",
//   // exportable = false
//   extraElement,
// }: DataTableProps<TData, TValue>) {
//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [columnVisibility, setColumnVisibility] =
//     React.useState<VisibilityState>({});
//   const [rowSelection, setRowSelection] = React.useState({});
//   const [pageSize, setPageSize] = React.useState<number>(10);
//   const [search, setSearch] = React.useState("");

//   const globalFilterFn: FilterFn<TData> = (row, columnId, filterValue) => {
//     if (!searchableKeys.includes(columnId as keyof TData)) return false;
//     const value = row.getValue(columnId);
//     return String(value ?? "")
//       .toLowerCase()
//       .includes(filterValue.toLowerCase());
//   };

//   const allColumns = [
//     {
//       id: "checkbox",
//       header: () => (
//         <input type="checkbox" className="w-3 h-3 accent-primary" readOnly />
//       ),
//       cell: () => (
//         <input type="checkbox" className="w-3 h-3 accent-primary" readOnly />
//       ),
//       enableSorting: false,
//       enableHiding: false,
//     },
//     ...columns,
//   ];

//   const table = useReactTable({
//     data,
//     columns: allColumns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     globalFilterFn,
//     onSortingChange: setSorting,
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     onGlobalFilterChange: setSearch,
//     state: {
//       sorting,
//       columnVisibility,
//       rowSelection,
//       globalFilter: search,
//     },
//   });

//   React.useEffect(() => {
//     table.setPageSize(pageSize);
//   }, [pageSize, table]);

//   const pageIndex = table.getState().pagination.pageIndex;
//   const start = pageIndex * pageSize + 1;
//   const end = Math.min(
//     start + pageSize - 1,
//     table.getFilteredRowModel().rows.length
//   );
//   const total = table.getFilteredRowModel().rows.length;

//   return (
//     <div className="w-full">
//       {/* <div className="flex items-center justify-between py-4">
//         <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline">
//                 Filter <ChevronDown className="ml-2 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               {table
//                 .getAllColumns()
//                 .filter((column) => column.getCanHide())
//                 .map((column) => (
//                   <DropdownMenuCheckboxItem
//                     key={column.id}
//                     className="capitalize"
//                     checked={column.getIsVisible()}
//                     onCheckedChange={(value) =>
//                       column.toggleVisibility(!!value)
//                     }
//                   >
//                     {column.id}
//                   </DropdownMenuCheckboxItem>
//                 ))}
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <div className="flex items-center gap-2">
//             <Input
//               placeholder={searchPlaceholder}
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-64"
//             />
//             {extraElement}
//           </div>
//         </div>
//       </div> */}

//       <div className="overflow-auto rounded-xl border border-[#F9F9F9] ">
//         <Table>
//           <TableHeader className="sticky top-0 bg-[#FCFDFD] z-10">
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow
//                 key={headerGroup.id}
//                 className="text-[#00328B] font-bold"
//               >
//                 {headerGroup.headers.map((header) => (
//                   <TableHead key={header.id}>
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>

//           <TableBody>
//             {table.getRowModel().rows.length ? (
//               table.getRowModel().rows.map((row, index) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                   // className="h-[56px] text-tableGray"
//                   className={`h-[56px] ${
//                     index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#FAFCFF]"
//                   }`}
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-x-2 py-4">
//         <div className="flex items-center justify-center gap-2">
//           <div className="text-muted-foreground text-sm">
//             Showing {start}–{end} of {total}
//           </div>
//           <div className="flex items-center gap-2">
//             <Select
//               value={String(pageSize)}
//               onValueChange={(value) => setPageSize(Number(value))}
//             >
//               <SelectTrigger className="w-[70px]">
//                 <SelectValue placeholder="10" />
//               </SelectTrigger>
//               <SelectContent>
//                 {[10, 25, 50, 100].map((size) => (
//                   <SelectItem key={size} value={String(size)}>
//                     {size} per page
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {total > pageSize && (
//           <Pagination
//             currentPage={table.getState().pagination.pageIndex + 1}
//             totalCount={table.getFilteredRowModel().rows.length}
//             pageSize={pageSize}
//             onPageChange={(page) => table.setPageIndex(page - 1)}
//           />
//         )}
//         {/* <div className="flex space-x-2">
//           <Button
//             variant="outline"
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//           >
//             <ChevronLeft size={16} />
//           </Button>
//           <Button
//             variant="outline"
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//           >
//             <ChevronRight size={16} />
//           </Button>
//         </div> */}
//       </div>
//     </div>
//   );
// }

// "use client";

// import {
//   ColumnDef,
//   FilterFn,
//   RowSelectionState,
//   SortingState,
//   VisibilityState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import * as React from "react";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import Pagination from "../Pagination/Pagination";
// import { Checkbox } from "./checkbox"; // your Radix-styled checkbox

// /** Utilities */
// const cn = (...c: Array<string | false | null | undefined>) =>
//   c.filter(Boolean).join(" ");

// /** Bridges Radix Checkbox (onCheckedChange) with TanStack (boolean togglers) */
// function SelectionCheckbox({
//   checked,
//   indeterminate,
//   onCheckedChange,
//   className,
//   ...rest
// }: {
//   checked: boolean;
//   indeterminate?: boolean;
//   onCheckedChange: (next: boolean) => void;
//   className?: string;
//   "aria-label"?: string;
// }) {
//   const value: boolean | "indeterminate" = indeterminate
//     ? "indeterminate"
//     : checked;

//   return (
//     <Checkbox
//       checked={value}
//       onCheckedChange={(v) => onCheckedChange(Boolean(v))}
//       className={cn("h-4 w-4 cursor-pointer", className)}
//       {...rest}
//     />
//   );
// }

// interface DataTableProps<TData extends Record<string, any>, TValue> {
//   columns: ColumnDef<TData, TValue>[];
//   data: TData[];

//   /** Global search (applies only to keys listed here) */
//   searchableKeys?: (keyof TData)[];
//   searchPlaceholder?: string;

//   /** Row selection (opt-in, controlled) */
//   enableRowSelection?: boolean;
//   rowSelection?: RowSelectionState;
//   onRowSelectionChange?: (updater: RowSelectionState) => void;
//   getRowId?: (row: TData, index: number) => string;

//   /** Emits fully resolved selected rows whenever selection changes */
//   onSelectedRowsChange?: (rows: TData[]) => void;

//   /** Optional slot (filters, buttons, etc.) */
//   extraElement?: React.ReactNode;
// }

// export function DataTable<TData extends Record<string, any>, TValue>({
//   columns,
//   data,
//   searchableKeys = [],
//   searchPlaceholder = "Search…",
//   enableRowSelection = true,
//   rowSelection: rowSelectionProp,
//   onRowSelectionChange,
//   getRowId,
//   onSelectedRowsChange,
//   extraElement,
// }: DataTableProps<TData, TValue>) {
//   /** Table state */
//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [columnVisibility, setColumnVisibility] =
//     React.useState<VisibilityState>({});

//   /** Allow controlled OR uncontrolled selection */
//   const [internalRowSelection, setInternalRowSelection] =
//     React.useState<RowSelectionState>({});
//   const rowSelection = rowSelectionProp ?? internalRowSelection;

//   const [pageSize, setPageSize] = React.useState<number>(10);
//   const [search, setSearch] = React.useState("");

//   /** Global filter limited to declared `searchableKeys` */
//   const globalFilterFn: FilterFn<TData> = (row, columnId, filterValue) => {
//     if (!searchableKeys.includes(columnId as keyof TData)) return false;
//     const value = row.getValue(columnId);
//     return String(value ?? "")
//       .toLowerCase()
//       .includes(String(filterValue).toLowerCase());
//   };

//   /** Optional selection column (header + row) using Radix checkbox */
//   const selectableColumn: ColumnDef<TData, unknown> | null = enableRowSelection
//     ? {
//         id: "__select",
//         header: ({ table }) => {
//           const allSelected = table.getIsAllPageRowsSelected();
//           const someSelected =
//             table.getIsSomePageRowsSelected() && !allSelected;

//           return (
//             <SelectionCheckbox
//               aria-label="Select page rows"
//               checked={allSelected}
//               indeterminate={someSelected}
//               onCheckedChange={() => {
//                 // flip based on current state
//                 table.toggleAllPageRowsSelected(!allSelected);
//               }}
//               className="h-4 w-4 cursor-pointer"
//             />
//           );
//         },
//         cell: ({ row }) => (
//           <SelectionCheckbox
//             aria-label="Select row"
//             checked={row.getIsSelected()}
//             indeterminate={row.getIsSomeSelected()}
//             onCheckedChange={(next) => row.toggleSelected(next)}
//           />
//         ),
//         enableSorting: false,
//         enableHiding: false,
//         size: 36,
//       }
//     : null;

//   const allColumns = selectableColumn
//     ? [selectableColumn, ...columns]
//     : columns;

//   /** Table instance */
//   const table = useReactTable({
//     data,
//     columns: allColumns,
//     getRowId:
//       getRowId ??
//       ((row, index) => {
//         // Prefer your row.id; fallback to index if not present
//         return (row as any).id ?? String(index);
//       }),
//     enableRowSelection,

//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),

//     globalFilterFn,

//     onSortingChange: setSorting,
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: (updater) => {
//       if (onRowSelectionChange) {
//         onRowSelectionChange(updater as RowSelectionState);
//       } else {
//         setInternalRowSelection(updater as RowSelectionState);
//       }
//     },
//     onGlobalFilterChange: setSearch,

//     state: {
//       sorting,
//       columnVisibility,
//       rowSelection,
//       globalFilter: search,
//     },
//   });

//   /** Emit fully-resolved selected rows upward for bulk actions */
//   React.useEffect(() => {
//     if (!onSelectedRowsChange) return;
//     const rows = table
//       .getSelectedRowModel()
//       .flatRows.map((r) => r.original as TData);
//     onSelectedRowsChange(rows);
//   }, [rowSelection, table, onSelectedRowsChange]);

//   /** Keep page size in sync */
//   React.useEffect(() => {
//     table.setPageSize(pageSize);
//   }, [pageSize, table]);

//   /** Footer paging info */
//   const pageIndex = table.getState().pagination.pageIndex;
//   const start = pageIndex * pageSize + 1;
//   const end = Math.min(
//     start + pageSize - 1,
//     table.getFilteredRowModel().rows.length
//   );
//   const total = table.getFilteredRowModel().rows.length;

//   return (
//     <div className="w-full">
//       {/* Optional top tools area (kept minimal) */}
//       {/* <div className="flex items-center justify-between py-4">
//         <div className="flex items-center gap-2">
//           <Input
//             placeholder={searchPlaceholder}
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-64"
//           />
//           {extraElement}
//         </div>
//       </div> */}

//       <div className="overflow-auto rounded-xl border border-[#F9F9F9]">
//         <Table>
//           <TableHeader className="sticky top-0 bg-[#FCFDFD] z-10">
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow
//                 key={headerGroup.id}
//                 className="text-[#00328B] font-bold"
//               >
//                 {headerGroup.headers.map((header) => (
//                   <TableHead
//                     key={header.id}
//                     style={{ width: header.getSize() }}
//                   >
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>

//           <TableBody>
//             {table.getRowModel().rows.length ? (
//               table.getRowModel().rows.map((row, index) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                   className={cn(
//                     "h-[56px]",
//                     index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#FAFCFF]"
//                   )}
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={allColumns.length}
//                   className="h-24 text-center"
//                 >
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Footer: paging controls */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-x-2 py-4">
//         <div className="flex items-center justify-center gap-2">
//           <div className="text-muted-foreground text-sm">
//             Showing {start}–{end} of {total}
//           </div>
//           <div className="flex items-center gap-2">
//             <Select
//               value={String(pageSize)}
//               onValueChange={(value) => setPageSize(Number(value))}
//             >
//               <SelectTrigger className="w-[110px]">
//                 <SelectValue placeholder="10 per page" />
//               </SelectTrigger>
//               <SelectContent>
//                 {[10, 25, 50, 100].map((size) => (
//                   <SelectItem key={size} value={String(size)}>
//                     {size} per page
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {total > pageSize && (
//           <Pagination
//             currentPage={table.getState().pagination.pageIndex + 1}
//             totalCount={table.getFilteredRowModel().rows.length}
//             pageSize={pageSize}
//             onPageChange={(page) => table.setPageIndex(page - 1)}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import {
  ColumnDef,
  FilterFn,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "../Pagination/Pagination";
import { Checkbox } from "./checkbox";

/** Utility */
const cn = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

/** Bridges Radix Checkbox (onCheckedChange) with TanStack (boolean togglers) */
function SelectionCheckbox({
  checked,
  indeterminate,
  onCheckedChange,
  className,
  ...rest
}: {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: (next: boolean) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const value: boolean | "indeterminate" = indeterminate
    ? "indeterminate"
    : checked;

  return (
    <Checkbox
      checked={value}
      onCheckedChange={(v) => onCheckedChange(Boolean(v))}
      className={cn("h-4 w-4 cursor-pointer", className)}
      {...rest}
    />
  );
}

/* -----------------------------------------------------------------------
   DataTable Component with Server Pagination
------------------------------------------------------------------------ */
interface DataTableProps<TData extends Record<string, any>, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  /** Total count (from API pagination) */
  totalCount?: number;

  /** Current pagination (controlled by parent) */
  page?: number;
  limit?: number;

  /** When page or limit changes (trigger API refetch) */
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;

  /** Global search (optional) */
  searchableKeys?: (keyof TData)[];
  searchPlaceholder?: string;

  /** Row selection (opt-in) */
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (updater: RowSelectionState) => void;
  onSelectedRowsChange?: (rows: TData[]) => void;
}

export function DataTable<TData extends Record<string, any>, TValue>({
  columns,
  data,
  totalCount = data?.length,
  page = 1,
  limit = 10,
  onPageChange,
  onLimitChange,
  searchableKeys = [],
  searchPlaceholder = "Search…",
  enableRowSelection = false,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  onSelectedRowsChange,
}: DataTableProps<TData, TValue>) {
  /** Table state */
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [search, setSearch] = React.useState("");

  /** Allow controlled OR uncontrolled selection */
  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>({});
  const rowSelection = rowSelectionProp ?? internalRowSelection;

  /** Global filter limited to declared `searchableKeys` */
  const globalFilterFn: FilterFn<TData> = (row, columnId, filterValue) => {
    if (!searchableKeys.includes(columnId as keyof TData)) return false;
    const value = row.getValue(columnId);
    return String(value ?? "")
      .toLowerCase()
      .includes(String(filterValue).toLowerCase());
  };

  /** Optional selection column */
  const selectableColumn: ColumnDef<TData, unknown> | null = enableRowSelection
    ? {
        id: "__select",
        header: ({ table }) => {
          const allSelected = table.getIsAllPageRowsSelected();
          const someSelected =
            table.getIsSomePageRowsSelected() && !allSelected;

          return (
            <SelectionCheckbox
              aria-label="Select page rows"
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={() => {
                table.toggleAllPageRowsSelected(!allSelected);
              }}
              className="h-4 w-4 cursor-pointer"
            />
          );
        },
        cell: ({ row }) => (
          <SelectionCheckbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onCheckedChange={(next) => row.toggleSelected(next)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 36,
      }
    : null;

  const allColumns = selectableColumn
    ? [selectableColumn, ...columns]
    : columns;

  /** Table instance */
  const table = useReactTable({
    data,
    columns: allColumns,
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, // 🚀 enable server pagination
    pageCount: Math.ceil(totalCount / limit),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter: search,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setSearch,
    onRowSelectionChange: (updater) => {
      if (onRowSelectionChange) {
        onRowSelectionChange(updater as RowSelectionState);
      } else {
        setInternalRowSelection(updater as RowSelectionState);
      }
    },
  });

  /** Emit fully-resolved selected rows upward */
  React.useEffect(() => {
    if (!onSelectedRowsChange) return;
    const rows = table
      .getSelectedRowModel()
      .flatRows.map((r) => r.original as TData);
    onSelectedRowsChange(rows);
  }, [rowSelection, table, onSelectedRowsChange]);

  /** Footer paging info */
  const start = (page - 1) * limit + 1;
  const end = Math.min(start + limit - 1, totalCount);

  return (
    <div className="w-full">
      <div className="overflow-auto rounded-xl border border-[#F9F9F9]">
        <Table>
          <TableHeader className="sticky top-0 bg-[#FCFDFD] z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="text-[#00328B] font-bold"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table?.getRowModel()?.rows?.length ? (
              table?.getRowModel()?.rows?.map((row, idx) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "h-[56px]",
                    idx % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#FAFCFF]"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: paging controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Showing {start}–{end} of {totalCount}
          <Select
            value={String(limit)}
            onValueChange={(v) => onLimitChange?.(Number(v))}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="10 per page" />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {totalCount > limit && (
          <Pagination
            currentPage={page}
            totalCount={totalCount}
            pageSize={limit}
            onPageChange={(p) => onPageChange?.(p)}
          />
        )}
      </div>
    </div>
  );
}
