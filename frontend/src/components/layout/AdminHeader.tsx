import { Link, useNavigate } from "react-router-dom";
import { Scale, Menu, LogOut, Settings, Coins, DollarSign } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Sidebar } from "./Sidebar";
import useUserStore from "@/store/useUserStore";
import { CreditsPopup } from "../credits/CreditsPopup";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useEffect } from "react";
import chatService from "@/services/chat.service";

interface AdminHeaderProps {
  variant?: "admin" | "user";
}

export function AdminHeader({ variant = "admin" }: AdminHeaderProps) {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const { clearUser } = useUserStore();
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  const handleLogout = () => {
    // Clear user data from store
    clearUser();
    // Redirect to login page
    navigate("/login");
  };

  const fetchUserCredits = async () => {
    try {
      const credits = await chatService.fetchUserCredits();
      if (user) {
        useUserStore.getState().updateUser({ credits });
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  // Fetch credits on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchUserCredits();
    }
  }, [user?.id]); // Only refetch when user ID changes

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40 h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar variant={variant} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - Visible on Mobile Only */}
        <div className="lg:hidden flex items-center">
          <div className="w-8 h-8 bg-[#BB8A28] rounded flex items-center justify-center text-white font-bold">
            {variant === "admin" ? "A" : "L"}
          </div>
          <span className="ml-2 text-lg font-semibold">
            {variant === "admin" ? "Admin" : "User"}
          </span>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center relative max-w-md w-full"></div>

        {/* Right side icons and profile */}
        <div className="flex items-center space-x-4">
          {/* Credits Display - Only show for user variant */}
          {variant === "user" && (
            <>
              <div
                className="flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => navigate("/chat/products")}
              >
                <Coins className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {user?.credits || 0} Credits
                </span>
              </div>
              <Button
                onClick={() => navigate("/user/trial")}
                variant="ghost"
                className="hidden lg:flex items-center space-x-2 ml-4 hover:bg-primary/50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <span className="font-medium">Mock Trials</span>
                </div>
              </Button>
            </>
          )}

          {/* Profile Avatar with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 focus:outline-none">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>
                    {variant === "admin" ? "AD" : "US"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {variant === "admin" ? "Admin" : user?.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link
                  to={variant == "admin" ? "/admin/profile" : "/chat/profile"}
                  className="flex items-center cursor-pointer"
                >
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="User"
                    />
                    <AvatarFallback>
                      {variant === "admin" ? "AD" : "US"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {variant === "admin" ? "Admin User" : user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {variant === "admin" ? "Administrator" : user?.email}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to={variant == "admin" ? "/admin/profile" : "/chat/profile"}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              {variant == "user" && (
                <DropdownMenuItem asChild>
                  <Link to={"/chat/products"} className="cursor-pointer">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Upgrade</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-500 focus:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Credits Popup */}
      {variant === "user" && (
        <>
          <CreditsPopup
            isOpen={isCreditsOpen}
            onClose={() => setIsCreditsOpen(false)}
          />
        </>
      )}
    </header>
  );
}
