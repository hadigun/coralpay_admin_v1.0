import { ShortCode } from "./columns";

export const shortCodeTableData: ShortCode[] = [
  {
    id: "SCO-12346",
    ussd: "*312*2#",
    type: "Dedicated",
    status: "Pending",
    dateCreated: "01/01/2025 10:00am",
  },
  {
    id: "SCO-12345",
    ussd: "*500#",
    type: "Shared",
    status: "Approved",
    dateCreated: "01/01/2025 10:00am",
  },
  {
    id: "SCO-12344",
    ussd: "*321*2#",
    type: "Dedicated",
    status: "Declined",
    dateCreated: "01/01/2025 10:00am",
  },
  {
    id: "SCO-12343",
    ussd: "*876#",
    type: "Dedicated",
    status: "Declined",
    dateCreated: "01/01/2025 10:00am",
  },
];
