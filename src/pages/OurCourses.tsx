import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, Filter, BookOpen, Clock, BarChart2, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const subjects = ["All", "Physics", "Chemistry", "Mathematics", "Biology", "English", "General Studies"];
const testTypes = ["All Types", "Full Mock", "Chapter-wise", "Previous Year", "Practice"];
const difficulties = ["All Levels", "Easy", "Medium", "Hard"];

const courses = [
  {
    id: 1,
    title: "JEE Main Complete Mock Series",
    subject: "Physics",
    testCount: 25,
    difficulty: "Hard",
    rating: 4.8,
    reviews: 1240,
    price: 1999,
    included: false,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop",
    description: "Complete JEE Main preparation with 25 full-length mock tests.",
  },
  {
    id: 2,
    title: "NEET Biology Master Course",
    subject: "Biology",
    testCount: 40,
    difficulty: "Medium",
    rating: 4.9,
    reviews: 890,
    price: 2499,
    included: false,
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=250&fit=crop",
    description: "Comprehensive NEET Biology preparation with chapter-wise tests.",
  },
  {
    id: 3,
    title: "CUET General Test Series",
    subject: "General Studies",
    testCount: 30,
    difficulty: "Medium",
    rating: 4.7,
    reviews: 650,
    price: 0,
    included: true,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop",
    description: "Free CUET preparation tests covering all general topics.",
  },
  {
    id: 4,
    title: "Chemistry Formula Master",
    subject: "Chemistry",
    testCount: 20,
    difficulty: "Easy",
    rating: 4.6,
    reviews: 420,
    price: 999,
    included: false,
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop",
    description: "Master chemistry formulas with targeted practice tests.",
  },
  {
    id: 5,
    title: "Mathematics Problem Solving",
    subject: "Mathematics",
    testCount: 35,
    difficulty: "Hard",
    rating: 4.8,
    reviews: 980,
    price: 1499,
    included: false,
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop",
    description: "Advanced mathematics problem solving techniques and tests.",
  },
  {
    id: 6,
    title: "English Proficiency Tests",
    subject: "English",
    testCount: 15,
    difficulty: "Easy",
    rating: 4.5,
    reviews: 320,
    price: 799,
    included: false,
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=250&fit=crop",
    description: "Improve your English skills with comprehensive tests.",
  },
];

export default function OurCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || course.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === "All Levels" || course.difficulty === selectedDifficulty;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 lg:px-8 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-start/10 text-sm font-medium text-brand-blue mb-4">
              Course Catalog
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-6">
              Explore Our <span className="gradient-text">Test Series</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse through our comprehensive collection of practice tests and courses.
            </p>
          </motion.div>
        </section>

        {/* Filters */}
        <section className="container mx-auto px-4 lg:px-8 py-8">
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-card">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>

            {/* Filter Chips */}
            <div className="space-y-4">
              {/* Subjects */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedSubject === subject
                        ? "gradient-bg text-white"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              {/* Difficulty */}
              <div className="flex flex-wrap items-center gap-2">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedDifficulty === diff
                        ? "gradient-bg text-white"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Course Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="gradient-bg text-white border-0">
                      {course.subject}
                    </Badge>
                  </div>
                  {course.included && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white border-0">
                        Free
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.testCount} tests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart2 className="w-4 h-4" />
                      <span>{course.difficulty}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({course.reviews} reviews)</span>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      {course.included ? (
                        <span className="text-lg font-bold text-green-600">Included</span>
                      ) : (
                        <span className="text-lg font-bold gradient-text">₹{course.price}</span>
                      )}
                    </div>
                    <Button variant="gradient" size="sm" className="group/btn">
                      View Details
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No courses found matching your criteria.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
