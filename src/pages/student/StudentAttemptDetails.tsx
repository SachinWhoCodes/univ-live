import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sampleQuestions, getAttemptById, attempts } from "@/mock/studentMock";
import { cn } from "@/lib/utils";

export default function StudentAttemptDetails() {
  const { attemptId } = useParams();
  const attempt = getAttemptById(attemptId || "") || attempts[0];

  // Mock responses for review
  const mockResponses: Record<string, string> = { q_001: "a", q_002: "b", q_003: "c", q_004: "20", q_005: "b" };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" asChild><Link to={`/student/results/${attemptId}`}><ArrowLeft className="h-4 w-4 mr-2" />Back to Results</Link></Button>

      <Card className="card-soft border-0 bg-pastel-lavender">
        <CardContent className="p-6"><h1 className="text-xl font-bold">{attempt.testTitle}</h1><p className="text-muted-foreground">Review your answers</p></CardContent>
      </Card>

      <div className="space-y-4">
        {sampleQuestions.map((q, i) => {
          const userAnswer = mockResponses[q.id];
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <Card key={q.id} className={cn("card-soft border-0", isCorrect ? "bg-green-50 dark:bg-green-900/10" : "bg-red-50 dark:bg-red-900/10")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="rounded-full">Q{i + 1}</Badge>
                  <div className="flex items-center gap-2">
                    {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    <Badge className={cn("rounded-full", isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{isCorrect ? `+${q.marks.correct}` : q.marks.incorrect}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{q.stem}</p>

                {q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt, j) => (
                      <div key={opt.id} className={cn("p-3 rounded-xl border-2", opt.id === q.correctAnswer ? "border-green-500 bg-green-100/50 dark:bg-green-900/20" : opt.id === userAnswer ? "border-red-500 bg-red-100/50 dark:bg-red-900/20" : "border-transparent bg-background/50")}>
                        <span className="font-medium">{String.fromCharCode(65 + j)}.</span> {opt.text}
                        {opt.id === q.correctAnswer && <Badge className="ml-2 rounded-full bg-green-500">Correct</Badge>}
                        {opt.id === userAnswer && opt.id !== q.correctAnswer && <Badge className="ml-2 rounded-full bg-red-500">Your Answer</Badge>}
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "integer" && (
                  <div className="flex gap-4">
                    <div className="p-3 rounded-xl bg-background/50"><span className="text-muted-foreground">Your answer:</span> <span className="font-bold">{userAnswer || "—"}</span></div>
                    <div className="p-3 rounded-xl bg-green-100/50 dark:bg-green-900/20"><span className="text-muted-foreground">Correct:</span> <span className="font-bold text-green-600">{q.correctAnswer}</span></div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-pastel-cream">
                  <p className="text-sm font-medium mb-1">Explanation</p>
                  <p className="text-sm text-muted-foreground">{q.explanation}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
