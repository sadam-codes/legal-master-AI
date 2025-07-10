import { useState } from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Database,
  FileText,
  Users,
  Mic,
  Scale,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    id: 1,
    title: "Legal Database",
    description:
      "Access comprehensive legal knowledge with our extensive database of cases and precedents.",
    icon: "database",
    detailedDescription:
      "Our AI-powered legal query system offers instantaneous, reliable answers to your legal questions, ensuring you're always informed and prepared.",
    benefits: [
      "Access well-founded legal advice at the click of a button, drawing from a vast repository of legal knowledge.",
      "Dive into our extensive database for detailed insights into case laws, statutes, and legal precedents.",
      "Confidentiality is paramount. Your inquiries and the information provided are protected with the highest standards of privacy.",
    ],
    image: "/assets/legal-database.png",
    fallbackImage:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
    ctaText: "Explore Legal Database",
  },
  {
    id: 2,
    title: "Legal Document",
    description:
      "Generate and review legal documents with AI-powered assistance for accuracy and compliance.",
    icon: "file-text",
    detailedDescription:
      "Our document generation system helps you create legally sound documents with ease and precision.",
    benefits: [
      "Generate contracts, agreements, and legal forms tailored to your specific needs.",
      "Review existing documents for legal compliance and potential issues.",
      "Track document versions and changes with our comprehensive history system.",
    ],
    image: "/assets/legal-documents.png",
    fallbackImage:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2070&auto=format&fit=crop",
    ctaText: "Create Documents",
  },
  {
    id: 3,
    title: "Legal Consultancy",
    description:
      "Get expert advice and consultation on complex legal matters with our AI legal consultants.",
    icon: "users",
    detailedDescription:
      "Connect with our AI consultants for personalized legal advice on your most complex matters.",
    benefits: [
      "Receive tailored advice for your specific legal situation from our trained AI system.",
      "Get answers to complex legal questions with supporting case citations and statutes.",
      "Available 24/7 to assist with urgent legal inquiries when you need guidance most.",
    ],
    image: "/assets/legal-consultancy.png",
    fallbackImage:
      "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=2070&auto=format&fit=crop",
    ctaText: "Consult Now",
  },
  {
    id: 4,
    title: "Voice Recording",
    description:
      "Record, transcribe, and analyze legal meetings and conversations with our voice recording feature.",
    icon: "mic",
    detailedDescription:
      "Capture, transcribe, and analyze important legal conversations with our advanced voice recording system.",
    benefits: [
      "Automatically transcribe meetings and consultations for accurate record-keeping.",
      "Extract key insights and action items from recorded conversations.",
      "Secure storage with end-to-end encryption to protect sensitive legal discussions.",
    ],
    image: "/images/voice-recording.png",
    fallbackImage:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop",
    ctaText: "Start Recording",
  },
  {
    id: 5,
    title: "Legal Mock Trials",
    description:
      "Prepare for court with AI-simulated mock trials to strengthen your case strategy.",
    icon: "gavel",
    detailedDescription:
      "Test and refine your case strategies with our AI-powered mock trial simulation system.",
    benefits: [
      "Practice your case presentation with realistic AI-generated responses from judges and opposing counsel.",
      "Identify potential weaknesses in your arguments before entering the actual courtroom.",
      "Receive detailed feedback and improvement suggestions based on legal precedent and best practices.",
    ],
    image: "/assets/legal-trials.png",
    fallbackImage:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop",
    ctaText: "Simulate Trial",
  },
];

function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const iconProps = {
    className: cn("w-full h-full", className),
    size: 24,
  };

  switch (name) {
    case "database":
      return <Database {...iconProps} />;
    case "file-text":
      return <FileText {...iconProps} />;
    case "users":
      return <Users {...iconProps} />;
    case "mic":
      return <Mic {...iconProps} />;
    case "gavel":
      return <Scale {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
}

export default function Services() {
  const [activeTab, setActiveTab] = useState("1");
  const navigate = useNavigate();

  return (
    <section id="services" className="py-12 md:py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">AI SERVICES</h2>
          <div className="w-20 h-1 bg-[#BB8A28] mx-auto mb-6"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our range of AI-powered legal services designed to
            streamline your legal work and provide expert assistance.
          </p>
        </div>

        <Tabs
          defaultValue="1"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-12">
            <TabsList className="bg-background/80 backdrop-blur-sm border p-1 gap-1 flex-wrap">
              {services.map((service) => (
                <TabsTrigger
                  key={service.id}
                  value={service.id.toString()}
                  className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm sm:text-base data-[state=active]:bg-[#BB8A28] data-[state=active]:text-white"
                >
                  <span className="hidden md:inline-flex w-5 h-5 text-current">
                    <ServiceIcon name={service.icon} />
                  </span>
                  {service.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {services.map((service) => (
            <TabsContent
              key={service.id}
              value={service.id.toString()}
              className="mt-2 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
                <div className="space-y-4 md:space-y-6 order-2 md:order-1">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#BB8A28]">
                    {service.title}:{" "}
                    <span className="text-foreground font-medium">
                      Your Gateway to Legal Excellence
                    </span>
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {service.detailedDescription}
                  </p>

                  <ul className="space-y-3 md:space-y-4">
                    {service.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#BB8A28] flex items-center justify-center text-white flex-shrink-0">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <p className="text-sm sm:text-base">{benefit}</p>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="bg-[#BB8A28] hover:bg-[#BB8A28]/90 gap-2 mt-4 w-full sm:w-auto"
                    onClick={() => {
                      navigate("/sign-in");
                    }}
                  >
                    {service.ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="relative rounded-xl overflow-hidden shadow-xl order-1 md:order-2 transform transition-transform duration-500 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#BB8A28]/20 to-transparent z-10"></div>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-auto object-cover aspect-video"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = service.fallbackImage;
                      target.onerror = null;
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
