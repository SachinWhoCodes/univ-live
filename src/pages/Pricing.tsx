import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Check, Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small coaching centers just getting started",
    monthlyPrice: 2999,
    yearlyPrice: 29990,
    features: [
      "Branded subdomain (yourname.univ.live)",
      "Up to 100 active students",
      "10 test imports per month",
      "Basic analytics dashboard",
      "Email support",
      "Student portal access",
      "Mobile responsive website",
    ],
    notIncluded: [
      "Custom domain",
      "AI-powered analytics",
      "White-label solution",
      "API access",
    ],
    highlighted: false,
    cta: "Start Free Trial",
  },
  {
    name: "Growth",
    description: "Best for growing institutes looking to scale",
    monthlyPrice: 7999,
    yearlyPrice: 79990,
    features: [
      "Everything in Starter",
      "Up to 500 active students",
      "Unlimited test imports",
      "AI-powered analytics & insights",
      "Custom domain support",
      "Priority email & chat support",
      "Student mobile app access",
      "Advanced reporting",
      "Batch management",
    ],
    notIncluded: [
      "White-label solution",
      "API access",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    description: "For large institutions with custom requirements",
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      "Everything in Growth",
      "Unlimited students",
      "White-label solution",
      "Full API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee (99.9% uptime)",
      "On-premise deployment option",
      "Custom training sessions",
    ],
    notIncluded: [],
    highlighted: false,
    cta: "Contact Sales",
  },
];

const faqs = [
  {
    question: "What's included in the free trial?",
    answer: "The 14-day free trial includes full access to all features of the Growth plan. No credit card required to start.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Is there a student limit on each plan?",
    answer: "Yes, Starter supports up to 100 students, Growth supports up to 500 students. Enterprise has no limit.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes! Annual billing gives you 2 months free (approximately 17% savings).",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, UPI, net banking, and PayTM. Enterprise customers can pay via invoice.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-start/10 text-sm font-medium text-brand-blue mb-4">
              Pricing
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-6">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your coaching institute. All plans include a 14-day free trial.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-secondary/50 rounded-full p-1.5">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  !isYearly ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isYearly ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
                  Save 17%
                </span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-brand-start/5 to-brand-end/5 border-2 border-brand-start/30 shadow-glow"
                    : "bg-card border border-border/50"
                }`}
              >
                {/* Popular Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full gradient-bg">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">Most Popular</span>
                    </div>
                  </div>
                )}

                {/* Plan Info */}
                <div className="mb-6">
                  <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  {plan.monthlyPrice ? (
                    <>
                      <span className="text-5xl font-display font-bold">
                        ₹{isYearly ? Math.round(plan.yearlyPrice! / 12) : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                      {isYearly && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Billed ₹{plan.yearlyPrice?.toLocaleString()} yearly
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-4xl font-display font-bold">Custom</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.highlighted ? "gradient" : "outline"}
                  className="w-full"
                  size="lg"
                  asChild
                >
                  <Link to={plan.cta === "Contact Sales" ? "/contact" : "/signup"}>
                    {plan.cta}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about our pricing
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card rounded-xl border border-border/50 px-6"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
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
              Still have questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our team is here to help you find the perfect plan
            </p>
            <Button variant="gradient" size="xl" asChild className="group">
              <Link to="/contact">
                Contact Sales
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
