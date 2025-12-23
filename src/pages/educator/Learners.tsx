import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Mail,
  Trash2,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/educator/DataTable";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface Learner {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  batch: string;
  attempts: number;
  avgScore: number;
  lastActive: string;
  joinDate: string;
  status: "active" | "inactive";
}

const learners: Learner[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    phone: "+91 98765 43210",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
    batch: "NEET 2024",
    attempts: 45,
    avgScore: 78,
    lastActive: "2 hours ago",
    joinDate: "Jan 15, 2024",
    status: "active",
  },
  {
    id: "2",
    name: "Priya Patel",
    email: "priya.patel@email.com",
    phone: "+91 98765 43211",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    batch: "NEET 2024",
    attempts: 38,
    avgScore: 82,
    lastActive: "5 hours ago",
    joinDate: "Jan 20, 2024",
    status: "active",
  },
  {
    id: "3",
    name: "Amit Kumar",
    email: "amit.kumar@email.com",
    phone: "+91 98765 43212",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amit",
    batch: "JEE Advanced",
    attempts: 52,
    avgScore: 71,
    lastActive: "1 day ago",
    joinDate: "Feb 01, 2024",
    status: "active",
  },
  {
    id: "4",
    name: "Sneha Gupta",
    email: "sneha.gupta@email.com",
    phone: "+91 98765 43213",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sneha",
    batch: "JEE Mains",
    attempts: 28,
    avgScore: 65,
    lastActive: "3 days ago",
    joinDate: "Feb 10, 2024",
    status: "inactive",
  },
  {
    id: "5",
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "+91 98765 43214",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vikram",
    batch: "NEET 2024",
    attempts: 41,
    avgScore: 74,
    lastActive: "12 hours ago",
    joinDate: "Feb 15, 2024",
    status: "active",
  },
];

const performanceData = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 68 },
  { month: "Mar", score: 72 },
  { month: "Apr", score: 70 },
  { month: "May", score: 78 },
  { month: "Jun", score: 82 },
];

const subjectData = [
  { subject: "Physics", score: 75, fullMark: 100 },
  { subject: "Chemistry", score: 82, fullMark: 100 },
  { subject: "Biology", score: 88, fullMark: 100 },
  { subject: "Maths", score: 70, fullMark: 100 },
  { subject: "English", score: 85, fullMark: 100 },
];

const attemptsList = [
  { id: "1", test: "Physics Mock Test 1", score: 78, rank: 12, time: "45 min", date: "Jun 10, 2024" },
  { id: "2", test: "Chemistry Full Test", score: 82, rank: 8, time: "2h 30min", date: "Jun 8, 2024" },
  { id: "3", test: "Biology Chapter 5", score: 85, rank: 5, time: "30 min", date: "Jun 5, 2024" },
  { id: "4", test: "NEET Mock Test 3", score: 72, rank: 18, time: "3h 0min", date: "Jun 1, 2024" },
];

export default function Learners() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);

  const filteredLearners = learners.filter((learner) => {
    const matchesSearch =
      learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch =
      selectedBatch === "all" || learner.batch === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  const columns = [
    {
      key: "name",
      header: "Student",
      render: (learner: Learner) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={learner.avatar} />
            <AvatarFallback>{learner.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{learner.name}</p>
            <p className="text-xs text-muted-foreground">{learner.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "batch",
      header: "Batch",
      render: (learner: Learner) => (
        <Badge variant="secondary" className="font-normal">
          {learner.batch}
        </Badge>
      ),
    },
    {
      key: "attempts",
      header: "Attempts",
      className: "text-center",
    },
    {
      key: "avgScore",
      header: "Avg Score",
      className: "text-center",
      render: (learner: Learner) => (
        <span
          className={
            learner.avgScore >= 75
              ? "text-green-600"
              : learner.avgScore >= 60
              ? "text-amber-600"
              : "text-red-600"
          }
        >
          {learner.avgScore}%
        </span>
      ),
    },
    {
      key: "lastActive",
      header: "Last Active",
      className: "hidden sm:table-cell",
    },
    {
      key: "status",
      header: "Status",
      render: (learner: Learner) => (
        <Badge
          variant={learner.status === "active" ? "default" : "secondary"}
          className={
            learner.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : ""
          }
        >
          {learner.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (learner: Learner) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedLearner(learner)}>
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Learners</h1>
          <p className="text-muted-foreground text-sm">
            Manage and track your students' progress
          </p>
        </div>
        <Button className="gradient-bg text-white">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Batches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            <SelectItem value="NEET 2024">NEET 2024</SelectItem>
            <SelectItem value="JEE Advanced">JEE Advanced</SelectItem>
            <SelectItem value="JEE Mains">JEE Mains</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Learners", value: learners.length },
          { label: "Active", value: learners.filter((l) => l.status === "active").length },
          { label: "Avg Score", value: "74%" },
          { label: "This Week", value: "+12" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <DataTable
        data={filteredLearners}
        columns={columns}
        onRowClick={(learner) => setSelectedLearner(learner)}
      />

      {/* Learner Profile Dialog */}
      <Dialog open={!!selectedLearner} onOpenChange={() => setSelectedLearner(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedLearner?.avatar} />
                <AvatarFallback>{selectedLearner?.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{selectedLearner?.name}</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  {selectedLearner?.email}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attempts">Attempts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Batch</p>
                    <p className="font-medium">{selectedLearner?.batch}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Join Date</p>
                    <p className="font-medium">{selectedLearner?.joinDate}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Total Attempts</p>
                    <p className="font-medium">{selectedLearner?.attempts}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                    <p className="font-medium text-green-600">
                      {selectedLearner?.avgScore}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(204, 91%, 56%)"
                          strokeWidth={2}
                          dot={{ fill: "hsl(204, 91%, 56%)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attempts" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {attemptsList.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{attempt.test}</p>
                          <p className="text-xs text-muted-foreground">
                            {attempt.date} • {attempt.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-green-600">{attempt.score}%</p>
                            <p className="text-xs text-muted-foreground">
                              Rank #{attempt.rank}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            AI Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Subject-wise Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={subjectData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" className="text-xs" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="hsl(204, 91%, 56%)"
                            fill="hsl(204, 91%, 56%)"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Focus on Maths
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-300">
                        Score 15% below average. Recommend Chapter 3 & 5 revision.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Strong in Biology
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        Top 10% in the batch. Ready for advanced tests.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Consistency improving
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        Study time increased by 20% this month.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
