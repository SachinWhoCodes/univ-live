import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Users, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTenantProfile } from "@/mock/tenantWebsiteMock";

export default function Theme1Hero() {
  const { tenantSlug } = useParams();
  const tenant = getTenantProfile(tenantSlug || "");

  if (!tenant) return null;

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
              Trusted by {tenant.stats[0]?.value || "10,000+"} Students
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {tenant.heroTitle}
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              {tenant.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button size="lg" className="gradient-bg rounded-full text-lg px-8" asChild>
                <Link to={`/t/${tenantSlug}/courses`}>
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
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-pastel-yellow flex items-center justify-center">
                  <Users className="h-5 w-5 text-yellow-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">{tenant.stats[0]?.value}</p>
                  <p className="text-xs text-muted-foreground">{tenant.stats[0]?.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-pastel-mint flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">{tenant.stats[1]?.value}</p>
                  <p className="text-xs text-muted-foreground">{tenant.stats[1]?.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-pastel-lavender flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">{tenant.stats[2]?.value}</p>
                  <p className="text-xs text-muted-foreground">{tenant.stats[2]?.label}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Illustration / Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-8 lg:p-12">
              {/* Decorative Cards */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="card-soft p-4 text-center"
                >
                  <div className="text-3xl font-bold text-primary">{tenant.stats[2]?.value || "200+"}</div>
                  <p className="text-sm text-muted-foreground mt-1">{tenant.stats[2]?.label || "Top Rankers"}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="card-soft p-4 text-center bg-pastel-yellow"
                >
                  <div className="text-3xl font-bold text-yellow-700">{tenant.stats[1]?.value || "98.5%"}</div>
                  <p className="text-sm text-yellow-700/70 mt-1">{tenant.stats[1]?.label || "Success Rate"}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="card-soft p-4 text-center bg-pastel-mint"
                >
                  <div className="text-3xl font-bold text-green-700">{tenant.stats[3]?.value || "15+"}</div>
                  <p className="text-sm text-green-700/70 mt-1">{tenant.stats[3]?.label || "Years Exp."}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="card-soft p-4 text-center bg-pastel-lavender"
                >
                  <div className="text-3xl font-bold text-purple-700">4.9★</div>
                  <p className="text-sm text-purple-700/70 mt-1">Student Rating</p>
                </motion.div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -right-4 bg-white dark:bg-card rounded-2xl shadow-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Award className="h-4 w-4 text-green-600" />
                  </div>
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
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">A</div>
                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">B</div>
                    <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold">C</div>
                  </div>
                  <p className="text-xs font-medium">500+ enrolled today</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

