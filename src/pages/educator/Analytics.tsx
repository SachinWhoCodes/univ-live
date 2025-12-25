import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Target,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { db } from "@/lib/firebase";
import {
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { useAuth } from "@/contexts/AuthProvider";
import { useTenant } from "@/contexts/TenantProvider";

/**
 * Assumptions (aligning with your student dashboard logic):
 *  - users collection has: { role: "student", educatorId, createdAt, displayName/name, photoURL/avatar, batch/batchName }
 *  - attempts collection has: { educatorId, studentId, createdAt, status, subject, testId, testTitle, score, maxScore, accuracy, timeSpent }
 */

type UserDoc = {
  displayName?: string;
  name?: string;
  photoURL?: string;
  avatar?: string;
  batch?: string;
  batchName?: string;
};

type AttemptDoc = {
  educatorId?: string;
  studentId?: string;
  createdAt?: any;

  status?: string;
  subject?: string;

  testId?: string;
  testTitle?: string;

  score?: number;
  maxScore?: number;
  accuracy?: number; // 0..1 or 0..100 (we normalize)
  timeSpent?: number; // seconds
};

type GrowthPoint = { date: string; students: number; active: number };
type PieSlice = { name: string; value: number; color: string };
type TopPerformer = { studentId: string; name: string; avatarSeed: string; score: number; tests: number };
type Struggling = { studentId: string; name: string; avatarSeed: string; score: number; weakness: string };
type TestAgg = { name: string; attempts: number; avgScore: number };
type BatchAgg = { batch: string; avgScore: number; students: number; growth: number };

const PIE_COLORS = [
  "hsl(204, 91%, 56%)",
  "hsl(184, 87%, 65%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(271, 81%, 56%)",
  "hsl(0, 84%, 60%)",
  "hsl(199, 89%, 48%)",
];

function toMillis(v: any): number {
  if (!v) return Date.now();
  if (typeof v === "number") return v;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v?.seconds === "number") return v.seconds * 1000;
  return Date.now();
}

function safeNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeAccuracy(a: AttemptDoc) {
  // prefer accuracy if present else compute from score/maxScore
  if (a.accuracy != null) {
    const n = Number(a.accuracy);
    if (!Number.isFinite(n)) return 0;
    const pct = n <= 1.01 ? n * 100 : n;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }
  const score = safeNum(a.score, 0);
  const maxScore = safeNum(a.maxScore, 0);
  if (!maxScore) return 0;
  return Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
}

function isCompletedStatus(status?: string) {
  const s = String(status || "").toLowerCase();
  return ["completed", "submitted", "finished", "done"].includes(s);
}

function initials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function formatCompactInt(n: number) {
  return n.toLocaleString();
}

function pctChange(curr: number, prev: number) {
  if (prev <= 0 && curr <= 0) return 0;
  if (prev <= 0) return 100;
  return Math.round(((curr - prev) / prev) * 100);
}

function formatMinutes(seconds: number) {
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}

function weekLabel(i: number) {
  return `Week ${i}`;
}

function binHourLabel(h: number) {
  if (h < 9) return "6AM";
  if (h < 12) return "9AM";
  if (h < 15) return "12PM";
  if (h < 18) return "3PM";
  if (h < 21) return "6PM";
  return "9PM";
}

const WEEKDAY_KEYS: Array<keyof ActiveHoursRow> = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
type ActiveHoursRow = {
  hour: string;
  mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number;
};

function weekdayKeyFromDate(d: Date): keyof ActiveHoursRow {
  // JS: 0 Sun ... 6 Sat
  const day = d.getDay();
  if (day === 0) return "sun";
  if (day === 1) return "mon";
  if (day === 2) return "tue";
  if (day === 3) return "wed";
  if (day === 4) return "thu";
  if (day === 5) return "fri";
  return "sat";
}

export default function Analytics() {
  const { firebaseUser, profile, loading: authLoading } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();

  const educatorId = tenant?.educatorId || profile?.educatorId || null;

  const [periodDays, setPeriodDays] = useState<string>("30");
  const days = useMemo(() => Number(periodDays), [periodDays]);

  const [loading, setLoading] = useState(true);

  // quick stats
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  // changes
  const [studentsChange, setStudentsChange] = useState(0);
  const [attemptsChange, setAttemptsChange] = useState(0);
  const [avgScoreChange, setAvgScoreChange] = useState(0);
  const [avgTimeChange, setAvgTimeChange] = useState(0);

  // charts & lists
  const [studentGrowthData, setStudentGrowthData] = useState<GrowthPoint[]>([]);
  const [attemptDistribution, setAttemptDistribution] = useState<PieSlice[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [strugglingStudents, setStrugglingStudents] = useState<Struggling[]>([]);
  const [mostAttemptedTests, setMostAttemptedTests] = useState<TestAgg[]>([]);
  const [batchComparisonData, setBatchComparisonData] = useState<BatchAgg[]>([]);

  const canLoad = useMemo(() => {
    return !authLoading && !tenantLoading && !!firebaseUser?.uid && !!educatorId;
  }, [authLoading, tenantLoading, firebaseUser?.uid, educatorId]);

  const getDateRanges = useCallback(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    const prevEnd = new Date(start);
    prevEnd.setMilliseconds(-1);

    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - days);
    prevStart.setHours(0, 0, 0, 0);

    return {
      start,
      end,
      prevStart,
      prevEnd,
      startTs: Timestamp.fromDate(start),
      endTs: Timestamp.fromDate(end),
      prevStartTs: Timestamp.fromDate(prevStart),
      prevEndTs: Timestamp.fromDate(prevEnd),
    };
  }, [days]);

  const fetchUserProfiles = useCallback(async (studentIds: string[]) => {
    const out: Record<string, UserDoc | null> = {};
    await Promise.all(
      studentIds.map(async (sid) => {
        try {
          const snap = await getDoc(doc(db, "users", sid));
          out[sid] = snap.exists() ? (snap.data() as UserDoc) : null;
        } catch {
          out[sid] = null;
        }
      })
    );
    return out;
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (!canLoad) return;

    setLoading(true);

    try {
      const { startTs, endTs, prevStartTs, prevEndTs, start } = getDateRanges();

      // ===== 1) Counts (server aggregation) =====
      const qStudentsAll = query(
        collection(db, "users"),
        where("educatorId", "==", educatorId!),
        where("role", "==", "student")
      );
      const studentsAllSnap = await getCountFromServer(qStudentsAll);
      const totalStudentsCount = studentsAllSnap.data().count;

      const qStudentsNewCurr = query(
        collection(db, "users"),
        where("educatorId", "==", educatorId!),
        where("role", "==", "student"),
        where("createdAt", ">=", startTs),
        where("createdAt", "<=", endTs)
      );
      const qStudentsNewPrev = query(
        collection(db, "users"),
        where("educatorId", "==", educatorId!),
        where("role", "==", "student"),
        where("createdAt", ">=", prevStartTs),
        where("createdAt", "<=", prevEndTs)
      );

      const [newCurrSnap, newPrevSnap] = await Promise.all([
        getCountFromServer(qStudentsNewCurr),
        getCountFromServer(qStudentsNewPrev),
      ]);

      const newStudentsCurr = newCurrSnap.data().count;
      const newStudentsPrev = newPrevSnap.data().count;

      setTotalStudents(totalStudentsCount);
      setStudentsChange(pctChange(newStudentsCurr, newStudentsPrev));

      // ===== 2) Load attempts for charts/top lists (bounded) =====
      const qAttempts = query(
        collection(db, "attempts"),
        where("educatorId", "==", educatorId!),
        where("createdAt", ">=", startTs),
        where("createdAt", "<=", endTs),
        orderBy("createdAt", "asc"),
        limit(5000)
      );

      const attemptsSnap = await getDocs(qAttempts);
      if (attemptsSnap.size >= 5000) {
        toast.warning("Analytics is showing last 5000 attempts for this period (add server aggregation later for huge scale).");
      }

      const attempts: Array<{ id: string; data: AttemptDoc }> = attemptsSnap.docs.map((d) => ({
        id: d.id,
        data: d.data() as AttemptDoc,
      }));

      // total attempts in period via aggregation (accurate, not bounded)
      const qAttemptsCountCurr = query(
        collection(db, "attempts"),
        where("educatorId", "==", educatorId!),
        where("createdAt", ">=", startTs),
        where("createdAt", "<=", endTs)
      );
      const qAttemptsCountPrev = query(
        collection(db, "attempts"),
        where("educatorId", "==", educatorId!),
        where("createdAt", ">=", prevStartTs),
        where("createdAt", "<=", prevEndTs)
      );

      const [attemptsCountCurrSnap, attemptsCountPrevSnap] = await Promise.all([
        getCountFromServer(qAttemptsCountCurr),
        getCountFromServer(qAttemptsCountPrev),
      ]);

      const attemptsCurrCount = attemptsCountCurrSnap.data().count;
      const attemptsPrevCount = attemptsCountPrevSnap.data().count;

      setTotalAttempts(attemptsCurrCount);
      setAttemptsChange(pctChange(attemptsCurrCount, attemptsPrevCount));

      // ===== 3) Compute avg score/time/completion from fetched attempts =====
      const completed = attempts.filter((a) => isCompletedStatus(a.data.status));
      const completedCount = completed.length;

      const avgAcc =
        completedCount > 0
          ? Math.round(
              completed.reduce((sum, a) => sum + normalizeAccuracy(a.data), 0) / completedCount
            )
          : 0;

      const avgTimeSec =
        completedCount > 0
          ? Math.round(completed.reduce((sum, a) => sum + safeNum(a.data.timeSpent, 0), 0) / completedCount)
          : 0;

      setAvgScore(avgAcc);
      setAvgTime(avgTimeSec);
      setCompletionRate(attemptsCurrCount > 0 ? Math.round((completedCount / attemptsCurrCount) * 100) : 0);

      // ===== 4) Previous period avg score/time (for change badges) =====
      // Keep it light: fetch up to 2000 prev attempts
      const qPrevAttempts = query(
        collection(db, "attempts"),
        where("educatorId", "==", educatorId!),
        where("createdAt", ">=", prevStartTs),
        where("createdAt", "<=", prevEndTs),
        orderBy("createdAt", "asc"),
        limit(2000)
      );
      const prevSnap = await getDocs(qPrevAttempts);
      const prevDocs = prevSnap.docs.map((d) => d.data() as AttemptDoc);
      const prevCompleted = prevDocs.filter((a) => isCompletedStatus(a.status));

      const prevAvgAcc =
        prevCompleted.length > 0
          ? Math.round(prevCompleted.reduce((s, a) => s + normalizeAccuracy(a), 0) / prevCompleted.length)
          : 0;

      const prevAvgTime =
        prevCompleted.length > 0
          ? Math.round(prevCompleted.reduce((s, a) => s + safeNum(a.timeSpent, 0), 0) / prevCompleted.length)
          : 0;

      setAvgScoreChange(pctChange(avgAcc, prevAvgAcc));

      // avg time improvement: negative change is good; we still show sign
      const timeDeltaMin = Math.round((avgTimeSec - prevAvgTime) / 60);
      setAvgTimeChange(timeDeltaMin);

      // ===== 5) Student Growth (weekly within period) =====
      // baseline = total students created before start
      const qBaseline = query(
        collection(db, "users"),
        where("educatorId", "==", educatorId!),
        where("role", "==", "student"),
        where("createdAt", "<", Timestamp.fromDate(start))
      );
      const baselineSnap = await getCountFromServer(qBaseline);
      const baseline = baselineSnap.data().count;

      // fetch new users in this period (bounded)
      const qNewUsers = query(
        collection(db, "users"),
        where("educatorId", "==", educatorId!),
        where("role", "==", "student"),
        where("createdAt", ">=", startTs),
        where("createdAt", "<=", endTs),
        orderBy("createdAt", "asc"),
        limit(5000)
      );
      const newUsersSnap = await getDocs(qNewUsers);
      const newUserTimes = newUsersSnap.docs.map((d) => toMillis((d.data() as any)?.createdAt));

      // make week buckets
      const totalWeeks = Math.max(1, Math.ceil(days / 7));
      const weekStarts: number[] = [];
      for (let i = 0; i < totalWeeks; i++) {
        const dt = new Date(start);
        dt.setDate(start.getDate() + i * 7);
        weekStarts.push(dt.getTime());
      }

      const weekNewCounts = new Array(totalWeeks).fill(0);
      for (const ms of newUserTimes) {
        const idx = Math.min(totalWeeks - 1, Math.max(0, Math.floor((ms - weekStarts[0]) / (7 * 864e5))));
        weekNewCounts[idx] += 1;
      }

      // active students per week from attempts (unique)
      const weekActiveSets: Array<Set<string>> = new Array(totalWeeks).fill(null).map(() => new Set());
      for (const a of attempts) {
        const sid = String(a.data.studentId || "");
        if (!sid) continue;
        const ms = toMillis(a.data.createdAt);
        const idx = Math.min(totalWeeks - 1, Math.max(0, Math.floor((ms - weekStarts[0]) / (7 * 864e5))));
        weekActiveSets[idx].add(sid);
      }

      const growth: GrowthPoint[] = [];
      let cumulative = baseline;
      for (let i = 0; i < totalWeeks; i++) {
        cumulative += weekNewCounts[i];
        growth.push({
          date: weekLabel(i + 1),
          students: cumulative,
          active: weekActiveSets[i].size,
        });
      }
      setStudentGrowthData(growth);

      // ===== 6) Attempt Distribution (by subject) =====
      const subjMap = new Map<string, number>();
      for (const a of attempts) {
        const subject = String(a.data.subject || "General").trim() || "General";
        subjMap.set(subject, (subjMap.get(subject) || 0) + 1);
      }
      const totalAttemptDocs = attempts.length || 1;
      const subjArr = Array.from(subjMap.entries())
        .sort((x, y) => y[1] - x[1])
        .slice(0, 6);

      const pie: PieSlice[] = subjArr.map(([name, count], idx) => ({
        name,
        value: Math.round((count / totalAttemptDocs) * 100),
        color: PIE_COLORS[idx % PIE_COLORS.length],
      }));
      setAttemptDistribution(pie);

      // ===== 7) Top performers + struggling =====
      // Aggregate completed attempts per student (avg accuracy) + per subject for weakness
      const perStudent = new Map<
        string,
        {
          attempts: number;
          sumAcc: number;
          subject: Map<string, { sum: number; cnt: number }>;
        }
      >();

      for (const a of completed) {
        const sid = String(a.data.studentId || "");
        if (!sid) continue;
        const acc = normalizeAccuracy(a.data);
        const subject = String(a.data.subject || "General").trim() || "General";

        const s = perStudent.get(sid) || { attempts: 0, sumAcc: 0, subject: new Map() };
        s.attempts += 1;
        s.sumAcc += acc;

        const ss = s.subject.get(subject) || { sum: 0, cnt: 0 };
        ss.sum += acc;
        ss.cnt += 1;
        s.subject.set(subject, ss);

        perStudent.set(sid, s);
      }

      const studentStats = Array.from(perStudent.entries()).map(([studentId, v]) => {
        const avg = v.attempts ? v.sumAcc / v.attempts : 0;

        // weakness = subject with lowest avg among their subjects
        let weakness = "General";
        let weaknessAvg = Infinity;
        for (const [subj, ss] of v.subject.entries()) {
          const a = ss.cnt ? ss.sum / ss.cnt : Infinity;
          if (a < weaknessAvg) {
            weaknessAvg = a;
            weakness = subj;
          }
        }

        return {
          studentId,
          avg: Math.round(avg),
          tests: v.attempts,
          weakness,
        };
      });

      studentStats.sort((a, b) => b.avg - a.avg);

      const topIds = studentStats.slice(0, 5).map((s) => s.studentId);
      const bottomCandidates = studentStats
        .filter((s) => s.tests >= 3) // avoid noise
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 3);

      const bottomIds = bottomCandidates.map((s) => s.studentId);

      const needProfiles = Array.from(new Set([...topIds, ...bottomIds]));
      const profilesMap = await fetchUserProfiles(needProfiles);

      const top: TopPerformer[] = studentStats.slice(0, 5).map((s) => {
        const ud = profilesMap[s.studentId];
        const name = ud?.displayName || ud?.name || "Student";
        const avatarSeed = s.studentId.slice(0, 8);
        return { studentId: s.studentId, name, avatarSeed, score: s.avg, tests: s.tests };
      });
      setTopPerformers(top);

      const struggling: Struggling[] = bottomCandidates.map((s) => {
        const ud = profilesMap[s.studentId];
        const name = ud?.displayName || ud?.name || "Student";
        const avatarSeed = s.studentId.slice(0, 8);
        return { studentId: s.studentId, name, avatarSeed, score: s.avg, weakness: s.weakness };
      });
      setStrugglingStudents(struggling);

      // ===== 8) Most Attempted Tests =====
      const testMap = new Map<string, { cnt: number; sumAcc: number }>();
      for (const a of completed) {
        const title = String(a.data.testTitle || a.data.testId || "Test").trim() || "Test";
        const acc = normalizeAccuracy(a.data);
        const t = testMap.get(title) || { cnt: 0, sumAcc: 0 };
        t.cnt += 1;
        t.sumAcc += acc;
        testMap.set(title, t);
      }

      const most: TestAgg[] = Array.from(testMap.entries())
        .map(([name, v]) => ({
          name,
          attempts: v.cnt,
          avgScore: v.cnt ? Math.round(v.sumAcc / v.cnt) : 0,
        }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 8);

      setMostAttemptedTests(most);

      // ===== 9) Batch Comparison (best-effort) =====
      // We join batch from user docs for ACTIVE students in this period (not total in database).
      const activeStudentIds = Array.from(new Set(attempts.map((a) => String(a.data.studentId || "")).filter(Boolean)));
      const sampleIds = activeStudentIds.slice(0, 50); // keep it light
      const batchProfiles = await fetchUserProfiles(sampleIds);

      const sidToBatch = new Map<string, string>();
      for (const sid of sampleIds) {
        const ud = batchProfiles[sid];
        const b = ud?.batchName || ud?.batch || "Batch";
        sidToBatch.set(sid, b);
      }

      const batchMap = new Map<string, { students: Set<string>; sumAcc: number; cnt: number }>();
      for (const a of completed) {
        const sid = String(a.data.studentId || "");
        if (!sid) continue;
        const batch = sidToBatch.get(sid) || "Batch";
        const acc = normalizeAccuracy(a.data);

        const b = batchMap.get(batch) || { students: new Set(), sumAcc: 0, cnt: 0 };
        b.students.add(sid);
        b.sumAcc += acc;
        b.cnt += 1;
        batchMap.set(batch, b);
      }

      const batches: BatchAgg[] = Array.from(batchMap.entries())
        .map(([batch, v]) => ({
          batch,
          avgScore: v.cnt ? Math.round(v.sumAcc / v.cnt) : 0,
          students: v.students.size,
          growth: 0, // will approximate from newUsers in this period (overall)
        }))
        .sort((a, b) => b.students - a.students)
        .slice(0, 4);

      // growth approximation: overall new student change in period vs prev, applied as % label
      const growthPct = pctChange(newStudentsCurr, newStudentsPrev);
      setBatchComparisonData(batches.map((b) => ({ ...b, growth: Math.max(0, growthPct) })));

    } catch (e) {
      console.error(e);
      toast.error("Failed to load educator analytics.");
    } finally {
      setLoading(false);
    }
  }, [canLoad, educatorId, fetchUserProfiles, getDateRanges]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, periodDays]);

  const stats = useMemo(() => {
    return [
      {
        icon: Users,
        label: "Total Students",
        value: formatCompactInt(totalStudents),
        change: `${studentsChange >= 0 ? "+" : ""}${studentsChange}%`,
        positive: studentsChange >= 0,
      },
      {
        icon: Target,
        label: "Total Attempts",
        value: formatCompactInt(totalAttempts),
        change: `${attemptsChange >= 0 ? "+" : ""}${attemptsChange}%`,
        positive: attemptsChange >= 0,
      },
      {
        icon: TrendingUp,
        label: "Avg Score",
        value: `${avgScore}%`,
        change: `${avgScoreChange >= 0 ? "+" : ""}${avgScoreChange}%`,
        positive: avgScoreChange >= 0,
      },
      {
        icon: Clock,
        label: "Avg Time/Test",
        value: formatMinutes(avgTime),
        change: `${avgTimeChange >= 0 ? "+" : ""}${avgTimeChange}min`,
        // for time, negative is good (less time)
        positive: avgTimeChange <= 0,
      },
    ];
  }, [totalStudents, totalAttempts, avgScore, avgTime, studentsChange, attemptsChange, avgScoreChange, avgTimeChange]);

  if (!canLoad) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Detailed insights into your coaching performance
          </p>
        </div>
        <Select value={periodDays} onValueChange={setPeriodDays}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                  <Badge
                    variant="secondary"
                    className={
                      stat.positive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }
                  >
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{loading ? "—" : stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Extra Stat: Completion Rate */}
      <Card className="border-dashed">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">Completion Rate</p>
              <p className="text-xs text-muted-foreground">Completed attempts / total attempts in this period</p>
            </div>
          </div>
          <Badge className="rounded-full">{loading ? "—" : `${completionRate}%`}</Badge>
        </CardContent>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={studentGrowthData}>
                    <defs>
                      <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(204, 91%, 56%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(204, 91%, 56%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(184, 87%, 65%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(184, 87%, 65%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Area type="monotone" dataKey="students" stroke="hsl(204, 91%, 56%)" fill="url(#totalGradient)" strokeWidth={2} />
                    <Area type="monotone" dataKey="active" stroke="hsl(184, 87%, 65%)" fill="url(#activeGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Total Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(184, 87%, 65%)" }} />
                  <span className="text-xs text-muted-foreground">Active Students</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Attempt Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attemptDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {attemptDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                {attemptDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
                {attemptDistribution.length === 0 && (
                  <p className="text-xs text-muted-foreground col-span-2">No attempts in this period.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top & Struggling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((student, index) => (
                  <div
                    key={student.studentId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium w-6 text-muted-foreground">#{index + 1}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.avatarSeed}`} />
                      <AvatarFallback>{initials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.tests} completed attempts</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {student.score}%
                    </Badge>
                  </div>
                ))}
                {topPerformers.length === 0 && (
                  <p className="text-sm text-muted-foreground">No completed attempts yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">Students Needing Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strugglingStudents.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.avatarSeed}`} />
                      <AvatarFallback>{initials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">Weak in {student.weakness}</p>
                    </div>
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      {student.score}%
                    </Badge>
                  </div>
                ))}
                {strugglingStudents.length === 0 && (
                  <p className="text-sm text-muted-foreground">No struggling pattern detected yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Most Attempted Tests */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Attempted Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostAttemptedTests} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={170}
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="attempts" fill="hsl(204, 91%, 56%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {mostAttemptedTests.length === 0 && (
              <p className="text-sm text-muted-foreground mt-3">No completed attempts in this period.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Batch Comparison */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batch Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {batchComparisonData.map((batch) => (
                <div
                  key={batch.batch}
                  className="p-4 rounded-xl border border-border hover:shadow-card transition-shadow"
                >
                  <h4 className="font-medium text-sm mb-3">{batch.batch}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Students</span>
                      <span className="font-medium">{batch.students}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Score</span>
                      <span className="font-medium text-green-600">{batch.avgScore}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Growth</span>
                      <span className="font-medium text-primary">+{batch.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {batchComparisonData.length === 0 && (
                <p className="text-sm text-muted-foreground">No batch data yet (batch comes from users.batch / users.batchName).</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

