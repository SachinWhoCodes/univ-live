import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import logo from "@/assets/logo.png";

const footerLinks = {
  product: [
    { name: "How It Works", href: "/how-it-works" },
    { name: "For Coaching", href: "/for-coaching" },
    { name: "For Students", href: "/for-students" },
    { name: "Our Courses", href: "/our-courses" },
    { name: "Pricing", href: "/pricing" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
  social: [
    { name: "Twitter", href: "https://twitter.com" },
    { name: "LinkedIn", href: "https://linkedin.com" },
    { name: "YouTube", href: "https://youtube.com" },
    { name: "Instagram", href: "https://instagram.com" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-pastel-cream dark:bg-surface relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-20 relative">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <img src={logo} alt="UNIV.LIVE" className="h-10 w-auto" />
              <span className="font-display font-bold text-xl text-foreground">
                UNIV.LIVE
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              Empowering coaching institutes with AI-powered websites and 
              helping students excel with advanced CBT practice platforms.
            </p>
            <div className="space-y-3">
              <a
                href="mailto:hello@univ.live"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                hello@univ.live
              </a>
              <a
                href="tel:+911234567890"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                +91 123 456 7890
              </a>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Connect</h4>
            <ul className="space-y-3">
              {footerLinks.social.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} UNIV.LIVE. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">Made with ♥ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
