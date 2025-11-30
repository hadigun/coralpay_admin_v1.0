import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex-1 h-full px-4 py-6 mx-auto max-w-screen-2xl md:px-8 2xl:px-8 2xl:py-14">
      {children}
    </div>
  );
};

export default Layout;
