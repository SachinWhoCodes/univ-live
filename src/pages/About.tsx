import  Layout  from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Target, Heart, Lightbulb, Users } from "lucide-react";

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding section-1">
        <div className="container-main">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Univ.live</span>
            </h1>
            <p className="text-2xl text-primary font-semibold mb-4">
              Tayari Exam Jaisi.
            </p>
            <p className="text-lg text-muted-foreground">
              Univ.live is a technology platform built to help coaching centers deliver <strong className="text-foreground">real CUET CBT exam preparation</strong>—exactly the way the exam is conducted.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section-padding section-2">
        <div className="container-main">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card rounded-3xl p-8 lg:p-12 border border-border shadow-card">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                We exist to solve one simple but critical problem: most mock tests are still conducted on <strong className="text-foreground">OMR sheets</strong>, while the actual CUET exam is <strong className="text-foreground">computer-based (CBT)</strong>. This gap often leads to poor time management, confusion, and unnecessary panic on exam day.
              </p>
              <p className="text-lg text-primary font-semibold">
                Univ.live bridges this gap by enabling coaching centers to offer exam-realistic CBT practice to their students.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="section-padding section-3">
        <div className="container-main">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">What We Do</h2>
            <p className="text-muted-foreground text-lg">
              Univ.live enables coaching centers to create their <strong className="text-foreground">own CUET CBT test platform</strong> in just a few clicks.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              "Conduct full-length CUET CBT mock tests",
              "Provide students with real exam-like practice",
              "Track student performance using AI-powered analytics",
              "Eliminate printing and manual checking costs",
              "Scale testing without technical complexity",
            ].map((item, index) => (
              <motion.div
                key={item}
                className="bg-card rounded-2xl p-6 border border-border shadow-soft"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 text-primary-foreground font-bold">
                  {index + 1}
                </div>
                <p className="text-foreground font-medium">{item}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center text-muted-foreground text-lg mt-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Our platform is <strong className="text-foreground">teacher-first</strong>, intuitive, and built specifically for coaching centers across India.
          </motion.p>
        </div>
      </section>

      {/* Why Univ.live */}
      <section className="section-padding section-4">
        <div className="container-main">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Univ.live</h2>
            <p className="text-muted-foreground text-lg">
              We believe preparation should feel exactly like the real exam.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Target, title: "Real CBT exam simulation" },
              { icon: Lightbulb, title: "High-quality test content curated by expert academic teams" },
              { icon: Users, title: "Actionable analytics for teachers and students" },
              { icon: Heart, title: "Pay-per-student pricing with zero upfront cost" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="bg-card rounded-2xl p-6 border border-border shadow-soft text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <p className="font-medium">{item.title}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center text-muted-foreground space-y-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p>No installations.</p>
            <p>No fixed fees.</p>
            <p>No technical barriers.</p>
          </motion.div>
        </div>
      </section>

      {/* Built for Coaching Centers */}
      <section className="section-padding section-5">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Built for Coaching Centers</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Univ.live is designed for:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Independent coaching centers</li>
                  <li>Small and mid-sized institutes</li>
                  <li>Teachers preparing students for CUET (Commerce & Humanities)</li>
                </ul>
                <p className="text-foreground font-medium mt-6">
                  We don't replace coaching centers. We <strong className="text-primary">empower them with the right technology</strong>.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 lg:p-12"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-bold mb-4">Our Pricing Philosophy</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>Access the platform for free.</p>
                <p>Pay only when students enroll.</p>
                <div className="border-t border-border pt-4 mt-4">
                  <p className="font-medium text-foreground">This ensures:</p>
                  <ul className="space-y-1 mt-2">
                    <li>✓ No upfront investment</li>
                    <li>✓ Low risk for coaching centers</li>
                    <li>✓ Complete flexibility to grow at your own pace</li>
                  </ul>
                </div>
                <p className="text-primary font-semibold mt-4">Simple. Transparent. Sustainable.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder's Note */}
      <section className="section-padding section-1">
        <div className="container-main">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card rounded-3xl p-8 lg:p-12 border border-border shadow-card">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Founder's Note</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  When we started Univ.live, the problem was personal.
                </p>
                <p>
                  We saw students preparing seriously for CUET, yet practicing on <strong className="text-foreground">OMR sheets</strong>, while the actual exam was entirely <strong className="text-foreground">computer-based</strong>. Despite good preparation, many students struggled with time management, navigation, and exam pressure on the final day.
                </p>
                <p>The issue wasn't effort.</p>
                <p>The issue was a <strong className="text-foreground">mismatch between preparation and the real exam</strong>.</p>
                <p>
                  We built Univ.live to fix this—by giving coaching centers access to <strong className="text-foreground">simple, affordable CBT infrastructure</strong> that mirrors the actual CUET exam environment. No complex setup. No heavy costs. Just meaningful preparation.
                </p>
                <p className="font-medium text-foreground">Our focus has always been clear:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Support teachers, not replace them</li>
                  <li>Make CBT preparation accessible to every coaching center</li>
                  <li>Keep pricing transparent and risk-free</li>
                </ul>
                <p className="text-xl font-bold text-primary mt-6">
                  Tayari Exam Jaisi.
                </p>
                <p>
                  When students practice the way they're tested, confidence improves—and so do results.
                </p>
                <p className="text-foreground font-semibold mt-6">— Founders, Univ.live</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision */}
      <section className="section-padding section-2">
        <div className="container-main">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Our Vision</h2>
            <p className="text-lg text-muted-foreground mb-4">
              To make <strong className="text-foreground">exam-realistic CBT preparation accessible to every coaching center in India</strong>, regardless of size or location.
            </p>
            <p className="text-xl text-primary font-semibold">
              Because when preparation matches the exam, results follow naturally.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;