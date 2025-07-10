import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();
  
  return (
    <section className="py-12 sm:py-16 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-[#BB8A28]/90 to-[#BB8A28] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 shadow-xl relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 sm:-right-40 -top-20 sm:-top-40 w-40 sm:w-80 h-40 sm:h-80 rounded-full bg-white"></div>
            <div className="absolute -left-10 sm:-left-20 -bottom-10 sm:-bottom-20 w-30 sm:w-60 h-30 sm:h-60 rounded-full bg-white"></div>
          </div>
          
          <div className="relative z-10 text-center text-white max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              The best AI Lawyer software on the planet!
            </h2>
            
            <p className="mb-6 sm:mb-8 text-sm sm:text-base text-white/80">
              Experience the future of legal assistance with our cutting-edge AI technology.
              Get started today with our free plan or upgrade for premium features.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button
                className={cn(
                  "bg-white text-[#BB8A28] hover:bg-white/90 w-full sm:w-auto",
                )}
                onClick={() => {
                  navigate("/sign-in");
                }}
              >
                Try Now
              </Button>
              <Button
                className={cn(
                  "bg-transparent border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto",
                )}
                onClick={() => {
                  navigate("/sign-up");
                }}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 