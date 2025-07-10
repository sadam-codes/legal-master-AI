import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import authService from "../../services/auth.service";
import Helpers from "../../config/helpers";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setIsInvalidToken(true);
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      Helpers.showToast("Please fill in all fields", "error");
      return;
    }

    if (newPassword.length < 8) {
      Helpers.showToast("Password must be at least 8 characters", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      Helpers.showToast("Passwords do not match", "error");
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({
        token: token || "",
        email: email || "",
        newPassword,
      });
      setIsSuccessful(true);
      Helpers.showToast("Your password has been reset successfully", "success");
    } catch (error: any) {
      console.error("Reset password error:", error);
      Helpers.showToast(error.response?.data?.message || "Invalid or expired token", "error");
      setIsInvalidToken(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInvalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
          <p className="text-muted-foreground mb-6">
            The password reset link is invalid or has expired.
          </p>
          <Button
            onClick={() => navigate("/forgot-password")}
            className="mx-auto"
          >
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold mb-6">Reset Your Password</h2>
          <p className="mb-6 text-white/80">
            Create a new secure password for your account and get back to using
            our AI-powered legal assistance.
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
            <Link to="/">
              <img src="/assets/logo.png" alt="" className="w-40 h-auto" />
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground">
              Create a new password for your account
            </p>
          </div>

          {isSuccessful ? (
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 text-center">
              <div className="text-green-600 dark:text-green-400 text-xl mb-4">
                ✓
              </div>
              <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">
                Password Reset Successful
              </h3>
              <p className="text-green-700 dark:text-green-400 mb-4">
                Your password has been reset successfully.
              </p>
              <div className="mt-6">
                <Link to="/sign-in" className="text-[#BB8A28] hover:underline">
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#BB8A28] focus:border-[#BB8A28] transition"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#BB8A28] focus:border-[#BB8A28] transition"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>

              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  Remember your password?{" "}
                  <Link
                    to="/sign-in"
                    className="text-[#BB8A28] hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
