import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Trophy, Target, Clock, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AIReviewPanel } from "@/components/student/AIReviewPanel";
import { getAttemptById, attempts } from "@/mock/studentMock";

export default function StudentResults() {
  const { attemptId } = useParams();
  const attempt = getAttemptById(attemptId || "") || attempts[0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" asChild><Link to="/student/attempts"><ArrowLeft className="h-4 w-4 mr-2" />Back to Attempts</Link></Button>

      {/* Score Header */}
      <Card className="card-soft border-0 bg-gradient-to-r from-pastel-mint to-pastel-lavender">
        <CardContent className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">{attempt.testTitle}</h1>
          <div className="text-5xl font-bold gradient-text mb-2">{attempt.score}/{attempt.maxScore}</div>
          <p className="text-muted-foreground">Your Score</p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-soft border-0 bg-pastel-yellow"><CardContent className="p-4 text-center"><Target className="h-6 w-6 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold">{attempt.accuracy}%</p><p className="text-xs text-muted-foreground">Accuracy</p></CardContent></Card>
        <Card className="card-soft border-0 bg-pastel-lavender"><CardContent className="p-4 text-center"><Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" /><p className="text-2xl font-bold">#{attempt.rank}</p><p className="text-xs text-muted-foreground">Rank</p></CardContent></Card>
        <Card className="card-soft border-0 bg-pastel-peach"><CardContent className="p-4 text-center"><Clock className="h-6 w-6 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold">{formatTime(attempt.timeSpent)}</p><p className="text-xs text-muted-foreground">Time Spent</p></CardContent></Card>
        <Card className="card-soft border-0 bg-pastel-mint"><CardContent className="p-4 text-center"><TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" /><p className="text-2xl font-bold">Top {Math.round((attempt.rank / attempt.totalParticipants) * 100)}%</p><p className="text-xs text-muted-foreground">Percentile</p></CardContent></Card>
      </div>

      {/* Section Breakdown */}
      <Card className="card-soft border-0">
        <CardHeader><CardTitle>Section-wise Performance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {attempt.sectionScores.map((section, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm"><span>{section.sectionName}</span><span className="font-medium">{section.score}/{section.maxScore}</span></div>
              <Progress value={(section.score / section.maxScore) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Review */}
      <AIReviewPanel status={attempt.aiReviewStatus} review={attempt.aiReview} />

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 rounded-xl" asChild><Link to={`/student/attempts/${attempt.id}`}><Eye className="h-4 w-4 mr-2" />Review Answers</Link></Button>
        <Button className="flex-1 rounded-xl gradient-bg" asChild><Link to="/student/tests">Take Another Test</Link></Button>
      </div>
    </div>
  );
}
