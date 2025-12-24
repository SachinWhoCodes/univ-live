import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface Theme1FAQProps {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "What is CUET and why is it important?",
    answer: "CUET (Common University Entrance Test) is a national-level entrance exam conducted by NTA for admission to undergraduate programs in central and participating universities across India. It's crucial as it's now mandatory for admission to top universities like DU, JNU, BHU, and 200+ others."
  },
  {
    question: "How is the course delivered?",
    answer: "Our courses include live interactive classes, recorded video lectures, comprehensive study materials, practice tests, and AI-powered performance analytics. All content is accessible 24/7 through our mobile app and web platform."
  },
  {
    question: "What is the validity of the courses?",
    answer: "All courses are valid till the CUET exam date plus one additional month for result preparation and counseling support. You get unlimited access during this period."
  },
  {
    question: "Can I access the courses on mobile?",
    answer: "Yes! Our platform is fully mobile-responsive and we also have dedicated iOS and Android apps for a seamless learning experience on any device."
  },
  {
    question: "Is there any installment option for payment?",
    answer: "Yes, we offer flexible EMI options through various payment partners. You can also choose to pay in 2-3 installments for higher-value courses."
  },
  {
    question: "What if I need to change my subject combination?",
    answer: "You can request a subject change within 7 days of enrollment. After that, we offer discounted add-on pricing for additional subjects."
  },
];

export default function Theme1FAQ({ items = defaultFAQs, title, subtitle }: Theme1FAQProps) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1 rounded-full">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title || "Frequently Asked Questions"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {subtitle || "Find answers to common questions about our courses and CUET preparation"}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="card-soft border-0 px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

