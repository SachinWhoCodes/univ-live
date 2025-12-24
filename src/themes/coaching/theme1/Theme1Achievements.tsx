import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Award, Target, Users, Crown, GraduationCap, Video, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTenantProfile } from "@/mock/tenantWebsiteMock";

const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy,
  award: Award,
  target: Target,
  users: Users,
  crown: Crown,
  "graduation-cap": GraduationCap,
  video: Video,
  "file-text": FileText,
};

const colors = [
  "bg-pastel-yellow text-yellow-700",
  "bg-pastel-mint text-green-700",
  "bg-pastel-lavender text-purple-700",
  "bg-pastel-peach text-orange-700",
];

export default function Theme1Achievements() {
  const { tenantSlug } = useParams();
  const tenant = getTenantProfile(tenantSlug || "");

  if (!tenant) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1 rounded-full">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Achievements & Excellence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Years of dedication and expertise in CUET preparation have led to exceptional results
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tenant.achievements.map((achievement, index) => {
            const Icon = iconMap[achievement.icon] || Trophy;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-soft border-0 text-center h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`h-16 w-16 rounded-2xl ${colors[index % colors.length]} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

