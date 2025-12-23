import { motion } from "framer-motion";
import {
  UserPlus,
  Key,
  FileCheck,
  CreditCard,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "student_joined" | "access_code" | "test_attempted" | "payment";
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "student_joined",
    title: "New student joined",
    description: "Rahul Sharma joined NEET Batch 2024",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "access_code",
    title: "Access code used",
    description: "Code NEET2024 used by Priya Patel",
    time: "15 min ago",
  },
  {
    id: "3",
    type: "test_attempted",
    title: "Test completed",
    description: "Physics Mock Test completed by 5 students",
    time: "1 hour ago",
  },
  {
    id: "4",
    type: "payment",
    title: "Payment received",
    description: "₹2,999 received from Amit Kumar",
    time: "3 hours ago",
  },
  {
    id: "5",
    type: "student_joined",
    title: "New student joined",
    description: "Sneha Gupta joined JEE Advanced Batch",
    time: "5 hours ago",
  },
];

const iconMap: Record<Activity["type"], LucideIcon> = {
  student_joined: UserPlus,
  access_code: Key,
  test_attempted: FileCheck,
  payment: CreditCard,
};

const colorMap: Record<Activity["type"], string> = {
  student_joined: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  access_code: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  test_attempted: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  payment: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
};

interface ActivityFeedProps {
  delay?: number;
}

export default function ActivityFeed({ delay = 0 }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = iconMap[activity.type];
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: delay + index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0",
                      colorMap[activity.type]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
