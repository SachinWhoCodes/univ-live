import { Link } from "react-router-dom";
import { FileText, Target, Trophy, TrendingUp, Play, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StudentMetricCard } from "@/components/student/StudentMetricCard";
import { AttemptTable } from "@/components/student/AttemptTable";
import { studentProfile, attempts, scoreTrend, subjectPerformance } from "@/mock/studentMock";

export default function StudentDashboard() {
  const completedAttempts = attempts.filter(a => a.status === "completed");
  const inProgressAttempt = attempts.find(a => a.status === "in-progress");
  const avgScore = completedAttempts.length > 0 
    ? Math.round(completedAttempts.reduce((sum, a) => sum + a.accuracy, 0) / completedAttempts.length)
    : 0;
  const bestSubject = subjectPerformance.reduce((best, curr) => curr.score > best.score ? curr : best);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="card-soft border-0 bg-gradient-to-r from-pastel-mint to-pastel-lavender overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {studentProfile.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground mt-1">Keep up the great work. You're making progress!</p>
          </div>
          <Button className="gradient-bg rounded-xl" asChild>
            <Link to="/student/tests">
              <Play className="h-4 w-4 mr-2" />
              Start a Test
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StudentMetricCard title="Tests Attempted" value={completedAttempts.length} icon={FileText} color="mint" trend={{ value: 15, isPositive: true }} />
        <StudentMetricCard title="Avg Score" value={`${avgScore}%`} icon={Target} color="yellow" trend={{ value: 8, isPositive: true }} />
        <StudentMetricCard title="Best Subject" value={bestSubject.subject} subtitle={`${bestSubject.score}% avg`} icon={Trophy} color="lavender" />
        <StudentMetricCard title="Current Rank" value="#12" subtitle="in your batch" icon={TrendingUp} color="peach" trend={{ value: 2, isPositive: true }} />
      </div>

      {/* Continue Test Card */}
      {inProgressAttempt && (
        <Card className="card-soft border-0 bg-pastel-yellow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Continue where you left off</p>
              <p className="font-semibold">{inProgressAttempt.testTitle}</p>
            </div>
            <Button className="gradient-bg rounded-xl" asChild>
              <Link to={`/student/tests/${inProgressAttempt.testId}/attempt`}>Continue Test</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="card-soft border-0">
          <CardHeader><CardTitle className="text-lg">Score Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis domain={[0, 100]} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-soft border-0">
          <CardHeader><CardTitle className="text-lg">Subject Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="subject" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attempts */}
      <Card className="card-soft border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Attempts</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/student/attempts">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <AttemptTable attempts={completedAttempts.slice(0, 5)} compact />
        </CardContent>
      </Card>
    </div>
  );
}
