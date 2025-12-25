import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, MoreVertical, Edit, Trash2, FileText, 
  Download, Clock, BookOpen, Loader2, X, Save, Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import EmptyState from "@/components/educator/EmptyState"; 

// Firebase
import { onAuthStateChanged } from "firebase/auth";
import {
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc, 
  onSnapshot, query, where, serverTimestamp, writeBatch 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// --- Types ---
type Question = {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  positiveMarks: number;
  negativeMarks: number;
};

export default function TestSeries() {
  const [activeTab, setActiveTab] = useState("library");
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Data
  const [myTests, setMyTests] = useState<any[]>([]);
  const [bankTests, setBankTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [importingId, setImportingId] = useState<string | null>(null);

  // --- 1. Auth & Data Fetching ---
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);

        // A. Fetch MY Tests (Nested Collection: educators/{uid}/my_tests)
        const myTestsQuery = query(collection(db, "educators", user.uid, "my_tests"));
        const unsubMyTests = onSnapshot(myTestsQuery, (snap) => {
          setMyTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // B. Fetch BANK Tests (Root Collection: test_series where author == admin)
        const bankQuery = query(collection(db, "test_series"), where("authorId", "==", "admin"));
        const unsubBank = onSnapshot(bankQuery, (snap) => {
          setBankTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });

        return () => { unsubMyTests(); unsubBank(); };
      } else {
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  // --- 2. Action: Import from Bank ---
  const handleImport = async (bankTest: any) => {
    if (!currentUser) return;
    setImportingId(bankTest.id);

    try {
      // Step 1: Copy Metadata to nested collection
      const newTestMetadata = {
        ...bankTest,
        authorId: currentUser.uid, // Now belongs to educator
        originalTestId: bankTest.id, // Reference to original
        source: "imported",
        createdAt: serverTimestamp(),
      };
      delete newTestMetadata.id; // Remove old ID

      const newTestRef = await addDoc(collection(db, "educators", currentUser.uid, "my_tests"), newTestMetadata);

      // Step 2: Fetch Original Questions
      const questionsSnap = await getDocs(collection(db, "test_series", bankTest.id, "questions"));

      // Step 3: Batch Write Questions to New Location
      const batch = writeBatch(db);
      questionsSnap.forEach((qDoc) => {
        const newQRef = doc(collection(db, "educators", currentUser.uid, "my_tests", newTestRef.id, "questions"));
        batch.set(newQRef, qDoc.data());
      });

      await batch.commit();
      
      toast.success("Test imported successfully to your library");
      setActiveTab("library");
    } catch (err) {
      console.error(err);
      toast.error("Failed to import test");
    } finally {
      setImportingId(null);
    }
  };

  // --- 3. Action: Create Custom Test ---
  const handleCreateCustom = async (e: any) => {
    e.preventDefault();
    if (!currentUser) return;
    const fd = new FormData(e.target);
    
    const data = {
      title: fd.get("title"),
      description: fd.get("description"),
      subject: fd.get("subject"),
      level: fd.get("level"),
      durationMinutes: Number(fd.get("duration")),
      authorId: currentUser.uid,
      source: "custom",
      createdAt: serverTimestamp(),
    };

    try {
      // 1. Add to local nested collection (The active copy)
      await addDoc(collection(db, "educators", currentUser.uid, "my_tests"), data);
      
      // 2. Add to root collection (For global analytics/admin view, but marked private)
      await addDoc(collection(db, "test_series"), { ...data, isPublic: false });

      toast.success("Custom test created");
      setSelectedTest(null); // Close modal
    } catch (err) {
      console.error(err);
      toast.error("Failed to create test");
    }
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Test Series</h1>
          <p className="text-muted-foreground">Manage your exams and import from the global bank.</p>
        </div>
        
        {/* Create Button Logic */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Create Custom Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Test</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateCustom} className="space-y-4 mt-2">
               <div className="space-y-2">
                 <Label>Title</Label>
                 <Input name="title" required placeholder="e.g. Weekly Biology Mock" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Subject</Label>
                   <Input name="subject" required />
                 </div>
                 <div className="space-y-2">
                   <Label>Duration (Mins)</Label>
                   <Input type="number" name="duration" required />
                 </div>
               </div>
               <div className="space-y-2">
                  <Label>Level</Label>
                  <Select name="level" defaultValue="Medium">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                 <Label>Description</Label>
                 <Textarea name="description" required />
               </div>
               <Button type="submit" className="w-full">Create & Start Adding Questions</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="library">My Library</TabsTrigger>
          <TabsTrigger value="bank">Test Bank</TabsTrigger>
        </TabsList>

        {/* --- MY LIBRARY TAB --- */}
        <TabsContent value="library" className="mt-6">
          {myTests.length === 0 ? (
            <EmptyState icon={FileText} title="No tests yet" description="Create a custom test or import one from the bank." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTests.map((test) => (
                <motion.div key={test.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start gap-2">
                        <span className="truncate text-lg">{test.title}</span>
                        {test.source === "imported" ? (
                          <Badge variant="secondary" className="text-[10px]">Imported</Badge>
                        ) : (
                          <Badge className="text-[10px]">Custom</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{test.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {test.subject}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {test.durationMinutes}m</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedTest(test);
                          setIsManageOpen(true);
                        }}>
                          <Edit className="mr-2 h-3 w-3" /> Manage
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => {
                           if(confirm("Delete this test?")) deleteDoc(doc(db, "educators", currentUser.uid, "my_tests", test.id));
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- TEST BANK TAB --- */}
        <TabsContent value="bank" className="mt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankTests.map((test) => (
                <Card key={test.id} className="bg-muted/30 border-dashed">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span className="truncate">{test.title}</span>
                        <Badge variant="outline">Admin</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{test.description}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                         <span>{test.subject}</span> • <span>{test.level}</span>
                      </div>
                      <Button 
                        className="w-full" 
                        disabled={importingId === test.id}
                        onClick={() => handleImport(test)}
                      >
                        {importingId === test.id ? <Loader2 className="animate-spin h-4 w-4" /> : <><Download className="mr-2 h-4 w-4" /> Import to Library</>}
                      </Button>
                    </CardContent>
                </Card>
              ))}
           </div>
        </TabsContent>
      </Tabs>

      {/* --- Questions Manager Drawer/Modal --- */}
      {isManageOpen && selectedTest && currentUser && (
        <QuestionsManager 
          testId={selectedTest.id}
          // The critical part: Educator manages questions in THEIR nested collection
          collectionPath={`educators/${currentUser.uid}/my_tests`}
          onClose={() => setIsManageOpen(false)}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: Questions Manager ---
// This handles adding/editing questions specifically for the educator's copy of the test.
function QuestionsManager({ testId, collectionPath, onClose }: { testId: string, collectionPath: string, onClose: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQ, setEditingQ] = useState<Question | null>(null); // Null = Create Mode
  const [loadingQ, setLoadingQ] = useState(true);

  // Fetch Questions
  useEffect(() => {
    // collectionPath is like: "educators/{uid}/my_tests"
    // We access the subcollection "questions" inside specific test document
    const qRef = collection(db, collectionPath, testId, "questions");
    
    // Using snapshot for real-time updates as they edit
    const unsub = onSnapshot(qRef, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Question[];
      // Optional: Sort by creation time if you added a timestamp field to questions, otherwise they might jump around
      setQuestions(docs);
      setLoadingQ(false);
    });
    return () => unsub();
  }, [testId, collectionPath]);

  const handleSaveQuestion = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    
    const qData = {
      text: fd.get("text") as string,
      options: [
        fd.get("opt1") as string, 
        fd.get("opt2") as string, 
        fd.get("opt3") as string, 
        fd.get("opt4") as string
      ],
      correctOptionIndex: Number(fd.get("correctIdx")),
      positiveMarks: Number(fd.get("pos")),
      negativeMarks: Number(fd.get("neg")),
    };

    try {
      const parentRef = collection(db, collectionPath, testId, "questions");
      
      if (editingQ) {
        // Edit existing
        await updateDoc(doc(parentRef, editingQ.id), qData);
        toast.success("Question updated");
      } else {
        // Create new
        await addDoc(parentRef, qData);
        toast.success("Question added");
      }
      
      setEditingQ(null);
      e.target.reset(); // Reset form
    } catch (err) {
      console.error(err);
      toast.error("Failed to save question");
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if(!confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteDoc(doc(db, collectionPath, testId, "questions", qId));
      toast.success("Question deleted");
      if (editingQ?.id === qId) setEditingQ(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-background w-full max-w-5xl h-[90vh] rounded-xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-muted/30">
          <div>
            <h2 className="font-bold text-lg">Manage Questions</h2>
            <p className="text-xs text-muted-foreground">Add or edit questions for this test series.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: List of Questions */}
          <div className="w-1/3 border-r flex flex-col bg-muted/10">
             <div className="p-4 border-b">
                <Button className="w-full" onClick={() => setEditingQ(null)}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Question
                </Button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {loadingQ ? (
                 <div className="flex justify-center py-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
               ) : questions.length === 0 ? (
                 <p className="text-center text-sm text-muted-foreground py-10">No questions added yet.</p>
               ) : (
                 questions.map((q, idx) => (
                   <div key={q.id} 
                     onClick={() => setEditingQ(q)}
                     className={`p-3 rounded-lg border cursor-pointer text-sm hover:bg-accent transition-colors ${editingQ?.id === q.id ? 'border-primary bg-accent ring-1 ring-primary/20' : 'bg-card'}`}>
                     <div className="font-medium line-clamp-2">Q{idx + 1}: {q.text}</div>
                     <div className="text-xs text-muted-foreground mt-2 flex justify-between items-center">
                        <Badge variant="outline" className="text-[10px] h-5">+{q.positiveMarks} / -{q.negativeMarks}</Badge>
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }} />
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>

          {/* Right: Edit Form */}
          <div className="flex-1 overflow-y-auto bg-background">
             <div className="p-8 max-w-2xl mx-auto">
                <form id="q-form" onSubmit={handleSaveQuestion} className="space-y-6">
                   <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold flex items-center gap-2">
                       {editingQ ? <><Edit className="h-4 w-4" /> Edit Question</> : <><Plus className="h-4 w-4" /> New Question</>}
                     </h3>
                     {editingQ && (
                       <Button type="button" variant="ghost" size="sm" onClick={() => setEditingQ(null)}>Cancel</Button>
                     )}
                   </div>

                   <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea 
                        name="text" 
                        defaultValue={editingQ?.text} 
                        key={editingQ?.id || 'new-text'} // Force re-render on switch
                        className="min-h-[100px] resize-none" 
                        required 
                        placeholder="Type the question content here..." 
                      />
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[1, 2, 3, 4].map((i) => (
                       <div key={i} className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-2">
                            Option {i}
                            {editingQ && editingQ.correctOptionIndex === (i-1) && <Check className="h-3 w-3 text-green-600" />}
                          </Label>
                          <Input 
                            name={`opt${i}`} 
                            defaultValue={editingQ?.options?.[i-1]} 
                            key={editingQ?.id || `new-opt${i}`}
                            required 
                            placeholder={`Option ${i}`} 
                          />
                       </div>
                     ))}
                   </div>

                   <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                      <div className="space-y-1.5">
                         <Label>Correct Option</Label>
                         <Select name="correctIdx" defaultValue={editingQ ? String(editingQ.correctOptionIndex) : "0"} key={editingQ?.id || 'new-select'}>
                           <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="0">Option 1</SelectItem>
                             <SelectItem value="1">Option 2</SelectItem>
                             <SelectItem value="2">Option 3</SelectItem>
                             <SelectItem value="3">Option 4</SelectItem>
                           </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-1.5">
                         <Label className="text-green-600 font-medium">Positive Marks</Label>
                         <Input type="number" name="pos" defaultValue={editingQ?.positiveMarks || 4} key={editingQ?.id || 'new-pos'} min={0} className="bg-background" />
                      </div>
                      <div className="space-y-1.5">
                         <Label className="text-red-600 font-medium">Negative Marks</Label>
                         <Input type="number" name="neg" defaultValue={editingQ?.negativeMarks || 1} key={editingQ?.id || 'new-neg'} min={0} className="bg-background" />
                      </div>
                   </div>

                   <div className="flex justify-end pt-4 border-t">
                     <Button type="submit" className="min-w-[140px]">
                       <Save className="mr-2 h-4 w-4" />
                       Save Question
                     </Button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
