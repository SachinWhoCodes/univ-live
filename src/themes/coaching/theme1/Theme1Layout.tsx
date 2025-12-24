import { useState, useEffect } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, Linkedin, GraduationCap, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { tenantProfiles } from "@/mock/tenantWebsiteMock";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

interface Theme1LayoutProps {
  children?: React.ReactNode;
}

export default function Theme1Layout({ children }: Theme1LayoutProps) {
  const { tenantSlug } = useParams();
  const tenant = tenantProfiles[tenantSlug || ""] || tenantProfiles["success-academy"];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Coaching not found</p>
      </div>
    );
  }

  const navItems = [
    { label: "Home", href: `/t/${tenantSlug}` },
    { label: "About", href: `/t/${tenantSlug}/about` },
    { label: "Courses", href: `/t/${tenantSlug}/courses` },
    { label: "Contact", href: `/t/${tenantSlug}/contact` },
  ];

  const socialIcons: Record<string, React.ReactNode> = {
    facebook: <Facebook className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    youtube: <Youtube className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    linkedin: <Linkedin className="h-5 w-5" />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="hidden md:block bg-primary/5 py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-muted-foreground">
            <a href={`tel:${tenant.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
              <Phone className="h-3.5 w-3.5" />
              {tenant.phone}
            </a>
            <a href={`mailto:${tenant.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
              <Mail className="h-3.5 w-3.5" />
              {tenant.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            {Object.entries(tenant.socials).map(([key, url]) => (
              url && (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  {socialIcons[key]}
                </a>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to={`/t/${tenantSlug}`} className="flex items-center gap-2">
              {tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.coachingName} className="h-10 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold text-lg hidden sm:block">{tenant.coachingName}</span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" className="hidden sm:inline-flex rounded-full" asChild>
                <Link to={`/t/${tenantSlug}/login`}>Login</Link>
              </Button>
              <Button className="gradient-bg rounded-full hidden md:inline-flex" asChild>
                <Link to={`/t/${tenantSlug}/courses`}>Enroll Now</Link>
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col gap-6 mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-bold">{tenant.coachingName}</span>
                    </div>
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="pt-4 border-t border-border space-y-3">
                      <Button variant="outline" className="w-full rounded-full" asChild>
                        <Link to={`/t/${tenantSlug}/login`}>Login</Link>
                      </Button>
                      <Button className="w-full gradient-bg rounded-full" asChild>
                        <Link to={`/t/${tenantSlug}/courses`}>Enroll Now</Link>
                      </Button>
                    </div>
                    <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
                      <a href={`tel:${tenant.phone}`} className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {tenant.phone}
                      </a>
                      <a href={`mailto:${tenant.email}`} className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {tenant.email}
                      </a>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={tenantSlug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children || <Outlet />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-pastel-cream dark:bg-muted/30 border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-lg">{tenant.coachingName}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{tenant.tagline}</p>
              <div className="flex gap-3">
                {Object.entries(tenant.socials).map(([key, url]) => (
                  url && (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                      {socialIcons[key]}
                    </a>
                  )
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to={`/t/${tenantSlug}/login`} className="text-muted-foreground hover:text-primary transition-colors">
                    Student Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Courses */}
            <div>
              <h3 className="font-semibold mb-4">Popular Courses</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to={`/t/${tenantSlug}/courses`} className="text-muted-foreground hover:text-primary transition-colors">
                    CUET Complete Course
                  </Link>
                </li>
                <li>
                  <Link to={`/t/${tenantSlug}/courses`} className="text-muted-foreground hover:text-primary transition-colors">
                    English + GT Course
                  </Link>
                </li>
                <li>
                  <Link to={`/t/${tenantSlug}/courses`} className="text-muted-foreground hover:text-primary transition-colors">
                    Domain Courses
                  </Link>
                </li>
                <li>
                  <Link to={`/t/${tenantSlug}/courses`} className="text-muted-foreground hover:text-primary transition-colors">
                    Free Demo
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  {tenant.address}
                </li>
                <li>
                  <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" />
                    {tenant.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${tenant.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                    {tenant.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 {tenant.coachingName}. All rights reserved.</p>
            <p>Powered by <Link to="/" className="text-primary hover:underline">UNIV.LIVE</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
}

