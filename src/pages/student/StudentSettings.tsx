import { User, Mail, Phone, Shield, Bell, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { studentProfile } from "@/mock/studentMock";

export default function StudentSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Manage your account and preferences</p></div>

      {/* Profile Card */}
      <Card className="card-soft border-0 bg-pastel-mint">
        <CardContent className="p-6 flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-white shadow-lg"><AvatarImage src={studentProfile.avatar} /><AvatarFallback>{studentProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
          <div>
            <h2 className="text-xl font-bold">{studentProfile.name}</h2>
            <p className="text-muted-foreground">{studentProfile.batch}</p>
            <p className="text-sm text-muted-foreground">{studentProfile.coachingName}</p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="card-soft border-0">
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Full Name</Label><Input value={studentProfile.name} className="rounded-xl mt-1" /></div>
            <div><Label>Phone</Label><Input value={studentProfile.phone} className="rounded-xl mt-1" /></div>
          </div>
          <div><Label>Email</Label><Input value={studentProfile.email} className="rounded-xl mt-1" /></div>
          <Button className="gradient-bg rounded-xl">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="card-soft border-0">
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">{theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}<div><p className="font-medium">Dark Mode</p><p className="text-xs text-muted-foreground">Toggle dark/light theme</p></div></div>
            <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3"><Bell className="h-5 w-5" /><div><p className="font-medium">Push Notifications</p><p className="text-xs text-muted-foreground">Get notified about new tests and results</p></div></div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="card-soft border-0">
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Security</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" className="rounded-xl">Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
