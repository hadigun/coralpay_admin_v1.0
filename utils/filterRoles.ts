type Role = {
  id: string;
  role: string;
  members: number;
  date: string;
};

export const filterRoleList = (roleList: Role[], search: string) => {
  const lowerSearch = search.toLowerCase();
  return roleList.filter((role) => role.role.toLowerCase().includes(lowerSearch));
};
