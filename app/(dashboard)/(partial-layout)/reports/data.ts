export interface USSDReport {
  transactionId: string;
  serviceId: string;
  merchantName: string;
  ussdCode: string;
  dateCreated: string;
  status: "Success" | "Failed" | "Pending";
}

export const ussdReports: USSDReport[] = [
  {
    transactionId: "TXN-203948",
    serviceId: "SVC-00123",
    merchantName: "Isalu Hospital",
    ussdCode: "*312#",
    dateCreated: "2025-07-28 10:24 AM",
    status: "Success",
  },
  {
    transactionId: "TXN-203949",
    serviceId: "SVC-00124",
    merchantName: "NextGen Mart",
    ussdCode: "*501#",
    dateCreated: "2025-07-28 11:10 AM",
    status: "Pending",
  },
  {
    transactionId: "TXN-203950",
    serviceId: "SVC-00125",
    merchantName: "GreenPay Ltd",
    ussdCode: "*700#",
    dateCreated: "2025-07-27 9:45 PM",
    status: "Failed",
  },
];
