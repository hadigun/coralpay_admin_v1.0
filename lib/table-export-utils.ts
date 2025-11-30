// // lib/table-export-utils.ts
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// export function downloadCSV(data: any[], filename = "transactions.csv") {
//   const csv = [
//     Object.keys(data[0]).join(","),
//     ...data.map((row) => Object.values(row).join(",")),
//   ].join("\n");

//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.setAttribute("download", filename);
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }

// export function downloadPDF(data: any[], filename = "transactions.pdf") {
//   const doc = new jsPDF();
//   const headers = [Object.keys(data[0])];
//   const rows = data.map((row) => Object.values(row));
//   autoTable(doc, { head: headers, body: rows });
//   doc.save(filename);
// }

// const handleExportPDF = () => {
//   const doc = new jsPDF();
//   doc.text("USSD Transactions", 14, 16);
//   doc.autoTable({
//     startY: 20,
//     head: [["Transaction ID", "Name", "Type", "Status", "Date"]],
//     body: filteredData.map((tx) => [
//       tx.transactionId,
//       tx.name,
//       tx.type,
//       tx.status,
//       tx.date,
//     ]),
//   });
//   doc.save("ussd-transactions.pdf");
// };

// const handleExportCSV = () => {
//   const csv = Papa.unparse(filteredData);
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.setAttribute("href", url);
//   link.setAttribute("download", "ussd-transactions.csv");
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

/**
 * Downloads a CSV file from a dataset.
 * @param data - The array of objects to export
 * @param filename - The output filename
 */
export function downloadCSV<T extends Record<string, any>>(
  data: T[],
  filename = "transactions.csv"
) {
  if (data.length === 0) return;

  const header = Object.keys(data[0]).join(",");
  const rows = data.map((row) => Object.values(row).join(","));
  const csv = [header, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a PDF file from a dataset using jsPDF & autoTable.
 * @param data - The array of objects to export
 * @param filename - The output filename
 */
export function downloadPDF<T extends Record<string, any>>(
  data: T[],
  filename = "transactions.pdf"
) {
  if (data.length === 0) return;

  const doc = new jsPDF();

  const headers: string[] = Object.keys(data[0]);
  const rows: RowInput[] = data.map((row) =>
    headers.map((key) => String(row[key] ?? ""))
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 20,
    styles: {
      fontSize: 10,
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
    },
  });

  doc.save(filename);
}
