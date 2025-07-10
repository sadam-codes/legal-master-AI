import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import authService from "../../services/auth.service";
import Helpers from "../../config/helpers";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      Helpers.showToast("Please enter your email address", "error");
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword({ email });
      setIsSuccessful(true);
      Helpers.showToast("Password reset instructions have been sent to your email", "success");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      Helpers.showToast(error.response?.data?.message || "An error occurred. Please try again.", "error");
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
          <h2 className="text-3xl font-bold mb-6">Recover Your Account</h2>
          <p className="mb-6 text-white/80">
            We'll help you reset your password and get back to using our AI-powered legal assistance.
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
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
          </div>

          {isSuccessful ? (
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 text-center">
              <div className="text-green-600 dark:text-green-400 text-xl mb-4">✓</div>
              <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Check your email</h3>
              <p className="text-green-700 dark:text-green-400 mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-green-600 dark:text-green-500">
                If you don't see it, check your spam folder or <button
                  onClick={handleSubmit}
                  className="underline font-medium"
                  disabled={isLoading}
                >
                  click here to resend
                </button>
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
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#BB8A28] focus:border-[#BB8A28] transition"
                    placeholder="you@example.com"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/sign-in" className="text-[#BB8A28] hover:underline font-medium">
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