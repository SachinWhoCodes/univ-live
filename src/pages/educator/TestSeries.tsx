import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  FileText,
  Users,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmptyState from "@/components/educator/EmptyState";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { onAuthStateChanged } from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface ImportedTestSeries {
  id: string;
  title: string;
  subject: string;
  testsCount: number;
  attempts: number;
  status: "active" | "hidden";
  difficulty: "Easy" | "Medium" | "Hard";
  createdAt?: Timestamp | null;

  // meta
  source?: "bank" | "custom";
  bankTestId?: string;
}

interface BankTestSeries {
  id: string;
  title: string;
  subject: string;
  testsCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  price: string; // "Included" or "₹499"
  description: string;
  category: "NEET" | "JEE" | "CUET" | "Board Exams" | "All";
  isActive?: boolean;
  createdAt?: Timestamp | null;
}

function difficultyBadgeClass(d: "Easy" | "Medium" | "Hard") {
  return cn(
    "text-xs",
    d === "Hard" &&
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    d === "Medium" &&
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    d === "Easy" &&
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
  );
}

export default function TestSeries() {
  const [uid, setUid] = useState<string | null>(null);

  // Imported tab
  const [imported, setImported] = useState<ImportedTestSeries[]>([]);
  const [loadingImported, setLoadingImported] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Explore tab
  const [bankFilter, setBankFilter] = useState<"All" | "NEET" | "JEE" | "CUET" | "Board Exams">("All");
  const [bankTests, setBankTests] = useState<BankTestSeries[]>([]);
  const [loadingBank, setLoadingBank] = useState(true);

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("General");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [formTestsCount, setFormTestsCount] = useState<string>("10");
  const [saving, setSaving] = useState(false);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  // Load Imported Tests
  useEffect(() => {
    if (!uid) {
      setImported([]);
      setLoadingImported(false);
      return;
    }

    setLoadingImported(true);
    const ref = collection(db, "educators", uid, "importedTests");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: ImportedTestSeries[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: String(data?.title || "Untitled"),
            subject: String(data?.subject || "General"),
            testsCount: Number(data?.testsCount || 0),
            attempts: Number(data?.attempts || 0),
            status: (data?.status || "active") as "active" | "hidden",
            difficulty: (data?.difficulty || "Medium") as "Easy" | "Medium" | "Hard",
            createdAt: (data?.createdAt as Timestamp) || null,
            source: (data?.source || "custom") as "bank" | "custom",
            bankTestId: data?.bankTestId ? String(data.bankTestId) : undefined,
          };
        });

        setImported(rows);
        setLoadingImported(false);
      },
      () => {
        setImported([]);
        setLoadingImported(false);
        toast.error("Failed to load imported tests");
      }
    );

    return () => unsub();
  }, [uid]);

  // Load Test Bank (filtered)
  useEffect(() => {
    setLoadingBank(true);

    const ref = collection(db, "testBank");

    // If you later want to “disable” a bank test, keep isActive=true.
    const q =
      bankFilter === "All"
        ? query(ref, orderBy("createdAt", "desc"))
        : query(ref, where("category", "==", bankFilter), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: BankTestSeries[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: String(data?.title || "Untitled"),
            subject: String(data?.subject || "General"),
            testsCount: Number(data?.testsCount || 0),
            difficulty: (data?.difficulty || "Medium") as "Easy" | "Medium" | "Hard",
            price: String(data?.price || "Included"),
            description: String(data?.description || ""),
            category: (data?.category || "All") as any,
            isActive: data?.isActive !== false,
            createdAt: (data?.createdAt as Timestamp) || null,
          };
        });

        // Only keep active ones by default
        setBankTests(rows.filter((r) => r.isActive !== false));
        setLoadingBank(false);
      },
      () => {
        setBankTests([]);
        setLoadingBank(false);
        toast.error("Failed to load test bank");
      }
    );

    return () => unsub();
  }, [bankFilter]);

  const subjectsForFilter = useMemo(() => {
    const set = new Set(imported.map((i) => i.subject));
    return ["all", ...Array.from(set)];
  }, [imported]);

  const filteredImported = useMemo(() => {
    return imported.filter((test) => {
      const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === "all" || test.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [imported, searchQuery, selectedSubject]);

  function resetDialog() {
    setEditingId(null);
    setFormTitle("");
    setFormSubject("General");
    setFormDifficulty("Medium");
    setFormTestsCount("10");
  }

  function openCreate() {
    resetDialog();
    setDialogOpen(true);
  }

  function openEdit(item: ImportedTestSeries) {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormSubject(item.subject);
    setFormDifficulty(item.difficulty);
    setFormTestsCount(String(item.testsCount || 0));
    setDialogOpen(true);
  }

  async function saveCustomTestSeries() {
    if (!uid) {
      toast.error("Please login as educator");
      return;
    }

    const title = formTitle.trim();
    const testsCount = Number(formTestsCount);

    if (!title) {
      toast.error("Please enter title");
      return;
    }
    if (!Number.isFinite(testsCount) || testsCount <= 0) {
      toast.error("Tests count must be a positive number");
      return;
    }

    setSaving(true);
    try {
      if (!editingId) {
        await addDoc(collection(db, "educators", uid, "importedTests"), {
          title,
          subject: formSubject,
          testsCount,
          attempts: 0,
          status: "active",
          difficulty: formDifficulty,
          source: "custom",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Test series created");
      } else {
        await updateDoc(doc(db, "educators", uid, "importedTests", editingId), {
          title,
          subject: formSubject,
          testsCount,
          difficulty: formDifficulty,
          updatedAt: serverTimestamp(),
        });
        toast.success("Test series updated");
      }

      setDialogOpen(false);
      resetDialog();
    } catch {
      toast.error("Could not save test series");
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility(item: ImportedTestSeries) {
    if (!uid) return;
    try {
      const next = item.status === "active" ? "hidden" : "active";
      await updateDoc(doc(db, "educators", uid, "importedTests", item.id), {
        status: next,
        updatedAt: serverTimestamp(),
      });
      toast.success(next === "hidden" ? "Hidden" : "Visible");
    } catch {
      toast.error("Could not update status");
    }
  }

  async function deleteImported(item: ImportedTestSeries) {
    if (!uid) return;
    const ok = window.confirm(`Delete "${item.title}"?`);
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "educators", uid, "importedTests", item.id));
      toast.success("Deleted");
    } catch {
      toast.error("Could not delete");
    }
  }

  async function importFromBank(test: BankTestSeries) {
    if (!uid) {
      toast.error("Please login as educator");
      return;
    }
    try {
      // Prevent duplicates by using bank test id as doc id
      const ref = doc(db, "educators", uid, "importedTests", test.id);
      const exists = await getDoc(ref);
      if (exists.exists()) {
        toast.info("Already imported");
        return;
      }

      await setDoc(ref, {
        title: test.title,
        subject: test.subject,
        testsCount: test.testsCount,
        attempts: 0,
        status: "active",
        difficulty: test.difficulty,
        source: "bank",
        bankTestId: test.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Imported successfully");
    } catch {
      toast.error("Could not import test series");
    }
  }

  if (!uid) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Test Series</h1>
          <p className="text-muted-foreground text-sm">
            Manage your imported tests and explore new ones
          </p>
        </div>
        <EmptyState
          icon={FileText}
          title="Please login as Educator"
          description="You must be logged in to manage test series."
          actionLabel="Go to Login"
          onAction={() => (window.location.href = "/login?role=educator")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Test Series</h1>
          <p className="text-muted-foreground text-sm">
            Manage your imported tests and explore new ones
          </p>
        </div>

        <Button className="gradient-bg text-white" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetDialog();
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Test Series" : "Create Test Series"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Title</div>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="E.g. CUET General Test Pack" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <div className="text-sm font-medium">Subject</div>
                <Select value={formSubject} onValueChange={setFormSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {["General", "English", "Maths", "Physics", "Chemistry", "Biology", "Accounts", "Business", "History", "Geography"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Difficulty</div>
                <Select value={formDifficulty} onValueChange={(v) => setFormDifficulty(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Tests Count</div>
                <Input type="number" value={formTestsCount} onChange={(e) => setFormTestsCount(e.target.value)} />
              </div>
            </div>

            <Button
              className="w-full gradient-bg text-white"
              onClick={saveCustomTestSeries}
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="imported" className="space-y-6">
        <TabsList>
          <TabsTrigger value="imported">Imported Tests</TabsTrigger>
          <TabsTrigger value="explore">Explore Test Bank</TabsTrigger>
        </TabsList>

        <TabsContent value="imported" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-52">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectsForFilter.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All Subjects" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Imported Grid */}
          {loadingImported ? (
            <div className="flex items-center justify-center py-14 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading imported tests...
            </div>
          ) : filteredImported.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No imported tests yet"
              description="Import from the Test Bank or create a new test series."
              actionLabel="Create Test"
              onAction={openCreate}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImported.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="card-hover h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className={difficultyBadgeClass(test.difficulty)}>
                          {test.difficulty}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(test)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => toggleVisibility(test)}>
                              {test.status === "active" ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Show
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuItem className="text-destructive" onClick={() => deleteImported(test)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-2">
                        <h3 className="font-semibold text-base line-clamp-2">{test.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{test.subject}</p>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{test.testsCount} tests</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{test.attempts}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <Badge
                          variant={test.status === "active" ? "default" : "secondary"}
                          className={
                            test.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : ""
                          }
                        >
                          {test.status}
                        </Badge>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info("Manage screen coming next")}
                        >
                          Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="explore" className="space-y-4">
          {/* Explore Filters */}
          <div className="flex flex-wrap gap-2">
            {(["All", "NEET", "JEE", "CUET", "Board Exams"] as const).map((filter) => (
              <Button
                key={filter}
                variant={filter === bankFilter ? "default" : "outline"}
                size="sm"
                className={filter === bankFilter ? "gradient-bg text-white" : ""}
                onClick={() => setBankFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>

          {/* Explore Grid */}
          {loadingBank ? (
            <div className="flex items-center justify-center py-14 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading test bank...
            </div>
          ) : bankTests.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No test bank items yet"
              description="Add documents to Firestore collection: testBank"
              actionLabel="OK"
              onAction={() => toast.info("Add docs in Firestore → testBank")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bankTests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="card-hover h-full flex flex-col">
                    <div className="h-32 gradient-bg rounded-t-lg flex items-center justify-center">
                      <FileText className="h-12 w-12 text-white/80" />
                    </div>

                    <CardContent className="flex-1 flex flex-col p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{test.subject}</Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            test.difficulty === "Hard" && "border-red-500 text-red-500",
                            test.difficulty === "Medium" && "border-amber-500 text-amber-500",
                            test.difficulty === "Easy" && "border-green-500 text-green-500"
                          )}
                        >
                          {test.difficulty}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {test.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {test.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <FileText className="h-3 w-3" />
                        <span>{test.testsCount} tests</span>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <span
                          className={cn(
                            "font-semibold text-sm",
                            test.price === "Included" ? "text-green-600" : "text-foreground"
                          )}
                        >
                          {test.price}
                        </span>
                        <Button
                          size="sm"
                          className="gradient-bg text-white"
                          onClick={() => importFromBank(test)}
                        >
                          Import
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

