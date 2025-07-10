import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import authService from "../../services/auth.service";
import useUserStore from "../../store/useUserStore";
import Helpers from "../../config/helpers";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useUserStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      Helpers.showToast("Please fill in all fields", "error");
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await authService.login({
        username: email, // could be email or username
        password
      });
      
      // Store user data in zustand store
      setUser(response.user);
      setToken(response.token);
      
      // If "Remember Me" is checked, allow token to persist
      if (!rememberMe) {
        // Set session storage flag to clear on browser close
        sessionStorage.setItem("session-only", "true");
      }
      
      Helpers.showToast("You have been logged in successfully", "success");
      
      // Redirect based on user role
      if (response.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/chat/new", { state: { stage: 'category_selection' } });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Helpers.showToast(error.response?.data?.message || "Invalid credentials. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Decorative Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#BB8A28] relative overflow-hidden justify-center items-center">
        <div className="absolute inset-0 bg-[url('/images/law-pattern.webp')] opacity-10 bg-repeat"></div>
        <div className="relative z-10 text-white max-w-md p-12">
          <div className="flex items-center space-x-3 mb-8">
            <Link to="/">
              <img src="/assets/logo.png" alt="" className="w-40 h-auto" />
            </Link>
          </div>
          <h2 className="text-3xl font-bold mb-6">AI-Powered Legal Assistance at Your Fingertips</h2>
          <p className="mb-6 text-white/80">
            Join thousands of legal professionals and clients who trust our platform for accurate, efficient legal services.
          </p>
          <div className="flex space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm"></div>
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm"></div>
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm"></div>
          </div>
        </div>
      </div>
      
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <img src="" alt="" className="w-40 h-auto" />

          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>
          
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email or Username
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#BB8A28] focus:border-[#BB8A28] transition"
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-[#BB8A28] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#BB8A28] focus:border-[#BB8A28] transition"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#BB8A28] focus:ring-[#BB8A28] border-input rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            
            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/sign-up" className="text-[#BB8A28] hover:underline font-medium">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 