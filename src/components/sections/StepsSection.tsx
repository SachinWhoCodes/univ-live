import { motion } from "framer-motion";
import { Clipboard, Users, BarChart3, Rocket, ArrowRight } from "lucide-react";
import { ButtonWithIcon } from "@/components/ui/button";
import { Link } from "react-router-dom";

import step1Image from "@/assets/step-1-signup.png";
import step2Image from "@/assets/step-2-students.png";
import step3Image from "@/assets/step-3-analytics.png";
import step4Image from "@/assets/step-4-scale.png";

const steps = [
  {
    icon: Clipboard,
    number: "01",
    title: "Sign Up & Create Your Platform",
    description: "Register your coaching center and set up your branded test platform in just a few clicks.",
    image: step1Image,
    color: "from-blue-500 to-primary",
  },
  {
    icon: Users,
    number: "02",
    title: "Add Your Students",
    description: "Import student data or let them self-register. Organize them by batches or subjects.",
    image: step2Image,
    color: "from-primary to-accent",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Assign Tests & Track Progress",
    description: "Schedule mock tests, monitor real-time performance, and access detailed analytics.",
    image: step3Image,
    color: "from-accent to-purple-600",
  },
  {
    icon: Rocket,
    number: "04",
    title: "Scale Your Success",
    description: "Grow your coaching center with data-driven insights and student success stories.",
    image: step4Image,
    color: "from-purple-600 to-pink-500",
  },
];

export function StepsSection() {
  return (
    <section className="section-padding section-2">
      <div className="container-main">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Launch Your Test Platform with Univ.live in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">4 Steps</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative bg-card rounded-2xl border border-border shadow-soft hover-lift overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Step number badge */}
              <div className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-sm flex items-center justify-center shadow-lg z-10`}>
                {step.number}
              </div>
              
              {/* Step Image */}
              <div className="w-full h-40 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                <img 
                  src={step.image} 
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                  <step.icon className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>

              {/* Connecting line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-24 -right-3 w-6 h-0.5 bg-gradient-to-r from-border to-primary/30" />
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/signup">
            <ButtonWithIcon variant="hero" size="lg" className="group">
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </ButtonWithIcon>
          </Link>
          <Link to="/contact">
            <ButtonWithIcon variant="heroOutline" size="lg">
              Book a Demo
            </ButtonWithIcon>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
