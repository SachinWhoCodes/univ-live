import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Monitor, BarChart3, Brain, Trophy, TrendingUp, 
  BookOpen, Target, ArrowRight, Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Monitor,
    title: "Realistic CBT Experience",
    description: "Practice on a test interface that mirrors actual competitive exams like CUET, JEE, and NEET.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Track your performance across subjects, topics, and difficulty levels with visual insights.",
  },
  {
    icon: Brain,
    title: "AI-Powered Review",
    description: "Get intelligent analysis of your answers with personalized improvement suggestions.",
  },
  {
    icon: Trophy,
    title: "Rankings & Leaderboards",
    description: "See where you stand among peers. Compete in batch and institute-level rankings.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your growth over time with performance trends and milestone achievements.",
  },
  {
    icon: BookOpen,
    title: "Subject-wise Reports",
    description: "Deep dive into each subject with topic-level breakdowns and strength analysis.",
  },
];

const benefits = [
  "Exam-like test environment",
  "Instant result analysis",
  "Works on all devices",
  "Offline mode support",
  "Detailed solutions",
  "Performance predictions",
];

export default function ForStudents() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-start/10 text-sm font-medium text-brand-blue mb-4">
                For Students
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-bold mb-6">
                Practice Smarter,{" "}
                <span className="gradient-text">Score Higher</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Experience exam-like CBT practice with AI-powered analytics. Know exactly where you stand and how to improve.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-brand-blue shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="xl" asChild className="group">
                  <Link to="/signup?role=student">
                    Start Practicing
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/our-courses">Browse Courses</Link>
                </Button>
              </div>
            </motion.div>

            {/* CBT Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 gradient-bg opacity-20 blur-3xl rounded-3xl" />
              <div className="relative bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
                {/* Test Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-brand-blue" />
                    <span className="font-medium text-sm">Physics Mock Test - 3</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                    01:45:30
                  </div>
                </div>
                
                {/* Test Content */}
                <div className="p-6 bg-gradient-to-br from-surface to-background">
                  <div className="mb-4">
                    <span className="text-sm text-muted-foreground">Question 15 of 50</span>
                    <h4 className="font-medium mt-2">
                      A particle is projected with velocity v at an angle θ with horizontal. 
                      The time of flight is:
                    </h4>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {["T = 2v sinθ / g", "T = v sinθ / g", "T = 2v cosθ / g", "T = v cosθ / g"].map((option, i) => (
                      <div
                        key={option}
                        className={`p-3 rounded-lg border ${i === 0 ? "border-brand-start bg-brand-start/5" : "border-border"} cursor-pointer hover:border-brand-start/50 transition-colors`}
                      >
                        <span className="text-sm">{String.fromCharCode(65 + i)}. {option}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">Mark for Review</Button>
                    <Button variant="gradient" size="sm">Save & Next</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Tools to Ace Your Exams
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to prepare effectively and track your progress.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-card rounded-3xl p-12 border border-border/50"
          >
            <h2 className="text-3xl font-display font-bold mb-4">
              Start Your Exam Prep Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of students improving their scores with UNIV.LIVE
            </p>
            <Button variant="hero" size="xl" asChild className="group">
              <Link to="/signup?role=student">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
