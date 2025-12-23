import { useState } from "react";
import {
  Users,
  UserCheck,
  FileText,
  Target,
  TrendingUp,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import MetricCard from "@/components/educator/MetricCard";
import ChartCard from "@/components/educator/ChartCard";
import ActivityFeed from "@/components/educator/ActivityFeed";
import EmptyState from "@/components/educator/EmptyState";
import { motion } from "framer-motion";

const studentGrowthData = [
  { month: "Jan", students: 120 },
  { month: "Feb", students: 145 },
  { month: "Mar", students: 180 },
  { month: "Apr", students: 210 },
  { month: "May", students: 256 },
  { month: "Jun", students: 310 },
];

const attemptsData = [
  { day: "Mon", attempts: 45, avgScore: 72 },
  { day: "Tue", attempts: 52, avgScore: 68 },
  { day: "Wed", attempts: 38, avgScore: 75 },
  { day: "Thu", attempts: 65, avgScore: 71 },
  { day: "Fri", attempts: 48, avgScore: 69 },
  { day: "Sat", attempts: 72, avgScore: 74 },
  { day: "Sun", attempts: 55, avgScore: 76 },
];

const weakSubjectsData = [
  { subject: "Physics", weak: 35, moderate: 45, strong: 20 },
  { subject: "Chemistry", weak: 25, moderate: 40, strong: 35 },
  { subject: "Biology", weak: 20, moderate: 35, strong: 45 },
  { subject: "Maths", weak: 40, moderate: 35, strong: 25 },
];

export default function EducatorDashboard() {
  const [hasData] = useState(true); // Toggle for empty state demo

  if (!hasData) {
    return (
      <EmptyState
        icon={FileText}
        title="Let's start by importing your first test series"
        description="Import test series from our extensive library or create your own to get started with your coaching journey."
        actionLabel="Import Test Series"
        onAction={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-bg rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYyaDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
            Welcome back, Dr. Sharma! 👋
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl">
            Your coaching is growing! You have 12 new students this week and 5 pending test reviews.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              View Pending Reviews
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Students"
          value="1,234"
          change={{ value: 12, type: "increase" }}
          icon={Users}
          iconColor="text-blue-500"
          delay={0}
        />
        <MetricCard
          title="Active Students"
          value="892"
          change={{ value: 8, type: "increase" }}
          icon={UserCheck}
          iconColor="text-green-500"
          delay={0.1}
        />
        <MetricCard
          title="Test Series"
          value="24"
          change={{ value: 3, type: "increase" }}
          icon={FileText}
          iconColor="text-purple-500"
          delay={0.2}
        />
        <MetricCard
          title="Total Attempts"
          value="5,678"
          change={{ value: 15, type: "increase" }}
          icon={Target}
          iconColor="text-orange-500"
          delay={0.3}
        />
        <MetricCard
          title="Avg Score"
          value="72%"
          change={{ value: 2, type: "increase" }}
          icon={TrendingUp}
          iconColor="text-cyan-500"
          delay={0.4}
        />
        <MetricCard
          title="Revenue"
          value="₹2.4L"
          change={{ value: 18, type: "increase" }}
          icon={IndianRupee}
          iconColor="text-emerald-500"
          delay={0.5}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Student Growth" showPeriodSelect delay={0.2}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentGrowthData}>
                <defs>
                  <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(204, 91%, 56%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(204, 91%, 56%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="hsl(204, 91%, 56%)"
                  strokeWidth={2}
                  fill="url(#studentGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Attempts & Scores" showPeriodSelect delay={0.3}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attemptsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="day"
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar
                  dataKey="attempts"
                  fill="hsl(184, 87%, 65%)"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="hsl(211, 91%, 42%)"
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Subject Performance Heatmap" delay={0.4}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weakSubjectsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis
                    dataKey="subject"
                    type="category"
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar
                    dataKey="weak"
                    stackId="a"
                    fill="hsl(0, 84%, 60%)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="moderate"
                    stackId="a"
                    fill="hsl(38, 92%, 50%)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="strong"
                    stackId="a"
                    fill="hsl(142, 76%, 36%)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-xs text-muted-foreground">Weak</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span className="text-xs text-muted-foreground">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-600" />
                <span className="text-xs text-muted-foreground">Strong</span>
              </div>
            </div>
          </ChartCard>
        </div>

        <ActivityFeed delay={0.5} />
      </div>
    </div>
  );
}
