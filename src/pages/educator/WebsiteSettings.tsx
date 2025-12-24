import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Trophy,
  BookOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthProvider"; // ✅ Uses your specific Context
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where
} from "firebase/firestore";
import { toast } from "sonner";

// --- Types ---
type StatItem = { label: string; value: string; icon: string };
type AchievementItem = { title: string; description: string; icon: string };
type FacultyItem = { name: string; subject: string; designation: string; experience: string; bio: string; image: string };
type TestimonialItem = { name: string; course: string; rating: number; text: string; avatar: string };
type CourseItem = {
  id: string; 
  title: string;
  price: number;
  discountPrice?: number;
  image: string;
  enrolledCount?: number;
  rating?: string;
};

// Available Icons for selection
const ICON_OPTIONS = [
  { value: "users", label: "Users" },
  { value: "trophy", label: "Trophy" },
  { value: "star", label: "Star" },
  { value: "target", label: "Target" },
  { value: "graduation-cap", label: "Graduation Cap" },
  { value: "award", label: "Award" },
  { value: "trending-up", label: "Trending Up" },
];

export default function WebsiteSettings() {
  // ✅ FIX: Destructure firebaseUser instead of user
  const { firebaseUser } = useAuth(); 
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Data State ---
  const [coachingName, setCoachingName] = useState("");
  const [tagline, setTagline] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  
  // Complex Lists
  const [stats, setStats] = useState<StatItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [faculty, setFaculty] = useState<FacultyItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<CourseItem[]>([]);

  // Load Data
  useEffect(() => {
    async function loadData() {
      // ✅ FIX: Check firebaseUser
      if (!firebaseUser) return;
      
      try {
        setLoading(true);

        // 1. Fetch Educator Settings using firebaseUser.uid
        const docRef = doc(db, "educators", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCoachingName(data.coachingName || "");
          setTagline(data.tagline || "");
          
          const config = data.websiteConfig || {};
          setHeroImage(config.heroImage || "");
          setStats(config.stats || []);
          setAchievements(config.achievements || []);
          setFaculty(config.faculty || []);
          setTestimonials(config.testimonials || []);
          setSelectedCourses(config.courses || []);
        }

        // 2. Fetch Available Tests (to use as Courses)
        const testsQuery = query(
          collection(db, "tests"),
          where("educatorId", "==", firebaseUser.uid)
        );
        const testsSnap = await getDocs(testsQuery);
        const testsData = testsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAvailableTests(testsData);

      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("Failed to load website settings");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [firebaseUser]);

  // --- Save Handler ---
  const handleSave = async () => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      const docRef = doc(db, "educators", firebaseUser.uid);
      
      await updateDoc(docRef, {
        coachingName,
        tagline,
        websiteConfig: {
          heroImage,
          stats,
          achievements,
          faculty,
          testimonials,
          courses: selectedCourses,
          updatedAt: new Date().toISOString()
        }
      });
      
      toast.success("Website updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // --- Helpers for Course/Test Logic ---
  const toggleCourse = (test: any) => {
    const exists = selectedCourses.find(c => c.id === test.id);
    if (exists) {
      // Remove
      setSelectedCourses(prev => prev.filter(c => c.id !== test.id));
    } else {
      // Add (Map Test Data to Course Data)
      const newCourse: CourseItem = {
        id: test.id,
        title: test.title || "Untitled Course",
        price: test.price === "Included" ? 0 : Number(test.price) || 999,
        discountPrice: test.price === "Included" ? 0 : Number(test.price) || 999,
        image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80", // Default placeholder
        rating: "4.8",
        enrolledCount: 100
      };
      setSelectedCourses(prev => [...prev, newCourse]);
    }
  };

  const updateCourseImage = (id: string, url: string) => {
    setSelectedCourses(prev => prev.map(c => c.id === id ? { ...c, image: url } : c));
  };

  // --- Render Helpers ---

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website Builder</h1>
          <p className="text-muted-foreground">Manage your coaching website content</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1">
          <TabsTrigger value="general">General & Hero</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* 1. General & Hero */}
        <TabsContent value="general" className="space-y-4 mt-6">
          <Card>
            <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Coaching Name</Label>
                <Input value={coachingName} onChange={e => setCoachingName(e.target.value)} placeholder="Ex: Zenith Academy" />
              </div>
              <div className="grid gap-2">
                <Label>Tagline</Label>
                <Input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Ex: Your Pathway to Success" />
              </div>
              <div className="grid gap-2">
                <Label>Hero Background Image URL</Label>
                <Input value={heroImage} onChange={e => setHeroImage(e.target.value)} placeholder="https://..." />
                <p className="text-xs text-muted-foreground">Paste a direct image link (Unsplash, etc.)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Stats */}
        <TabsContent value="stats" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Statistics</CardTitle>
              <CardDescription>Numbers displayed below the hero section.</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.map((stat, idx) => (
                <div key={idx} className="flex gap-4 mb-4 items-end border-b pb-4 last:border-0">
                  <div className="grid gap-2 flex-1">
                    <Label>Label</Label>
                    <Input value={stat.label} onChange={e => {
                      const newStats = [...stats]; newStats[idx].label = e.target.value; setStats(newStats);
                    }} placeholder="Students" />
                  </div>
                  <div className="grid gap-2 flex-1">
                    <Label>Value</Label>
                    <Input value={stat.value} onChange={e => {
                      const newStats = [...stats]; newStats[idx].value = e.target.value; setStats(newStats);
                    }} placeholder="10k+" />
                  </div>
                  <div className="grid gap-2 w-32">
                    <Label>Icon</Label>
                    <Select value={stat.icon} onValueChange={(val) => {
                       const newStats = [...stats]; newStats[idx].icon = val; setStats(newStats);
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setStats(stats.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setStats([...stats, { label: "", value: "", icon: "users" }])}>
                <Plus className="mr-2 h-4 w-4" /> Add Stat
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Courses (From Tests) */}
        <TabsContent value="courses" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured Courses</CardTitle>
              <CardDescription>Select created Tests to display as Courses on your homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableTests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tests found. Create tests in the "Test Series" tab first.
                </div>
              )}
              {availableTests.map(test => {
                const isSelected = selectedCourses.some(c => c.id === test.id);
                const currentCourse = selectedCourses.find(c => c.id === test.id);

                return (
                  <div key={test.id} className={`p-4 rounded-xl border ${isSelected ? "border-primary bg-primary/5" : "border-border"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-white" : "bg-muted"}`}>
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{test.title}</h4>
                          <p className="text-xs text-muted-foreground">{test.description?.slice(0, 50)}...</p>
                        </div>
                      </div>
                      <Switch checked={isSelected} onCheckedChange={() => toggleCourse(test)} />
                    </div>
                    
                    {isSelected && currentCourse && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pl-12 space-y-3">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs">Display Price</Label>
                                <Input 
                                  className="h-8" 
                                  type="number" 
                                  value={currentCourse.discountPrice} 
                                  onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setSelectedCourses(prev => prev.map(c => c.id === test.id ? { ...c, discountPrice: val, price: val + 500 } : c))
                                  }}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Cover Image URL</Label>
                                <Input 
                                  className="h-8" 
                                  placeholder="https://..." 
                                  value={currentCourse.image} 
                                  onChange={(e) => updateCourseImage(test.id, e.target.value)}
                                />
                            </div>
                         </div>
                         <p className="text-[10px] text-muted-foreground">
                            * This test will appear as a clickable course card on your website.
                         </p>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Faculty */}
        <TabsContent value="faculty" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Team</CardTitle>
              <CardDescription>Add profiles for your educators.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {faculty.map((member, idx) => (
                  <div key={idx} className="p-4 border rounded-xl relative group bg-muted/20">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                      onClick={() => setFaculty(faculty.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={member.name} onChange={e => {
                          const list = [...faculty]; list[idx].name = e.target.value; setFaculty(list);
                        }} placeholder="Dr. John Doe" />
                      </div>
                      <div className="space-y-2">
                         <Label>Subject</Label>
                         <Input value={member.subject} onChange={e => {
                          const list = [...faculty]; list[idx].subject = e.target.value; setFaculty(list);
                        }} placeholder="Physics" />
                      </div>
                      <div className="space-y-2">
                         <Label>Designation</Label>
                         <Input value={member.designation} onChange={e => {
                          const list = [...faculty]; list[idx].designation = e.target.value; setFaculty(list);
                        }} placeholder="Senior Faculty" />
                      </div>
                      <div className="space-y-2">
                         <Label>Experience</Label>
                         <Input value={member.experience} onChange={e => {
                          const list = [...faculty]; list[idx].experience = e.target.value; setFaculty(list);
                        }} placeholder="10+ Years" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <Label>Profile Image URL</Label>
                         <Input value={member.image} onChange={e => {
                          const list = [...faculty]; list[idx].image = e.target.value; setFaculty(list);
                        }} placeholder="https://..." />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <Label>Bio</Label>
                         <Textarea value={member.bio} onChange={e => {
                          const list = [...faculty]; list[idx].bio = e.target.value; setFaculty(list);
                        }} placeholder="Short bio..." />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full dashed-border" onClick={() => setFaculty([...faculty, { name: "", subject: "", designation: "", experience: "", bio: "", image: "" }])}>
                   <Plus className="mr-2 h-4 w-4" /> Add Faculty Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Content (Achievements & Testimonials) */}
        <TabsContent value="content" className="space-y-6 mt-6">
          
          {/* Achievements Section */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Showcase your awards and milestones.</CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.map((item, idx) => (
                <div key={idx} className="flex gap-4 mb-4 items-start border-b pb-4 last:border-0">
                  <div className="grid gap-2 flex-1">
                    <Label>Title</Label>
                    <Input value={item.title} onChange={e => {
                      const list = [...achievements]; list[idx].title = e.target.value; setAchievements(list);
                    }} placeholder="Best Coaching 2024" />
                    <Label className="mt-2">Description</Label>
                    <Input value={item.description} onChange={e => {
                      const list = [...achievements]; list[idx].description = e.target.value; setAchievements(list);
                    }} placeholder="Awarded by..." />
                  </div>
                  <div className="grid gap-2 w-32">
                    <Label>Icon</Label>
                    <Select value={item.icon} onValueChange={(val) => {
                       const list = [...achievements]; list[idx].icon = val; setAchievements(list);
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setAchievements([...achievements, { title: "", description: "", icon: "trophy" }])}>
                <Plus className="mr-2 h-4 w-4" /> Add Achievement
              </Button>
            </CardContent>
          </Card>

          {/* Testimonials Section */}
          <Card>
            <CardHeader>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription>What students say about you.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid gap-6">
                {testimonials.map((item, idx) => (
                  <div key={idx} className="p-4 border rounded-xl relative bg-muted/20">
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-destructive"
                      onClick={() => setTestimonials(testimonials.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>Student Name</Label>
                          <Input value={item.name} onChange={e => {
                            const list = [...testimonials]; list[idx].name = e.target.value; setTestimonials(list);
                          }} />
                       </div>
                       <div className="space-y-2">
                          <Label>Course Taken</Label>
                          <Input value={item.course} onChange={e => {
                            const list = [...testimonials]; list[idx].course = e.target.value; setTestimonials(list);
                          }} />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                          <Label>Review Text</Label>
                          <Textarea value={item.text} onChange={e => {
                            const list = [...testimonials]; list[idx].text = e.target.value; setTestimonials(list);
                          }} />
                       </div>
                       <div className="space-y-2">
                          <Label>Avatar URL</Label>
                          <Input value={item.avatar} onChange={e => {
                            const list = [...testimonials]; list[idx].avatar = e.target.value; setTestimonials(list);
                          }} placeholder="https://..." />
                       </div>
                       <div className="space-y-2">
                          <Label>Rating (1-5)</Label>
                          <Input type="number" max={5} min={1} value={item.rating} onChange={e => {
                            const list = [...testimonials]; list[idx].rating = Number(e.target.value); setTestimonials(list);
                          }} />
                       </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full dashed-border" onClick={() => setTestimonials([...testimonials, { name: "", course: "", text: "", rating: 5, avatar: "" }])}>
                   <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                </Button>
               </div>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}