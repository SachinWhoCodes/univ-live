import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";

const TermsOfUseTenant = () => {
  return (
    <Layout>
      <section className="section-padding section-1">
        <div className="container-main">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Terms of Use</h1>
            <p className="text-muted-foreground mb-12">Last updated: 24/01/2026</p>

            <div className="prose prose-lg max-w-none">
              <p>
                By accessing or using our services, you agree to comply with the following terms and conditions.
              </p>

              <h2>Use of Services</h2>
              <p>Our educational content, materials, and services are intended solely for personal academic use. Any unauthorized reproduction, distribution, or commercial use is strictly prohibited.</p>

              <h2>Enrollment and Participation</h2>
              <p>Students are expected to provide accurate information during enrollment and maintain discipline, integrity, and respectful conduct throughout their association with us.</p>

              <h2>Intellectual Property</h2>
              <p>All study materials, content, and resources provided are the intellectual property of the coaching center and are protected by applicable laws.</p>

              <h2>Fees and Payments</h2>
              <p>All fees paid are subject to the policies communicated at the time of enrollment. Fees once paid are non-transferable unless stated otherwise.</p>

              <h2>Limitation of Liability</h2>
              <p>We strive to provide accurate and high-quality educational support; however, we do not guarantee specific results or outcomes. The coaching center shall not be held liable for individual academic performance.</p>

              <h2>Changes to Terms</h2>
              <p>We reserve the right to update or modify these terms at any time. Continued use of our services indicates acceptance of the updated terms.</p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsOfUseTenant;
