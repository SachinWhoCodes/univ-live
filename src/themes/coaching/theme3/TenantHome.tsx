// src/themes/coaching/theme3/TenantHome.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  Menu,
  X,
  Play,
  FileText,
  Star,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  Globe,
  MessageCircle,
  Send,
  Phone,
  MapPin,
  Mail,
  Quote,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

import { useTenant } from "@/contexts/TenantProvider";
import { db } from "@/lib/firebase";
import { collection, documentId, getDocs, limit, orderBy, query, where } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type StatItem = { label: string; value: string; icon?: string };
type AchievementItem = { title: string; description: string; icon?: string };
type FacultyItem = { name: string; subject?: string; designation?: string; experience?: string; bio?: string; image?: string };
type TestimonialItem = { name: string; course?: string; rating?: number; text: string; avatar?: string };
type FAQItem = { question: string; answer: string };

type TestSeries = {
  id: string;
  title: string;
  description: string;
  price: string | number;
  coverImage?: string;
  subject?: string;
  difficulty?: string;
  testsCount?: number;
  durationMinutes?: number;
};

function initials(name: string) {
  return (name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

function isTruthyUrl(v: any) {
  return typeof v === "string" && v.trim().length > 0;
}

export default function TenantHomeTheme2() {
  const { tenant, loading } = useTenant();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [featured, setFeatured] = useState<TestSeries[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-neutral-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" />
        Loading...
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center px-6">
          <h2 className="text-2xl font-bold">Coaching not found</h2>
          <p className="text-neutral-400 mt-2">
            This coaching website does not exist. Check the URL or contact support.
          </p>
        </div>
      </div>
    );
  }

  const config = tenant.websiteConfig || {};

  const coachingName = config.coachingName || tenant.coachingName || "Your Institute";
  const tagline = config.tagline || tenant.tagline || "Learn smarter. Score higher.";
  const heroImage: string | undefined = config.heroImage;

  const stats: StatItem[] = Array.isArray(config.stats) ? config.stats : [];
  const achievements: AchievementItem[] = Array.isArray(config.achievements) ? config.achievements : [];
  const faculty: FacultyItem[] = Array.isArray(config.faculty) ? config.faculty : [];
  const testimonials: TestimonialItem[] = Array.isArray(config.testimonials) ? config.testimonials : [];

  const faqs: FAQItem[] =
    Array.isArray(config.faqs) && config.faqs.length > 0
      ? config.faqs
      : [
          {
            question: "How do I access the test series after purchase?",
            answer:
              "Once you purchase (or enroll if free), the test series appears in your student dashboard under 'My Tests'.",
          },
          {
            question: "Can I access content on mobile?",
            answer:
              "Yes. The platform is mobile-responsive and works smoothly on phones and tablets.",
          },
          {
            question: "Do you provide performance analytics?",
            answer:
              "Yes. Students get score insights and progress tracking inside the dashboard.",
          },
          {
            question: "Is there any demo / preview available?",
            answer:
              "Many educators provide free tests or previews. Check the Featured section or login to see what's included.",
          },
        ];

  const socials: Record<string, string> = useMemo(() => {
    const s = (config.socials || {}) as Record<string, string>;
    const cleaned: Record<string, string> = {};
    Object.entries(s).forEach(([k, v]) => {
      if (isTruthyUrl(v)) cleaned[k] = v.trim();
    });
    return cleaned;
  }, [config.socials]);

  const educatorId = tenant.educatorId;
  const featuredIds: string[] = Array.isArray(config.featuredTestIds) ? config.featuredTestIds : [];
  const featuredKey = featuredIds.join(",");

  useEffect(() => {
    if (!educatorId) return;

    async function loadFeatured() {
      setLoadingFeatured(true);
      try {
        let qRef;

        if (featuredIds.length > 0) {
          const safeIds = featuredIds.slice(0, 10);
          qRef = query(
            collection(db, "educators", educatorId, "my_tests"),
            where(documentId(), "in", safeIds)
          );
        } else {
          qRef = query(
            collection(db, "educators", educatorId, "my_tests"),
            orderBy("createdAt", "desc"),
            limit(4)
          );
        }

        const snap = await getDocs(qRef);
        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as TestSeries[];

        setFeatured(rows);
      } catch {
        setFeatured([]);
      } finally {
        setLoadingFeatured(false);
      }
    }

    loadFeatured();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [educatorId, featuredKey]);

  const navLinks = [
    { label: "Curriculum", href: "#tests" },
    { label: "Reviews", href: "#reviews" },
    { label: "Faculty", href: "#faculty" },
    { label: "Why us", href: "#why-us" },
    { label: "FAQs", href: "#faq" },
  ];

  const socialIconMap: Record<string, any> = {
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    website: Globe,
    telegram: Send,
    whatsapp: MessageCircle,
  };

  return (
    <div id="top" className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-orange-500/30 selection:text-white">
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* FLOATING NAVBAR */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <nav className="rounded-full border border-neutral-800 bg-[#111111]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-2xl">
          <Link to="/" className="flex items-center gap-2.5 pl-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm">
              <span className="text-sm font-bold">
                {coachingName?.trim()?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <span className="text-base font-semibold text-white hidden sm:block">
              {coachingName}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-neutral-400 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 pr-1">
            <Link to="/login?role=student">
              <Button size="sm" className="hidden md:inline-flex rounded-full px-5 bg-orange-600 text-white hover:bg-orange-700 border-none transition-all">
                Enroll now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <button className="md:hidden text-neutral-300" onClick={() => setMobileOpen((s) => !s)}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="absolute top-16 left-0 w-full rounded-2xl border border-neutral-800 bg-[#111111]/95 backdrop-blur-xl p-4 md:hidden shadow-2xl flex flex-col gap-2">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <Link to="/login?role=student" onClick={() => setMobileOpen(false)} className="mt-2">
              <Button size="sm" className="w-full rounded-full bg-orange-600 hover:bg-orange-700 text-white border-none py-5">
                Enroll now
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 px-4 overflow-hidden">
        {/* Subtle orange glow in center */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-[#151515] px-4 py-1.5 text-xs font-medium text-neutral-300 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              {tagline}
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold leading-[1.05] tracking-tight text-white">
              Unlock your potential <br className="hidden sm:block" />
              with <span className="text-orange-500">{coachingName}</span>.
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 mt-6 leading-relaxed">
              Explore structured test series, expert faculty guidance, and performance insights — all designed to move your score up.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full justify-center">
              <Link to="/login?role=student">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-orange-600 px-8 py-6 text-base text-white hover:bg-orange-700 border-none transition-transform hover:scale-105"
                >
                  Enroll Today <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#tests">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 py-6 text-base border-neutral-700 text-white bg-neutral-900/50 hover:bg-neutral-800 hover:text-white">
                  View Curriculum
                </Button>
              </a>
            </div>

            {/* Avatars / Social Proof */}
            <div className="flex items-center gap-4 mt-10 pt-4 opacity-80">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-[#0a0a0a] bg-neutral-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm text-neutral-400 font-medium font-handwriting">
                Join thousands of successful students ahead of you.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS / RESULTS OVERVIEW */}
      {stats && stats.length > 0 && (
        <section className="py-20 border-t border-neutral-800/50 bg-[#0f0f0f]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                The <span className="text-orange-500">Results</span> Speak <br className="hidden sm:block"/> for Themselves
              </h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {stats.slice(0, 6).map((s, idx) => (
                <div key={idx} className="p-8 rounded-2xl border border-neutral-800 bg-[#161616] flex flex-col items-center text-center hover:border-orange-500/30 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">{s.value}</h3>
                  <p className="text-neutral-400 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HIGHLIGHTS / SPLIT SECTION */}
      <section id="why-us" className="py-24 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-start">
            <div className="sticky top-32">
              <Badge className="bg-neutral-900 border-neutral-800 text-neutral-300 mb-6 hover:bg-neutral-800">Why choose us</Badge>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-white mb-6">
                Introducing the ultimate preparation toolkit.
              </h2>
              <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                Same dedication, better presentation. Built for consistency and engineered to give you a powerful competitive edge in your exams.
              </p>
              <Link to="/signup">
                <Button className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-5 border-none">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-6">
              {(achievements.length ? achievements : [
                { title: "Structured Test Series", description: "Chapter-wise, subject-wise, and full mocks designed by experts." },
                { title: "Expert Faculty", description: "Learn directly from mentors who know how to improve accuracy and speed." },
                { title: "Performance Insights", description: "Track your improvement and focus heavily on weak areas." },
              ]).map((a, idx) => (
                <div key={idx} className="p-8 rounded-2xl border border-neutral-800 bg-[#141414] hover:bg-[#1a1a1a] transition-colors flex gap-6 items-start">
                  <div className="mt-1 h-12 w-12 shrink-0 rounded-xl bg-neutral-900 border border-neutral-800 text-orange-500 flex items-center justify-center">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{a.title}</h3>
                    <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
                      {a.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM / EXAM CENTER */}
      <section id="tests" className="py-24 bg-[#0c0c0c] border-y border-neutral-800/50 relative">
        <div className="absolute left-0 top-0 w-[400px] h-[400px] bg-orange-600/5 blur-[150px] pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Curriculum Overview
            </h2>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Unlock the <span className="text-orange-500 font-semibold">secret sauce</span> behind top scorers.
            </p>
          </div>

          {loadingFeatured ? (
            <div className="py-20 flex justify-center text-neutral-500">
              <Loader2 className="h-6 w-6 animate-spin mr-3 text-orange-500" />
              Loading curriculum...
            </div>
          ) : featured.length === 0 ? (
            <div className="py-20 text-center text-neutral-500 border border-neutral-800 rounded-2xl bg-[#111]">
              No series available right now. Check back soon.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 6).map((t) => (
                <div key={t.id} className="group flex flex-col rounded-2xl border border-neutral-800 bg-[#141414] overflow-hidden hover:border-neutral-600 transition-all">
                  <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden">
                    {t.coverImage ? (
                      <img src={t.coverImage} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600">
                        <FileText className="h-10 w-10 opacity-40" />
                      </div>
                    )}
                    {t.subject && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-xs font-semibold bg-black/60 backdrop-blur-md text-white rounded-full border border-white/10">
                          {t.subject}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{t.title}</h3>
                    <p className="text-sm text-neutral-400 line-clamp-2 mb-6 flex-grow">
                      {t.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                      <span className="text-lg font-bold text-white">
                        {t.price === "Included" || t.price == 0 ? (
                          <span className="text-orange-500">Free Access</span>
                        ) : (
                          `$${t.price}`
                        )}
                      </span>
                      <Link to="/login?role=student">
                        <Button size="sm" className="rounded-full bg-neutral-800 hover:bg-orange-600 text-white border-none transition-colors">
                          Enroll <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
             <Link to="/courses">
              <Button variant="outline" className="rounded-full bg-transparent border-neutral-700 text-white hover:bg-neutral-800">
                View All Series
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* REVIEWS / TESTIMONIALS */}
      <section id="reviews" className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Don't just take our word for it.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {(testimonials.length ? testimonials : []).slice(0, 6).map((t, idx) => (
              <div key={idx} className="p-8 rounded-2xl border border-neutral-800 bg-[#141414] relative">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-orange-500/20" />
                
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-12 w-12 border border-neutral-700">
                    <AvatarImage src={t.avatar} />
                    <AvatarFallback className="bg-neutral-800 text-neutral-300">{initials(t.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-xs text-neutral-500">{t.course || "Student"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: Math.max(1, Math.min(5, t.rating || 5)) }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-orange-500 text-orange-500" />
                  ))}
                </div>

                <p className="text-neutral-300 text-sm leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>
            ))}
          </div>
          
          {(!testimonials || testimonials.length === 0) && (
            <div className="text-sm text-neutral-500 text-center border border-neutral-800 rounded-2xl bg-[#111] p-10">
              No reviews available yet.
            </div>
          )}
        </div>
      </section>

      {/* FACULTY SECTION */}
      {faculty && faculty.length > 0 && (
        <section id="faculty" className="py-24 bg-[#0c0c0c] border-y border-neutral-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Meet the Experts</h2>
              <p className="text-neutral-400">Learn from the best minds in the industry.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {faculty.slice(0, 6).map((f, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-neutral-800 bg-[#141414] flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-neutral-800">
                      <AvatarImage src={f.image} className="object-cover" />
                      <AvatarFallback className="bg-neutral-800 text-neutral-300 text-lg">{initials(f.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-lg text-white">{f.name}</p>
                      <p className="text-xs font-medium text-orange-500 uppercase tracking-wider mt-1">
                        {[f.designation, f.subject].filter(Boolean).join(" • ") || "Faculty"}
                      </p>
                    </div>
                  </div>
                  {f.bio && (
                    <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3 mt-2">
                      {f.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQS */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Questions</h2>
          <p className="text-neutral-400 text-lg">Everything you need to know about the platform.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <Accordion key={idx} type="single" collapsible className="w-full">
              <AccordionItem value={`item-${idx}`} className="border border-neutral-800 bg-[#141414] rounded-2xl px-6 py-2 overflow-hidden data-[state=open]:border-neutral-600 transition-colors">
                <AccordionTrigger className="text-left text-white hover:no-underline py-4 text-lg font-medium [&[data-state=open]>svg]:rotate-180">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-400 text-base leading-relaxed pb-6">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
        
        <div className="mt-12 text-center text-neutral-400">
          Still got questions? Reach out, we're here to help.
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-24 relative overflow-hidden border-t border-neutral-800/50">
        <div className="absolute inset-0 bg-orange-600/5" />
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Enroll Now & Get <span className="text-orange-500">Instant Access</span>
          </h2>
          <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            Join students learning with {coachingName}. Login to access your dashboard and start practicing immediately.
          </p>
          <Link to="/login?role=student">
            <Button size="lg" className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-10 py-7 text-lg border-none shadow-[0_0_40px_rgba(234,88,12,0.3)] transition-all hover:scale-105">
              Enroll Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800 bg-[#0a0a0a] pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid gap-12 md:grid-cols-4 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white">
                  <span className="text-sm font-bold">{coachingName?.trim()?.[0]?.toUpperCase() || "U"}</span>
                </div>
                <div className="font-bold text-xl text-white">{coachingName}</div>
              </div>
              <p className="text-sm text-neutral-500 mb-6 max-w-xs">{tagline}</p>
              <div className="flex gap-4">
                {Object.entries(socials).map(([k, v]) => {
                  const Icon = socialIconMap[k];
                  if (!Icon) return null;
                  return (
                    <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors" title={k}>
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="font-semibold text-white mb-6">Links</div>
              <div className="space-y-4 text-sm text-neutral-400">
                <Link className="block hover:text-orange-500 transition-colors" to="/">Home</Link>
                <Link className="block hover:text-orange-500 transition-colors" to="/courses">Curriculum</Link>
                <Link className="block hover:text-orange-500 transition-colors" to="/login?role=student">Student Login</Link>
              </div>
            </div>

            <div>
              <div className="font-semibold text-white mb-6">Contact</div>
              <div className="space-y-4 text-sm text-neutral-400">
                {tenant.contact?.email ? (
                  <a className="block hover:text-white transition-colors" href={`mailto:${tenant.contact.email}`}>{tenant.contact.email}</a>
                ) : null}
                {tenant.contact?.phone ? (
                  <a className="block hover:text-white transition-colors" href={`tel:${tenant.contact.phone}`}>{tenant.contact.phone}</a>
                ) : null}
                {tenant.contact?.address ? (
                  <span className="block leading-relaxed">{tenant.contact.address}</span>
                ) : null}
                {!tenant.contact?.phone && !tenant.contact?.email && !tenant.contact?.address ? (
                  <span>Reach out via our social channels.</span>
                ) : null}
              </div>
            </div>

            <div>
              <div className="font-semibold text-white mb-6">Others</div>
              <div className="space-y-4 text-sm text-neutral-400">
                <a href="#" className="block hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="block hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
            <span>© {new Date().getFullYear()} {coachingName}. All rights reserved.</span>
            <span>Powered by <span className="text-neutral-400 font-medium">UNIV.LIVE</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}