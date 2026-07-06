import { getCurrentRole } from "@/lib/command-center/auth";
import { canAccessModule } from "@/lib/command-center/roles";

interface AccessGuardProps {
  moduleKey: string;
  children: React.ReactNode;
}

export async function AccessGuard({ moduleKey, children }: AccessGuardProps) {
  const role = await getCurrentRole();
  if (!canAccessModule(role, moduleKey)) {
    return (
      <div className="cc-restricted">
        <h1>Access restricted</h1>
        <p>This module is only available to owners. Contact your admin if you need access.</p>
      </div>
    );
  }
  return <>{children}</>;
}
