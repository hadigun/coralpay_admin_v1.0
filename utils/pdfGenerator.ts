import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Transaction {
  accountNumber: string;
  amount: number;
  narration: string;
  transType: 'D' | 'C';
  entryDate: string;
  valueDate: string;
  balance: number;
  transRef: string;
  transactionCategory: string;
}

export const generateStatementPDF = (transactions: Transaction[], accountNumber: string) => {
  // Validate parameters
  if (!transactions || !Array.isArray(transactions)) {
    throw new Error('Transactions parameter must be a valid array');
  }

  if (!accountNumber || typeof accountNumber !== 'string') {
    throw new Error('Account number must be a valid string');
  }

  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNT STATEMENT', 105, 20, { align: 'center' });

  // Add company/bank info (customize as needed)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Bank Name', 105, 30, { align: 'center' });
  doc.text('123 Bank Street, City, State', 105, 37, { align: 'center' });

  // Account information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNT DETAILS', 20, 55);

  doc.setFont('helvetica', 'normal');
  doc.text(`Account Number: ${accountNumber}`, 20, 65);
  doc.text(`Statement Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 72);
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 20, 79);

  // Date range
  if (transactions.length > 0) {
    const startDate = new Date(transactions[transactions.length - 1].valueDate).toLocaleDateString(
      'en-GB'
    );
    const endDate = new Date(transactions[0].valueDate).toLocaleDateString('en-GB');
    doc.text(`Period: ${startDate} to ${endDate}`, 20, 86);
  }

  // Prepare table data
  const tableData = transactions.map((transaction) => [
    new Date(transaction.valueDate).toLocaleDateString('en-GB'),
    new Date(transaction.entryDate).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    transaction.transType === 'D' ? 'DEBIT' : 'CREDIT',
    transaction.narration,
    transaction.transType === 'D'
      ? `₦${transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      : '',
    transaction.transType === 'C'
      ? `₦${transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      : '',
    `₦${transaction.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
  ]);

  // Table headers
  const headers = [
    'VALUE DATE',
    'TRANSACTION DATE',
    'TYPE',
    'DESCRIPTION',
    'DEBIT (₦)',
    'CREDIT (₦)',
    'BALANCE (₦)'
  ];

  // Generate table
  (doc as any).autoTable({
    head: [headers],
    body: tableData,
    startY: 95,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    columnStyles: {
      0: { cellWidth: 22 }, // Value Date
      1: { cellWidth: 28 }, // Transaction Date
      2: { cellWidth: 18 }, // Type
      3: { cellWidth: 55 }, // Description
      4: { cellWidth: 22, halign: 'right' }, // Debit
      5: { cellWidth: 22, halign: 'right' }, // Credit
      6: { cellWidth: 25, halign: 'right' } // Balance
    },
    margin: { left: 10, right: 10 },
    didDrawPage: (data: any) => {
      // Add page numbers
      const pageNumber = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    }
  });

  // Summary section
  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page for summary
  if (finalY > 250) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTION SUMMARY', 20, 30);
  } else {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTION SUMMARY', 20, finalY);
  }

  const summaryY = finalY > 250 ? 45 : finalY + 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Calculate totals
  const totalTransactions = transactions.length;
  const totalDebits = transactions
    .filter((t) => t.transType === 'D')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalCredits = transactions
    .filter((t) => t.transType === 'C')
    .reduce((sum, t) => sum + t.amount, 0);

  const debitCount = transactions.filter((t) => t.transType === 'D').length;
  const creditCount = transactions.filter((t) => t.transType === 'C').length;

  // Summary data
  const summaryData = [
    ['Total Transactions:', totalTransactions.toString()],
    ['Total Debits:', `${debitCount} transaction(s)`],
    ['Total Credits:', `${creditCount} transaction(s)`],
    [
      'Total Debit Amount:',
      `₦${totalDebits.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    ],
    [
      'Total Credit Amount:',
      `₦${totalCredits.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    ]
  ];

  if (transactions.length > 0) {
    // Calculate opening balance (balance before first transaction)
    const firstTransaction = transactions[transactions.length - 1];
    const openingBalance =
      firstTransaction.transType === 'D'
        ? firstTransaction.balance + firstTransaction.amount
        : firstTransaction.balance - firstTransaction.amount;

    const closingBalance = transactions[0].balance;

    summaryData.push(
      [
        'Opening Balance:',
        `₦${openingBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      ],
      [
        'Closing Balance:',
        `₦${closingBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      ]
    );
  }

  // Create summary table
  (doc as any).autoTable({
    body: summaryData,
    startY: summaryY,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 60, halign: 'right' }
    },
    margin: { left: 20, right: 20 },
    theme: 'plain'
  });

  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);

    // Footer text
    doc.text('This is a computer-generated statement and does not require signature.', 105, 285, {
      align: 'center'
    });
    doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: 'right' });
    doc.text('Generated on ' + new Date().toLocaleString('en-GB'), 10, 290);
  }

  // Generate filename
  const currentDate = new Date().toISOString().slice(0, 10);
  const fileName = `Account_Statement_${accountNumber}_${currentDate}.pdf`;

  // Save/download the PDF
  doc.save(fileName);

  return fileName;
};

// Alternative function for preview (returns blob instead of downloading)
export const generateStatementPDFBlob = (
  transactions: Transaction[],
  accountNumber: string
): Blob => {
  // Validate parameters
  if (!transactions || !Array.isArray(transactions)) {
    throw new Error('Transactions parameter must be a valid array');
  }

  if (!accountNumber || typeof accountNumber !== 'string') {
    throw new Error('Account number must be a valid string');
  }

  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNT STATEMENT', 105, 20, { align: 'center' });

  // Add company/bank info (customize as needed)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Bank Name', 105, 30, { align: 'center' });
  doc.text('123 Bank Street, City, State', 105, 37, { align: 'center' });

  // Account information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNT DETAILS', 20, 55);

  doc.setFont('helvetica', 'normal');
  doc.text(`Account Number: ${accountNumber}`, 20, 65);
  doc.text(`Statement Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 72);
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 20, 79);

  // Date range
  if (transactions.length > 0) {
    const startDate = new Date(transactions[transactions.length - 1].valueDate).toLocaleDateString(
      'en-GB'
    );
    const endDate = new Date(transactions[0].valueDate).toLocaleDateString('en-GB');
    doc.text(`Period: ${startDate} to ${endDate}`, 20, 86);
  }

  // Prepare table data
  const tableData = transactions.map((transaction) => [
    new Date(transaction.valueDate).toLocaleDateString('en-GB'),
    new Date(transaction.entryDate).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    transaction.transType === 'D' ? 'DEBIT' : 'CREDIT',
    transaction.narration,
    transaction.transType === 'D'
      ? `₦${transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      : '',
    transaction.transType === 'C'
      ? `₦${transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      : '',
    `₦${transaction.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
  ]);

  // Table headers
  const headers = [
    'VALUE DATE',
    'TRANSACTION DATE',
    'TYPE',
    'DESCRIPTION',
    'DEBIT (₦)',
    'CREDIT (₦)',
    'BALANCE (₦)'
  ];

  // Generate table
  (doc as any).autoTable({
    head: [headers],
    body: tableData,
    startY: 95,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 18 },
      3: { cellWidth: 55 },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' }
    },
    margin: { left: 10, right: 10 }
  });

  // Summary section
  const finalY = (doc as any).lastAutoTable.finalY + 15;

  if (finalY > 250) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTION SUMMARY', 20, 30);
  } else {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTION SUMMARY', 20, finalY);
  }

  const summaryY = finalY > 250 ? 45 : finalY + 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Calculate totals
  const totalTransactions = transactions.length;
  const totalDebits = transactions
    .filter((t) => t.transType === 'D')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalCredits = transactions
    .filter((t) => t.transType === 'C')
    .reduce((sum, t) => sum + t.amount, 0);

  const debitCount = transactions.filter((t) => t.transType === 'D').length;
  const creditCount = transactions.filter((t) => t.transType === 'C').length;

  const summaryData = [
    ['Total Transactions:', totalTransactions.toString()],
    ['Total Debits:', `${debitCount} transaction(s)`],
    ['Total Credits:', `${creditCount} transaction(s)`],
    [
      'Total Debit Amount:',
      `₦${totalDebits.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    ],
    [
      'Total Credit Amount:',
      `₦${totalCredits.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    ]
  ];

  if (transactions.length > 0) {
    const firstTransaction = transactions[transactions.length - 1];
    const openingBalance =
      firstTransaction.transType === 'D'
        ? firstTransaction.balance + firstTransaction.amount
        : firstTransaction.balance - firstTransaction.amount;

    const closingBalance = transactions[0].balance;

    summaryData.push(
      [
        'Opening Balance:',
        `₦${openingBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      ],
      [
        'Closing Balance:',
        `₦${closingBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      ]
    );
  }

  (doc as any).autoTable({
    body: summaryData,
    startY: summaryY,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 60, halign: 'right' }
    },
    margin: { left: 20, right: 20 },
    theme: 'plain'
  });

  return doc.output('blob');
};

// Function to get PDF as base64 string (useful for email attachments)
export const generateStatementPDFBase64 = (
  transactions: Transaction[],
  accountNumber: string
): string => {
  // Validate parameters
  if (!transactions || !Array.isArray(transactions)) {
    throw new Error('Transactions parameter must be a valid array');
  }

  if (!accountNumber || typeof accountNumber !== 'string') {
    throw new Error('Account number must be a valid string');
  }

  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNT STATEMENT', 105, 20, { align: 'center' });

  // Add company/bank info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Bank Name', 105, 30, { align: 'center' });
  doc.text('123 Bank Street, City, State', 105, 37, { align: 'center' });

  // Account information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNT DETAILS', 20, 55);

  doc.setFont('helvetica', 'normal');
  doc.text(`Account Number: ${accountNumber}`, 20, 65);
  doc.text(`Statement Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 72);
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 20, 79);

  if (transactions.length > 0) {
    const startDate = new Date(transactions[transactions.length - 1].valueDate).toLocaleDateString(
      'en-GB'
    );
    const endDate = new Date(transactions[0].valueDate).toLocaleDateString('en-GB');
    doc.text(`Period: ${startDate} to ${endDate}`, 20, 86);
  }

  // Prepare table data
  const tableData = transactions.map((transaction) => [
    new Date(transaction.valueDate).toLocaleDateString('en-GB'),
    new Date(transaction.entryDate).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    transaction.transType === 'D' ? 'DEBIT' : 'CREDIT',
    transaction.narration,
    transaction.transType === 'D'
      ? `₦${transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      : '',
    transaction.transType === 'C'
      ? `₦${transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      : '',
    `₦${transaction.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
  ]);

  const headers = [
    'VALUE DATE',
    'TRANSACTION DATE',
    'TYPE',
    'DESCRIPTION',
    'DEBIT (₦)',
    'CREDIT (₦)',
    'BALANCE (₦)'
  ];

  (doc as any).autoTable({
    head: [headers],
    body: tableData,
    startY: 95,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 18 },
      3: { cellWidth: 55 },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' }
    },
    margin: { left: 10, right: 10 }
  });

  return doc.output('datauristring');
};
