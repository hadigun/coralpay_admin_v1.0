import React from "react";

const Header = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="">
      <div className="mx-auto max-w-screen-2xl pb-4">{children}</div>
    </div>
  );
};

export default Header;
