
import { Outlet } from "react-router-dom";
import { LockKeyholeIcon } from "lucide-react";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-6 flex flex-col items-center">
        <div className="p-2 bg-primary rounded-full mb-2">
          <LockKeyholeIcon className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Password Vault</h1>
        <p className="text-muted-foreground">Secure your digital life</p>
      </div>
      <div className="w-full max-w-md bg-card rounded-lg border shadow-sm">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
