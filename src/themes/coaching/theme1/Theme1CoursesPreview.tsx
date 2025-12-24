import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  BookOpen,
  Users,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTenant } from "@/contexts/TenantProvider";

const badgeColors: Record<string, string> = {
  "Most Popular": "bg-gradient-to-r from-primary to-accent text-white",
  New: "bg-green-500 text-white",
  "Best Value": "bg-yellow-500 text-white",
};

const subjectColors: Record<string, string> = {
  "All Subjects": "bg-pastel-lavender",
  "English & GT": "bg-pastel-mint",
  "Business Studies": "bg-pastel-yellow",
  Economics: "bg-pastel-peach",
  Mathematics: "bg-pastel-pink",
};

export default function Theme1CoursesPreview() {
  const { tenant } = useTenant();

  if (!tenant) return null;

  const courses = tenant.websiteConfig?.courses?.slice(0, 4) || [];

  if (!courses.length) return null;

  return (
    <section className="py-20 bg-pastel-cream/30 dark:bg-muted/10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1 rounded-full">
              Our Courses
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Most Popular Courses
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our expertly designed courses to crack CUET 2025 with confidence
            </p>
          </motion.div>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course: any, index: number) => (
            <CourseCard key={course.id || index} course={course} index={index} />
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Button size="lg" className="gradient-bg rounded-full" asChild>
            <Link to="/courses">
              View All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function CourseCard({
  course,
  index,
}: {
  course: any;
  index: number;
}) {
  const bgColor =
    subjectColors[course.subject] || "bg-pastel-mint";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/courses/${course.slug}`}>
        <Card
          className={`card-soft border-0 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${bgColor} dark:bg-card`}
        >
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 relative">
              {course.badge && (
                <Badge
                  className={`absolute top-2 right-2 ${badgeColors[course.badge]}`}
                >
                  {course.badge}
                </Badge>
              )}

              <div className="h-12 w-12 rounded-xl bg-white/80 dark:bg-background/80 flex items-center justify-center mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>

              <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/50 dark:bg-background/50">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {course.durationWeeks} weeks
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {course.enrolledCount?.toLocaleString() || "1000+"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {course.price === 0 ? (
                    <span className="text-lg font-bold text-green-600">
                      Free
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        ₹{(course.discountPrice || course.price).toLocaleString()}
                      </span>
                      {course.discountPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{course.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {course.rating || "4.8"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

