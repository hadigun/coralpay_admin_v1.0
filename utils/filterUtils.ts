type Staff = {
  id: string;
  name: string;
  role: string;
  date: string;
  time: string;
  status: string;
};

export const filterStaffList = (staffList: Staff[], search: string) => {
  const lowerSearch = search.toLowerCase();
  return staffList.filter(
    (staff) =>
      staff.name.toLowerCase().includes(lowerSearch) ||
      staff.id.toLowerCase().includes(lowerSearch) ||
      staff.role.toLowerCase().includes(lowerSearch) ||
      staff.status.toLowerCase().includes(lowerSearch)
  );
};
