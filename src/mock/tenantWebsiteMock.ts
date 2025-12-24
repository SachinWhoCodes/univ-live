// Tenant Website Mock Data
// This will be replaced by Firestore websiteConfig + themeId later

export interface TenantProfile {
  coachingName: string;
  tagline: string;
  logoUrl?: string;
  themeId: "theme1";
  primaryColor: string;
  accentColor: string;
  address: string;
  phone: string;
  email: string;
  socials: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  heroTitle: string;
  heroSubtitle: string;
  achievements: {
    title: string;
    description: string;
    icon: string;
  }[];
  testimonials: {
    id: string;
    name: string;
    course: string;
    rating: number;
    text: string;
    avatar?: string;
  }[];
  stats: {
    value: string;
    label: string;
  }[];
  faculty: {
    id: string;
    name: string;
    designation: string;
    subject: string;
    experience: string;
    image?: string;
    bio: string;
  }[];
  missionStatement?: string;
  visionStatement?: string;
  story?: string;
}

export interface CourseModule {
  title: string;
  lessons: string[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  subject: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  durationWeeks: number;
  mode: "online" | "offline" | "hybrid";
  price: number;
  discountPrice?: number;
  description: string;
  highlights: string[];
  modules: CourseModule[];
  includedTests: string[];
  outcomes: string[];
  faq: { question: string; answer: string }[];
  banner?: string;
  thumbnail?: string;
  badge?: "Most Popular" | "New" | "Best Value";
  enrolledCount?: number;
}

export const tenantProfiles: Record<string, TenantProfile> = {
  "success-academy": {
    coachingName: "Success Academy",
    tagline: "Your Gateway to CUET Excellence",
    themeId: "theme1",
    primaryColor: "#0EA5E9",
    accentColor: "#8B5CF6",
    address: "123 Education Lane, Sector 18, Noida, UP 201301",
    phone: "+91 9876543210",
    email: "info@successacademy.in",
    socials: {
      facebook: "https://facebook.com/successacademy",
      instagram: "https://instagram.com/successacademy",
      youtube: "https://youtube.com/@successacademy",
      twitter: "https://twitter.com/successacademy",
    },
    heroTitle: "Crack CUET 2025 with India's Top Faculty",
    heroSubtitle: "Join 50,000+ students who trust Success Academy for comprehensive CUET preparation with AI-powered learning and expert guidance.",
    achievements: [
      { title: "Top 100 Rankers", description: "200+ students in CUET Top 100 last year", icon: "trophy" },
      { title: "99+ Percentile", description: "500+ students scored 99+ percentile", icon: "award" },
      { title: "Selection Rate", description: "85% students got their first choice college", icon: "target" },
      { title: "Expert Faculty", description: "20+ years experienced IIT/NIT alumni faculty", icon: "users" },
    ],
    testimonials: [
      { id: "t1", name: "Priya Sharma", course: "CUET Full Course", rating: 5, text: "Success Academy helped me score 98.5 percentile! The mock tests and AI analysis were game changers.", avatar: "" },
      { id: "t2", name: "Rahul Verma", course: "CUET English + GT", rating: 5, text: "Best coaching for CUET preparation. The faculty is amazing and always available for doubts.", avatar: "" },
      { id: "t3", name: "Ananya Singh", course: "CUET Domain Courses", rating: 4, text: "The structured syllabus and regular tests kept me on track. Got admission in DU!", avatar: "" },
    ],
    stats: [
      { value: "50,000+", label: "Students Enrolled" },
      { value: "98.5%", label: "Avg. Score" },
      { value: "200+", label: "Top 100 Rankers" },
      { value: "15+", label: "Years Experience" },
    ],
    faculty: [
      { id: "f1", name: "Dr. Rajesh Kumar", designation: "Director & English Faculty", subject: "English", experience: "20+ Years", bio: "Former DU Professor with expertise in CUET English preparation. Author of 5 best-selling CUET books." },
      { id: "f2", name: "Prof. Meera Iyer", designation: "Senior Faculty", subject: "General Test", experience: "15+ Years", bio: "IIT Delhi alumna specializing in quantitative aptitude and logical reasoning." },
      { id: "f3", name: "Mr. Amit Saxena", designation: "Domain Expert", subject: "Economics & Business Studies", experience: "12+ Years", bio: "CA and MBA from IIM Ahmedabad. Expert in commerce domain subjects." },
    ],
    missionStatement: "To democratize quality CUET preparation and help every student achieve their dream college admission.",
    visionStatement: "To be India's most trusted and innovative CUET preparation platform powered by technology and expert guidance.",
    story: "Success Academy was founded in 2010 by Dr. Rajesh Kumar with a vision to make quality education accessible to all. Starting with just 20 students in a small classroom, we have grown to become one of India's leading CUET preparation institutes with over 50,000 students across 100+ cities.",
  },
  "elite-cuet": {
    coachingName: "Elite CUET Prep",
    tagline: "Excellence in Every Exam",
    themeId: "theme1",
    primaryColor: "#10B981",
    accentColor: "#F59E0B",
    address: "456 Knowledge Hub, Rajouri Garden, New Delhi 110027",
    phone: "+91 8765432109",
    email: "contact@elitecuet.com",
    socials: {
      facebook: "https://facebook.com/elitecuet",
      youtube: "https://youtube.com/@elitecuet",
    },
    heroTitle: "Transform Your CUET Dreams into Reality",
    heroSubtitle: "Expert-led courses, unlimited practice tests, and personalized mentoring to help you excel in CUET 2025.",
    achievements: [
      { title: "All India Toppers", description: "3 AIR under 10 in CUET 2024", icon: "crown" },
      { title: "DU Selections", description: "1000+ students selected in top DU colleges", icon: "graduation-cap" },
      { title: "Live Classes", description: "500+ hours of live interactive sessions", icon: "video" },
      { title: "Practice Tests", description: "10,000+ practice questions with solutions", icon: "file-text" },
    ],
    testimonials: [
      { id: "t1", name: "Vikram Patel", course: "CUET Complete", rating: 5, text: "Elite CUET's personalized approach helped me score AIR 45. Forever grateful!", avatar: "" },
      { id: "t2", name: "Sneha Gupta", course: "CUET Crash Course", rating: 5, text: "The crash course was intensive but incredibly effective. Got 97 percentile!", avatar: "" },
    ],
    stats: [
      { value: "25,000+", label: "Happy Students" },
      { value: "97%", label: "Success Rate" },
      { value: "1000+", label: "DU Selections" },
      { value: "10+", label: "Years Legacy" },
    ],
    faculty: [
      { id: "f1", name: "Dr. Sunita Rao", designation: "Founder & CEO", subject: "Mathematics", experience: "18+ Years", bio: "PhD from JNU, former NCERT consultant for mathematics curriculum development." },
      { id: "f2", name: "Mr. Karan Mehta", designation: "Head Faculty", subject: "English & GT", experience: "14+ Years", bio: "Cambridge certified English trainer with extensive CUET coaching experience." },
    ],
    missionStatement: "To provide world-class CUET preparation that empowers students to achieve academic excellence.",
    visionStatement: "Building tomorrow's leaders through exceptional education and mentorship.",
    story: "Elite CUET Prep was established in 2012 by Dr. Sunita Rao, driven by a passion to revolutionize competitive exam preparation. Our innovative teaching methods and student-centric approach have helped thousands achieve their dreams.",
  },
};

export const coursesByTenant: Record<string, Course[]> = {
  "success-academy": [
    {
      id: "c1",
      title: "CUET UG Complete Test Series 2025",
      slug: "cuet-ug-complete-test-series",
      subject: "All Subjects",
      level: "Advanced",
      durationWeeks: 16,
      mode: "online",
      price: 4999,
      discountPrice: 2999,
      description: "Comprehensive test series covering all CUET UG subjects with detailed solutions, AI-powered performance analysis, and rank predictions.",
      highlights: [
        "100+ Full-length Mock Tests",
        "Subject-wise Practice Tests",
        "Previous Year Question Papers",
        "AI-Powered Performance Analysis",
        "All India Rank Predictions",
        "Detailed Video Solutions",
      ],
      modules: [
        { title: "Section 1A: English Language", lessons: ["Reading Comprehension", "Vocabulary", "Grammar & Usage", "Verbal Ability"] },
        { title: "Section 1B: General Test", lessons: ["Quantitative Aptitude", "Logical Reasoning", "General Awareness", "Current Affairs"] },
        { title: "Section 2: Domain Subjects", lessons: ["Physics", "Chemistry", "Mathematics", "Biology", "Economics", "Business Studies"] },
      ],
      includedTests: ["50 Full Mocks", "200 Sectional Tests", "500 Topic Tests"],
      outcomes: ["Score 95+ percentile", "Master time management", "Identify weak areas", "Track improvement"],
      faq: [
        { question: "How long is the access valid?", answer: "Access is valid till CUET 2025 exam date + 1 month." },
        { question: "Can I access on mobile?", answer: "Yes, our platform is fully mobile-responsive and works on all devices." },
        { question: "Are solutions included?", answer: "Yes, detailed text and video solutions are provided for all questions." },
      ],
      badge: "Most Popular",
      enrolledCount: 12500,
    },
    {
      id: "c2",
      title: "CUET English + General Test Crash Course",
      slug: "cuet-english-gt-crash-course",
      subject: "English & GT",
      level: "Intermediate",
      durationWeeks: 8,
      mode: "online",
      price: 2499,
      discountPrice: 1499,
      description: "Intensive crash course for CUET English and General Test sections. Perfect for last-minute preparation with focused concept revision and practice.",
      highlights: [
        "40+ Live Interactive Classes",
        "Complete Concept Coverage",
        "50+ Practice Tests",
        "Doubt Clearing Sessions",
        "Study Materials PDFs",
        "Mobile App Access",
      ],
      modules: [
        { title: "English Language", lessons: ["Reading Passages", "Idioms & Phrases", "One Word Substitution", "Sentence Correction", "Para Jumbles"] },
        { title: "General Test - Quant", lessons: ["Number System", "Percentage", "Profit & Loss", "Time & Work", "Data Interpretation"] },
        { title: "General Test - Reasoning", lessons: ["Coding-Decoding", "Blood Relations", "Syllogism", "Series", "Analogies"] },
        { title: "General Test - GK", lessons: ["Indian History", "Geography", "Polity", "Economics", "Current Affairs"] },
      ],
      includedTests: ["25 Full Mocks", "100 Topic Tests"],
      outcomes: ["Score 90+ in English", "Score 85+ in GT", "Fast problem solving", "Exam confidence"],
      faq: [
        { question: "Is this enough for CUET preparation?", answer: "This course covers English and GT thoroughly. For domain subjects, check our domain courses." },
        { question: "What if I miss a live class?", answer: "All live classes are recorded and available for replay within 24 hours." },
      ],
      badge: "Best Value",
      enrolledCount: 8900,
    },
    {
      id: "c3",
      title: "CUET Business Studies Domain Course",
      slug: "cuet-business-studies",
      subject: "Business Studies",
      level: "Intermediate",
      durationWeeks: 12,
      mode: "online",
      price: 1999,
      description: "Complete Business Studies preparation for CUET with NCERT-aligned content, case studies, and extensive practice material.",
      highlights: [
        "NCERT Complete Coverage",
        "Case Study Practice",
        "30 Chapter Tests",
        "10 Full Mock Tests",
        "Previous Year Papers",
        "Quick Revision Notes",
      ],
      modules: [
        { title: "Nature & Significance of Management", lessons: ["Management Concept", "Objectives", "Levels", "Functions"] },
        { title: "Principles of Management", lessons: ["Taylor's Principles", "Fayol's Principles", "Application"] },
        { title: "Business Environment", lessons: ["Meaning & Importance", "Dimensions", "Demonetization", "GST"] },
        { title: "Planning", lessons: ["Concept", "Types of Plans", "Planning Process"] },
        { title: "Organising", lessons: ["Structure", "Delegation", "Decentralisation"] },
      ],
      includedTests: ["10 Full Mocks", "30 Chapter Tests", "100 MCQs"],
      outcomes: ["Master all 12 chapters", "Score 45+ out of 50", "Case study expertise", "Quick revision"],
      faq: [
        { question: "Is NCERT sufficient for CUET Business Studies?", answer: "Yes, NCERT is the primary source. Our course adds practice and exam strategies." },
      ],
      enrolledCount: 5600,
    },
    {
      id: "c4",
      title: "CUET Economics Domain Course",
      slug: "cuet-economics",
      subject: "Economics",
      level: "Advanced",
      durationWeeks: 12,
      mode: "online",
      price: 1999,
      description: "Master CUET Economics with comprehensive coverage of Micro and Macro economics concepts, graphs, numericals, and practice tests.",
      highlights: [
        "Microeconomics Complete",
        "Macroeconomics Complete",
        "Numerical Problem Solving",
        "Graph-Based Questions",
        "30 Topic Tests",
        "Chapterwise MCQs",
      ],
      modules: [
        { title: "Microeconomics", lessons: ["Consumer Behavior", "Production", "Cost & Revenue", "Market Forms", "Price Determination"] },
        { title: "Macroeconomics", lessons: ["National Income", "Money & Banking", "Government Budget", "Balance of Payments"] },
      ],
      includedTests: ["10 Full Mocks", "30 Chapter Tests"],
      outcomes: ["Understand concepts deeply", "Solve numericals quickly", "Draw graphs accurately", "Score 45+"],
      faq: [
        { question: "Do I need to know calculations?", answer: "Yes, Economics has numerical questions. We cover all types of calculations." },
      ],
      badge: "New",
      enrolledCount: 4200,
    },
    {
      id: "c5",
      title: "CUET Mathematics Domain Course",
      slug: "cuet-mathematics",
      subject: "Mathematics",
      level: "Advanced",
      durationWeeks: 14,
      mode: "online",
      price: 2499,
      discountPrice: 1799,
      description: "Advanced Mathematics preparation for CUET covering all Class 12 topics with extensive problem practice and shortcut techniques.",
      highlights: [
        "All Class 12 Topics",
        "500+ Practice Problems",
        "Shortcut Techniques",
        "Formula Sheets",
        "Video Solutions",
        "Live Doubt Sessions",
      ],
      modules: [
        { title: "Relations & Functions", lessons: ["Types of Relations", "Types of Functions", "Composition", "Inverse"] },
        { title: "Calculus", lessons: ["Continuity", "Differentiability", "Integration", "Applications"] },
        { title: "Algebra", lessons: ["Matrices", "Determinants", "Linear Equations"] },
        { title: "Probability", lessons: ["Conditional Probability", "Bayes Theorem", "Distributions"] },
      ],
      includedTests: ["15 Full Mocks", "50 Topic Tests"],
      outcomes: ["Master all formulas", "Solve in 2 min/question", "Score 48+", "Build confidence"],
      faq: [
        { question: "What is the difficulty level?", answer: "CUET Maths is moderate. We prepare you for all difficulty levels." },
      ],
      enrolledCount: 6100,
    },
    {
      id: "c6",
      title: "Free CUET Demo Course",
      slug: "free-cuet-demo",
      subject: "All Subjects",
      level: "Beginner",
      durationWeeks: 1,
      mode: "online",
      price: 0,
      description: "Try our teaching methodology with this free demo course covering sample topics from English, GT, and popular domain subjects.",
      highlights: [
        "5 Sample Video Lectures",
        "2 Practice Tests",
        "Study Material Sample",
        "Mobile Access",
        "No Payment Required",
      ],
      modules: [
        { title: "English Sample", lessons: ["Reading Comprehension Demo", "Vocabulary Demo"] },
        { title: "GT Sample", lessons: ["Reasoning Demo", "Quant Demo"] },
      ],
      includedTests: ["2 Demo Tests"],
      outcomes: ["Understand our teaching", "Experience platform", "Evaluate quality", "Make informed decision"],
      faq: [
        { question: "Is it really free?", answer: "Yes, 100% free. No credit card or payment required." },
      ],
      enrolledCount: 25000,
    },
  ],
  "elite-cuet": [
    {
      id: "e1",
      title: "CUET Complete Mastery Program",
      slug: "cuet-complete-mastery",
      subject: "All Subjects",
      level: "Advanced",
      durationWeeks: 20,
      mode: "hybrid",
      price: 7999,
      discountPrice: 4999,
      description: "Our flagship program with live classes, recorded lectures, unlimited tests, and 1-on-1 mentoring for guaranteed CUET success.",
      highlights: [
        "200+ Live Classes",
        "Unlimited Mock Tests",
        "1-on-1 Mentoring",
        "Personal Study Plan",
        "Parent Dashboard",
        "Certificate on Completion",
      ],
      modules: [
        { title: "Foundation", lessons: ["CUET Pattern Overview", "Time Management", "Study Planning"] },
        { title: "English Mastery", lessons: ["All English Topics", "Advanced Practice"] },
        { title: "GT Mastery", lessons: ["Quantitative Complete", "Reasoning Complete", "GK Complete"] },
        { title: "Domain Expertise", lessons: ["Choose Any 2 Domains", "In-depth Coverage"] },
      ],
      includedTests: ["Unlimited Mocks", "Unlimited Practice"],
      outcomes: ["99+ Percentile", "Top college admission", "Complete preparation", "Exam confidence"],
      faq: [
        { question: "What is hybrid mode?", answer: "Hybrid means both online and offline support. Live online classes + offline study centers access." },
      ],
      badge: "Most Popular",
      enrolledCount: 8500,
    },
    {
      id: "e2",
      title: "CUET Last 30 Days Crash Course",
      slug: "cuet-30-days-crash",
      subject: "All Subjects",
      level: "Intermediate",
      durationWeeks: 4,
      mode: "online",
      price: 1999,
      description: "Intensive 30-day revision program for students who have completed their syllabus and need focused practice and revision.",
      highlights: [
        "Daily 4-Hour Sessions",
        "Quick Revision",
        "50 Mock Tests",
        "Doubt Marathon",
        "Last Minute Tips",
        "Exam Day Strategy",
      ],
      modules: [
        { title: "Week 1: English + GT Revision", lessons: ["All topics quick revision", "Practice tests"] },
        { title: "Week 2: Domain Revision", lessons: ["Subject-wise revision", "Important questions"] },
        { title: "Week 3: Full Mocks", lessons: ["Daily full-length tests", "Analysis sessions"] },
        { title: "Week 4: Final Polish", lessons: ["Weak area focus", "Confidence building"] },
      ],
      includedTests: ["50 Full Mocks", "100 Mini Tests"],
      outcomes: ["Complete revision", "Identify gaps", "Build speed", "Exam ready"],
      faq: [
        { question: "Is this for beginners?", answer: "No, this is for students who have already covered the syllabus once." },
      ],
      badge: "New",
      enrolledCount: 3200,
    },
  ],
};

// Helper functions
export const getTenantProfile = (slug: string): TenantProfile | undefined => {
  return tenantProfiles[slug];
};

export const getCoursesByTenant = (slug: string): Course[] => {
  return coursesByTenant[slug] || [];
};

export const getCourseById = (tenantSlug: string, courseId: string): Course | undefined => {
  const courses = getCoursesByTenant(tenantSlug);
  return courses.find(c => c.id === courseId || c.slug === courseId);
};

export const getRelatedCourses = (tenantSlug: string, currentCourseId: string, limit: number = 3): Course[] => {
  const courses = getCoursesByTenant(tenantSlug);
  return courses.filter(c => c.id !== currentCourseId).slice(0, limit);
};

