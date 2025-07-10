import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";

export default function Hero() {
  return (
    <section id="hero" className="py-12 md:py-16 bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#BB8A28]/5 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20 relative">
        {/* Left content */}
        <div className="flex-1 space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            <span className="text-foreground">AI-Powered </span>
            <span className="text-[#BB8A28] relative">
              Legal Assistance
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#BB8A28]/20 rounded-full"></span>
            </span>
            <span className="text-foreground block mt-2">at Your Fingertips</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
            Navigate complex legal landscapes with ease using our cutting-edge
            AI Lawyer chatbot. Get instant answers to your legal questions, 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button size="lg" className="bg-[#BB8A28] hover:bg-[#BB8A28]/90 transition-all duration-300">
              <Link to='/sign-in'>Get Started</Link>
            </Button>
            <Button size="lg" variant="outline"  className="border-[#BB8A28] text-[#BB8A28] hover:bg-[#BB8A28]/10 hover:text-[#BB8A28] transition-all duration-300">
              <Link to='sign-in'>Try Legal Assistant</Link>
            </Button>
          </div>
        </div>

        {/* Right content - image */}
        <div className="flex-1 flex justify-center items-center relative">
          <div className="relative w-full max-w-2xl h-auto group">
            <div className="absolute inset-0 bg-[#BB8A28]/10 rounded-2xl -z-10 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <img 
              src="/assets/hero.jpg"
              alt="AI Legal Assistant" 
              className="w-full h-auto object-cover rounded-2xl shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/800x600/BB8A28/FFF?text=AI+Legal+Assistant";
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
} 