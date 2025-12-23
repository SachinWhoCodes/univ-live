import { motion } from "framer-motion";
import { Sparkles, CheckCircle, AlertCircle, Lightbulb, BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AIReview } from "@/mock/studentMock";

interface AIReviewPanelProps {
  status: "queued" | "in-progress" | "completed" | "failed";
  review?: AIReview;
  className?: string;
}

export function AIReviewPanel({ status, review, className }: AIReviewPanelProps) {
  if (status === "queued") {
    return (
      <Card className={cn("card-soft border-0 bg-pastel-lavender", className)}>
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Review Queued</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your personalized analysis will be ready in approximately 2 minutes.
            </p>
          </div>
          <Progress value={0} className="h-2" />
        </CardContent>
      </Card>
    );
  }

  if (status === "in-progress") {
    return (
      <Card className={cn("card-soft border-0 bg-pastel-yellow", className)}>
        <CardContent className="p-6 text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-lg">AI Analyzing Your Performance</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Our AI is reviewing your answers and preparing personalized feedback...
            </p>
          </div>
          <Progress value={65} className="h-2" />
        </CardContent>
      </Card>
    );
  }

  if (status === "failed") {
    return (
      <Card className={cn("card-soft border-0 bg-pastel-peach", className)}>
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Analysis Failed</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Something went wrong. Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completed state
  if (!review) return null;

  return (
    <Card className={cn("card-soft border-0", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl gradient-bg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Performance Review</CardTitle>
            <Badge variant="secondary" className="mt-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Analysis */}
        <div className="p-4 rounded-xl bg-pastel-mint">
          <p className="text-sm text-foreground">{review.overallAnalysis}</p>
        </div>

        {/* Strengths */}
        <div>
          <h4 className="font-semibold flex items-center gap-2 text-green-600 mb-3">
            <CheckCircle className="h-4 w-4" />
            Strengths
          </h4>
          <ul className="space-y-2">
            {review.strengths.map((strength, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span>{strength}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Weak Areas */}
        <div>
          <h4 className="font-semibold flex items-center gap-2 text-orange-600 mb-3">
            <AlertCircle className="h-4 w-4" />
            Areas to Improve
          </h4>
          <ul className="space-y-2">
            {review.weakAreas.map((area, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                <span>{area}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Suggestions */}
        <div>
          <h4 className="font-semibold flex items-center gap-2 text-primary mb-3">
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </h4>
          <ul className="space-y-2">
            {review.suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Next Test Recommendations */}
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4" />
            Recommended Next Tests
          </h4>
          <div className="flex flex-wrap gap-2">
            {review.nextTestRecommendations.map((test, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="rounded-full bg-pastel-lavender cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {test}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
