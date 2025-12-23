import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Search,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "educator";
  content: string;
  time: string;
}

interface Ticket {
  id: string;
  title: string;
  status: "open" | "in-progress" | "resolved";
  createdAt: string;
  lastUpdate: string;
  messages: { content: string; author: string; time: string }[];
}

const conversations: Message[] = [
  {
    id: "1",
    sender: "Rahul Sharma",
    avatar: "rahul",
    preview: "Sir, I have a doubt in Physics Chapter 5...",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    sender: "Priya Patel",
    avatar: "priya",
    preview: "Thank you for the feedback on my test!",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    sender: "Amit Kumar",
    avatar: "amit",
    preview: "When is the next mock test scheduled?",
    time: "3 hours ago",
    unread: false,
  },
  {
    id: "4",
    sender: "Sneha Gupta",
    avatar: "sneha",
    preview: "I'm having trouble accessing the test series",
    time: "Yesterday",
    unread: false,
  },
];

const chatMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "user",
    content: "Sir, I have a doubt in Physics Chapter 5. The question about projectile motion is confusing.",
    time: "10:30 AM",
  },
  {
    id: "2",
    sender: "educator",
    content: "Hi Rahul! Which specific part is confusing? Is it about the horizontal or vertical component?",
    time: "10:32 AM",
  },
  {
    id: "3",
    sender: "user",
    content: "The vertical component. I don't understand how to calculate the maximum height.",
    time: "10:35 AM",
  },
  {
    id: "4",
    sender: "educator",
    content: "Great question! At maximum height, the vertical velocity becomes zero. Use v² = u² - 2gh where v=0 at max height. This gives h = u²sin²θ / 2g. Would you like me to solve a similar problem?",
    time: "10:38 AM",
  },
];

const tickets: Ticket[] = [
  {
    id: "1",
    title: "Unable to download test results PDF",
    status: "open",
    createdAt: "Jun 10, 2024",
    lastUpdate: "2 hours ago",
    messages: [
      { content: "I'm trying to download my test results but the PDF is not generating.", author: "You", time: "Jun 10, 2024" },
    ],
  },
  {
    id: "2",
    title: "Request for additional test series",
    status: "in-progress",
    createdAt: "Jun 8, 2024",
    lastUpdate: "1 day ago",
    messages: [
      { content: "Can you add more JEE Advanced level problems?", author: "You", time: "Jun 8, 2024" },
      { content: "We're working on adding new content. Should be ready by next week.", author: "Support", time: "Jun 9, 2024" },
    ],
  },
  {
    id: "3",
    title: "Billing issue with subscription",
    status: "resolved",
    createdAt: "Jun 1, 2024",
    lastUpdate: "Jun 5, 2024",
    messages: [
      { content: "I was charged twice for my subscription.", author: "You", time: "Jun 1, 2024" },
      { content: "We've processed a refund for the duplicate charge. Please allow 5-7 business days.", author: "Support", time: "Jun 3, 2024" },
      { content: "Refund received. Thank you!", author: "You", time: "Jun 5, 2024" },
    ],
  },
];

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<Message | null>(
    conversations[0]
  );
  const [messageInput, setMessageInput] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const statusColors = {
    open: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };

  const statusIcons = {
    open: AlertCircle,
    "in-progress": Clock,
    resolved: CheckCircle2,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Messages & Support</h1>
          <p className="text-muted-foreground text-sm">
            Communicate with students and get help from support
          </p>
        </div>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students" className="relative">
            Student Messages
            <Badge className="ml-2 bg-primary text-primary-foreground text-xs">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="support">Contact Support</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-0">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">
              {/* Conversations List */}
              <div className="border-r border-border">
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search conversations..." className="pl-9" />
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn(
                        "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                        selectedConversation?.id === conv.id && "bg-muted"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.avatar}`}
                            />
                            <AvatarFallback>{conv.sender[0]}</AvatarFallback>
                          </Avatar>
                          {conv.unread && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={cn(
                                "text-sm truncate",
                                conv.unread ? "font-semibold" : "font-medium"
                              )}
                            >
                              {conv.sender}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {conv.time}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {conv.preview}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.avatar}`}
                          />
                          <AvatarFallback>
                            {selectedConversation.sender[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {selectedConversation.sender}
                          </p>
                          <p className="text-xs text-green-500">Online</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex",
                            msg.sender === "educator" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-2",
                              msg.sender === "educator"
                                ? "gradient-bg text-white rounded-br-sm"
                                : "bg-muted rounded-bl-sm"
                            )}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={cn(
                                "text-[10px] mt-1",
                                msg.sender === "educator"
                                  ? "text-white/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {msg.time}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button className="gradient-bg text-white">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Select a conversation to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gradient-bg text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="content">Content Request</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input placeholder="Brief description of your issue" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Provide detailed information about your issue..."
                      rows={4}
                    />
                  </div>
                  <Button className="w-full gradient-bg text-white">
                    Submit Ticket
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Tickets</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {tickets.map((ticket) => {
                    const StatusIcon = statusIcons[ticket.status];
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={cn(
                          "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                          selectedTicket?.id === ticket.id && "bg-muted"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {ticket.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Created {ticket.createdAt}
                            </p>
                          </div>
                          <Badge className={statusColors[ticket.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Ticket Details */}
            <Card>
              {selectedTicket ? (
                <>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {selectedTicket.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last update: {selectedTicket.lastUpdate}
                        </p>
                      </div>
                      <Badge className={statusColors[selectedTicket.status]}>
                        {selectedTicket.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {selectedTicket.messages.map((msg, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-3 rounded-lg",
                            msg.author === "Support"
                              ? "bg-primary/10 ml-4"
                              : "bg-muted mr-4"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{msg.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {msg.time}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ))}
                    </div>

                    {selectedTicket.status !== "resolved" && (
                      <div className="pt-4 border-t border-border">
                        <Textarea placeholder="Add a reply..." rows={3} />
                        <Button className="mt-2 gradient-bg text-white">
                          Send Reply
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Select a ticket to view details</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
