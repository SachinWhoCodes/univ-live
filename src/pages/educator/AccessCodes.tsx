import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Copy,
  Check,
  Key,
  Calendar,
  Users,
  MoreVertical,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import DataTable from "@/components/educator/DataTable";
import EmptyState from "@/components/educator/EmptyState";
import { toast } from "@/hooks/use-toast";

interface AccessCode {
  id: string;
  code: string;
  testSeries: string;
  maxUses: number;
  usesLeft: number;
  expiry: string;
  status: "active" | "expired" | "exhausted";
  createdAt: string;
}

const accessCodes: AccessCode[] = [
  {
    id: "1",
    code: "NEET2024-PHYSICS",
    testSeries: "NEET Physics Complete Package",
    maxUses: 100,
    usesLeft: 65,
    expiry: "Dec 31, 2024",
    status: "active",
    createdAt: "Jan 01, 2024",
  },
  {
    id: "2",
    code: "CHEMISTRY-VIP",
    testSeries: "Chemistry Chapter-wise Tests",
    maxUses: 50,
    usesLeft: 12,
    expiry: "Jun 30, 2024",
    status: "active",
    createdAt: "Feb 15, 2024",
  },
  {
    id: "3",
    code: "BIO-TRIAL",
    testSeries: "Biology NCERT Based",
    maxUses: 25,
    usesLeft: 0,
    expiry: "Mar 15, 2024",
    status: "exhausted",
    createdAt: "Mar 01, 2024",
  },
  {
    id: "4",
    code: "JEE-DEMO",
    testSeries: "JEE Maths Foundation",
    maxUses: 10,
    usesLeft: 8,
    expiry: "Jan 01, 2024",
    status: "expired",
    createdAt: "Dec 01, 2023",
  },
];

export default function AccessCodes() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newCode, setNewCode] = useState("");
  const [hasData] = useState(true);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Code copied!",
      description: "Access code has been copied to clipboard.",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(code);
  };

  const columns = [
    {
      key: "code",
      header: "Access Code",
      render: (item: AccessCode) => (
        <div className="flex items-center gap-2">
          <code className="px-2 py-1 rounded bg-muted font-mono text-sm">
            {item.code}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(item.code);
            }}
          >
            {copiedCode === item.code ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      ),
    },
    {
      key: "testSeries",
      header: "Test Series",
      className: "hidden md:table-cell",
    },
    {
      key: "uses",
      header: "Uses",
      render: (item: AccessCode) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-bg"
              style={{
                width: `${((item.maxUses - item.usesLeft) / item.maxUses) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {item.maxUses - item.usesLeft}/{item.maxUses}
          </span>
        </div>
      ),
    },
    {
      key: "expiry",
      header: "Expiry",
      className: "hidden sm:table-cell",
    },
    {
      key: "status",
      header: "Status",
      render: (item: AccessCode) => (
        <Badge
          variant="secondary"
          className={
            item.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : item.status === "expired"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (item: AccessCode) => (
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
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(item.code);
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Access Codes</h1>
            <p className="text-muted-foreground text-sm">
              Create and manage access codes for your test series
            </p>
          </div>
        </div>
        <EmptyState
          icon={Key}
          title="No access codes created yet"
          description="Create access codes to let students access your test series. Share the codes via WhatsApp, email, or any other platform."
          actionLabel="Create Access Code"
          onAction={() => setIsCreateOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Access Codes</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage access codes for your test series
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Access Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Access Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Test Series</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test series" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neet-physics">
                      NEET Physics Complete Package
                    </SelectItem>
                    <SelectItem value="chemistry">
                      Chemistry Chapter-wise Tests
                    </SelectItem>
                    <SelectItem value="biology">Biology NCERT Based</SelectItem>
                    <SelectItem value="jee-maths">JEE Maths Foundation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Access Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="Enter or generate code"
                    className="font-mono uppercase"
                  />
                  <Button variant="outline" onClick={generateCode}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Uses</Label>
                  <Input type="number" placeholder="100" />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input type="date" />
                </div>
              </div>

              {newCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-muted/50 border border-border"
                >
                  <p className="text-xs text-muted-foreground mb-2">
                    Generated Access Code
                  </p>
                  <div className="flex items-center justify-between">
                    <code className="text-2xl font-bold font-mono gradient-text">
                      {newCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(newCode)}
                    >
                      {copiedCode === newCode ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              <Button
                className="w-full gradient-bg text-white"
                onClick={() => {
                  toast({
                    title: "Access code created!",
                    description: "Your new access code is ready to share.",
                  });
                  setIsCreateOpen(false);
                  setNewCode("");
                }}
              >
                Create Access Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Key, label: "Total Codes", value: accessCodes.length },
          {
            icon: Users,
            label: "Total Uses",
            value: accessCodes.reduce((acc, c) => acc + c.maxUses - c.usesLeft, 0),
          },
          {
            icon: Check,
            label: "Active",
            value: accessCodes.filter((c) => c.status === "active").length,
          },
          {
            icon: Calendar,
            label: "Expiring Soon",
            value: 2,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <DataTable data={accessCodes} columns={columns} />
    </div>
  );
}
