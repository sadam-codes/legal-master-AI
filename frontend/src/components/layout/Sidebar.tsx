import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Calendar,
  MessagesSquare,
  User,
  Users2,
  MessageSquareIcon,
  DollarSign,
  Gavel,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ChatHistorySidebar } from "../user/ChatHistorySidebar";

interface SidebarProps {
  variant?: "admin" | "user";
  className?: string;
}

export function Sidebar({ variant = "admin", className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const adminLinks = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/payments", icon: DollarSign, label: "Payment" },
    { href: "/admin/categories", icon: FileText, label: "Categories" },
    { href: "/admin/questions", icon: BarChart3, label: "Questions" },
    { href: "/admin/chats", icon: MessageSquareIcon, label: "Chats" },
    { href: "/admin/trials", icon: Gavel, label: "Trials" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
    { href: "/admin/subscriptions", icon: DollarSign, label: "Subscriptions" },
  ];

  const userLinks = [
    { href: "/chat/new", icon: LayoutDashboard, label: "Chat" },
    { href: "/chat/pricing", icon: Calendar, label: "Pricing" },
    { href: "/chat/history", icon: MessagesSquare, label: "History" },
    { href: "/chat/profile", icon: User, label: "Profile" },
    { href: "/chat/teams", icon: Users2, label: "Teams" },
    { href: "/chat/settings", icon: Settings, label: "Settings" },
  ];

  const links = variant === "admin" ? adminLinks : userLinks;

  return (
    <aside
      className={cn(
        "bg-background h-screen border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <Link
            to={variant === "admin" ? "/admin/dashboard" : "/chat/new"}
            className="flex items-center space-x-2"
          >
            <div
              className={` ${
                variant === "admin"
                  ? "w-8 h-8 bg-[#BB8A28] rounded flex items-center justify-center text-white font-bold"
                  : ""
              }`}
            >
              {variant === "admin" ? "A" : ""}
            </div>
            <span className="text-lg font-semibold">
              {variant === "admin" ? (
                "Admin"
              ) : (
                <img src="/assets/logo.png" alt="" className="w-40 h-auto" />
              )}
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-[#BB8A28] mx-auto rounded flex items-center justify-center text-white font-bold">
            {variant === "admin" ? "A" : "L"}
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(true)}
            className="p-0 h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {variant === "user" ? (
        <ChatHistorySidebar collapsed={collapsed} />
      ) : (
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md text-foreground hover:bg-muted transition",
                  collapsed ? "justify-center" : "space-x-3"
                )}
              >
                <link.icon className="h-5 w-5" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {collapsed && (
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(false)}
            className="w-full p-0 h-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </aside>
  );
}
