import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";

const PrivacyPolicyTenant = () => {
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
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground mb-12">Last updated: 24/01/2026</p>

            <div className="prose prose-lg max-w-none">
              <p>
                We respect your privacy and are committed to protecting the personal information of our students, parents, and users.
              </p>

              <h2>Information We Collect</h2>
              <p>We may collect basic personal information such as name, contact details, academic information, and usage data when you register, enroll, or interact with our services.</p>

              <h2>Use of Information</h2>
              <p>The information collected is used solely for:</p>
              <ul>
                <li>Providing educational services</li>
                <li>Communication related to classes, updates, or support</li>
                <li>Improving our academic offerings and user experience</li>
                <li>Maintaining records and internal analysis</li>
              </ul>

              <h2>Data Protection</h2>
              <p>We take reasonable measures to safeguard your information against unauthorized access, misuse, or disclosure. Your personal data is handled with care and confidentiality.</p>

              <h2>Information Sharing</h2>
              <p>We do not sell, rent, or share personal information with third parties, except when required by law or for essential service operations.</p>

              <h2>Consent</h2>
              <p>By using our services, you consent to the collection and use of information as outlined in this policy.</p>

            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicyTenant;
