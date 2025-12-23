import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { scoreTrend, subjectPerformance, timeOfDayData, weeklyFocusPlan } from "@/mock/studentMock";

export default function StudentAnalytics() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-muted-foreground">Track your preparation progress</p></div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="card-soft border-0">
          <CardHeader><CardTitle>Score Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={scoreTrend}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="date" className="text-xs" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} /></LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-soft border-0">
          <CardHeader><CardTitle>Subject Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectPerformance}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="subject" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-soft border-0">
          <CardHeader><CardTitle>Study Hours Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeOfDayData}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="hour" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="attempts" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-soft border-0 bg-pastel-mint">
          <CardHeader><CardTitle>Weekly Focus Plan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {weeklyFocusPlan.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/60">
                <Checkbox checked={item.done} />
                <span className={item.done ? "line-through text-muted-foreground" : ""}>{item.task}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
