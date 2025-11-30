import { ShortCodeRequest } from "./colums";

export const requestData: ShortCodeRequest[] = [
  {
    id: "SCO-12346",
    ussd: "*312*2#",
    shortCodeType: "Dedicated",
    availability: "Not Available",
    status: "Pending",
    createdAt: "2025-01-04",
  },
  {
    id: "SCO-12345",
    ussd: "*500#",
    shortCodeType: "Shared",
    availability: "Available",
    status: "Pending",
    createdAt: "2025-01-05",
  },
  {
    id: "SCO-12344",
    ussd: "*321*2#",
    shortCodeType: "Dedicated",
    availability: "Available",
    status: "Approved",
    createdAt: "2025-01-06",
    editable: false,
  },
  {
    id: "SCO-12343",
    ussd: "*876#",
    shortCodeType: "Dedicated",
    availability: "Not Available",
    status: "Declined",
    createdAt: "2025-01-07",
  },
];
