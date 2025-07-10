import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
export default function About() {
  const navigate = useNavigate();
  return (
    <section id="about" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <img 
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop"
              alt="Team of legal experts" 
              className="rounded-xl shadow-xl w-full h-auto"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x400/BB8A28/FFF?text=Legal+Team";
              }}
            />
          </div>
          
          <div className="order-1 md:order-2 space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Pioneering Legal Transformation
              </h2>
              <div className="w-20 h-1 bg-[#BB8A28]"></div>
            </div>
            
            <div className="bg-[#BB8A28]/10 p-4 rounded-lg border-l-4 border-[#BB8A28]">
              <h3 className="font-bold text-lg mb-2">Non-profit Initiative</h3>
              <p className="text-muted-foreground">
                Legal Master AI, a proud initiative of Bold Champions (501(c)(3) Non-Profit),
                is dedicated to democratizing access to justice. We firmly believe that Justice should not be a privilege but a fundamental right. Our
                mission is to empower all to navigate, participate, and understand
                complicated legal processes.
              </p>
            </div>
            
            <p className="text-muted-foreground">
              By leveraging cutting-edge AI technology with unwavering commitment, we are dedicated to bringing the justice gap, ensuring that affordable, efficient, and accurate legal assistance
              is a reality for all.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-card p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Trusted Experience</h4>
                <p className="text-sm text-muted-foreground">20+ years of combined legal expertise powering our AI</p>
              </div>
              <div className="bg-card p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Innovative Solutions</h4>
                <p className="text-sm text-muted-foreground">Cutting-edge AI technology with practical legal applications</p>
              </div>
              <div className="bg-card p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Global Reach</h4>
                <p className="text-sm text-muted-foreground">Serving clients across jurisdictions worldwide</p>
              </div>
              <div className="bg-card p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Client Satisfaction</h4>
                <p className="text-sm text-muted-foreground">98% client satisfaction rate with our legal services</p>
              </div>
            </div>
            
            <Button onClick={() => navigate("/sign-up")}>
              Try our Legal Assistant
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 