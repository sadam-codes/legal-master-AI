import { FaFacebookF } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className=" mx-20 container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <a
                href="#hero"
                className="flex items-center space-x-2"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("hero");
                }}
              >
                <img src="/assets/logo.png" alt="" className="w-40 h-auto" />
              </a>
            </div>
            <p className="text-muted-foreground">
              Transforming legal assistance with AI technology to make justice
              accessible for all.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#hero"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("hero");
                  }}
                  className="text-muted-foreground hover:text-[#BB8A28] transition"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("about");
                  }}
                  className="text-muted-foreground hover:text-[#BB8A28] transition"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("testimonials");
                  }}
                  className="text-muted-foreground hover:text-[#BB8A28] transition"
                >
                  Reviews
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <a
                  href="mailto:info@legalmaster.ai"
                  className="text-muted-foreground hover:text-[#BB8A28] transition"
                >
                  info@legalmaster.ai
                </a>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <FaFacebookF className="text-muted-foreground hover:text-[#BB8A28] transition" />
              <FaTwitter className="text-muted-foreground hover:text-[#BB8A28] transition" />
              <FaInstagram className="text-muted-foreground hover:text-[#BB8A28] transition" />
              <FaLinkedin className="text-muted-foreground hover:text-[#BB8A28] transition" />
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
          <p>
            Copyright © {new Date().getFullYear()} LegalMaster.AI. All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
