import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Loader2,
  TrendingUp,
  Award,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmptyState from "@/components/educator/EmptyState";

import { onAuthStateChanged } from "firebase/auth";
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  limit,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Student = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  status: "active" | "inactive";
  createdAt?: Timestamp | null;
};

type Attempt = {
  id: string;
  studentId: string;
  testTitle?: string;
  subject?: string;
  scorePercent?: number;
  createdAt?: Timestamp | null;
};

function fmtDate(ts?: Timestamp | null) {
  if (!ts) return "—";
  try {
    return ts.toDate().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

function statusBadge(status: "active" | "inactive") {
  return status === "active"
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300";
}

export default function Learners() {
  const [uid, setUid] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // detail modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);

  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [attemptStatsLoading, setAttemptStatsLoading] = useState(false);

  const [avgScore, setAvgScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [bestSubject, setBestSubject] = useState<string>("—");

  // auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  // students list (realtime)
  useEffect(() => {
    if (!uid) {
      setStudents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = collection(db, "educators", uid, "students");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Student[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: String(data?.name || data?.fullName || "Student"),
            email: data?.email ? String(data.email) : undefined,
            phone: data?.phone ? String(data.phone) : undefined,
            city: data?.city ? String(data.city) : undefined,
            status: (data?.status || (data?.isActive ? "active" : "inactive") || "active") as
              | "active"
              | "inactive",
            createdAt: (data?.createdAt as Timestamp) || null,
          };
        });

        setStudents(rows);
        setLoading(false);
      },
      () => {
        toast.error("Failed to load learners");
        setStudents([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  async function toggleActive(s: Student) {
    if (!uid) return;
    try {
      const next = s.status === "active" ? "inactive" : "active";
      await updateDoc(doc(db, "educators", uid, "students", s.id), { status: next });
      toast.success(next === "active" ? "Student activated" : "Student deactivated");
    } catch {
      toast.error("Could not update status");
    }
  }

  async function openStudentDetails(s: Student) {
    if (!uid) return;

    setSelected(s);
    setOpen(true);

    setAttemptStatsLoading(true);
    setRecentAttempts([]);
    setAvgScore(0);
    setTotalAttempts(0);
    setBestSubject("—");

    try {
      const attemptsRef = collection(db, "educators", uid, "attempts");
      const q = query(
        attemptsRef,
        where("studentId", "==", s.id),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const snap = await getDocs(q);
      const rows: Attempt[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          studentId: String(data?.studentId || ""),
          testTitle: data?.testTitle ? String(data.testTitle) : undefined,
          subject: data?.subject ? String(data.subject) : undefined,
          scorePercent: typeof data?.scorePercent === "number" ? data.scorePercent : undefined,
          createdAt: (data?.createdAt as Timestamp) || null,
        };
      });

      setRecentAttempts(rows);
      setTotalAttempts(rows.length);

      const scores = rows
        .map((a) => a.scorePercent)
        .filter((x): x is number => typeof x === "number" && Number.isFinite(x));
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      setAvgScore(Math.round(avg));

      const bySubject: Record<string, number[]> = {};
      rows.forEach((a) => {
        if (!a.subject) return;
        if (typeof a.scorePercent !== "number") return;
        if (!bySubject[a.subject]) bySubject[a.subject] = [];
        bySubject[a.subject].push(a.scorePercent);
      });

      const best = Object.entries(bySubject)
        .map(([subj, arr]) => ({
          subject: subj,
          avg: arr.reduce((a, b) => a + b, 0) / arr.length,
          count: arr.length,
        }))
        .sort((a, b) => b.avg - a.avg)[0];

      if (best) setBestSubject(`${best.subject} (${Math.round(best.avg)}%)`);
    } catch {
      toast.error("Could not load student attempts");
    } finally {
      setAttemptStatsLoading(false);
    }
  }

  if (!uid) {
    return (
      <EmptyState
        icon={Users}
        title="Please login as Educator"
        description="You must be logged in to manage learners."
        actionLabel="Go to Login"
        onAction={() => (window.location.href = "/login?role=educator")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Learners</h1>
          <p className="text-muted-foreground text-sm">
            Manage your students and view their performance
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search learners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-44 rounded-xl">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading learners...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No learners found"
          description="Once students register on your subdomain, they will appear here."
          actionLabel="OK"
          onAction={() => toast.info("Student subdomain login will be wired next")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s, index) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
            >
              <Card className="card-hover h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base truncate">{s.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {fmtDate(s.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={statusBadge(s.status)}>
                        {s.status}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openStudentDetails(s)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => toggleActive(s)}>
                            {s.status === "active" ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {s.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}
                    {s.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                    {s.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{s.city}</span>
                      </div>
                    )}
                    {!s.email && !s.phone && !s.city && (
                      <div className="text-xs text-muted-foreground">
                        No profile details available.
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => openStudentDetails(s)}
                  >
                    View Performance
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Student Detail Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>

          {!selected ? (
            <div className="py-8 text-center text-muted-foreground">No student selected.</div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="card-soft border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Target className="h-4 w-4" />
                      Attempts
                    </div>
                    <div className="text-2xl font-bold mt-2">{totalAttempts}</div>
                  </CardContent>
                </Card>

                <Card className="card-soft border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <TrendingUp className="h-4 w-4" />
                      Avg Score
                    </div>
                    <div className="text-2xl font-bold mt-2">{avgScore}%</div>
                  </CardContent>
                </Card>

                <Card className="card-soft border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Award className="h-4 w-4" />
                      Best Subject
                    </div>
                    <div className="text-base font-semibold mt-2">{bestSubject}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-lg">{selected.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {fmtDate(selected.createdAt)} •{" "}
                      <span className={cn("font-medium", selected.status === "active" ? "text-green-600" : "text-slate-500")}>
                        {selected.status}
                      </span>
                    </p>

                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {selected.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{selected.email}</span>
                        </div>
                      )}
                      {selected.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{selected.phone}</span>
                        </div>
                      )}
                      {selected.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{selected.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => toggleActive(selected)}
                  >
                    {selected.status === "active" ? (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Recent Attempts */}
              <div>
                <p className="font-semibold mb-3">Recent Attempts</p>

                {attemptStatsLoading ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading attempts...
                  </div>
                ) : recentAttempts.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-xl">
                    No attempts yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentAttempts.slice(0, 8).map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {a.testTitle || "Test Attempt"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {a.subject || "General"} • {fmtDate(a.createdAt)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            typeof a.scorePercent === "number" && a.scorePercent >= 70
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : typeof a.scorePercent === "number" && a.scorePercent >= 40
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}
                        >
                          {typeof a.scorePercent === "number" ? `${Math.round(a.scorePercent)}%` : "—"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button className="gradient-bg text-white" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

