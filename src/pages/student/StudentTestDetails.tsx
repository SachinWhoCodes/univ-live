import { useParams, Link } from "react-router-dom";
import { Clock, FileText, Award, ArrowLeft, Play, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTestById, attempts } from "@/mock/studentMock";

export default function StudentTestDetails() {
  const { testId } = useParams();
  const test = getTestById(testId || "");
  const testAttempts = attempts.filter(a => a.testId === testId && a.status === "completed");

  if (!test) {
    return <div className="text-center py-12"><p>Test not found</p><Button asChild><Link to="/student/tests">Back to Tests</Link></Button></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" asChild><Link to="/student/tests"><ArrowLeft className="h-4 w-4 mr-2" />Back to Tests</Link></Button>

      <Card className="card-soft border-0 bg-pastel-mint">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Badge className="mb-2">{test.subject}</Badge>
              <h1 className="text-2xl font-bold">{test.title}</h1>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{test.duration} minutes</span>
                <span className="flex items-center gap-1"><FileText className="h-4 w-4" />{test.questionsCount} questions</span>
                <span className="flex items-center gap-1"><Award className="h-4 w-4" />{test.markingScheme.correct} marks per correct</span>
              </div>
            </div>
            {test.isLocked ? (
              <Button className="gradient-bg rounded-xl"><Lock className="h-4 w-4 mr-2" />Unlock (₹{test.price})</Button>
            ) : (
              <Button className="gradient-bg rounded-xl" asChild><Link to={`/student/tests/${test.id}/attempt`}><Play className="h-4 w-4 mr-2" />Start Test</Link></Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-soft border-0">
          <CardHeader><CardTitle>Sections</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {test.sections.map((section, i) => (
              <div key={section.id} className="flex justify-between p-3 rounded-xl bg-muted/50">
                <span>{i + 1}. {section.name}</span>
                <span className="text-muted-foreground">{section.questionsCount} Q</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-soft border-0">
          <CardHeader><CardTitle>Syllabus</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {test.syllabus.map((topic, i) => (
                <Badge key={i} variant="secondary" className="rounded-full">{topic}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {testAttempts.length > 0 && (
        <Card className="card-soft border-0">
          <CardHeader><CardTitle>Your Attempts ({testAttempts.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {testAttempts.map((attempt, i) => (
              <div key={attempt.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium">Attempt {testAttempts.length - i}</p>
                  <p className="text-sm text-muted-foreground">{new Date(attempt.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{attempt.score}/{attempt.maxScore}</p>
                  <p className="text-sm text-muted-foreground">{attempt.accuracy}% accuracy</p>
                </div>
                <Button variant="ghost" size="sm" asChild><Link to={`/student/results/${attempt.id}`}>View</Link></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
