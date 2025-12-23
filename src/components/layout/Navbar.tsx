import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const navLinks = [
  { name: "How It Works", href: "/how-it-works" },
  {
    name: "Solutions",
    href: "#",
    children: [
      { name: "For Coaching Institutes", href: "/for-coaching" },
      { name: "For Students", href: "/for-students" },
    ],
  },
  { name: "Our Courses", href: "/our-courses" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-card/90 backdrop-blur-xl border-b border-border/30 shadow-soft"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logo} alt="UNIV.LIVE" className="h-9 lg:h-10 w-auto" />
            <span className="font-display font-bold text-lg lg:text-xl">
              <span className="gradient-text">UNIV</span>
              <span className="text-foreground">.LIVE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.children && setOpenDropdown(link.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1",
                    isActive(link.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                  onClick={(e) => link.children && e.preventDefault()}
                >
                  {link.name}
                  {link.children && (
                    <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                  )}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {link.children && openDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-card rounded-2xl shadow-card-hover border border-border/30 overflow-hidden p-2"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          className={cn(
                            "block px-4 py-2.5 rounded-xl text-sm transition-colors",
                            isActive(child.href)
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-secondary/60 text-foreground"
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-secondary/60 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost" asChild className="rounded-full">
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="gradient" asChild className="rounded-full px-6">
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2.5 rounded-full hover:bg-secondary/60 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1 border-t border-border/30">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.children ? (
                      <>
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === link.name ? null : link.name
                            )
                          }
                          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl"
                        >
                          {link.name}
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform",
                              openDropdown === link.name && "rotate-180"
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {openDropdown === link.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-4"
                            >
                              {link.children.map((child) => (
                                <Link
                                  key={child.name}
                                  to={child.href}
                                  onClick={() => setIsMobileOpen(false)}
                                  className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl"
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={link.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "block px-4 py-3 text-sm font-medium transition-colors rounded-xl",
                          isActive(link.href)
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}

                <div className="pt-4 px-4 space-y-2 border-t border-border/30 mt-4">
                  <Button variant="outline" className="w-full rounded-full" asChild>
                    <Link to="/login" onClick={() => setIsMobileOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button variant="gradient" className="w-full rounded-full" asChild>
                    <Link to="/signup" onClick={() => setIsMobileOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
