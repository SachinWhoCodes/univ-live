import { useState } from "react";
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
  Clock,
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
import { cn } from "@/lib/utils";

interface TestSeries {
  id: string;
  title: string;
  subject: string;
  testsCount: number;
  attempts: number;
  status: "active" | "hidden";
  difficulty: "Easy" | "Medium" | "Hard";
  createdAt: string;
}

const testSeriesData: TestSeries[] = [
  {
    id: "1",
    title: "NEET Physics Complete Package",
    subject: "Physics",
    testsCount: 25,
    attempts: 1250,
    status: "active",
    difficulty: "Hard",
    createdAt: "Jan 15, 2024",
  },
  {
    id: "2",
    title: "Chemistry Chapter-wise Tests",
    subject: "Chemistry",
    testsCount: 18,
    attempts: 890,
    status: "active",
    difficulty: "Medium",
    createdAt: "Feb 01, 2024",
  },
  {
    id: "3",
    title: "Biology NCERT Based",
    subject: "Biology",
    testsCount: 32,
    attempts: 2100,
    status: "active",
    difficulty: "Medium",
    createdAt: "Feb 10, 2024",
  },
  {
    id: "4",
    title: "JEE Maths Foundation",
    subject: "Mathematics",
    testsCount: 20,
    attempts: 560,
    status: "hidden",
    difficulty: "Easy",
    createdAt: "Mar 05, 2024",
  },
];

const exploreTestsData = [
  {
    id: "e1",
    title: "CUET General Test 2024",
    subject: "General",
    testsCount: 15,
    difficulty: "Medium",
    price: "Included",
    description: "Complete preparation for CUET General Test with comprehensive coverage.",
  },
  {
    id: "e2",
    title: "NEET Full Mock Tests",
    subject: "Medical",
    testsCount: 30,
    difficulty: "Hard",
    price: "₹499",
    description: "Full-length NEET mock tests following the latest pattern.",
  },
  {
    id: "e3",
    title: "JEE Advanced Problem Set",
    subject: "Engineering",
    testsCount: 40,
    difficulty: "Hard",
    price: "₹799",
    description: "Advanced level problems for JEE aspirants.",
  },
  {
    id: "e4",
    title: "Class 12 Board Prep",
    subject: "CBSE",
    testsCount: 25,
    difficulty: "Easy",
    price: "Included",
    description: "Board exam preparation with sample papers and practice tests.",
  },
];

export default function TestSeries() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const filteredTests = testSeriesData.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || test.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

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
        <Button className="gradient-bg text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </div>

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
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="card-hover h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          test.difficulty === "Hard" &&
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                          test.difficulty === "Medium" &&
                            "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                          test.difficulty === "Easy" &&
                            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        )}
                      >
                        {test.difficulty}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
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
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-semibold text-base line-clamp-2">
                        {test.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {test.subject}
                      </p>
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
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="explore" className="space-y-4">
          {/* Explore Filters */}
          <div className="flex flex-wrap gap-2">
            {["All", "NEET", "JEE", "CUET", "Board Exams"].map((filter) => (
              <Button
                key={filter}
                variant={filter === "All" ? "default" : "outline"}
                size="sm"
                className={filter === "All" ? "gradient-bg text-white" : ""}
              >
                {filter}
              </Button>
            ))}
          </div>

          {/* Explore Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {exploreTestsData.map((test, index) => (
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
                          test.price === "Included"
                            ? "text-green-600"
                            : "text-foreground"
                        )}
                      >
                        {test.price}
                      </span>
                      <Button size="sm" className="gradient-bg text-white">
                        Import
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
