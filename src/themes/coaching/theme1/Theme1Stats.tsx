import { motion } from "framer-motion";
import {
  Users,
  Trophy,
  Target,
  GraduationCap,
  Star,
  TrendingUp,
} from "lucide-react";
import { useTenant } from "@/contexts/TenantProvider";

const iconMap: Record<string, React.ElementType> = {
  users: Users,
  trophy: Trophy,
  target: Target,
  "graduation-cap": GraduationCap,
  star: Star,
  "trending-up": TrendingUp,
};

export default function Theme1Stats() {
  const { tenant } = useTenant();

  // Index.tsx already ensures tenant exists
  if (!tenant) return null;

  const stats = tenant.websiteConfig?.stats || [];

  const colors = [
    "bg-pastel-mint text-green-700",
    "bg-pastel-yellow text-yellow-700",
    "bg-pastel-lavender text-purple-700",
    "bg-pastel-peach text-orange-700",
  ];

  if (!stats.length) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat: any, index: number) => {
            const Icon =
              iconMap[stat.icon as string] || Users;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-soft p-6 text-center"
              >
                <div
                  className={`h-12 w-12 rounded-2xl ${
                    colors[index % colors.length]
                  } flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="text-3xl font-bold mb-1">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

