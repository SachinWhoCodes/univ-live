import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Upload,
  Palette,
  Eye,
  Save,
  ExternalLink,
  Image,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const themes = [
  {
    id: "modern",
    name: "Modern Minimal",
    description: "Clean and professional with focus on content",
    preview: "gradient-bg",
  },
  {
    id: "classic",
    name: "Classic Academic",
    description: "Traditional educational institution feel",
    preview: "bg-blue-900",
  },
];

export default function WebsiteSettings() {
  const [selectedTheme, setSelectedTheme] = useState("modern");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved!",
        description: "Your website has been updated successfully.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Website Settings</h1>
          <p className="text-muted-foreground text-sm">
            Customize your public coaching website
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            className="gradient-bg text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Subdomain Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div className="gradient-bg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-xs">Your website URL</p>
                  <p className="text-white font-semibold">sharma-coaching.univ.live</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-white/20 text-white">Active</Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 text-white border-0 hover:bg-white/30"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Site
                </Button>
              </div>
            </div>
          </div>
          <CardContent className="p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Want a custom domain? Upgrade to Growth plan to use{" "}
              <span className="font-medium">yourcoaching.com</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coaching Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Coaching Name</Label>
                  <Input defaultValue="Sharma's Science Academy" />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input defaultValue="Excellence in NEET & JEE Preparation" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Courses Offered</Label>
                <div className="flex flex-wrap gap-2">
                  {["NEET", "JEE Mains", "JEE Advanced", "CUET"].map((course) => (
                    <Badge key={course} variant="secondary" className="px-3 py-1">
                      {course}
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    + Add Course
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-2xl">
                    SS
                  </div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About Your Coaching</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>About Description</Label>
                <Textarea
                  rows={6}
                  defaultValue="Sharma's Science Academy has been a pioneer in medical and engineering entrance exam preparation since 2010. With a team of experienced faculty members and a proven track record of success, we have helped thousands of students achieve their dreams of getting into top medical and engineering colleges."
                  placeholder="Tell students about your coaching, experience, and achievements..."
                />
              </div>

              <div className="space-y-2">
                <Label>Achievements</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-border">
                    <Input
                      className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0"
                      defaultValue="500+"
                    />
                    <Input
                      className="text-sm text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0"
                      defaultValue="Students Selected"
                    />
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <Input
                      className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0"
                      defaultValue="15+"
                    />
                    <Input
                      className="text-sm text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0"
                      defaultValue="Years Experience"
                    />
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <Input
                      className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0"
                      defaultValue="50+"
                    />
                    <Input
                      className="text-sm text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0"
                      defaultValue="Expert Faculty"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input defaultValue="contact@sharma-coaching.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Textarea
                  rows={2}
                  defaultValue="123 Education Street, Knowledge Park, Delhi - 110001"
                />
              </div>

              <div className="space-y-2">
                <Label>Social Links</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <Input placeholder="Facebook URL" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="h-5 w-5 text-sky-500" />
                    <Input placeholder="Twitter URL" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <Input placeholder="Instagram URL" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                    <Input placeholder="YouTube URL" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-5 w-5 text-blue-700" />
                    <Input placeholder="LinkedIn URL" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Choose Your Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {themes.map((theme) => (
                  <motion.div
                    key={theme.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={cn(
                      "rounded-xl border-2 cursor-pointer overflow-hidden transition-colors",
                      selectedTheme === theme.id
                        ? "border-primary"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className={cn("h-32", theme.preview)} />
                    <div className="p-4 bg-card">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{theme.name}</h4>
                        {selectedTheme === theme.id && (
                          <Badge className="gradient-bg text-white">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {theme.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Image className="h-5 w-5" />
                Hero Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-muted/30"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Hero Image {index}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended size: 1920x1080px. Maximum file size: 5MB.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Website Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
                <div className="gradient-bg p-8">
                  <div className="max-w-lg">
                    <Badge className="bg-white/20 text-white mb-4">
                      #1 Coaching in Delhi
                    </Badge>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Sharma's Science Academy
                    </h2>
                    <p className="text-white/80 text-sm mb-4">
                      Excellence in NEET & JEE Preparation
                    </p>
                    <Button className="bg-white text-foreground hover:bg-white/90">
                      Enroll Now
                    </Button>
                  </div>
                </div>
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Live preview of your website hero section
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
