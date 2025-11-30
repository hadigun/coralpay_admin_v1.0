const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[url('/images/auth-background.png')] bg-cover bg-center">
        <div className="w-11/12 sm:w-full max-w-lg bg-white rounded-lg shadow-md p-6 sm:p-10 mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
