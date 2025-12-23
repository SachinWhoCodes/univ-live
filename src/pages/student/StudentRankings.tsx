import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { leaderboard } from "@/mock/studentMock";

export default function StudentRankings() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Rankings</h1><p className="text-muted-foreground">See how you compare with others in your batch</p></div>

      {/* Top 3 */}
      <div className="grid grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map((entry, i) => (
          <Card key={entry.studentId} className={cn("card-soft border-0 text-center", i === 0 ? "bg-yellow-100 dark:bg-yellow-900/20" : i === 1 ? "bg-gray-100 dark:bg-gray-800" : "bg-orange-100 dark:bg-orange-900/20")}>
            <CardContent className="pt-6">
              <div className="relative inline-block">
                <Avatar className="h-16 w-16 border-4 border-white shadow-lg"><AvatarImage src={entry.avatar} /><AvatarFallback>{entry.name[0]}</AvatarFallback></Avatar>
                <div className={cn("absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : "bg-orange-400")}>{entry.rank}</div>
              </div>
              <p className="font-semibold mt-3">{entry.name}</p>
              <p className="text-2xl font-bold gradient-text">{entry.score}</p>
              <p className="text-xs text-muted-foreground">{entry.accuracy}% accuracy</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card className="card-soft border-0">
        <CardHeader><CardTitle>Full Leaderboard</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead className="w-16">Rank</TableHead><TableHead>Student</TableHead><TableHead className="text-center">Score</TableHead><TableHead className="text-center">Accuracy</TableHead><TableHead className="text-center">Change</TableHead></TableRow></TableHeader>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow key={entry.studentId} className={cn(entry.isCurrentUser && "bg-primary/5")}>
                  <TableCell className="font-bold">{entry.rank <= 3 ? <Trophy className={cn("h-5 w-5", entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-gray-400" : "text-orange-400")} /> : `#${entry.rank}`}</TableCell>
                  <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={entry.avatar} /><AvatarFallback>{entry.name[0]}</AvatarFallback></Avatar><span className={cn("font-medium", entry.isCurrentUser && "text-primary")}>{entry.name}{entry.isCurrentUser && " (You)"}</span></div></TableCell>
                  <TableCell className="text-center font-semibold">{entry.score}</TableCell>
                  <TableCell className="text-center">{entry.accuracy}%</TableCell>
                  <TableCell className="text-center">{entry.rankChange > 0 ? <span className="text-green-600 flex items-center justify-center gap-1"><TrendingUp className="h-4 w-4" />+{entry.rankChange}</span> : entry.rankChange < 0 ? <span className="text-red-500 flex items-center justify-center gap-1"><TrendingDown className="h-4 w-4" />{entry.rankChange}</span> : <Minus className="h-4 w-4 text-muted-foreground mx-auto" />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
