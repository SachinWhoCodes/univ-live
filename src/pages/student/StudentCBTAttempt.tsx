import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle, Save, Flag, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimerChip } from "@/components/student/TimerChip";
import { CBTQuestionPalette } from "@/components/student/CBTQuestionPalette";
import { getTestById, sampleQuestions, passages } from "@/mock/studentMock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STORAGE_KEY = "cbt_attempt_state";

export default function StudentCBTAttempt() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const test = getTestById(testId || "");
  const questions = sampleQuestions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSectionId, setCurrentSectionId] = useState(questions[0]?.sectionId || "");
  const [responses, setResponses] = useState<Record<string, { answer: string | null; markedForReview: boolean; visited: boolean; answered: boolean }>>({});
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState((test?.duration || 60) * 60);

  // Initialize responses
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.testId === testId) {
        setResponses(parsed.responses);
        setCurrentIndex(parsed.currentIndex);
        setTimeRemaining(parsed.timeRemaining);
        return;
      }
    }
    const initial: typeof responses = {};
    questions.forEach(q => { initial[q.id] = { answer: null, markedForReview: false, visited: false, answered: false }; });
    setResponses(initial);
  }, [testId]);

  // Mark current question as visited
  useEffect(() => {
    const qId = questions[currentIndex]?.id;
    if (qId && responses[qId] && !responses[qId].visited) {
      setResponses(prev => ({ ...prev, [qId]: { ...prev[qId], visited: true } }));
    }
  }, [currentIndex]);

  // Autosave every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ testId, responses, currentIndex, timeRemaining }));
      toast.success("Progress saved", { duration: 1000 });
    }, 10000);
    return () => clearInterval(interval);
  }, [responses, currentIndex, timeRemaining, testId]);

  const currentQuestion = questions[currentIndex];
  const passage = currentQuestion?.passageId ? passages.find(p => p.id === currentQuestion.passageId) : null;

  const handleAnswer = (answer: string) => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: { ...prev[currentQuestion.id], answer, answered: !!answer } }));
  };

  const handleMarkForReview = () => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: { ...prev[currentQuestion.id], markedForReview: !prev[currentQuestion.id].markedForReview } }));
  };

  const handleClearResponse = () => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: { ...prev[currentQuestion.id], answer: null, answered: false } }));
  };

  const handleSubmit = () => {
    localStorage.removeItem(STORAGE_KEY);
    const mockAttemptId = `att_${Date.now()}`;
    navigate(`/student/results/${mockAttemptId}?fromTest=true`);
  };

  const handleTimeUp = () => {
    toast.error("Time's up! Submitting your test...");
    handleSubmit();
  };

  if (!test || !currentQuestion) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-xl mb-4">
          <div className="flex items-center gap-4">
            <TimerChip initialSeconds={timeRemaining} onTimeUp={handleTimeUp} />
            <div className="hidden sm:block">
              <p className="font-semibold text-sm">{test.title}</p>
              <p className="text-xs text-muted-foreground">Question {currentIndex + 1} of {questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-green-600"><Save className="h-3 w-3" />Saved</div>
            <Button variant="destructive" size="sm" className="rounded-lg" onClick={() => setSubmitDialogOpen(true)}>Submit</Button>
          </div>
        </div>

        {/* Section Tabs */}
        {test.sections.length > 1 && (
          <Tabs value={currentSectionId} onValueChange={setCurrentSectionId} className="mb-4">
            <TabsList className="w-full justify-start overflow-x-auto rounded-xl">
              {test.sections.map(section => (
                <TabsTrigger key={section.id} value={section.id} className="rounded-lg">{section.name}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Question Area */}
        <Card className="flex-1 card-soft border-0 overflow-auto">
          <CardContent className="p-6 space-y-6">
            {passage && (
              <div className="p-4 bg-pastel-cream rounded-xl">
                <p className="font-semibold mb-2">{passage.title}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{passage.content}</p>
              </div>
            )}

            <div>
              <p className="font-semibold text-lg">Q{currentIndex + 1}. {currentQuestion.stem}</p>
            </div>

            {currentQuestion.type === "mcq" && currentQuestion.options && (
              <RadioGroup value={responses[currentQuestion.id]?.answer || ""} onValueChange={handleAnswer} className="space-y-3">
                {currentQuestion.options.map((option, i) => (
                  <div key={option.id} className={cn("flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors cursor-pointer", responses[currentQuestion.id]?.answer === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">{String.fromCharCode(65 + i)}. {option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "integer" && (
              <Input type="number" placeholder="Enter your answer" value={responses[currentQuestion.id]?.answer || ""} onChange={(e) => handleAnswer(e.target.value)} className="max-w-xs rounded-xl text-lg" />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2 mt-4">
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl" onClick={handleClearResponse}><Trash2 className="h-4 w-4 mr-1" />Clear</Button>
            <Button variant={responses[currentQuestion.id]?.markedForReview ? "default" : "outline"} className={cn("rounded-xl", responses[currentQuestion.id]?.markedForReview && "bg-purple-500 hover:bg-purple-600")} onClick={handleMarkForReview}><Flag className="h-4 w-4 mr-1" />Mark</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl" disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}><ChevronLeft className="h-4 w-4" />Prev</Button>
            <Button className="rounded-xl gradient-bg" disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex(currentIndex + 1)}>Next<ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Question Palette (Desktop) */}
      <Card className="hidden lg:block w-72 card-soft border-0">
        <CardContent className="p-4">
          <p className="font-semibold mb-4">Question Palette</p>
          <CBTQuestionPalette questions={questions} responses={responses} currentQuestionIndex={currentIndex} onQuestionClick={setCurrentIndex} sections={test.sections} currentSectionId={currentSectionId} />
        </CardContent>
      </Card>

      {/* Submit Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />Submit Test?</DialogTitle>
            <DialogDescription>Are you sure you want to submit? You won't be able to change your answers.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4 text-sm">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30"><p className="font-semibold text-green-700 dark:text-green-400">{Object.values(responses).filter(r => r.answer).length}</p><p className="text-xs text-muted-foreground">Answered</p></div>
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30"><p className="font-semibold text-red-700 dark:text-red-400">{Object.values(responses).filter(r => r.visited && !r.answer).length}</p><p className="text-xs text-muted-foreground">Unanswered</p></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
            <Button className="gradient-bg" onClick={handleSubmit}>Submit Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

