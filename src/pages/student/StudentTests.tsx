import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestCard } from "@/components/student/TestCard";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthProvider";
import { useTenant } from "@/contexts/TenantProvider";
import { db } from "@/lib/firebase";
import {
  Timestamp,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

type TestDoc = Record<string, any>;

type Test = {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questionsCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  isLocked: boolean;
  price: number;
  attemptsAllowed: number;
  attemptsUsed: number;
  sections: { id: string; name: string; questionsCount: number; duration?: number }[];
  syllabus: string[];
  markingScheme: { correct: number; incorrect: number; unanswered: number };
};

const DEFAULT_SUBJECTS = ["General Test", "English", "Mathematics", "Physics", "Chemistry", "Biology"];
const DIFFICULTIES: Array<"All" | "Easy" | "Medium" | "Hard"> = ["All", "Easy", "Medium", "Hard"];

function safeNum(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function normalizeDifficulty(v: any): "Easy" | "Medium" | "Hard" {
  const s = String(v || "").trim();
  if (s === "Easy" || s === "Medium" || s === "Hard") return s;
  return "Medium";
}
function isExpired(expiresAt: any) {
  if (!expiresAt) return false;
  const ts = expiresAt as Timestamp;
  if (!ts?.toDate) return false;
  return ts.toDate().getTime() < Date.now();
}
function sumSectionQuestions(sections: any[]) {
  if (!Array.isArray(sections)) return 0;
  return sections.reduce((acc, s) => acc + safeNum(s?.questionsCount, 0), 0);
}

export default function StudentTests() {
  const navigate = useNavigate();
  const { firebaseUser, profile, loading: authLoading } = useAuth();
  const { tenant, tenantSlug: tenantSlugFromDomain, loading: tenantLoading } = useTenant();

  const educatorId = tenant?.educatorId || profile?.educatorId || null;
  const tenantSlug = tenantSlugFromDomain || profile?.tenantSlug || null;

  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");

  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const [tests, setTests] = useState<Test[]>([]);
  const [unlockedSet, setUnlockedSet] = useState<Set<string>>(new Set());
  const [attemptsUsedMap, setAttemptsUsedMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const canLoad = useMemo(() => {
    return !authLoading && !tenantLoading && !!firebaseUser?.uid && !!educatorId;
  }, [authLoading, tenantLoading, firebaseUser?.uid, educatorId]);

  // 1) Listen unlocked tests for this student+educator
  useEffect(() => {
    if (!canLoad) return;

    const qUnlocks = query(
      collection(db, "testUnlocks"),
      where("studentId", "==", firebaseUser!.uid),
      where("educatorId", "==", educatorId!)
    );

    const unsub = onSnapshot(
      qUnlocks,
      (snap) => {
        const set = new Set<string>();
        snap.docs.forEach((d) => {
          const data = d.data() as any;
          const testId = String(data?.testSeriesId || data?.testId || "");
          if (testId) set.add(testId);
        });
        setUnlockedSet(set);
      },
      (err) => {
        console.error(err);
        setUnlockedSet(new Set());
      }
    );

    return () => unsub();
  }, [canLoad, educatorId, firebaseUser]);

  // 2) Listen attempts used per test (submitted only)
  useEffect(() => {
    if (!canLoad) return;

    const qAttempts = query(
      collection(db, "attempts"),
      where("studentId", "==", firebaseUser!.uid),
      where("educatorId", "==", educatorId!),
      where("status", "==", "submitted")
    );

    const unsub = onSnapshot(
      qAttempts,
      (snap) => {
        const map: Record<string, number> = {};
        snap.docs.forEach((d) => {
          const data = d.data() as any;
          const testId = String(data?.testId || data?.testSeriesId || "");
          if (!testId) return;
          map[testId] = (map[testId] || 0) + 1;
        });
        setAttemptsUsedMap(map);
      },
      (err) => {
        console.error(err);
        setAttemptsUsedMap({});
      }
    );

    return () => unsub();
  }, [canLoad, educatorId, firebaseUser]);

  // 3) Load tests
  useEffect(() => {
    if (!canLoad) {
      setLoading(authLoading || tenantLoading);
      return;
    }

    setLoading(true);

    const qTests = query(
      collection(db, "educators", educatorId!, "my_tests"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      qTests,
      (snap) => {
        const rows: Test[] = snap.docs.map((d) => {
          const data = d.data() as TestDoc;

          const title = String(data?.title || "Untitled Test");
          const subject = String(data?.subject || "General Test");
          const difficulty = normalizeDifficulty(data?.level || data?.difficulty);
          const duration = safeNum(data?.durationMinutes ?? data?.duration, 60);

          const rawSections = Array.isArray(data?.sections) ? data.sections : [];
          const sections = rawSections
            .map((s: any, idx: number) => ({
              id: String(s?.id || `sec_${idx + 1}`),
              name: String(s?.name || `Section ${idx + 1}`),
              questionsCount: safeNum(s?.questionsCount, 0),
              duration: s?.duration != null ? safeNum(s.duration, undefined as any) : undefined,
            }))
            .filter((s: any) => s.name);

          const questionsCount =
            safeNum(data?.questionsCount ?? data?.questionCount ?? data?.totalQuestions, 0) ||
            sumSectionQuestions(sections);

          const price = Math.max(0, safeNum(data?.price, 0));
          const attemptsAllowed = Math.max(1, safeNum(data?.attemptsAllowed ?? data?.maxAttempts, 3));

          const markingScheme = data?.markingScheme
            ? {
                correct: safeNum(data.markingScheme.correct, 4),
                incorrect: safeNum(data.markingScheme.incorrect, -1),
                unanswered: safeNum(data.markingScheme.unanswered, 0),
              }
            : {
                correct: safeNum(data?.positiveMarks, 4),
                incorrect: safeNum(data?.negativeMarks, -1),
                unanswered: 0,
              };

          const syllabus = Array.isArray(data?.syllabus) ? data.syllabus.map(String) : [];

          // ✅ NEW RULE: EVERYTHING locked unless unlocked via access code
          const unlocked = unlockedSet.has(d.id);
          const isLocked = !unlocked;

          return {
            id: d.id,
            title,
            subject,
            duration,
            questionsCount,
            difficulty,
            isLocked,
            price,
            attemptsAllowed,
            attemptsUsed: attemptsUsedMap[d.id] || 0,
            sections,
            syllabus,
            markingScheme,
          };
        });

        setTests(rows);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setTests([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [canLoad, educatorId, unlockedSet, attemptsUsedMap, authLoading, tenantLoading]);

  const subjects = useMemo(() => {
    const set = new Set<string>(["All", ...DEFAULT_SUBJECTS]);
    tests.forEach((t) => t.subject && set.add(t.subject));
    return Array.from(set);
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch = test.title.toLowerCase().includes(search.toLowerCase());
      const matchesSubject = selectedSubject === "All" || test.subject === selectedSubject;
      const matchesDifficulty = selectedDifficulty === "All" || test.difficulty === selectedDifficulty;
      return matchesSearch && matchesSubject && matchesDifficulty;
    });
  }, [tests, search, selectedSubject, selectedDifficulty]);

  const selectedTest = useMemo(() => {
    if (!selectedTestId) return null;
    return tests.find((t) => t.id === selectedTestId) || null;
  }, [selectedTestId, tests]);

  const handleUnlock = (testId: string) => {
    setSelectedTestId(testId);
    setAccessCode("");
    setUnlockDialogOpen(true);
  };

  const safeNavigateView = (testId: string) => {
    const t = tests.find((x) => x.id === testId);
    if (t?.isLocked) return handleUnlock(testId);
    navigate(`/student/tests/${testId}`);
  };

  const safeNavigateStart = (testId: string) => {
    const t = tests.find((x) => x.id === testId);
    if (t?.isLocked) return handleUnlock(testId);
    navigate(`/student/tests/${testId}/attempt`);
  };

  const handleRedeemCode = async () => {
    if (!firebaseUser?.uid || !educatorId || !selectedTestId) return;

    const codeUpper = accessCode.trim().toUpperCase();
    if (!codeUpper) {
      toast.error("Please enter an access code.");
      return;
    }

    setRedeeming(true);
    try {
      const codeRef = doc(db, "educators", educatorId, "accessCodes", codeUpper);
      const unlockId = `${firebaseUser.uid}__${educatorId}__${selectedTestId}`;
      const unlockRef = doc(db, "testUnlocks", unlockId);

      await runTransaction(db, async (tx) => {
        const codeSnap = await tx.get(codeRef);
        if (!codeSnap.exists()) throw new Error("Invalid code");

        const codeData = codeSnap.data() as any;
        const testSeriesId = String(codeData?.testSeriesId || "");

        if (!testSeriesId || testSeriesId !== selectedTestId) {
          throw new Error("Code does not match this test");
        }

        const maxUses = safeNum(codeData?.maxUses, 0);
        const usesUsed = safeNum(codeData?.usesUsed, 0);
        const expiresAt = codeData?.expiresAt ?? null;

        if (maxUses > 0 && usesUsed >= maxUses) throw new Error("Code exhausted");
        if (isExpired(expiresAt)) throw new Error("Code expired");

        const alreadyUnlocked = await tx.get(unlockRef);
        if (alreadyUnlocked.exists()) return;

        tx.set(unlockRef, {
          studentId: firebaseUser.uid,
          educatorId,
          tenantSlug: tenantSlug ?? null,
          testSeriesId: selectedTestId,
          unlockedVia: "accessCode",
          accessCode: codeUpper,
          unlockedAt: serverTimestamp(),
        });

        tx.update(codeRef, { usesUsed: increment(1), lastUsedAt: serverTimestamp() });
      });

      toast.success("Access code redeemed! Test unlocked.");
      setUnlockDialogOpen(false);
      setAccessCode("");
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("Invalid code")) toast.error("Invalid access code.");
      else if (msg.includes("does not match")) toast.error("This code is for a different test.");
      else if (msg.includes("exhausted")) toast.error("This code has reached its maximum uses.");
      else if (msg.includes("expired")) toast.error("This code is expired.");
      else toast.error("Failed to redeem code. Please try again.");
      console.error(e);
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Available Tests</h1>
          <p className="text-muted-foreground">All tests require an access code</p>
        </div>
        <div className="rounded-xl border border-border p-6 text-muted-foreground">Loading tests…</div>
      </div>
    );
  }

  if (!firebaseUser?.uid || !educatorId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Available Tests</h1>
          <p className="text-muted-foreground">All tests require an access code</p>
        </div>
        <div className="rounded-xl border border-border p-6 text-muted-foreground">
          You must be logged in as a student and linked to a coaching (educator).
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Available Tests</h1>
        <p className="text-muted-foreground">All tests are locked until you enter an access code.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {DIFFICULTIES.map((d) => (
              <Badge
                key={d}
                variant={selectedDifficulty === d ? "default" : "secondary"}
                className="cursor-pointer rounded-full whitespace-nowrap"
                onClick={() => setSelectedDifficulty(d)}
              >
                {d}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {subjects.map((subject) => (
            <Badge
              key={subject}
              variant={selectedSubject === subject ? "default" : "secondary"}
              className="cursor-pointer rounded-full whitespace-nowrap"
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </Badge>
          ))}
        </div>
      </div>

      {/* Test Grid */}
      {filteredTests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No tests found.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => (
            <TestCard
              key={test.id}
              test={test as any}
              onView={(id) => safeNavigateView(id)}
              onStart={(id) => safeNavigateStart(id)}
              onUnlock={handleUnlock}
            />
          ))}
        </div>
      )}

      {/* Unlock Dialog */}
      <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Unlock Test</DialogTitle>
            <DialogDescription>
              Payment is upcoming. For now, only access code unlock works.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="code">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="code" className="rounded-lg">
                Access Code
              </TabsTrigger>
              <TabsTrigger value="pay" className="rounded-lg" disabled>
                Pay Online (Upcoming)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="space-y-4 pt-4">
              <Input
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="rounded-xl"
              />
              <Button
                className="w-full gradient-bg rounded-xl"
                onClick={handleRedeemCode}
                disabled={redeeming}
              >
                {redeeming ? "Redeeming..." : "Redeem Code"}
              </Button>

              <p className="text-xs text-muted-foreground">
                Ask your educator for the access code (created in <span className="font-medium">Educator → Access Codes</span>).
              </p>
            </TabsContent>

            <TabsContent value="pay" className="space-y-4 pt-4">
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
                Payment integration is coming soon.
              </div>
              <Button className="w-full rounded-xl" variant="outline" disabled>
                Pay Now (Upcoming)
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                For now, please use access code.
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

