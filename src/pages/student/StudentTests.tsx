import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestCard } from "@/components/student/TestCard";
import { availableTests } from "@/mock/studentMock";
import { toast } from "sonner";

const subjects = ["All", "General Test", "English", "Mathematics", "Physics", "Chemistry", "Biology"];
const difficulties = ["All", "Easy", "Medium", "Hard"];

export default function StudentTests() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState("");

  const filteredTests = availableTests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === "All" || test.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === "All" || test.difficulty === selectedDifficulty;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const handleUnlock = (testId: string) => {
    setSelectedTestId(testId);
    setUnlockDialogOpen(true);
  };

  const handleRedeemCode = () => {
    toast.success("Access code redeemed successfully!");
    setUnlockDialogOpen(false);
    setAccessCode("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Available Tests</h1>
        <p className="text-muted-foreground">Browse and start your test preparation</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tests..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {subjects.map(subject => (
            <Badge key={subject} variant={selectedSubject === subject ? "default" : "secondary"} className="cursor-pointer rounded-full whitespace-nowrap" onClick={() => setSelectedSubject(subject)}>
              {subject}
            </Badge>
          ))}
        </div>
      </div>

      {/* Test Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map(test => (
          <TestCard key={test.id} test={test} onView={(id) => navigate(`/student/tests/${id}`)} onStart={(id) => navigate(`/student/tests/${id}/attempt`)} onUnlock={handleUnlock} />
        ))}
      </div>

      {/* Unlock Dialog */}
      <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Unlock Test</DialogTitle>
            <DialogDescription>Enter an access code or pay online to unlock this test.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="code">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="code" className="rounded-lg">Access Code</TabsTrigger>
              <TabsTrigger value="pay" className="rounded-lg">Pay Online</TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="space-y-4 pt-4">
              <Input placeholder="Enter access code" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} className="rounded-xl" />
              <Button className="w-full gradient-bg rounded-xl" onClick={handleRedeemCode}>Redeem Code</Button>
            </TabsContent>
            <TabsContent value="pay" className="space-y-4 pt-4">
              <div className="text-center p-4 bg-pastel-mint rounded-xl">
                <p className="text-2xl font-bold">₹{availableTests.find(t => t.id === selectedTestId)?.price || 0}</p>
                <p className="text-sm text-muted-foreground">One-time payment</p>
              </div>
              <Button className="w-full gradient-bg rounded-xl" onClick={() => toast.info("Payment integration coming soon!")}>Pay Now</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
