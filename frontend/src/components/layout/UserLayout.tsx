import { AdminHeader } from "./AdminHeader";
import { Sidebar } from "./Sidebar";
import { cn } from "../../lib/utils";
import { Outlet } from "react-router-dom";
interface UserLayoutProps {

  className?: string;
}

export function UserLayout({ className }: UserLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar variant="user" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader variant="user" />
        <main className={cn("flex-1 overflow-auto p-6", className)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
} 