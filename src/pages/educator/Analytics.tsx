import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Target,
  Award,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const studentGrowthData = [
  { date: "Week 1", students: 120, active: 100 },
  { date: "Week 2", students: 145, active: 125 },
  { date: "Week 3", students: 180, active: 150 },
  { date: "Week 4", students: 210, active: 180 },
  { date: "Week 5", students: 256, active: 220 },
  { date: "Week 6", students: 310, active: 270 },
  { date: "Week 7", students: 350, active: 300 },
  { date: "Week 8", students: 380, active: 330 },
];

const attemptDistribution = [
  { name: "Physics", value: 35, color: "hsl(204, 91%, 56%)" },
  { name: "Chemistry", value: 28, color: "hsl(184, 87%, 65%)" },
  { name: "Biology", value: 22, color: "hsl(142, 76%, 36%)" },
  { name: "Maths", value: 15, color: "hsl(38, 92%, 50%)" },
];

const topPerformers = [
  { name: "Priya Patel", score: 98, tests: 45, avatar: "priya" },
  { name: "Rahul Sharma", score: 95, tests: 42, avatar: "rahul" },
  { name: "Sneha Gupta", score: 94, tests: 38, avatar: "sneha" },
  { name: "Amit Kumar", score: 92, tests: 40, avatar: "amit" },
  { name: "Vikram Singh", score: 90, tests: 35, avatar: "vikram" },
];

const strugglingStudents = [
  { name: "Ravi Verma", score: 45, weakness: "Physics", avatar: "ravi" },
  { name: "Neha Gupta", score: 48, weakness: "Chemistry", avatar: "neha" },
  { name: "Arjun Reddy", score: 52, weakness: "Maths", avatar: "arjun" },
];

const mostAttemptedTests = [
  { name: "NEET Mock Test 5", attempts: 320, avgScore: 72 },
  { name: "Physics Unit Test 3", attempts: 280, avgScore: 68 },
  { name: "Chemistry Chapter 7", attempts: 245, avgScore: 75 },
  { name: "Biology NCERT Test", attempts: 210, avgScore: 78 },
  { name: "Full Mock Test 8", attempts: 195, avgScore: 65 },
];

const activeHoursData = [
  { hour: "6AM", mon: 10, tue: 15, wed: 12, thu: 18, fri: 14, sat: 25, sun: 30 },
  { hour: "9AM", mon: 45, tue: 50, wed: 48, thu: 52, fri: 46, sat: 60, sun: 55 },
  { hour: "12PM", mon: 30, tue: 35, wed: 32, thu: 38, fri: 28, sat: 45, sun: 40 },
  { hour: "3PM", mon: 55, tue: 60, wed: 58, thu: 62, fri: 54, sat: 70, sun: 65 },
  { hour: "6PM", mon: 80, tue: 85, wed: 82, thu: 88, fri: 78, sat: 90, sun: 85 },
  { hour: "9PM", mon: 65, tue: 70, wed: 68, thu: 72, fri: 64, sat: 75, sun: 70 },
];

const batchComparisonData = [
  { batch: "NEET 2024", avgScore: 72, students: 450, growth: 15 },
  { batch: "JEE Advanced", avgScore: 68, students: 280, growth: 12 },
  { batch: "JEE Mains", avgScore: 75, students: 320, growth: 18 },
  { batch: "CUET", avgScore: 78, students: 180, growth: 22 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Detailed insights into your coaching performance
          </p>
        </div>
        <Select defaultValue="30">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Students", value: "1,234", change: "+12%" },
          { icon: Target, label: "Total Attempts", value: "15,678", change: "+24%" },
          { icon: TrendingUp, label: "Avg Score", value: "72%", change: "+3%" },
          { icon: Clock, label: "Avg Time/Test", value: "45 min", change: "-5min" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={studentGrowthData}>
                    <defs>
                      <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(204, 91%, 56%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(204, 91%, 56%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(184, 87%, 65%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(184, 87%, 65%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
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
                      fill="url(#totalGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="active"
                      stroke="hsl(184, 87%, 65%)"
                      fill="url(#activeGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Total Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(184, 87%, 65%)" }} />
                  <span className="text-xs text-muted-foreground">Active Students</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Attempt Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attemptDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {attemptDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {attemptDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top & Struggling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((student, index) => (
                  <div
                    key={student.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium w-6 text-muted-foreground">
                      #{index + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.avatar}`}
                      />
                      <AvatarFallback>{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.tests} tests taken
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {student.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">Students Needing Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strugglingStudents.map((student) => (
                  <div
                    key={student.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.avatar}`}
                      />
                      <AvatarFallback>{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Weak in {student.weakness}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      {student.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Most Attempted Tests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Attempted Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostAttemptedTests} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
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
                    fill="hsl(204, 91%, 56%)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Batch Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batch Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {batchComparisonData.map((batch) => (
                <div
                  key={batch.batch}
                  className="p-4 rounded-xl border border-border hover:shadow-card transition-shadow"
                >
                  <h4 className="font-medium text-sm mb-3">{batch.batch}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Students</span>
                      <span className="font-medium">{batch.students}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Score</span>
                      <span className="font-medium text-green-600">{batch.avgScore}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Growth</span>
                      <span className="font-medium text-primary">+{batch.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
