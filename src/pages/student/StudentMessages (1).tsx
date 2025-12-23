import { useState } from "react";
import { Send, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { threads, messages } from "@/mock/studentMock";

export default function StudentMessages() {
  const [selectedThread, setSelectedThread] = useState(threads[0]);
  const [newMessage, setNewMessage] = useState("");

  const statusIcons = { open: AlertCircle, "in-progress": Clock, resolved: CheckCircle };
  const statusColors = { open: "text-yellow-500", "in-progress": "text-blue-500", resolved: "text-green-500" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Messages</h1><p className="text-muted-foreground">Get help from your coaching or our support team</p></div>
        <Dialog>
          <DialogTrigger asChild><Button className="gradient-bg rounded-xl"><Plus className="h-4 w-4 mr-2" />New Ticket</Button></DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Raise a New Ticket</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Subject" className="rounded-xl" />
              <Textarea placeholder="Describe your issue..." className="rounded-xl min-h-[120px]" />
              <Button className="w-full gradient-bg rounded-xl">Submit Ticket</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <Card className="card-soft border-0">
          <CardHeader><CardTitle className="text-lg">Conversations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {threads.map((thread) => {
              const Icon = statusIcons[thread.status];
              return (
                <div key={thread.id} onClick={() => setSelectedThread(thread)} className={cn("p-3 rounded-xl cursor-pointer transition-colors", selectedThread?.id === thread.id ? "bg-primary/10" : "hover:bg-muted")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">{thread.subject}</span>
                    {thread.unreadCount > 0 && <Badge className="rounded-full">{thread.unreadCount}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs"><Icon className={cn("h-3 w-3", statusColors[thread.status])} /><span className="capitalize">{thread.status}</span></div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 card-soft border-0 flex flex-col h-[500px]">
          <CardHeader className="border-b"><CardTitle className="text-lg">{selectedThread?.subject || "Select a conversation"}</CardTitle></CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.from === "student" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] p-3 rounded-2xl text-sm", msg.from === "student" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm")}>
                  <p className="font-medium text-xs mb-1">{msg.senderName}</p>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4 border-t flex gap-2">
            <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="rounded-xl" />
            <Button className="rounded-xl gradient-bg" size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
