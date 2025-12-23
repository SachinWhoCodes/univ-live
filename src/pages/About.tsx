import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Target, Users, Award, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { value: "500+", label: "Coaching Institutes" },
  { value: "50K+", label: "Active Students" },
  { value: "1M+", label: "Tests Taken" },
  { value: "15+", label: "Cities" },
];

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "Making quality education accessible to every student and empowering coaching institutes with technology.",
  },
  {
    icon: Users,
    title: "Student-First",
    description: "Every feature we build starts with one question: How does this help students succeed?",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We're committed to delivering the best possible platform for educators and learners.",
  },
  {
    icon: Rocket,
    title: "Innovation",
    description: "Leveraging AI and cutting-edge technology to transform the education landscape.",
  },
];

const team = [
  {
    name: "Arjun Mehta",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Priya Sharma",
    role: "Co-Founder & CTO",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Vikram Singh",
    role: "Head of Product",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Ananya Patel",
    role: "Head of Education",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
  },
];

const milestones = [
  { year: "2022", event: "Founded in Delhi with a mission to digitize coaching" },
  { year: "2023", event: "Launched AI website generation. 100+ institutes onboarded" },
  { year: "2024", event: "Crossed 50,000 active students. Expanded to 15 cities" },
  { year: "2025", event: "Launched CBT platform. 1M+ tests conducted" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-start/10 text-sm font-medium text-brand-blue mb-4">
              About Us
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">
              Transforming Education with{" "}
              <span className="gradient-text">Technology</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              We're on a mission to empower every coaching institute with cutting-edge 
              technology and help every student achieve their dreams.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl lg:text-5xl font-display font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-4 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/50 text-center"
              >
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="container mx-auto px-4 lg:px-8 py-20 bg-surface/50 rounded-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind UNIV.LIVE
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover border-4 border-card shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-full gradient-bg opacity-0 hover:opacity-20 transition-opacity" />
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="container mx-auto px-4 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Key milestones in our mission to transform education
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 pb-8 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-brand-start to-brand-end mt-2" />
                  )}
                </div>
                <div className="pt-2">
                  <p className="text-foreground">{milestone.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-card rounded-3xl p-12 border border-border/50"
          >
            <h2 className="text-3xl font-display font-bold mb-4">
              Join Our Mission
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Be part of the education revolution. Partner with us today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild className="group">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
