import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return <div className="flex-1 h-full">{children}</div>;
};

export default Layout;
