import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Maximize2,
  Save,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { HtmlView } from "@/lib/safeHtml";
import { TimerChip } from "@/components/student/TimerChip";

import { useAuth } from "@/contexts/AuthProvider";
import { useTenant } from "@/contexts/TenantProvider";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

type AttemptResponse = {
  answer: string | null;
  markedForReview: boolean;
  visited: boolean;
  answered: boolean;
};

type AttemptQuestion = {
  id: string;
  sectionId: string;
  type: "mcq" | "integer";
  stem: string; // text or HTML
  options?: { id: string; text: string }[]; // text or HTML
  correctAnswer?: string;
  explanation?: string;
  marks: { correct: number; incorrect: number };
  passage?: { title: string; content: string } | null;
};

type TestMeta = {
  id: string;
  title: string;
  subject?: string;
  durationMinutes: number;
  sections: { id: string; name: string }[];
};

type AttemptDoc = {
  studentId: string;
  educatorId: string;
  tenantSlug: string | null;
  testId: string;
  testTitle?: string;
  subject?: string;
  status: "in_progress" | "submitted";
  durationSec: number;
  startedAtMs?: number;
  currentIndex?: number;
  responses?: Record<string, AttemptResponse>;
  createdAt?: any;
  startedAt?: any;
  updatedAt?: any;
};

const LS_ATTEMPT_ID_PREFIX = "cbt_attempt_id__";

const safeNumber = (v: any, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const buildInitResponses = (qs: AttemptQuestion[]) => {
  const init: Record<string, AttemptResponse> = {};
  qs.forEach((q) => (init[q.id] = { answer: null, markedForReview: false, visited: false, answered: false }));
  return init;
};

// Admin-compatible question mapping
const mapQuestion = (id: string, data: any): AttemptQuestion => {
  const opts: string[] = Array.isArray(data.options) ? data.options : [];
  const correctIndex = safeNumber(data.correctOption, 0);
  const positive = safeNumber(data.marks, 4);
  const negative = safeNumber(data.negativeMarks, 1);

  return {
    id,
    sectionId: data.sectionId || "main",
    type: "mcq",
    stem: data.question || "",
    options: opts.map((t, i) => ({ id: String(i), text: String(t) })),
    correctAnswer: String(correctIndex),
    explanation: data.explanation || "",
    marks: { correct: positive, incorrect: negative },
    passage: null,
  };
};

const computeRemainingSeconds = (startedAtMs: number | null, totalSec: number) => {
  if (!totalSec) return 0;
  if (!startedAtMs) return totalSec;
  const elapsed = Math.floor((Date.now() - startedAtMs) / 1000);
  return Math.max(0, totalSec - elapsed);
};

async function requestFullscreenSafe() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    return true;
  } catch {
    return false;
  }
}

async function exitFullscreenSafe() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch {
    // ignore
  }
}

function statusOf(r: AttemptResponse | undefined) {
  const visited = !!r?.visited;
  const answered = !!r?.answer && String(r.answer).trim() !== "";
  const marked = !!r?.markedForReview;

  if (!visited) return "not_visited" as const;
  if (marked && answered) return "answered_marked" as const;
  if (marked && !answered) return "marked" as const;
  if (!marked && answered) return "answered" as const;
  return "not_answered" as const;
}

function statusColors(status: ReturnType<typeof statusOf>) {
  switch (status) {
    case "not_visited":
      return { bg: "#e5e7eb", border: "#9ca3af", text: "#111827" };
    case "not_answered":
      return { bg: "#f97316", border: "#c2410c", text: "#ffffff" };
    case "answered":
      return { bg: "#22c55e", border: "#15803d", text: "#ffffff" };
    case "marked":
      return { bg: "#7c3aed", border: "#5b21b6", text: "#ffffff" };
    case "answered_marked":
      return { bg: "#7c3aed", border: "#5b21b6", text: "#ffffff" };
    default:
      return { bg: "#e5e7eb", border: "#9ca3af", text: "#111827" };
  }
}

function Shape({
  status,
  label,
  withCount,
  count,
}: {
  status: ReturnType<typeof statusOf>;
  label?: string;
  withCount?: boolean;
  count?: number;
}) {
  const c = statusColors(status);

  const common = {
    backgroundColor: c.bg,
    borderColor: c.border,
    color: c.text,
  } as any;

  const showTick = status === "answered_marked";

  if (status === "marked" || status === "answered_marked") {
    return (
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "relative h-8 w-8 rounded-full border grid place-items-center font-semibold text-xs",
            withCount ? "" : "shrink-0"
          )}
          style={common}
        >
          {withCount ? count : null}
          {showTick ? (
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#22c55e] text-white grid place-items-center">
              <Check className="h-3 w-3" />
            </span>
          ) : null}
        </div>
        {label ? <span className="text-muted-foreground text-sm">{label}</span> : null}
      </div>
    );
  }

  if (status === "not_answered" || status === "answered") {
    // NTA flag shape
    return (
      <div className="flex items-center gap-3">
        <div
          className="relative h-8 w-12 border grid place-items-center font-semibold text-xs"
          style={{
            ...common,
            clipPath: "polygon(0 0, 78% 0, 100% 50%, 78% 100%, 0 100%)",
          }}
        >
          {withCount ? count : null}
        </div>
        {label ? <span className="text-muted-foreground text-sm">{label}</span> : null}
      </div>
    );
  }

  // not_visited
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-10 border rounded-sm grid place-items-center font-semibold text-xs" style={common}>
        {withCount ? count : null}
      </div>
      {label ? <span className="text-muted-foreground text-sm">{label}</span> : null}
    </div>
  );
}

function LegendItem({ label, status }: { label: string; status: ReturnType<typeof statusOf> }) {
  return <Shape status={status} label={label} />;
}

function PaletteGlyph({
  status,
  number,
  isCurrent,
}: {
  status: ReturnType<typeof statusOf>;
  number: number;
  isCurrent: boolean;
}) {
  const c = statusColors(status);
  const baseStyle = {
    backgroundColor: c.bg,
    borderColor: c.border,
    color: c.text,
  };

  const tick = status === "answered_marked";

  // Circle for review states
  if (status === "marked" || status === "answered_marked") {
    return (
      <div className={cn("relative h-10 w-10 rounded-full border grid place-items-center font-semibold text-sm", isCurrent && "ring-2 ring-black/70")} style={baseStyle}>
        {number}
        {tick ? (
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#22c55e] text-white grid place-items-center">
            <Check className="h-3 w-3" />
          </span>
        ) : null}
      </div>
    );
  }

  // Flag for answered / not answered
  if (status === "not_answered" || status === "answered") {
    return (
      <div
        className={cn("relative h-10 w-12 border grid place-items-center font-semibold text-sm", isCurrent && "ring-2 ring-black/70")}
        style={{
          ...baseStyle,
          clipPath: "polygon(0 0, 78% 0, 100% 50%, 78% 100%, 0 100%)",
        }}
      >
        {number}
      </div>
    );
  }

  // Square for not visited
  return (
    <div className={cn("h-10 w-10 border rounded-sm grid place-items-center font-semibold text-sm", isCurrent && "ring-2 ring-black/70")} style={baseStyle}>
      {number}
    </div>
  );
}


export default function StudentCBTAttempt() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const { firebaseUser, profile, loading: authLoading } = useAuth();
  const { tenant, tenantSlug, loading: tenantLoading } = useTenant();

  const educatorId = tenant?.educatorId || profile?.educatorId || null;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [testMeta, setTestMeta] = useState<TestMeta | null>(null);
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, AttemptResponse>>({});

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSectionId, setCurrentSectionId] = useState("main");

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptStartedAtMs, setAttemptStartedAtMs] = useState<number | null>(null);
  const [durationSec, setDurationSec] = useState(0);

  const [isStarted, setIsStarted] = useState(false);

  // Instructions gate
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  const [instructionsChecked, setInstructionsChecked] = useState(false);

  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [timerStartSeconds, setTimerStartSeconds] = useState(0);

  const attemptIdStorageKey = useMemo(
    () => `${LS_ATTEMPT_ID_PREFIX}${tenantSlug || "main"}__${testId || ""}`,
    [tenantSlug, testId]
  );

  const attemptRef = useMemo(() => (attemptId ? doc(db, "attempts", attemptId) : null), [attemptId]);

  // Debounced Firestore updates
  const saveTimerRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<Record<string, any>>({});

  const queueAttemptUpdate = useCallback(
    (patch: Record<string, any>) => {
      if (!attemptRef) return;

      pendingUpdateRef.current = { ...pendingUpdateRef.current, ...patch };

      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(async () => {
        const payload = pendingUpdateRef.current;
        pendingUpdateRef.current = {};
        setSaving(true);
        try {
          await updateDoc(attemptRef, { ...payload, updatedAt: serverTimestamp() });
          setLastSavedAt(Date.now());
        } catch (e) {
          console.error(e);
          toast.error("Failed to save progress");
        } finally {
          setSaving(false);
        }
      }, 650);
    },
    [attemptRef]
  );

  const currentQuestion = questions[currentIndex] || null;

  const counts = useMemo(() => {
    const all = Object.values(responses);
    const notVisited = all.filter((r) => statusOf(r) === "not_visited").length;
    const notAnswered = all.filter((r) => statusOf(r) === "not_answered").length;
    const answered = all.filter((r) => statusOf(r) === "answered").length;
    const marked = all.filter((r) => statusOf(r) === "marked").length;
    const answeredMarked = all.filter((r) => statusOf(r) === "answered_marked").length;
    return { notVisited, notAnswered, answered, marked, answeredMarked, total: all.length };
  }, [responses]);

  // Full screen overlay mode: hide app chrome behind (sidebar/topbar)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Load test + questions + existing attempt
  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!testId) {
        setLoadError("Missing test id");
        setLoading(false);
        return;
      }
      if (authLoading || tenantLoading) return;
      if (!firebaseUser) {
        setLoadError("You must be logged in");
        setLoading(false);
        return;
      }
      if (!educatorId) {
        setLoadError("Tenant not found. Open this test from your coaching website.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const sources = [
          {
            testDoc: doc(db, "educators", educatorId, "my_tests", testId),
            qCol: collection(db, "educators", educatorId, "my_tests", testId, "questions"),
          },
          {
            testDoc: doc(db, "test_series", testId),
            qCol: collection(db, "test_series", testId, "questions"),
          },
        ];

        let meta: TestMeta | null = null;
        let qs: AttemptQuestion[] = [];

        for (const s of sources) {
          const tSnap = await getDoc(s.testDoc);
          if (!tSnap.exists()) continue;

          const d = tSnap.data() as any;
          const durationMinutes = safeNumber(d.durationMinutes, 60);
          const computedSections = [{ id: "main", name: d.subject || "General" }];

          meta = {
            id: tSnap.id,
            title: d.title || "Untitled Test",
            subject: d.subject,
            durationMinutes,
            sections: Array.isArray(d.sections) && d.sections.length ? d.sections : computedSections,
          };

          const qSnap = await getDocs(s.qCol);
          qs = qSnap.docs.map((q) => mapQuestion(q.id, q.data()));
          break;
        }

        if (!meta) throw new Error("Test not found");
        if (!qs.length) throw new Error("No questions found in this test");

        if (!mounted) return;

        setTestMeta(meta);
        setQuestions(qs);
        setDurationSec(meta.durationMinutes * 60);

        const init = buildInitResponses(qs);
        setResponses(init);
        setCurrentIndex(0);
        setCurrentSectionId(qs[0]?.sectionId || "main");

        // Attempt resume: localStorage -> doc -> query
        const loadAttemptById = async (id: string) => {
          const aSnap = await getDoc(doc(db, "attempts", id));
          if (!aSnap.exists()) return null;
          const a = aSnap.data() as AttemptDoc;
          if (a.studentId !== firebaseUser.uid) return null;
          if (a.testId !== testId) return null;
          if (a.status !== "in_progress") return null;
          if (a.educatorId !== educatorId) return null;
          return { id: aSnap.id, ...a } as any;
        };

        let foundAttempt: any = null;
        const cachedId = localStorage.getItem(attemptIdStorageKey);

        if (cachedId) {
          foundAttempt = await loadAttemptById(cachedId);
          if (!foundAttempt) localStorage.removeItem(attemptIdStorageKey);
        }

        if (!foundAttempt) {
          const qAttempt = query(
            collection(db, "attempts"),
            where("studentId", "==", firebaseUser.uid),
            where("testId", "==", testId),
            where("educatorId", "==", educatorId),
            where("status", "==", "in_progress"),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const aSnap = await getDocs(qAttempt);
          if (!aSnap.empty) {
            const d = aSnap.docs[0];
            foundAttempt = { id: d.id, ...(d.data() as AttemptDoc) };
            localStorage.setItem(attemptIdStorageKey, d.id);
          }
        }

        if (!mounted) return;

        if (foundAttempt) {
          setAttemptId(foundAttempt.id);

          const stored = (foundAttempt.responses || {}) as Record<string, AttemptResponse>;
          setResponses((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((qid) => {
              if (stored[qid]) next[qid] = stored[qid];
            });
            return next;
          });

          setCurrentIndex(safeNumber(foundAttempt.currentIndex, 0));

          const startedMs =
            foundAttempt.startedAtMs ||
            (foundAttempt.startedAt && typeof foundAttempt.startedAt.toMillis === "function"
              ? foundAttempt.startedAt.toMillis()
              : null);

          setAttemptStartedAtMs(startedMs ? safeNumber(startedMs, Date.now()) : null);
          setDurationSec(safeNumber(foundAttempt.durationSec, meta.durationMinutes * 60));

          setIsStarted(false);
          setInstructionsOpen(true);
          setInstructionsChecked(false);
        } else {
          setAttemptId(null);
          setAttemptStartedAtMs(null);
          setIsStarted(false);
          setInstructionsOpen(true);
          setInstructionsChecked(false);
        }
      } catch (e: any) {
        console.error(e);
        if (!mounted) return;
        setLoadError(e?.message || "Failed to load test");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [testId, authLoading, tenantLoading, firebaseUser, educatorId, attemptIdStorageKey]);

  // Keep section in sync
  useEffect(() => {
    const q = questions[currentIndex];
    if (q?.sectionId) setCurrentSectionId(q.sectionId);
  }, [questions, currentIndex]);

  // Mark visited (only after started)
  useEffect(() => {
    if (!isStarted || !currentQuestion || !attemptId) return;
    const qId = currentQuestion.id;

    setResponses((prev) => {
      const cur = prev[qId];
      if (!cur || cur.visited) return prev;

      const next = { ...prev, [qId]: { ...cur, visited: true } };
      queueAttemptUpdate({ [`responses.${qId}.visited`]: true, currentIndex });
      return next;
    });
  }, [isStarted, currentQuestion, attemptId, queueAttemptUpdate, currentIndex]);

  // Heartbeat
  useEffect(() => {
    if (!isStarted || !attemptId) return;
    const i = window.setInterval(() => queueAttemptUpdate({ currentIndex }), 20000);
    return () => window.clearInterval(i);
  }, [isStarted, attemptId, queueAttemptUpdate, currentIndex]);

  // Leave fullscreen on unmount
  useEffect(() => {
    return () => {
      exitFullscreenSafe();
    };
  }, []);

  const goToIndex = (idx: number) => {
    const next = Math.max(0, Math.min(idx, questions.length - 1));
    setCurrentIndex(next);
    if (attemptId) queueAttemptUpdate({ currentIndex: next });
  };

  const handleProceed = async () => {
    if (!instructionsChecked) return;
    if (!firebaseUser || !testId || !educatorId || !testMeta) return;

    const fullscreenOk = await requestFullscreenSafe();
    if (!fullscreenOk) toast.message("Fullscreen was blocked by browser. Continuing in normal mode.");

    let id = attemptId;
    let startedAtMs = attemptStartedAtMs;

    try {
      const totalSec = durationSec || testMeta.durationMinutes * 60;

      // Resume expired attempt -> submit immediately
      if (id && startedAtMs && computeRemainingSeconds(startedAtMs, totalSec) <= 0) {
        toast.error("Time is already over. Submitting your test...");
        await handleSubmit(true);
        return;
      }

      if (!id) {
        startedAtMs = Date.now();
        const initialResponses = buildInitResponses(questions);

        const payload: AttemptDoc = {
          studentId: firebaseUser.uid,
          educatorId,
          tenantSlug: tenantSlug || null,
          testId,
          testTitle: testMeta.title,
          subject: testMeta.subject,
          status: "in_progress",
          durationSec: totalSec,
          startedAtMs,
          currentIndex,
          responses: initialResponses,
          createdAt: serverTimestamp(),
          startedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const ref = await addDoc(collection(db, "attempts"), payload);
        id = ref.id;

        setAttemptId(id);
        localStorage.setItem(attemptIdStorageKey, id);

        setResponses((prev) => ({ ...initialResponses, ...prev }));
      } else if (!startedAtMs) {
        startedAtMs = Date.now();
        setAttemptStartedAtMs(startedAtMs);
        await updateDoc(doc(db, "attempts", id), { startedAtMs, updatedAt: serverTimestamp() });
      }

      const remaining = computeRemainingSeconds(startedAtMs!, totalSec);
      setAttemptStartedAtMs(startedAtMs!);
      setDurationSec(totalSec);
      setTimerStartSeconds(remaining);

      setIsStarted(true);
      setInstructionsOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to start test");
    }
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || !attemptId) return;

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], answer, answered: String(answer).length > 0 },
    }));

    queueAttemptUpdate({
      [`responses.${currentQuestion.id}.answer`]: answer,
      [`responses.${currentQuestion.id}.answered`]: String(answer).length > 0,
      currentIndex,
    });
  };

  const setMarkedForReview = (value: boolean) => {
    if (!currentQuestion || !attemptId) return;

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], markedForReview: value },
    }));

    queueAttemptUpdate({ [`responses.${currentQuestion.id}.markedForReview`]: value, currentIndex });
  };

  const handleClearResponse = () => {
    if (!currentQuestion || !attemptId) return;

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], answer: null, answered: false },
    }));

    queueAttemptUpdate({
      [`responses.${currentQuestion.id}.answer`]: null,
      [`responses.${currentQuestion.id}.answered`]: false,
      currentIndex,
    });
  };

  const saveAndNext = () => {
    if (!isStarted) return;
    goToIndex(currentIndex + 1);
  };

  const markForReviewAndNext = () => {
    if (!isStarted) return;
    setMarkedForReview(true);
    goToIndex(currentIndex + 1);
  };

  const saveAndMarkForReview = () => {
    if (!isStarted) return;
    setMarkedForReview(true);
  };

  const computeScore = () => {
    let score = 0;
    let maxScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    for (const q of questions) {
      maxScore += safeNumber(q.marks.correct, 0);

      const ans = responses[q.id]?.answer;
      if (ans === null || ans === undefined || String(ans).trim() === "") {
        unansweredCount += 1;
        continue;
      }

      if (q.type === "integer") {
        if (String(ans).trim() === String(q.correctAnswer ?? "").trim()) {
          score += safeNumber(q.marks.correct, 0);
          correctCount += 1;
        } else {
          score -= safeNumber(q.marks.incorrect, 0);
          incorrectCount += 1;
        }
      } else {
        if (String(ans) === String(q.correctAnswer ?? "")) {
          score += safeNumber(q.marks.correct, 0);
          correctCount += 1;
        } else {
          score -= safeNumber(q.marks.incorrect, 0);
          incorrectCount += 1;
        }
      }
    }

    const attempted = correctCount + incorrectCount;
    const accuracy = attempted > 0 ? correctCount / attempted : 0;

    return { score, maxScore, correctCount, incorrectCount, unansweredCount, accuracy };
  };

  const flushPendingSaves = async () => {
    if (!attemptRef) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    const pending = pendingUpdateRef.current;
    pendingUpdateRef.current = {};
    if (Object.keys(pending).length > 0) await updateDoc(attemptRef, { ...pending, updatedAt: serverTimestamp() });
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!attemptId || !firebaseUser || !testId || !educatorId || !testMeta) return;

    try {
      setSaving(true);
      await flushPendingSaves();

      const { score, maxScore, correctCount, incorrectCount, unansweredCount, accuracy } = computeScore();
      const totalSec = durationSec || testMeta.durationMinutes * 60;
      const startedAtMs = attemptStartedAtMs || Date.now();
      const remaining = computeRemainingSeconds(startedAtMs, totalSec);
      const timeTakenSec = Math.max(0, totalSec - remaining);

      await updateDoc(doc(db, "attempts", attemptId), {
        status: "submitted",
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        score,
        maxScore,
        correctCount,
        incorrectCount,
        unansweredCount,
        accuracy,
        timeTakenSec,
      });

      localStorage.removeItem(attemptIdStorageKey);
      await exitFullscreenSafe();

      navigate(`/student/results/${attemptId}?fromTest=true${isAutoSubmit ? "&auto=1" : ""}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit test");
    } finally {
      setSaving(false);
      setSubmitDialogOpen(false);
    }
  };

  const handleTimeUp = async () => {
    toast.error("Time's up! Submitting your test...");
    await handleSubmit(true);
  };

  // Warn on reload/close while started
  useEffect(() => {
    if (!isStarted) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isStarted]);

  if (loading || authLoading || tenantLoading) return <div className="text-center py-12">Loading...</div>;
  if (loadError || !testMeta || !currentQuestion) return <div className="text-center py-12">{loadError || "Failed to load test"}</div>;

  const timerKey = isStarted ? `running_${attemptId || "new"}` : `paused_${attemptId || "new"}`;

  const candidateName =
    profile?.name || profile?.fullName || firebaseUser?.displayName || firebaseUser?.email || "Candidate";

  return (
    <div className="fixed inset-0 z-[60] bg-[#f1f5f9] text-[#111827]">
      {/* Instructions Modal */}
      <Dialog open={instructionsOpen} onOpenChange={(open) => { if (isStarted) setInstructionsOpen(open); }}>
        <DialogContent className="max-w-3xl rounded-2xl" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5" />
              Instructions
            </DialogTitle>
            <DialogDescription>
              Read carefully before starting. You must confirm to proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border bg-white p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exam</span>
                  <span className="font-semibold">{testMeta.title}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold">{testMeta.durationMinutes} minutes</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Total Questions</span>
                  <span className="font-semibold">{questions.length}</span>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <p className="font-semibold mb-3">General Instructions</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>This is a computer-based test with a timer; it will auto-submit when time ends.</li>
                  <li>The time duration for the test is {testMeta.durationMinutes} minutes.</li>
                  <li>Use Save &amp; Next to move forward and Previous to go back.</li>
                  <li>You can change or clear your answer anytime before submission.</li>
                  <li>Use Mark for Review &amp; Next to revisit questions later.</li>
                  <li>Check question status using the palette on the right.</li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <p className="font-semibold mb-4">Question Palette Legend</p>
              <div className="space-y-3">
                <LegendItem status="not_visited" label="You have not visited the question yet." />
                <LegendItem status="not_answered" label="You have not answered the question." />
                <LegendItem status="answered" label="You have answered the question." />
                <LegendItem status="marked" label="You have NOT answered the question, but have marked the question for review." />
                <LegendItem status="answered_marked" label='The question(s) "Answered and Marked for Review" will be considered for evaluation.' />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <Checkbox
              id="confirm_instructions"
              checked={instructionsChecked}
              onCheckedChange={(v) => setInstructionsChecked(!!v)}
            />
            <Label htmlFor="confirm_instructions" className="text-sm">
              I have read and understood the instructions
            </Label>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceed}
              disabled={!instructionsChecked}
              className="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
            >
              PROCEED
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top header like NTA */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-10 w-10 rounded bg-slate-200 grid place-items-center text-xs font-bold">
            CBT
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{testMeta.title}</div>
            <div className="text-xs text-muted-foreground truncate">
              Candidate: <span className="text-foreground">{candidateName}</span> • Subject:{" "}
              <span className="text-foreground">{testMeta.subject || "General"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isStarted ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Remaining Time</span>
              <TimerChip key={timerKey} initialSeconds={timerStartSeconds} onTimeUp={handleTimeUp} />
            </div>
          ) : (
            <div className="text-xs font-semibold text-muted-foreground">Not started</div>
          )}

          <div className={cn("flex items-center gap-1 text-xs", saving ? "text-amber-600" : "text-emerald-600")}>
            <Save className="h-3 w-3" />
            {saving ? "Saving…" : lastSavedAt ? "Saved" : "Ready"}
          </div>

          <Button
            variant="destructive"
            size="sm"
            className="rounded-md"
            onClick={() => setSubmitDialogOpen(true)}
            disabled={!isStarted}
          >
            SUBMIT
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0">
        {/* Left: Question Panel */}
        <div className="p-3 lg:p-4">
          {/* Section Tabs (if multiple) */}
          {testMeta.sections.length > 1 && (
            <Tabs value={currentSectionId} onValueChange={setCurrentSectionId} className="mb-3">
              <TabsList className="w-full justify-start overflow-x-auto rounded-md bg-white border">
                {testMeta.sections.map((section) => (
                  <TabsTrigger key={section.id} value={section.id} className="rounded-md">
                    {section.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          <div className="bg-white border rounded-md h-[calc(100vh-4rem-12px-60px)] lg:h-[calc(100vh-4rem-16px-60px)] flex flex-col">
            {/* Question header */}
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <div className="text-sm font-semibold">
                Question {currentIndex + 1} / {questions.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Marks: +{safeNumber(currentQuestion.marks.correct, 0)} / -{safeNumber(currentQuestion.marks.incorrect, 0)}
              </div>
            </div>

            {/* Question content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {!!currentQuestion.passage && (
                <div className="p-3 bg-slate-50 border rounded-md">
                  <p className="font-semibold mb-1">{currentQuestion.passage.title}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{currentQuestion.passage.content}</p>
                </div>
              )}

              <div className="flex gap-2">
                <span className="font-semibold">Q{currentIndex + 1}.</span>
                <HtmlView html={currentQuestion.stem} className="flex-1" />
              </div>

              {currentQuestion.type === "mcq" && currentQuestion.options && (
                <RadioGroup
                  value={responses[currentQuestion.id]?.answer || ""}
                  onValueChange={handleAnswer}
                  className="space-y-2"
                  disabled={!isStarted}
                >
                  {currentQuestion.options.map((option, i) => (
                    <div key={option.id} className={cn("flex items-start gap-3 border rounded-md p-3", !isStarted && "opacity-60")}>
                      <RadioGroupItem value={option.id} id={`${currentQuestion.id}_${option.id}`} className="mt-1" />
                      <Label htmlFor={`${currentQuestion.id}_${option.id}`} className="flex-1 cursor-pointer">
                        <div className="flex gap-2">
                          <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>
                          <HtmlView html={option.text} className="flex-1" />
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === "integer" && (
                <div className="max-w-xs">
                  <Input
                    type="number"
                    placeholder="Enter your answer"
                    value={responses[currentQuestion.id]?.answer || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="rounded-md text-base"
                    disabled={!isStarted}
                  />
                </div>
              )}
            </div>

            {/* Action buttons bar (NTA style) */}
            <div className="border-t p-3 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                <Button
                  onClick={saveAndNext}
                  disabled={!isStarted || currentIndex >= questions.length - 1}
                  className="rounded-md bg-[#16a34a] hover:bg-[#15803d] text-white"
                >
                  SAVE &amp; NEXT
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearResponse}
                  disabled={!isStarted}
                  className="rounded-md"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  CLEAR
                </Button>

                <Button
                  onClick={saveAndMarkForReview}
                  disabled={!isStarted}
                  className="rounded-md bg-[#f59e0b] hover:bg-[#d97706] text-white"
                >
                  SAVE &amp; MARK FOR REVIEW
                </Button>

                <Button
                  onClick={markForReviewAndNext}
                  disabled={!isStarted || currentIndex >= questions.length - 1}
                  className="rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                >
                  MARK FOR REVIEW &amp; NEXT
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  className="rounded-md"
                  disabled={!isStarted || currentIndex === 0}
                  onClick={() => goToIndex(currentIndex - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> PREVIOUS
                </Button>

                <Button
                  variant="outline"
                  className="rounded-md"
                  disabled={!isStarted || currentIndex === questions.length - 1}
                  onClick={() => goToIndex(currentIndex + 1)}
                >
                  NEXT <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Palette Panel */}
        <div className="hidden lg:flex flex-col border-l bg-white">
          <div className="p-4 border-b">
            <div className="font-semibold text-sm mb-3">Question Palette</div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Shape status="not_visited" withCount count={counts.notVisited} />
                <span className="text-muted-foreground">Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <Shape status="not_answered" withCount count={counts.notAnswered} />
                <span className="text-muted-foreground">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <Shape status="answered" withCount count={counts.answered} />
                <span className="text-muted-foreground">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <Shape status="marked" withCount count={counts.marked} />
                <span className="text-muted-foreground">Marked for Review</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 mt-1">
                <Shape status="answered_marked" withCount count={counts.answeredMarked} />
                <span className="text-muted-foreground">
                  Answered &amp; Marked for Review (evaluated)
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 overflow-auto">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const st = statusOf(responses[q.id]);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => isStarted && goToIndex(idx)}
                    disabled={!isStarted}
                    className={cn("inline-flex", !isStarted && "opacity-60 cursor-not-allowed")}
                    title={`Q${idx + 1}`}
                  >
                    <PaletteGlyph status={st} number={idx + 1} isCurrent={isCurrent} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t text-xs text-muted-foreground space-y-2">
            <div className="flex items-center justify-between">
              <span>Marked for review:</span>
              <span className="font-semibold text-foreground">{counts.marked + counts.answeredMarked}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Answered:</span>
              <span className="font-semibold text-foreground">{counts.answered + counts.answeredMarked}</span>
            </div>

            <Button
              variant="destructive"
              className="w-full rounded-md"
              onClick={() => setSubmitDialogOpen(true)}
              disabled={!isStarted}
            >
              SUBMIT
            </Button>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" /> Submit Test?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to submit? You won't be able to change your answers.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4 text-sm">
            <div className="p-3 rounded-xl bg-emerald-50 border">
              <p className="font-semibold text-emerald-700">{counts.answered + counts.answeredMarked}</p>
              <p className="text-xs text-muted-foreground">Answered</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50 border">
              <p className="font-semibold text-orange-700">{counts.notAnswered}</p>
              <p className="text-xs text-muted-foreground">Not Answered</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <p className="font-semibold text-slate-700">{counts.notVisited}</p>
              <p className="text-xs text-muted-foreground">Not Visited</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border">
              <p className="font-semibold text-purple-700">{counts.marked + counts.answeredMarked}</p>
              <p className="text-xs text-muted-foreground">Marked for Review</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button className="rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white" onClick={() => handleSubmit(false)} disabled={!isStarted}>
              Submit Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}