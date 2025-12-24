import { motion } from "framer-motion";
import { GraduationCap, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTenant } from "@/contexts/TenantProvider";

export default function Theme1Faculty() {
  const { tenant } = useTenant();

  if (!tenant) return null;

  const faculty = tenant.websiteConfig?.faculty || [];

  if (!faculty.length) return null;

  return (
    <section className="py-20 bg-pastel-lavender/20 dark:bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1 rounded-full">
              Expert Faculty
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Learn from the Best
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our faculty comprises top educators with decades of experience in CUET preparation
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {faculty.map((member: any, index: number) => (
            <motion.div
              key={member.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-soft border-0 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20 shrink-0">
                      <AvatarImage src={member.image} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl font-bold">
                        {member.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {member.name}
                      </h3>
                      <p className="text-sm text-primary font-medium">
                        {member.designation}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="rounded-full text-xs">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {member.subject}
                        </Badge>

                        <Badge variant="outline" className="rounded-full text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {member.experience}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-4">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

