import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    newStudent: true,
    testCompleted: true,
    payments: true,
    weeklyReport: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved!",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account preferences
        </p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=educator" />
                <AvatarFallback>DS</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue="Dr. Sharma" />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input defaultValue="Dr. Sharma" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input defaultValue="sharma@coaching.com" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input defaultValue="+91 98765 43210" />
              </div>
            </div>

            <Button className="gradient-bg text-white" onClick={handleSave}>
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
            </div>

            <Button variant="outline">Update Password</Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notification Channels</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">SMS Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Important alerts via SMS
                    </p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, sms: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm">New student enrollments</p>
                  <Switch
                    checked={notifications.newStudent}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newStudent: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Test completions</p>
                  <Switch
                    checked={notifications.testCompleted}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, testCompleted: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Payment notifications</p>
                  <Switch
                    checked={notifications.payments}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, payments: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Weekly performance reports</p>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, weeklyReport: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium">Active Sessions</p>
                <p className="text-xs text-muted-foreground">
                  Manage your active login sessions
                </p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Log out from all devices</p>
                <p className="text-xs text-muted-foreground">
                  This will end all active sessions
                </p>
              </div>
              <Button variant="outline" size="sm">
                Logout All
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Delete Account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
