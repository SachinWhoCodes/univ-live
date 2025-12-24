import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Users, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/contexts/TenantProvider";

export default function Theme1Hero() {
  const { tenant } = useTenant();

  // Index.tsx already guards loading + null tenant
  if (!tenant) return null;

  const stats = tenant.websiteConfig?.stats || [];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-pastel-mint/30 via-background to-pastel-lavender/30 py-16 lg:py-24">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Star className="h-4 w-4 fill-primary" />
              Trusted by {stats[0]?.value || "10,000+"} Students
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {tenant.websiteConfig?.heroTitle || tenant.coachingName}
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              {tenant.websiteConfig?.heroSubtitle || tenant.tagline}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button size="lg" className="gradient-bg rounded-full text-lg px-8" asChild>
                <Link to="/courses">
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg px-8">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 mt-10 justify-center lg:justify-start">
              <StatCard icon={<Users />} stat={stats[0]} />
              <StatCard icon={<Award />} stat={stats[1]} />
              <StatCard icon={<BookOpen />} stat={stats[2]} />
            </div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-4">
                {stats.slice(0, 4).map((s: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="card-soft p-4 text-center"
                  >
                    <div className="text-3xl font-bold text-primary">
                      {s?.value}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {s?.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -right-4 bg-white dark:bg-card rounded-2xl shadow-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <div className="text-sm">
                    <p className="font-semibold">AIR 45</p>
                    <p className="text-xs text-muted-foreground">Our Student</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-white dark:bg-card rounded-2xl shadow-lg p-3"
              >
                <p className="text-xs font-medium">500+ enrolled today</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, stat }: { icon: React.ReactNode; stat?: any }) {
  if (!stat) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="h-10 w-10 rounded-full bg-pastel-mint flex items-center justify-center">
        {icon}
      </div>
      <div className="text-left">
        <p className="font-bold text-lg">{stat.value}</p>
        <p className="text-xs text-muted-foreground">{stat.label}</p>
      </div>
    </div>
  );
}

