import { AdminHeader } from "./AdminHeader";
import { Sidebar } from "./Sidebar";
import { cn } from "../../lib/utils";
import { Outlet } from "react-router-dom";

interface AdminLayoutProps {
  className?: string;
}

export function AdminLayout({ className }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar variant="admin" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader variant="admin" />
        <main className={cn("flex-1 overflow-auto p-6", className)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
} 